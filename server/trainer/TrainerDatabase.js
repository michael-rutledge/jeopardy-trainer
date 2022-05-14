const sqlite3 = require('better-sqlite3');
const datetime = require('node-datetime');

const ClueEntry = require(process.cwd() + '/server/trainer/ClueEntry.js');
const Logger = require(process.cwd() + '/server/utility/Logger.js');

const DB_PATH = process.cwd() + '/server/data/jeopardy-trainer.db';
const CLUES_TABLE = 'clues';
const RESULTS_TABLE = 'results';

const ResultColumns = {
  ID: 'id',
  TRAINER_CATEGORY: 'trainer_category',
  ROUND: 'round',
  CORRECT: 'correct',
  HEARD_OF: 'heard_of',
  DATE: 'date',
};

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: DB_PATH
  },
  useNullAsDefault: true
});

// Manages database storage of jeopardy-trainer clues.
class TrainerDatabase {
  constructor (db = null) {
    if (!db) {
      this.db = this._initDb();
    } else {
      this.db = db;
    }
  }


  // PUBLIC METHODS

  // Adds the given ClueEntry to the database.
  addClueEntry(clueEntry) {
    try {
      let clueToInsert = {};
      clueToInsert[ClueEntry.SqlColumns.J_CATEGORY] = clueEntry.jCategory;
      clueToInsert[ClueEntry.SqlColumns.CLUE] = clueEntry.clue;
      clueToInsert[ClueEntry.SqlColumns.ANSWER] = clueEntry.answer;
      clueToInsert[ClueEntry.SqlColumns.ROUND] = clueEntry.round;
      clueToInsert[ClueEntry.SqlColumns.DOLLAR_VALUE] = clueEntry.dollarValue;
      clueToInsert[ClueEntry.SqlColumns.AIR_DATE] = clueEntry.airDate;
      let query = knex(CLUES_TABLE).insert(clueToInsert).toString();
      this.db.prepare(query).run();
    } catch (err) {
      Logger.logError('TrainerDatabase failed to insert clueEntry: ' + err.message);
    }
  }

  // Adds a result entry for the given arguments representing how a clue for a particular
  // trainerCategory went.
  addResultEntry(trainerCategory, round, correct, heardOf) {
    try {
      let resultToInsert = {};
      resultToInsert[ResultColumns.TRAINER_CATEGORY] = trainerCategory;
      resultToInsert[ResultColumns.ROUND] = round;
      resultToInsert[ResultColumns.CORRECT] = correct;
      resultToInsert[ResultColumns.HEARD_OF] = heardOf;
      resultToInsert[ResultColumns.DATE] = datetime.create().format('Y-m-d');
      let query = knex(RESULTS_TABLE).insert(resultToInsert).toString();
      this.db.prepare(query).run();
    } catch (err) {
      Logger.logError(`TrainerDatabase failed to insert result row: ${err.message}`);
    }
  }

  // Closes the open db connection.
  close() {
    try {
      this.db.close();
      Logger.logInfo('TrainerDatabase closure successful');
    } catch (err) {
      Logger.logError('TrainerDatabase closure failed: ' + err.message);
    }
  }

  // Returns a list of currently active trainerCategories within the clues table.
  getActiveTrainerCategories() {
    let trainerCategories = [];

    try {
      let query = knex(CLUES_TABLE)
        .distinct(ClueEntry.SqlColumns.TRAINER_CATEGORY)
        .whereNotNull(ClueEntry.SqlColumns.TRAINER_CATEGORY)
        .toString();
      let rows = this.db.prepare(query).all();
      for (let i = 0; i < rows.length; ++i) {
        trainerCategories.push(rows[i][ClueEntry.SqlColumns.TRAINER_CATEGORY]);
      }
    } catch (err) {
      Logger.logError(`getActiveTrainerCategories error: ${err.message}`);
    }

    return trainerCategories;
  }

  // Returns clues associated with the given trainerCategory.
  getClueEntriesForTrainerCategory(trainerCategory, pagination = { limit: 0, offset: 0 }) {
    let clueEntries = [];
    let cluesQuery = knex
      .select()
      .from(CLUES_TABLE)
      .where(ClueEntry.SqlColumns.TRAINER_CATEGORY, trainerCategory);

    if (pagination.limit > 0) {
      cluesQuery.limit(pagination.limit);
    }
    if (pagination.offset > 0) {
      cluesQuery.offset(pagination.offset);
    }

    try {
      let clueRows = this.db.prepare(cluesQuery.toString()).all();
      for (let i = 0; clueRows && i < clueRows.length; ++i) {
        clueEntries.push(ClueEntry.fromSqlRow(clueRows[i]));
      }
    } catch (err) {
      Logger.logError(`getClueEntriesForTrainerCategory error: ${err.message}`);
    }
    return clueEntries;
  }

  // Returns all remaining clues left for the next unseen J Category. Preference is given to the
  // earliest categories chronologically.
  getNextUnseenJCategory(resolve) {
    let clueEntries = [];

    try {
      let categoryQuery = knex
        .select(ClueEntry.SqlColumns.J_CATEGORY, ClueEntry.SqlColumns.ROUND,
          ClueEntry.SqlColumns.AIR_DATE)
        .from(CLUES_TABLE)
        .whereNull(ClueEntry.SqlColumns.TRAINER_CATEGORY)
        .orderBy(ClueEntry.SqlColumns.AIR_DATE)
        .limit(1)
        .toString();
      let category = this.db.prepare(categoryQuery).get();
      if (!category) return [];
      let categoryCluesQuery = knex
          .select()
          .from(CLUES_TABLE)
          .where(ClueEntry.SqlColumns.J_CATEGORY, category[ClueEntry.SqlColumns.J_CATEGORY])
          .where(ClueEntry.SqlColumns.ROUND, category[ClueEntry.SqlColumns.ROUND])
          .where(ClueEntry.SqlColumns.AIR_DATE, category[ClueEntry.SqlColumns.AIR_DATE])
          .toString();
      let clueRows = this.db.prepare(categoryCluesQuery).all();
      for (let i = 0; clueRows && i < clueRows.length; ++i) {
        clueEntries.push(ClueEntry.fromSqlRow(clueRows[i]));
      }
    } catch (err) {
      Logger.logError(`getNextUnseenJCategory error: ${err.message}`);
    }

    return clueEntries;
  }

  // Updates the row 
  setTrainerCategoryForClueEntry(trainerCategory, clueEntry) {
    try {
      let query = knex(CLUES_TABLE)
        .where(ClueEntry.SqlColumns.ID, clueEntry.id)
        .update(ClueEntry.SqlColumns.TRAINER_CATEGORY, trainerCategory)
        .toString();
      this.db.prepare(query).run();
    } catch (err) {
      Logger.logError(
        `TrainerDatabase failed to set trainerCategory for clueEntry: ${err.message}`);
    }
  }


  // PRIVATE METHODS

  // Initializes the sql db accessor.
  _initDb() {
    let db = null;
    try {
      db = new sqlite3(DB_PATH, sqlite3.OPEN_READWRITE);

      try {
        // Create Clues table.
        let cluesQuery = knex.schema
          .createTable(CLUES_TABLE, table => {
            table.increments(ClueEntry.SqlColumns.ID);
            table.string(ClueEntry.SqlColumns.J_CATEGORY);
            table.string(ClueEntry.SqlColumns.CLUE);
            table.string(ClueEntry.SqlColumns.ANSWER);
            table.string(ClueEntry.SqlColumns.ROUND);
            table.integer(ClueEntry.SqlColumns.DOLLAR_VALUE);
            table.string(ClueEntry.SqlColumns.AIR_DATE);
            table.string(ClueEntry.SqlColumns.TRAINER_CATEGORY);
            table.string(ClueEntry.SqlColumns.CLUE_TYPE);
          }).toString();
        db.prepare(cluesQuery).run();
      } catch (err) {
        Logger.logWarning(`Clues table error: ${err.message}`);
      }

      try {
        // Create Results table.
        let resultsQuery = knex.schema
          .createTable(RESULTS_TABLE, table => {
            table.increments(ResultColumns.ID);
            table.string(ResultColumns.TRAINER_CATEGORY);
            table.string(ResultColumns.ROUND);
            table.integer(ResultColumns.CORRECT);
            table.integer(ResultColumns.HEARD_OF);
            table.string(ResultColumns.DATE);
          }).toString();
        db.prepare(resultsQuery).run();
      } catch (err) {
        Logger.logWarning(`Results table error: ${err.message}`);
      }
    } catch (err) {
      Logger.logError('TrainerDatabase init error: ' + err.message);
    }
    return db;
  }
}

module.exports = TrainerDatabase;
TrainerDatabase.DB_PATH = DB_PATH;
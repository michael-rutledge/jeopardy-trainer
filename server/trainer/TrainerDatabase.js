const sqlite3 = require('sqlite3').verbose();

const ClueEntry = require(process.cwd() + '/server/trainer/ClueEntry.js');
const Logger = require(process.cwd() + '/server/utility/Logger.js');

const DB_PATH = process.cwd() + '/server/data/jeopardy-trainer.db';
const CLUES_TABLE = 'clues';
const RESULTS_TABLE = 'results';

const ResultColumns = {
  ID: 'id',
  TRAINER_CATEGORY: 'trainer_category',
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
      this.db.run(query);
    } catch (err) {
      Logger.logError('TrainerDatabase failed to insert clueEntry: ' + err.message);
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


  // PRIVATE METHODS

  //
  _initDb() {
    try {
      let db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE);
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
      db.run(cluesQuery, (err) => {
        Logger.logWarning('TrainerDatabase: clues table already exists');
      });

      // Create Results table.
      let resultsQuery = knex.schema
        .createTable(CLUES_TABLE, table => {
          table.increments(ResultColumns.ID);
          table.string(ResultColumns.TRAINER_CATEGORY);
          table.integer(ResultColumns.CORRECT);
          table.integer(ResultColumns.HEARD_OF);
          table.string(ResultColumns.DATE);
        }).toString();
      db.run(resultsQuery, (err) => {
        Logger.logWarning('TrainerDatabase: results table already exists');
      });

      return db;
    } catch (err) {
      Logger.logError('TrainerDatabase init error: ' + err.message);
      return null;
    }
  }
}

module.exports = TrainerDatabase;
TrainerDatabase.DB_PATH = DB_PATH;
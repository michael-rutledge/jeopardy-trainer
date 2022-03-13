const sqlite3 = require('sqlite3').verbose();

const ClueEntry = require(process.cwd() + '/server/trainer/ClueEntry.js');
const Logger = require(process.cwd() + '/server/utility/Logger.js');

const DB_PATH = process.cwd() + '/server/data/jeopardy-trainer.db';
const CLUES_TABLE = 'clues';
const RESULTS_TABLE = 'results';

const ClueColumns = {
  ID: 'id',
  J_CATEGORY: 'j_category',
  CLUE: 'clue',
  ANSWER: 'answer',
  ROUND: 'round',
  DOLLAR_VALUE: 'dollar_value',
  AIR_DATE: 'air_date',
  TRAINER_CATEGORY: 'trainer_category',
  CLUE_TYPE: 'clue_type',
}
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
  constructor () {
    this.db = this._initDb();
  }


  // PUBLIC METHODS

  // Adds the given ClueEntry to the database.
  addClueEntry(clueEntry) {
    try {
      let clueToInsert = {};
      clueToInsert[ClueColumns.J_CATEGORY] = clueEntry.jCategory;
      clueToInsert[ClueColumns.CLUE] = clueEntry.clue;
      clueToInsert[ClueColumns.ANSWER] = clueEntry.answer;
      clueToInsert[ClueColumns.ROUND] = clueEntry.round;
      clueToInsert[ClueColumns.DOLLAR_VALUE] = clueEntry.dollarValue;
      clueToInsert[ClueColumns.AIR_DATE] = clueEntry.airDate;
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
          table.increments(ClueColumns.ID);
          table.string(ClueColumns.J_CATEGORY);
          table.string(ClueColumns.CLUE);
          table.string(ClueColumns.ANSWER);
          table.string(ClueColumns.ROUND);
          table.integer(ClueColumns.DOLLAR_VALUE);
          table.string(ClueColumns.AIR_DATE);
          table.string(ClueColumns.TRAINER_CATEGORY);
          table.string(ClueColumns.CLUE_TYPE)
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
TrainerDatabase.ClueColumns = ClueColumns;
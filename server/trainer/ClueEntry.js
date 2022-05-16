const AutoBuilder = require(`${process.cwd()}/server/utility/AutoBuilder.js`);

// Enum for possible rounds associated with when the clue was present in the game.
const Round = {
  NONE: 'NONE',
  JEOPARDY: 'JEOPARDY',
  DOUBLE_JEOPARDY: 'DOUBLE_JEOPARDY',
  FINAL_JEOPARDY: 'FINAL_JEOPARDY'
}

// Enum for possible types of clues.
const ClueType = {
  DEFAULT: 'DEFAULT',
  WORDPLAY: 'WORDPLAY',
  MATH: 'MATH'
};

// Enum for sql columns that would represent given values in a row.
const SqlColumns = {
  ID: 'id',
  J_CATEGORY: 'j_category',
  CLUE: 'clue',
  ANSWER: 'answer',
  ROUND: 'round',
  DOLLAR_VALUE: 'dollar_value',
  AIR_DATE: 'air_date',
  TRAINER_CATEGORY: 'trainer_category',
  CLUE_TYPE: 'clue_type',
};

// Represents a clue from Jeopardy to be stored in the ClueBank of jeopardy-trainer.
class ClueEntry {
  constructor () {
    // Id in the sql db. Should only be set from there.
    this.id = -1;
    // Category as aired on Jeopardy. Example: 'Potent Potables'
    this.jCategory = '';
    // The actual clue text. Example: 'This drink is commonly made from hops.'
    this.clue = '';
    // The answer to the clue. Example: 'Beer'
    this.answer = '';
    // The round the clue was given in the game.
    this.round = Round.NONE;
    // The dollar amount associated with the clue. This can be used to gauge difficulty.
    this.dollarValue = 0;
    // Date this clue aired, as a string (format: yyyy-mm-dd). Example: '2000-12-31'
    this.airDate = '';
    // Category within jeopardy-trainer. Example: 'ARTS::LITERATURE::AUTHORS'
    this.trainerCategory = null;
    // Type of the clue.
    this.clueType = ClueType.DEFAULT;
  }
}

module.exports = ClueEntry;
ClueEntry.Builder = AutoBuilder(ClueEntry);
ClueEntry.ClueType = ClueType;
ClueEntry.Round = Round;
ClueEntry.SqlColumns = SqlColumns;

// Returns a new ClueEntry from the given sql row JSON.
ClueEntry.fromSqlRow = function(row) {
  return new ClueEntry.Builder()
    .setId(row[SqlColumns.ID])
    .setJCategory(row[SqlColumns.J_CATEGORY])
    .setClue(row[SqlColumns.CLUE])
    .setAnswer(row[SqlColumns.ANSWER])
    .setRound(row[SqlColumns.ROUND])
    .setDollarValue(row[SqlColumns.DOLLAR_VALUE])
    .setAirDate(row[SqlColumns.AIR_DATE])
    .setTrainerCategory(row[SqlColumns.TRAINER_CATEGORY])
    .setClueType(row[SqlColumns.CLUE_TYPE])
    .build();
}
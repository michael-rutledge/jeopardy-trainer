const MAX_NUM_ROLLING_ATTEMPTS = 3;

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

// Represents a clue from Jeopardy to be stored in the ClueBank of jeopardy-trainer.
class ClueEntry {
  constructor () {
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

// Constructs a new ClueEntry. Does not need to seed certain fields related to training.
ClueEntry.Builder = class {
  constructor () {
    this._clueEntry = new ClueEntry();
  }

  build() {
    return this._clueEntry;
  }

  setJCategory(jCategory) {
    this._clueEntry.jCategory = jCategory;
    return this;
  }

  setClue(clue) {
    this._clueEntry.clue = clue;
    return this;
  }

  setAnswer(answer) {
    this._clueEntry.answer = answer;
    return this;
  }

  setRound(round) {
    this._clueEntry.round = round;
    return this;
  }

  setDollarValue(dollarValue) {
    this._clueEntry.dollarValue = dollarValue;
    return this;
  }

  setAirDate(airDate) {
    this._clueEntry.airDate = airDate;
    return this;
  }
}

module.exports = ClueEntry;
ClueEntry.Round = Round;
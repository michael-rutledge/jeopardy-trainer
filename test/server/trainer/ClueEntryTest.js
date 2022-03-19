const expect = require('chai').expect;
const should = require('chai').should();

const ClueEntry = require(process.cwd() + '/server/trainer/ClueEntry.js');

describe('ClueEntryTest', function () {
  describe('Builder', function () {
    it('shouldSetExpectedValues', function () {
      let clueEntry = new ClueEntry.Builder()
        .setJCategory('jCategory')
        .setClue('clue')
        .setAnswer('answer')
        .setRound(ClueEntry.Round.JEOPARDY)
        .setDollarValue(1000)
        .setAirDate('2009-09-01')
        .setTrainerCategory('TRAINER_CATEGORY')
        .setClueType(ClueEntry.ClueType.DEFAULT)
        .build();

      clueEntry.jCategory.should.equal('jCategory');
      clueEntry.clue.should.equal('clue');
      clueEntry.answer.should.equal('answer');
      clueEntry.round.should.equal(ClueEntry.Round.JEOPARDY);
      clueEntry.dollarValue.should.equal(1000);
      clueEntry.airDate.should.equal('2009-09-01');
      clueEntry.trainerCategory.should.equal('TRAINER_CATEGORY');
      clueEntry.clueType.should.equal(ClueEntry.ClueType.DEFAULT);
    });
	});

  describe('fromSqlRow', function () {
    it('shouldSetExpectedValues', function () {
      let row = {};
      row[ClueEntry.SqlColumns.J_CATEGORY] = 'jCategory';
      row[ClueEntry.SqlColumns.CLUE] = 'clue';
      row[ClueEntry.SqlColumns.ANSWER] = 'answer';
      row[ClueEntry.SqlColumns.ROUND] = ClueEntry.Round.JEOPARDY;
      row[ClueEntry.SqlColumns.DOLLAR_VALUE] = 1000;
      row[ClueEntry.SqlColumns.AIR_DATE] = '2009-09-01';
      row[ClueEntry.SqlColumns.TRAINER_CATEGORY] = 'TRAINER_CATEGORY';
      row[ClueEntry.SqlColumns.CLUE_TYPE] = ClueEntry.ClueType.DEFAULT;

      let clueEntry = ClueEntry.fromSqlRow(row);

      clueEntry.jCategory.should.equal('jCategory');
      clueEntry.clue.should.equal('clue');
      clueEntry.answer.should.equal('answer');
      clueEntry.round.should.equal(ClueEntry.Round.JEOPARDY);
      clueEntry.dollarValue.should.equal(1000);
      clueEntry.airDate.should.equal('2009-09-01');
      clueEntry.trainerCategory.should.equal('TRAINER_CATEGORY');
      clueEntry.clueType.should.equal(ClueEntry.ClueType.DEFAULT);
    });
  });
});
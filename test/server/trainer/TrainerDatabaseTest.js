const expect = require('chai').expect;
const should = require('chai').should();

const ClueEntry = require(process.cwd() + '/server/trainer/ClueEntry.js');
const MockDatabase = require(process.cwd() + '/test/mocks/MockDatabase.js');
const TrainerDatabase = require(process.cwd() + '/server/trainer/TrainerDatabase.js');

// A mock clue entry with valid data populated.
const kValidClueEntry = new ClueEntry.Builder()
        .setJCategory('jCategory')
        .setClue('clue')
        .setAnswer('answer')
        .setRound(ClueEntry.Round.JEOPARDY)
        .setDollarValue(1000)
        .setAirDate('2009-09-01')
        .setTrainerCategory('TRAINER_CATEGORY')
        .setClueType(ClueEntry.ClueType.DEFAULT)
        .build();

describe('TrainerDatabaseTest', function () {
  describe('addClueEntry', function () {
    it('shouldRunExpectedQuery', function () {
      let trainerDb = new TrainerDatabase(new MockDatabase());

      trainerDb.addClueEntry(kValidClueEntry);

      trainerDb.db.lastQuery.should.equal('insert into `clues` (`air_date`, `answer`, `clue`, '
        + '`dollar_value`, `j_category`, `round`) values (\'2009-09-01\', \'answer\', \'clue\', '
        + '1000, \'jCategory\', \'JEOPARDY\')');
    });

    it('shouldNotRunExpectedQueryOnFailure', function () {
      let trainerDb = new TrainerDatabase(new MockDatabase(/*shouldThrow=*/true));

      trainerDb.addClueEntry(kValidClueEntry);

      trainerDb.db.lastQuery.should.be.empty;
    });
  });

  describe('close', function () {
    it('shouldClose', function () {
      let trainerDb = new TrainerDatabase(new MockDatabase());

      trainerDb.close();

      trainerDb.db.closed.should.be.true;
    });

    it('shouldNotCloseOnFailure', function () {
      let trainerDb = new TrainerDatabase(new MockDatabase(/*shouldThrow=*/true));

      trainerDb.close();

      trainerDb.db.closed.should.be.false;
    });
  });
});
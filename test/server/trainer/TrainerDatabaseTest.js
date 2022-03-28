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
    it('shouldRunQuery', function () {
      let trainerDb = new TrainerDatabase(new MockDatabase());

      trainerDb.addClueEntry(kValidClueEntry);

      trainerDb.db.runQueries.length.should.equal(1);
    });

    it('shouldNotRunExpectedQueryOnFailure', function () {
      let trainerDb = new TrainerDatabase(
        new MockDatabase.Builder().setErrorChain([true]).build());

      trainerDb.addClueEntry(kValidClueEntry);

      trainerDb.db.runQueries.should.be.empty;
    });
  });

  describe('close', function () {
    it('shouldClose', function () {
      let trainerDb = new TrainerDatabase(new MockDatabase());

      trainerDb.close();

      trainerDb.db.closed.should.be.true;
    });

    it('shouldNotCloseOnFailure', function () {
      let trainerDb = new TrainerDatabase(
        new MockDatabase.Builder().setErrorChain([true]).build());

      trainerDb.close();

      trainerDb.db.closed.should.be.false;
    });
  });

  describe('getNextUnseenJCategory', function () {
    it('shouldReturnExpectedClueEntries', function () {
      // Set expected values for fetching category from db.
      let categoryResult = {};
      categoryResult[ClueEntry.SqlColumns.J_CATEGORY] = 'jCategory';
      categoryResult[ClueEntry.SqlColumns.ROUND] = ClueEntry.Round.JEOPARDY;
      categoryResult[ClueEntry.SqlColumns.AIR_DATE] = '2009-09-14';
      // Set expected clue to be found from category.
      let clueRows = [{}];
      clueRows[0][ClueEntry.SqlColumns.J_CATEGORY] = 'jCategory';
      clueRows[0][ClueEntry.SqlColumns.ROUND] = ClueEntry.Round.JEOPARDY;
      clueRows[0][ClueEntry.SqlColumns.AIR_DATE] = '2009-09-14';
      clueRows[0][ClueEntry.SqlColumns.CLUE] = 'clue';
      let mockDb = new MockDatabase.Builder()
        .setResultChain([categoryResult, clueRows])
        .setErrorChain([false, false])
        .build();
      let trainerDb = new TrainerDatabase(mockDb);

      let clueEntries = trainerDb.getNextUnseenJCategory();

      clueEntries.length.should.equal(1);
      clueEntries[0].should.deep.equal(ClueEntry.fromSqlRow(clueRows[0]));
    });

    it('shouldNotReturnCluesOnCategoryFailure', function () {
      let mockDb = new MockDatabase.Builder()
        .setResultChain([{}])
        .setErrorChain([true])
        .build();
      let trainerDb = new TrainerDatabase(mockDb);

      let clueEntries = trainerDb.getNextUnseenJCategory();

      clueEntries.should.be.empty;
    });

    it('shouldNotReturnCluesOnClueFailure', function () {
      // Set expected values for fetching category from db.
      let categoryResult = {};
      categoryResult[ClueEntry.SqlColumns.J_CATEGORY] = 'jCategory';
      categoryResult[ClueEntry.SqlColumns.ROUND] = ClueEntry.Round.JEOPARDY;
      categoryResult[ClueEntry.SqlColumns.AIR_DATE] = '2009-09-14';
      let mockDb = new MockDatabase.Builder()
        .setResultChain([categoryResult, []])
        .setErrorChain([false, true])
        .build();
      let trainerDb = new TrainerDatabase(mockDb);

      let clueEntries = trainerDb.getNextUnseenJCategory();

      clueEntries.should.be.empty;
    });
  });

  describe('getClueEntriesForTrainerCategory', function () {
    it('shouldReturnExpectedClueEntries', function () {
      let clueRows = [{}];
      clueRows[0][ClueEntry.SqlColumns.TRAINER_CATEGORY] = 'trainerCategory';
      clueRows[0][ClueEntry.SqlColumns.ROUND] = ClueEntry.Round.JEOPARDY;
      clueRows[0][ClueEntry.SqlColumns.AIR_DATE] = '2009-09-14';
      clueRows[0][ClueEntry.SqlColumns.CLUE] = 'clue';
      let mockDb = new MockDatabase.Builder()
        .setResultChain([clueRows])
        .setErrorChain([false])
        .build();
      let trainerDb = new TrainerDatabase(mockDb);

      let clueEntries = trainerDb.getClueEntriesForTrainerCategory('trainerCategory');

      clueEntries.length.should.equal(1);
      clueEntries[0].should.deep.equal(ClueEntry.fromSqlRow(clueRows[0]));
    });

    it('shouldSetExpectedLimitInQuery', function () {
      let mockDb = new MockDatabase.Builder()
        .setResultChain([[]])
        .setErrorChain([false])
        .build();
        let trainerDb = new TrainerDatabase(mockDb);

      let clueEntries = trainerDb.getClueEntriesForTrainerCategory(
        'trainerCategory', { limit: 10 });

      mockDb.runQueries.length.should.equal(1);
      mockDb.runQueries[0].should.contain('limit 10');
    });

    it('shouldSetExpectedOffsetInQuery', function () {
      let mockDb = new MockDatabase.Builder()
        .setResultChain([[]])
        .setErrorChain([false])
        .build();
        let trainerDb = new TrainerDatabase(mockDb);

      let clueEntries = trainerDb.getClueEntriesForTrainerCategory(
        'trainerCategory', { offset: 10 });

      mockDb.runQueries.length.should.equal(1);
      mockDb.runQueries[0].should.contain('offset 10');
    });

    it('shouldNotReturnCluesOnFailure', function () {
      let mockDb = new MockDatabase.Builder()
        .setResultChain([[]])
        .setErrorChain([true])
        .build();
      let trainerDb = new TrainerDatabase(mockDb);

      let clueEntries = trainerDb.getClueEntriesForTrainerCategory('trainerCategory');

      clueEntries.should.be.empty;
    });
  });
});
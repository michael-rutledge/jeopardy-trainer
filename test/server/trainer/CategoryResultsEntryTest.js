const expect = require('chai').expect;
const should = require('chai').should();

const CategoryResultsEntry = require(`${process.cwd()}/server/trainer/CategoryResultsEntry.js`);

describe('CategoryResultsEntryTest', function () {
  describe('fromSqlRow', function () {
    it('shouldReturnExpectedValue', function () {
      let sqlRow = {};
      sqlRow[CategoryResultsEntry.SqlColumns.NUM_CORRECT] = 3;
      sqlRow[CategoryResultsEntry.SqlColumns.TOTAL_TIMES_ASKED] = 10;

      let categoryResultsEntry = CategoryResultsEntry.fromSqlRow('TRAINER_CATEGORY', sqlRow);

      categoryResultsEntry.trainerCategory.should.equal('TRAINER_CATEGORY');
      categoryResultsEntry.numCorrect.should.equal(3);
      categoryResultsEntry.totalTimesAsked.should.equal(10);
    });
  });
});
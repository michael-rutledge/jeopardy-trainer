const AutoBuilder = require(`${process.cwd()}/server/utility/AutoBuilder.js`);

// Enum for sql columns that would represent given values in a row.
const SqlColumns = {
  NUM_CORRECT: 'num_correct',
  TOTAL_TIMES_ASKED: 'total_times_asked',
};

// Represents the results found for a given trainer category, children included.
class CategoryResultsEntry {
  constructor () {
    this.trainerCategory = null;
    this.numCorrect = 0;
    this.totalTimesAsked = 0;
  }
}

module.exports = CategoryResultsEntry;
CategoryResultsEntry.Builder = AutoBuilder(CategoryResultsEntry);
CategoryResultsEntry.SqlColumns = SqlColumns;

// Returns a CategoryResultsEntry object from the given sqlRow and trainer category it represents.
CategoryResultsEntry.fromSqlRow = function (trainerCategory, row) {
  return new CategoryResultsEntry.Builder()
    .setTrainerCategory(trainerCategory)
    .setNumCorrect(row[SqlColumns.NUM_CORRECT])
    .setTotalTimesAsked(row[SqlColumns.TOTAL_TIMES_ASKED])
    .build();
}
// Mocks sqllite queries made by jeopardy-trainer.
class MockDatabase {
  constructor () {
    // The expected chronological sequence of sql results.
    this.resultChain = [];

    // The expected chronological sequence of boolean failure states.
    this.errorChain = [];

    // A chronological list of sql query strings that have been run by the mock db.
    this.runQueries = [];

    // Query prepared by the db to run synchronously.
    this.preparedQuery = null;

    // Whether the mock db is closed.
    this.closed = false;
  }


  // PUBLIC METHODS

  // Mocks a db select query for multiple items.
  all() {
    return this.get();
  }

  // Mocks a db closure.
  close() {
    this._maybeThrow(this.errorChain.shift(), 'close error');
    this.closed = true;
  }

  // Mocks a db select query for one item.
  get() {
    let err = null;
    if (this.errorChain.shift()) {
      throw new Error('get error');
    }
    this.runQueries.push(this.preparedQuery);
    return this.resultChain.shift();
  }

  // Mocks the db preparing a statement to run.
  prepare(query) {
    this.preparedQuery = query;
    return this;
  }

  // Mocks a db query being run.
  run() {
    this._maybeThrow(this.errorChain.shift(), 'run error');
    this.runQueries.push(this.preparedQuery);
  }


  // PRIVATE METHODS

  _maybeThrow(shouldThrow, message) {
    if (shouldThrow) {
      throw new Error(message);
    }
  }
}

MockDatabase.Builder = class {
  constructor () {
    this._mockDatabase = new MockDatabase();
  }

  build() {
    return this._mockDatabase;
  }

  setResultChain(resultChain) {
    this._mockDatabase.resultChain = resultChain;
    return this;
  }

  setErrorChain(errorChain) {
    this._mockDatabase.errorChain = errorChain;
    return this;
  }
};

module.exports = MockDatabase;
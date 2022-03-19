// Mocks sqllite queries made by jeopardy-trainer.
class MockDatabase {
  constructor (shouldThrow = false) {
    this.lastQuery = '';
    this.closed = false;
    this.shouldThrow = shouldThrow;
  }


  // PUBLIC METHODS

  // Mocks a db closure.
  close() {
    this._maybeThrow('close error');
    this.closed = true;
  }

  // Mocks a db query being run.
  run(query) {
    this._maybeThrow('run error');
    this.lastQuery = query;
  }


  // PRIVATE METHODS

  _maybeThrow(message) {
    if (this.shouldThrow) {
      throw message;
    }
  }
}

module.exports = MockDatabase;
const expect = require('chai').expect;
const should = require('chai').should();

const MockDatabase = require(`${process.cwd()}/test/mocks/MockDatabase.js`);
const Trainer = require(`${process.cwd()}/server/trainer/Trainer.js`);
const TrainerDatabase = require(`${process.cwd()}/server/trainer/TrainerDatabase.js`);

function getMockedTrainer(mockDb = new MockDatabase()) {
  let trainerDb = new TrainerDatabase(mockDb);
  return new Trainer(trainerDb);
}

// Most of the functionality of the Trainer is not unit tested.
describe('TrainerTest', function () {
  describe('constructor', function () {
    it('shouldSetMembers', function () {
      let trainer = getMockedTrainer();

      expect(trainer.trainerDatabase).to.not.be.null;
      expect(trainer.tct).to.not.be.null;
    });
  });

  describe('endSession', function () {
    it('shouldCloseTrainerDatabase', function () {
      let trainer = getMockedTrainer();

      trainer.endSession();

      trainer.trainerDatabase.db.closed.should.be.true;
    });
  });
});
const inquirer = require('inquirer');

const ClueEntry = require(process.cwd() + '/server/trainer/ClueEntry.js');
const TrainerDatabase = require(process.cwd() + '/server/trainer/TrainerDatabase.js');

// Handles CLI prompts for the user to engage in training.
// TODO: implement initial public methods
class Trainer {
  constructor () {
    this.trainerDatabase = new TrainerDatabase();
  }


  // PUBLIC METHODS

  // End the current training session.
  endSession() {
    this.trainerDatabase.close();
  }

  // 
  mainMenu() {
  }

  // 
  startSession() {
    this.mainMenu();
  }
}

module.exports = Trainer;
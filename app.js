// Entry point for jeopardy-trainer.

const ClueEntry = require(process.cwd() + '/server/trainer/ClueEntry.js');
const Trainer = require(process.cwd() + '/server/trainer/Trainer.js');
const TrainerDatabase = require(process.cwd() + '/server/trainer/TrainerDatabase.js');

// MAIN METHOD
let trainer = new Trainer();
trainer.mainMenu();

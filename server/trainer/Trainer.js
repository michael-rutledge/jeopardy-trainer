const colors = require('colors');
const inquirer = require('inquirer');

const ClueEntry = require(`${process.cwd()}/server/trainer/ClueEntry.js`);
const Logger = require(`${process.cwd()}/server/utility/Logger.js`);
const TrainerCategoryTrie = require(`${process.cwd()}/server/trainer/TrainerCategoryTrie.js`);
const TrainerDatabase = require(`${process.cwd()}/server/trainer/TrainerDatabase.js`);

const kSeparator = new inquirer.Separator();

// Handles CLI prompts for the user to engage in training.
class Trainer {
  constructor (trainerDatabase = new TrainerDatabase()) {
    this.trainerDatabase = trainerDatabase;
    this.tct = new TrainerCategoryTrie();
  }


  // PUBLIC METHODS

  // Assigns a trainerCategory to the current clue, at the user's discretion.
  async defineTrainerCategory() {
    let trainerCategory = null;
    let currentTrieNode = this.tct.getRoot();
    let doneString = 'Done (select this trainer category)';

    do {
      let subNodes = Object.keys(currentTrieNode.children).map(
        key => currentTrieNode.children[key]);
      let subcategories = subNodes.map( subNode => subNode.subcategory );
      let followups = subcategories.map(subcategory =>
        (() => { return currentTrieNode.children[subcategory] }));
      if (currentTrieNode !== this.tct.getRoot()) {
        subcategories.unshift(doneString);
        followups.unshift(() => { return currentTrieNode });
      }
      let followup = await this._promptOneList('Select subcategory: ', subcategories, followups);
      let nextNode = followup();
      if (nextNode === currentTrieNode) {
        break;
      }
      currentTrieNode = nextNode;
    } while (true);

    return currentTrieNode.getFullCategory();
  }

  // End the current training session.
  endSession() {
    this.trainerDatabase.close();
  }

  // The main entry point for the trainer.
  async mainMenu() {
    let followup = null;

    // The tool should run until the user quits.
    while (true) {
      Logger.logConsole('MAIN MENU');
      followup = await this._promptOneList('What would you like to do?',
        ['Play next unseen j_category', 'Play trainer_category', 'Quit'],
        ['playNextUnseenJCategory', 'playTrainerCategory', null]);
      // A followup means we keep running.
      if (followup) {
        await this[followup]();
      } else {
        this.endSession();
        break;
      }
    }
  }

  // Plays questions from the next chronological j category that hasn't been seen by the user.
  async playNextUnseenJCategory() {
    let cutoutCallback = null;
    let unseenClueEntries = this.trainerDatabase.getNextUnseenJCategory();
    for (let i = 0; i < unseenClueEntries.length; ++i) {
      cutoutCallback = await this.presentClue(unseenClueEntries[i]);
    }
  }

  // Plays questions from a given trainer category in random order.
  // TODO: implement this
  async playTrainerCategory() {
  }

  // Presents a clue and records the result to the trainer db.
  async presentClue(clueEntry) {
    // Log the clue to console for the user to see and assess.
    Logger.logConsole(`  Air date: ${clueEntry.airDate}`);
    Logger.logConsole(`J Category: ${clueEntry.jCategory}`);
    Logger.logConsole(`Round: ${clueEntry.round}`);
    if (clueEntry.trainerCategory) {
      Logger.logConsole(`Trainer Category: ${clueEntry.trainerCategory}`);
    }
    Logger.logConsole(kSeparator);
    Logger.logConsole(colors.bold(clueEntry.clue));
    Logger.logConsole(kSeparator);

    // Give the user a chance to try out the question, and let them reveal the answer.
    await this._promptOneList('Reveal when ready',['Reveal']);
    Logger.logConsole(kSeparator);
    Logger.logConsole(`Answer: ${clueEntry.answer}`.bold);
    Logger.logConsole(kSeparator);

    // Set the trainer category.
    let trainerCategory = clueEntry.trainerCategory;
    if (!trainerCategory) {
      trainerCategory = await this.defineTrainerCategory();
      this.trainerDatabase.setTrainerCategoryForClueEntry(trainerCategory, clueEntry);
      this.tct.insert(trainerCategory);
    }

    // Add the result to the 'results' table of the trainer db.
    let followupLambda = await this._promptOneList(`How'd you do?`,
      ['Correct', 'Incorrect, but heard of', 'Incorrect, and not heard of'],
      [() => { return [/*correct=*/true, /*heardOf=*/true]; },
      () => { return [/*correct=*/false, /*heardOf=*/true]; },
      () => { return [/*correct=*/false, /*heardOf=*/false]; }]);
    let results = followupLambda();
    let correct = results[0];
    let heardOf = results[1];
    this.trainerDatabase.addResultEntry(trainerCategory, clueEntry.round, correct, heardOf);
  }


  // PRIVATE METHODS

  // Prompts the user with one inquirer prompt.
  async _promptOneList(message, choices, followups = null) {
    followups = followups ? followups : choices;
    let answers = await inquirer.prompt({
      type: 'rawlist',
      name: 'oneList',
      message: message,
      choices: choices
    });
    return followups[choices.indexOf(answers['oneList'])];
  }
}

module.exports = Trainer;
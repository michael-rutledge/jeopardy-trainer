// This script scrapes questions from J archive and stores them in the QuestionBank.

const axios = require('axios');
const htmlParser = require('node-html-parser');

const TrainerDatabase = require(process.cwd() + '/server/trainer/TrainerDatabase.js');
const ClueEntry = require(process.cwd() + '/server/trainer/ClueEntry.js');
const Logger = require(process.cwd() + '/server/utility/Logger.js');

// Episode to start from chronologically when scraping J Archive. This is done to prevent super old
// episodes from showing up, as their questions might out of date.
//
// Season 26 Episode 1 (2009-09-14)
const SEED_EPISODE_LINK = 'https://www.j-archive.com/showgame.php?game_id=3575';
// 'https://www.j-archive.com/showgame.php?game_id=3135'
// Episode to stop parsing at exclusively. This means the episode link provided will not be scraped
// and stored. Optional.
// Season 27 Episode 1
const STOP_EPISODE_LINK = '';
const J_ARCHIVE_LINK_PREFIX = 'https://www.j-archive.com/';
const NEXT_EPISODE_TEXT = 'next game';

// Amount of clues present in a Jeopardy category.
const CATEGORY_CLUE_COUNT = 5;
// Amount of categories present in a Jeopardy round.
const ROUND_CATEGORY_COUNT = 6;

const ROUND_HTML_IDS = {};
ROUND_HTML_IDS[ClueEntry.Round.JEOPARDY] = '#jeopardy_round';
ROUND_HTML_IDS[ClueEntry.Round.DOUBLE_JEOPARDY] = '#double_jeopardy_round';
ROUND_HTML_IDS[ClueEntry.Round.FINAL_JEOPARDY] = '#final_jeopardy_round';

let trainerDb = new TrainerDatabase();

// Returns the URL for the next chronological episode in relation to the given episodeData.
//
// Returns an empty string if no next episode is found/desired.
function getNextEpisodeLink(episodeData) {
  let links = episodeData.querySelector('#contestants').querySelectorAll('a');

  for (let i = 0; i < links.length; ++i) {
    let linkText = links[i].text;
    let linkHref = J_ARCHIVE_LINK_PREFIX + links[i].getAttribute('href');
    if (linkText && linkText.includes(NEXT_EPISODE_TEXT) && linkHref !== STOP_EPISODE_LINK) {
      return linkHref;
    }
  }

  return '';
}

// Returns the air date of the given episodeData in the form yyyy-mm-dd as a string.
function getAirDate(episodeData) {
  let airDateText = episodeData.querySelector('title').text;
  return airDateText.substring(airDateText.length - 10);
}

// Returns the dollar value of the clue tag given as an integer.
function getClueDollarValue(clue) {
  clueValue = clue.querySelector('.clue_value');
  if (!clueValue) {
    ddValue = clue.querySelector('.clue_value_daily_double');
    if (!ddValue) {
      return 0;
    }
    return parseInt(ddValue.text.replace(/,/g, '').substring(5));
  }
  return parseInt(clueValue.text.substring(1));
}

// Returns html hidden within a string. Needed for finding answers due to a quirk of j archive.
function getHiddenHtml(source) {
  let htmlStack = [];
  let i = 0, j = source.length-1;

  for (; i < source.length && source[i] !== '<'; ++i);
  for (; j > i && source[j] !== '>'; --j);

  return htmlParser.parse(source.substring(i, j+1).replace(/\\"/g, '"'));
}

// Gets the correct answer from the given clue.
function getAnswerFromClue(clue) {
  let div = clue.querySelector('div');
  let onMouseOverString = div.getAttribute('onmouseover');
  let hiddenHtml = getHiddenHtml(onMouseOverString);

  answerData = hiddenHtml.querySelector('.correct_response');
  if (answerData) {
    return answerData.text;
  }
}

// Returns a list of ClueEntry objects for the clues found in the given episodeData.
function getClueEntriesForRound(episodeData, round) {
  let clueEntries = [];
  let roundData = episodeData.querySelector(ROUND_HTML_IDS[round]);
  if (!roundData) return clueEntries;
  let isFinalJeopardy = round === ClueEntry.Round.FINAL_JEOPARDY;
  if (!isFinalJeopardy) { roundData = roundData.querySelector('.round'); }
  let categories = roundData.querySelectorAll('.category');
  let clues = roundData.querySelectorAll('.clue');
  let airDate = getAirDate(episodeData);

  for (let i = 0; i < clues.length; ++i) {
    let clue = clues[i];
    let categoryData = categories[Math.floor(i % ROUND_CATEGORY_COUNT)];
    let jCategory = categoryData.querySelector('.category_name').text;

    // Ignore clue if it never got revealed.
    if (!clue.querySelector('.clue_text')) {
      continue;
    }

    let clueEntry = new ClueEntry.Builder()
      .setJCategory(jCategory)
      .setClue(clue.querySelector('.clue_text').text)
      .setAnswer(getAnswerFromClue(isFinalJeopardy ? categoryData : clue))
      .setRound(round)
      .setDollarValue(getClueDollarValue(clue))
      .setAirDate(airDate)
      .build();
    clueEntries.push(clueEntry);
  }

  return clueEntries;
}

function getFilePath(airDate) {
  return './server/data/clues/' + airDate + '.json';
}

function storeQuestionsFromEpisode(episodeData) {
  let airDate = getAirDate(episodeData);
  let clueEntries = [];
  Logger.logInfo('STORING QUESTIONS FROM EPISODE: ' + airDate);

  // Get the clue entries.
  clueEntries = clueEntries.concat(
    getClueEntriesForRound(episodeData, ClueEntry.Round.JEOPARDY),
    getClueEntriesForRound(episodeData, ClueEntry.Round.DOUBLE_JEOPARDY),
    getClueEntriesForRound(episodeData, ClueEntry.Round.FINAL_JEOPARDY));
  Logger.logInfo('  clueEntries found: ' + clueEntries.length);

  // Then add them to the DB.
  for (let i = 0; i < clueEntries.length; ++i) {
    trainerDb.addClueEntry(clueEntries[i]);
  }
}

function scrapeEpisodeLink(episodeLink) {
  Logger.logInfo('Scraping episode: ' + episodeLink);
  axios
  .get(episodeLink)
  .then(res => {
    // Store episode that was found.
    let episodeData = htmlParser.parse(res.data);
    storeQuestionsFromEpisode(episodeData);

    // Attempt to scrape next episode.
    let nextEpisodeLink = getNextEpisodeLink(episodeData);
    if (nextEpisodeLink) {
      scrapeEpisodeLink(nextEpisodeLink);
    } else {
      Logger.logInfo('No more episodes found');
      trainerDb.close();
    }
  })
  .catch(error => {
    Logger.logError('Failed to retrieve episode (' + episodeLink + '): ' + error);
    trainerDb.close();
  })
}

// MAIN
scrapeEpisodeLink(SEED_EPISODE_LINK);
const Logger = require(`${process.cwd()}/server/utility/Logger.js`);

const TRAINER_CATEGORY_SEPARATOR = '::';

const BASELINE_CATEGORIES = [
  'ARTS::LITERATURE',
  'ARTS::SCULPTURE',
  'ARTS::PAINTING',
  'ARTS::FILM',
  'ARTS::BALLET',
  'ARTS::OPERA',
  'ARTS::MUSIC::POP',
  'ARTS::MUSIC::CLASSICAL',
  'ARTS::MUSICALS',
  'ARTS::PLAYS',
  'ARTS::PLAYS::SHAKESPEARE',
  'ARTS::PHILOSOPHY',
  'SCIENCE::MATH',
  'SCIENCE::ASTRONOMY::THE_PLANETS',
  'SCIENCE::ASTRONOMY::SPACEFLIGHT',
  'SCIENCE::ASTRONOMY::ASTRONOMERS',
  'SCIENCE::CHEMISTRY::PERIODIC_TABLE',
  'SCIENCE::BIOLOGY::ANIMALS',
  'SCIENCE::BIOLOGY::TAXONOMY',
  'SCIENCE::BIOLOGY::HUMAN_ANATOMY',
  'SCIENCE::GEOLOGY',
  'SCIENCE::PHYSICS',
  'GEOGRAPHY::CITIES',
  'GEOGRAPHY::STATES_AND_PROVINCES',
  'GEOGRAPHY::MOUNTAINS_AND_RANGES',
  'GEOGRAPHY::RIVERS',
  'GEOGRAPHY::BODIES_OF_WATER',
  'GEOGRAPHY::DESERTS',
  'GEOGRAPHY::ISLANDS',
  'GEOGRAPHY::GEOPOLITICS',
  'GEOGRAPHY::COLLEGES',
  'HISTORY::PREHISTORY',
  'HISTORY::BCE',
  'HISTORY::CE',
  'HISTORY::MIDDLE_AGES',
  'HISTORY::17TH_CENTURY',
  'HISTORY::18TH_CENTURY',
  'HISTORY::19TH_CENTURY',
  'HISTORY::19TH_CENTURY::US_CIVIL_WAR',
  'HISTORY::20TH_CENTURY',
  'HISTORY::20TH_CENTURY::WWI',
  'HISTORY::20TH_CENTURY::WWII',
  'HISTORY::20TH_CENTURY::COLD_WAR',
  'HISTORY::21ST_CENTURY',
  'HISTORY::CALENDAR',
  'HISTORY::WORLD_LEADERS',
  'HISTORY::WORLD_LEADERS::US_PRESIDENTS',
  'RELIGION::ANCIENT_MYTHOLOGY',
  'RELIGION::CHRISTIANITY',
  'RELIGION::CHRISTIANITY::BIBLE',
  'RELIGION::JUDAISM',
  'RELIGION::ISLAM',
  'RELIGION::BUDDHISM',
  'RELIGION::HINDUISM',
  'SPORTS::FOOTBALL',
  'SPORTS::BASEBALL',
  'SPORTS::BASKETBALL',
  'SPORTS::CRICKET',
  'SPORTS::HOCKEY',
  'SPORTS::TENNIS',
  'SPORTS::SOCCER',
  'SPORTS::OLYMPICS',
  'SPORTS::FUN_AND_GAMES',
  'WORDS::ETYMOLOGY',
  'WORDS::WORDPLAY',
  'WORDS::PHRASES',
  'WORDS::FOREIGN_LANGUAGE',
  'WORDS::ALPHABETS::ENGLISH',
  'WORDS::ALPHABETS::PHONETIC_ALPHABET',
  'WORDS::ALPHABETS::GREEK',
  'FOOD',
  'FOOD::ALCOHOL',
  'TECHNOLOGY',
  'TECHNOLOGY::INVENTIONS',
  'POP_CULTURE::ASTROLOGY',
  'POP_CULTURE::CELEBRITIES',
  'POP_CULTURE::COMPANIES',
  'POP_CULTURE::FADS',
  'POP_CULTURE::TELEVISION',
  'PICTURES',
];

// Acts as a trie node.
class _CategoryTrieNode {
  constructor(subcategory) {
    this.subcategory = subcategory;
    this.parent = null;
    this.children = {};
  }


  // PUBLIC METHODS

  // Returns a string representation of a full category.
  getFullCategory () {
    let output = [];
    let node = this;

    while (node !== null && node.subcategory !== null) {
      output.unshift(node.subcategory);
      node = node.parent;
    }

    return output.join(TRAINER_CATEGORY_SEPARATOR);
  }
}

// A trie of trainer categories.
class TrainerCategoryTrie {
  constructor(trainerCategories = null) {
    this.trie = new _CategoryTrieNode(null);
    trainerCategories = trainerCategories ? trainerCategories : BASELINE_CATEGORIES;
    for (let i = 0; i < trainerCategories.length; ++i) {
      this.insert(trainerCategories[i]);
    }
  }

  // Returns the node associated with the trainerCategory.
  find(trainerCategory) {
    let subcategories = trainerCategory.split(TRAINER_CATEGORY_SEPARATOR);
    let node = this.trie;

    for (let i = 0; i < subcategories.length; ++i) {
      if (!node) return null;
      node = node.children[subcategories[i]];
    }

    return node;
  }

  // Inserts a full category, represented by a list of subcategories, into the trie.
  insert(trainerCategory) {
    let subcategories = trainerCategory.split(TRAINER_CATEGORY_SEPARATOR);
    let node = this.trie;

    for(let i = 0; i < subcategories.length; i++) {
      if (!node.children[subcategories[i]]) {
        node.children[subcategories[i]] = new _CategoryTrieNode(subcategories[i]);
        node.children[subcategories[i]].parent = node;
      }
      node = node.children[subcategories[i]];
    }
  }

  // Returns the child trainer categories of the given trainer category, only going one level deep.
  // Example: getChildCategories('ARTS') => ['ARTS::MUSIC', 'ARTS::PLAYS', ...]
  getChildCategories(trainerCategory = null) {
    let node = trainerCategory ? this.find(trainerCategory) : this.trie;
    let childCategories = [];

    if (!node) return childCategories;

    Object.keys(node.children).forEach((childKey) => {
      childCategories.push(node.children[childKey].getFullCategory());
    });

    return childCategories;
  }

  // Returns the root node of the trie.
  getRoot() {
    return this.trie;
  }
}

module.exports = TrainerCategoryTrie;
TrainerCategoryTrie.TRAINER_CATEGORY_SEPARATOR = TRAINER_CATEGORY_SEPARATOR;
const TRAINER_CATEGORY_SEPARATOR = '::';

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
  constructor(trainerCategories = []) {
    this.trie = new _CategoryTrieNode(null);
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
  getChildCategories(trainerCategory) {
    let node = this.find(trainerCategory);
    let childCategories = [];

    if (!node) return childCategories;

    Object.keys(node.children).forEach((childKey) => {
      childCategories.push(node.children[childKey].getFullCategory());
    });

    return childCategories;
  }
}

module.exports = TrainerCategoryTrie;
TrainerCategoryTrie.TRAINER_CATEGORY_SEPARATOR = TRAINER_CATEGORY_SEPARATOR;
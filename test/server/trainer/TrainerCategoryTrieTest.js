const expect = require('chai').expect;
const should = require('chai').should();

const TrainerCategoryTrie = require(`${process.cwd()}/server/trainer/TrainerCategoryTrie.js`);

describe('TrainerCategoryTrieTest', function () {
  describe('constructor', function () {
    it('shouldGiveExpectedResultForEmptyInput', function () {
      let tct = new TrainerCategoryTrie();

      expect(tct.trie.subcategory).to.be.null;
      expect(tct.trie.parent).to.be.null;
      tct.trie.children.should.be.empty;
    });

    it('shouldGiveExpectedResultForNonEmptyInput', function () {
      let tct = new TrainerCategoryTrie([
        'ARTS', 'ARTS::MUSIC', 'ARTS::PLAYS', 'ARTS::PLAYS::SHAKESPEARE', 'SPORTS']);

      // root node
      expect(tct.trie.subcategory).to.be.null;
      expect(tct.trie.parent).to.be.null;
      Object.keys(tct.trie.children).should.deep.equal([
        'ARTS', 'SPORTS']);
      // ARTS node
      let artsNode = tct.trie.children['ARTS'];
      expect(artsNode).to.not.be.null;
      artsNode.subcategory.should.equal('ARTS');
      artsNode.parent.should.deep.equal(tct.trie);
      Object.keys(artsNode.children).should.deep.equal([
        'MUSIC', 'PLAYS']);
      // ARTS::MUSIC node
      let musicNode = artsNode.children['MUSIC'];
      expect(musicNode).to.not.be.null;
      musicNode.subcategory.should.equal('MUSIC');
      musicNode.parent.should.deep.equal(artsNode);
      musicNode.children.should.be.empty;
      // ARTS::PLAYS node
      let playsNode = artsNode.children['PLAYS'];
      expect(playsNode).to.not.be.null;
      playsNode.subcategory.should.equal('PLAYS');
      playsNode.parent.should.deep.equal(artsNode);
      Object.keys(playsNode.children).should.deep.equal(['SHAKESPEARE']);
      // ARTS::PLAYS::SHAKESPEARE node
      let shakespeareNode = playsNode.children['SHAKESPEARE'];
      expect(shakespeareNode).to.not.be.null;
      shakespeareNode.subcategory.should.equal('SHAKESPEARE');
      shakespeareNode.parent.should.deep.equal(playsNode);
      shakespeareNode.children.should.be.empty;
    });
  });

  describe('find', function () {
    it('shouldGiveExpectedResult', function () {
      let tct = new TrainerCategoryTrie([
        'ARTS', 'ARTS::MUSIC', 'ARTS::PLAYS', 'ARTS::PLAYS::SHAKESPEARE', 'SPORTS']);

      let node = tct.find('ARTS::PLAYS');

      expect(node).to.not.be.null;
      node.subcategory.should.equal('PLAYS');
      node.parent.should.deep.equal(tct.trie.children['ARTS']);
      Object.keys(node.children).should.deep.equal(['SHAKESPEARE']);
    });

    it('shouldReturnNullForInvalidNode', function () {
      let tct = new TrainerCategoryTrie([
        'ARTS', 'ARTS::MUSIC', 'ARTS::PLAYS', 'ARTS::PLAYS::SHAKESPEARE', 'SPORTS']);

      let node = tct.find('INVALID::CATEGORY');

      expect(node).to.be.null;
    });
  });

  describe('insert', function () {
    it('shouldInsertCorrectlyAtRoot', function () {
      let tct = new TrainerCategoryTrie();

      tct.insert('ARTS');

      let artsNode = tct.trie.children['ARTS'];
      expect(artsNode).to.not.be.null;
      artsNode.subcategory.should.equal('ARTS');
      artsNode.parent.should.deep.equal(tct.trie);
      artsNode.children.should.be.empty;
    });

    it('shouldInsertCorrectlAtChild', function () {
      let tct = new TrainerCategoryTrie(['ARTS']);

      tct.insert('ARTS::MUSIC');

      let artsNode = tct.trie.children['ARTS'];
      let musicNode = artsNode.children['MUSIC'];
      expect(musicNode).to.not.be.null;
      musicNode.subcategory.should.equal('MUSIC');
      musicNode.parent.should.deep.equal(artsNode);
      musicNode.children.should.be.empty;
    });
  });

  describe('getChildCategories', function () {
    it('shouldGiveExpectedResult', function () {
      let tct = new TrainerCategoryTrie([
        'ARTS', 'ARTS::MUSIC', 'ARTS::PLAYS', 'ARTS::PLAYS::SHAKESPEARE', 'SPORTS']);

      let childCategories = tct.getChildCategories('ARTS');

      childCategories.should.deep.equal(['ARTS::MUSIC', 'ARTS::PLAYS']);
    });
  });
});
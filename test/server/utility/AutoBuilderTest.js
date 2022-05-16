const expect = require('chai').expect;
const should = require('chai').should();

const AutoBuilder = require(`${process.cwd()}/server/utility/AutoBuilder.js`);

let MockClass = class {
  constructor () {
    this.intField = 1;
    this.stringField = 'foo';
    this.boolField = true;
  }

  fooFunction() {}
  barFunction() {}
}

describe('AutoBuilderTest', function () {
  it('shouldSetExpectedMethods', function () {
    let builder = new (AutoBuilder(MockClass))();

    expect(builder.build).to.not.be.undefined;
    expect(builder.setIntField).to.not.be.undefined;
    expect(builder.setStringField).to.not.be.undefined;
    expect(builder.setBoolField).to.not.be.undefined;
    // Should ignore method members
    expect(builder.setFooFunction).to.be.undefined;
    expect(builder.setBarFunction).to.be.undefined;
  });

  it('shouldSetExpectedValuesInBuiltItem', function () {
    let builder = new (AutoBuilder(MockClass))();

    builder.setIntField(2);
    builder.setStringField('bar');
    builder.setBoolField(false);
    let item = builder.build();

    item.intField.should.equal(2);
    item.stringField.should.equal('bar');
    item.boolField.should.be.false;
  });
});
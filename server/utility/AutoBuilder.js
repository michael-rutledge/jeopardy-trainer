function _toLowerCamel(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function _toUpperCamel(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Returns an automatically generated Builder class for the given class.
function AutoBuilder(OriginalClass) {
  let BuilderClass = class {
    constructor () {
      let buildingValue = new OriginalClass();
      let className = buildingValue.constructor.name;
      let smallClassName = _toLowerCamel(className);
      let originalKeys = Object.keys(buildingValue);
      let buildingValueKey = '_' + smallClassName;

      // Create value to be built
      this[buildingValueKey] = buildingValue;

      // Create setters
      for (let i = 0; i < originalKeys.length; ++i) {
        this['set' + _toUpperCamel(originalKeys[i])] = function (value) {
          this[buildingValueKey][originalKeys[i]] = value;
          return this;
        }
      }

      // Create build method
      this['build'] = function () { return this[buildingValueKey] };
    }
  }

  return BuilderClass;
}

module.exports = AutoBuilder;
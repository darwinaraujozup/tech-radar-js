const IDEAL_BLIP_WIDTH = 16;
const Blip = function (name, ring, isNew, topic, description, wasUpdated = false) {
  var self, number;

  self = {};
  number = -1;

  self.width = IDEAL_BLIP_WIDTH;

  self.name = function () {
    return name;
  };

  self.topic = function () {
    return topic || '';
  };

  self.description = function () {
    return description || '';
  };

  self.isNew = function () {
    return isNew;
  };

  self.ring = function () {
    return ring;
  };

  self.number = function () {
    return number;
  };

  self.setNumber = function (newNumber) {
    number = newNumber;
  };

  self.wasUpdated = function () {
    return wasUpdated;
  }

  return self;
};

module.exports = Blip;

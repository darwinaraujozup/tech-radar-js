const d3 = require('d3');
const _ = {
    map: require('lodash/map'),
    uniqBy: require('lodash/uniqBy'),
    capitalize: require('lodash/capitalize'),
    each: require('lodash/each')
};

const InputSanitizer = require('./inputSanitizer');
const Radar = require('../models/radar');
const Quadrant = require('../models/quadrant');
const Ring = require('../models/ring');
const Blip = require('../models/blip');
const GraphingRadar = require('../graphing/radar');
const MalformedDataError = require('../exceptions/malformedDataError');
const ContentValidator = require('./contentValidator');
const ExceptionMessages = require('./exceptionMessages');

const CSVBuilder = function (url) {
    var self = {};

    self.build = function () {
      const blips = [];
      let itemsFound = document.querySelectorAll('.pg-radar-category-list-item a');
      
      if (itemsFound) {
        itemsFound.forEach((blip) => {
          let { ring } = blip.dataset;
          const { id, description, isnew, name, quadrant, wasupdated } = blip.dataset;

          if (ring && ring === 'Estratégico') {
            ring = "Estrategico"
          }
          
          blips.push({
            id, 
            description,
            name,
            quadrant,
            ring,
            isNew: isnew,
            wasUpdated: wasupdated
          });
        });

        createBlips(blips);
      }
    }

    var createBlips = function (data) {
        try {
          if (data && data.length) {
            const columnNames = Object.keys(data[0]);

            var contentValidator = new ContentValidator(columnNames);
            contentValidator.verifyContent();
            contentValidator.verifyHeaders();
            var blips = _.map(data, new InputSanitizer().sanitize);
            plotRadar('Tech-radar', blips);
            // loadBuddy();
          }
        } catch (exception) {
            plotErrorMessage(exception);
        }
    }

    self.init = function () {
        plotLoading();
        return self;
    };

    return self;
};

const plotRadar = function (title, blips) {
    d3.selectAll(".loading").remove();

    const ringMapOrder = {
      strategic: 0,
      estrategico: 0,
      essential: 1,
      essencial: 1,
      potential: 2,
      potencial: 2,
      deprecated: 3,
      descontinuado: 3,
    };

    var rings = _.map(_.uniqBy(blips, 'ring'), 'ring');
    var ringMap = {};
    var maxRings = 4;

    _.each(rings, function (ringName, i) {
        if (i == maxRings) {
            throw new MalformedDataError(ExceptionMessages.TOO_MANY_RINGS);
        }
        
        ringMap[ringName] = new Ring(ringName, ringMapOrder[ringName.toLowerCase()]);
    });

    var quadrants = {};
    _.each(blips, function (blip) {
        if (!quadrants[blip.quadrant]) {
            quadrants[blip.quadrant] = new Quadrant(_.capitalize(blip.quadrant));
        }
        quadrants[blip.quadrant].add(new Blip(blip.id, blip.name, ringMap[blip.ring], blip.topic, blip.description, blip.isNew.toLowerCase() === 'true', blip.wasUpdated ? blip.wasUpdated.toLowerCase() === 'true' : false))
    });

    var radar = new Radar();
    _.each(quadrants, function (quadrant) {
      radar.addQuadrant(quadrant)
    });

    var size = 700;

    new GraphingRadar(size, radar).init().plot();
}

function plotLoading(content) {
    var content = d3.select('radar')
        .append('div')
        .attr('class', 'loading')
        .append('div')
        .attr('class', 'input-sheet');
}

function plotErrorMessage(exception) {
    d3.selectAll(".loading").remove();
    var message = 'Oops! It seems like there are some problems with loading your data. ';

    if (exception instanceof MalformedDataError) {
        message = message.concat(exception.message);
    } else {
        console.error(exception);
    }

    d3.select('radar')
        .append('div')
        .attr('class', 'error-container')
        .append('div')
        .attr('class', 'error-container__message')
        .append('p')
        .html(message);
}

module.exports = CSVBuilder;

const d3 = require("d3");
const d3tip = require("d3-tip");
const Chance = require("chance");
const _ = require("lodash/core");

const RingCalculator = require("../util/ringCalculator");

const MIN_BLIP_WIDTH = 12;

const Radar = function(size, radar) {
  var svg, radarElement;

  var tip = d3tip()
    .attr("class", "d3-tip")
    .html(function(text) {
      return text;
    });

  tip.direction(function() {
    if (d3.select(".quadrant-table.selected").node()) {
      var selectedQuadrant = d3.select(".quadrant-table.selected");
      if (
        selectedQuadrant.classed("first") ||
        selectedQuadrant.classed("fourth")
      )
        return "ne";
      else return "nw";
    }
    return "n";
  });

  var ringCalculator = new RingCalculator(radar.rings().length, center());

  var self = {};

  function center() {
    return Math.round(size / 2);
  }

  function toRadian(angleInDegrees) {
    return (Math.PI * angleInDegrees) / 180;
  }

  function plotLines(quadrantGroup, quadrant) {
    var startX =
      size * (1 - (-Math.sin(toRadian(quadrant.startAngle)) + 1) / 2);
    var endX =
      size * (1 - (-Math.sin(toRadian(quadrant.startAngle - 90)) + 1) / 2);

    var startY = size * (1 - (Math.cos(toRadian(quadrant.startAngle)) + 1) / 2);
    var endY =
      size * (1 - (Math.cos(toRadian(quadrant.startAngle - 90)) + 1) / 2);

    if (startY > endY) {
      var aux = endY;
      endY = startY;
      startY = aux;
    }

    quadrantGroup
      .append("line")
      .attr("x1", center())
      .attr("x2", center())
      .attr("y1", startY - 2)
      .attr("y2", endY + 2)
      .attr("stroke-width", 1);

    quadrantGroup
      .append("line")
      .attr("x1", endX)
      .attr("y1", center())
      .attr("x2", startX)
      .attr("y2", center())
      .attr("stroke-width", 1);
  }

  function plotQuadrant(rings, quadrant) {
    var quadrantGroup = svg
      .append("g")
      .attr("class", "quadrant-group quadrant-group-" + quadrant.order)
      .on("mouseover", mouseoverQuadrant.bind({}, quadrant.order))
      .on("mouseout", mouseoutQuadrant.bind({}, quadrant.order))
      .on(
        "click",
        selectQuadrant.bind({}, quadrant.order, quadrant.startAngle)
      );

    rings.forEach(function(ring, i) {
      var arc = d3
        .arc()
        .innerRadius(ringCalculator.getRadius(i))
        .outerRadius(ringCalculator.getRadius(i + 1))
        .startAngle(toRadian(quadrant.startAngle))
        .endAngle(toRadian(quadrant.startAngle - 90));

      quadrantGroup
        .append("path")
        .attr("d", arc)
        .attr("class", "ring-arc-" + ring.order())
        .attr("transform", "translate(" + center() + ", " + center() + ")");
    });

    return quadrantGroup;
  }

  function plotTexts(quadrantGroup, rings, quadrant) {
    rings.forEach(function(ring, i) {
      if (quadrant.order === "first" || quadrant.order === "fourth") {
        quadrantGroup
          .append("text")
          .attr("class", `line-text ${ring.name().toLowerCase()}`)
          .attr("y", center() + 4)
          .attr(
            "x",
            center() +
              (ringCalculator.getRadius(i) + ringCalculator.getRadius(i + 1)) /
                2
          )
          .attr("text-anchor", "middle")
          .text(ring.name());
      } else {
        quadrantGroup
          .append("text")
          .attr("class", `line-text ${ring.name().toLowerCase()}`)
          .attr("y", center() + 4)
          .attr(
            "x",
            center() -
              (ringCalculator.getRadius(i) + ringCalculator.getRadius(i + 1)) /
                2
          )
          .attr("text-anchor", "middle")
          .text(ring.name());
      }
    });
  }

  function triangle(blip, x, y, order, group) {
    const container = group
    .append('g')
    .attr("transform", `translate(${x - 8}, ${y - 8})`)
    .attr("class", order)   

    container
    .append(`circle`)
    .attr(`cx`, `7.24229`)
    .attr(`cy`, `6.88961`)
    .attr(`r`, `4.05131`)
    .attr("transform", "rotate(-90 7.24229 6.88961)")
    
    
    container
    .append(`circle`)
    .attr(`cx`, `7.24262`)
    .attr(`cy`, `6.88976`)
    .attr(`r`, `5.76112`)
    .attr("transform", "rotate(-90 7.24229 6.88961)")
    .attr(`stroke`, `#8C909C`)
    .attr("fill", "none")

    return group;
  }
  
  function updateSymbol(blip, x, y, order, group) {
    const container = group
    .append('g')
    .attr("transform", `translate(${x - 8}, ${y - 8})`)
    .attr("class", order)   

    container
    .append(`circle`)
    .attr("cx", "6.89519")
    .attr("cy", "6.78471")
    .attr("r", "4.05131")
    .attr("transform", "rotate(90 6.89519 6.78471)")
    
    
    container
    .append(`path`)
    .attr("d", "M0.634196 6.78407C0.634195 3.32615 3.43739 0.52295 6.89531 0.52295C10.3532 0.52295 13.1564 3.32615 13.1564 6.78407")
    .attr("stroke", "#8C909C")
    .attr("stroke-linecap", "round")
    .attr("fill", "none")

    return group;
  }

  function triangleLegend(x, y, group) {
    return group
      .append("path")
      .attr(
        "d",
        "M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C402.598,306.067,405.426,311.406,412.201,311.406"
      )
      .attr(
        "transform",
        "scale(" +
          22 / 64 +
          ") translate(" +
          (-404 + x * (64 / 22) - 17) +
          ", " +
          (-282 + y * (64 / 22) - 17) +
          ")"
      );
  }

  function circle(blip, x, y, order, group) {
    const container = (group || svg)
    .append('g')
    .attr("transform", `translate(${x - 8}, ${y - 8})`)
    .attr("class", order)   

    container
      .append(`circle`)
      .attr("cx", "4.43245")
      .attr("cy", "4.06783")
      .attr("r", "4.05131")
      .attr("transform", "rotate(180 4.43245 4.06783)")

    return group || svg;

    // return (group || svg)
    //   .append("path")
    //   .attr(
    //     "d",
    //     "M420.084,282.092c-1.073,0-2.16,0.103-3.243,0.313c-6.912,1.345-13.188,8.587-11.423,16.874c1.732,8.141,8.632,13.711,17.806,13.711c0.025,0,0.052,0,0.074-0.003c0.551-0.025,1.395-0.011,2.225-0.109c4.404-0.534,8.148-2.218,10.069-6.487c1.747-3.886,2.114-7.993,0.913-12.118C434.379,286.944,427.494,282.092,420.084,282.092"
    //   )
    //   .attr(
    //     "transform",
    //     "scale(" +
    //       blip.width / 34 +
    //       ") translate(" +
    //       (-404 + x * (34 / blip.width) - 17) +
    //       ", " +
    //       (-282 + y * (34 / blip.width) - 17) +
    //       ")"
    //   )
    //   .attr("class", order);
  }

  function circleLegend(x, y, group) {
    return (group || svg)
      .append("path")
      .attr(
        "d",
        "M420.084,282.092c-1.073,0-2.16,0.103-3.243,0.313c-6.912,1.345-13.188,8.587-11.423,16.874c1.732,8.141,8.632,13.711,17.806,13.711c0.025,0,0.052,0,0.074-0.003c0.551-0.025,1.395-0.011,2.225-0.109c4.404-0.534,8.148-2.218,10.069-6.487c1.747-3.886,2.114-7.993,0.913-12.118C434.379,286.944,427.494,282.092,420.084,282.092"
      )
      .attr(
        "transform",
        "scale(" +
          22 / 64 +
          ") translate(" +
          (-404 + x * (64 / 22) - 17) +
          ", " +
          (-282 + y * (64 / 22) - 17) +
          ")"
      );
  }

  function addRing(ring, order) {
    var table = d3.select(".quadrant-table." + order);
    var collapseId = "quadrant-table." + order + "." + ring;

    var collapseBox = table.append("div").attr("class", "box-collapse");

    var collapseBoxTrigger = collapseBox
      .append("div")
      .attr("class", "box-collapse-trigger");

    collapseBoxTrigger
      .append("button")
      .attr("aria-expanded", "false")
      .attr("aria-controls", collapseId)
      .attr("data-collapse", collapseId)
      .text(ring);

    var collapseContent = collapseBox
      .append("div")
      .attr("class", "box-collapse-content")
      .attr("id", collapseId);

    return collapseContent.append("ul");
  }

  function calculateBlipCoordinates(
    blip,
    chance,
    minRadius,
    maxRadius,
    startAngle
  ) {
    var adjustX =
      Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle));
    var adjustY =
      -Math.cos(toRadian(startAngle)) - Math.sin(toRadian(startAngle));

    var radius = chance.floating({
      min: minRadius + blip.width / 2,
      max: maxRadius - blip.width / 2
    });
    var angleDelta = (Math.asin(blip.width / 2 / radius) * 180) / Math.PI;
    angleDelta = angleDelta > 45 ? 45 : angleDelta;
    var angle = toRadian(
      chance.integer({ min: angleDelta, max: 90 - angleDelta })
    );

    var x = center() + radius * Math.cos(angle) * adjustX;
    var y = center() + radius * Math.sin(angle) * adjustY;

    return [x, y];
  }

  function thereIsCollision(blip, coordinates, allCoordinates) {
    return allCoordinates.some(function(currentCoordinates) {
      return (
        Math.abs(currentCoordinates[0] - coordinates[0]) < blip.width &&
        Math.abs(currentCoordinates[1] - coordinates[1]) < blip.width
      );
    });
  }

  function plotBlips(quadrantGroup, rings, quadrantWrapper) {
    var blips, quadrant, startAngle, order;

    quadrant = quadrantWrapper.quadrant;
    startAngle = quadrantWrapper.startAngle;
    order = quadrantWrapper.order;

    d3.select(".quadrant-table." + order)
      .append("h2")
      .attr("class", "quadrant-table__name")
      .text(quadrant.name());

    blips = quadrant.blips();
    rings.forEach(function(ring, i) {
      var ringBlips = blips.filter(function(blip) {
        return blip.ring() == ring;
      });

      if (ringBlips.length == 0) {
        return;
      }

      var maxRadius, minRadius;

      minRadius = ringCalculator.getRadius(i);
      maxRadius = ringCalculator.getRadius(i + 1);

      var sumRing = ring
        .name()
        .split("")
        .reduce(function(p, c) {
          return p + c.charCodeAt(0);
        }, 0);
      var sumQuadrant = quadrant
        .name()
        .split("")
        .reduce(function(p, c) {
          return p + c.charCodeAt(0);
        }, 0);

      var ringList = addRing(ring.name(), order);
      var allBlipCoordinatesInRing = [];

      ringBlips.forEach(function(blip) {
        const coordinates = findBlipCoordinates(
          blip,
          minRadius,
          maxRadius,
          startAngle,
          allBlipCoordinatesInRing
        );

        allBlipCoordinatesInRing.push(coordinates);
        drawBlipInCoordinates(
          blip,
          coordinates,
          order,
          quadrantGroup,
          ringList
        );
      });
    });
  }

  function findBlipCoordinates(
    blip,
    minRadius,
    maxRadius,
    startAngle,
    allBlipCoordinatesInRing
  ) {
    const maxIterations = 200;
    var coordinates = calculateBlipCoordinates(
      blip,
      chance,
      minRadius,
      maxRadius,
      startAngle
    );
    var iterationCounter = 0;
    var foundAPlace = false;

    while (iterationCounter < maxIterations) {
      if (thereIsCollision(blip, coordinates, allBlipCoordinatesInRing)) {
        coordinates = calculateBlipCoordinates(
          blip,
          chance,
          minRadius,
          maxRadius,
          startAngle
        );
      } else {
        foundAPlace = true;
        break;
      }
      iterationCounter++;
    }

    if (!foundAPlace && blip.width > MIN_BLIP_WIDTH) {
      blip.width = blip.width - 1;
      return findBlipCoordinates(
        blip,
        minRadius,
        maxRadius,
        startAngle,
        allBlipCoordinatesInRing
      );
    } else {
      return coordinates;
    }
  }

  function drawBlipInCoordinates(
    blip,
    coordinates,
    order,
    quadrantGroup,
    ringList
  ) {
    var x = coordinates[0];
    var y = coordinates[1];

    var group = quadrantGroup
      .append("g")
      .attr("class", `blip-link triggerOpenModal ${blip.ring().name().toLowerCase()}`)
      .attr("data-modal", blip.description())
      .attr("data-id", blip.id())
      .attr("aria-controls", blip.description());
    
    if (blip.wasUpdated()) {
      updateSymbol(blip, x, y, order, group);
    } else if (blip.isNew()) {
      triangle(blip, x, y, order, group);
    } else {
      circle(blip, x, y, order, group);
    }

    group
      .append("text")
      .attr("x", x)
      .attr("y", y + 4)
      .attr("class", "blip-text")
      .style("font-size", (blip.width * 10) / 22 + "px")
      .attr("text-anchor", "middle");

    var blipListItem = ringList.append("li");
    var blipText =
      blip.number() +
      ". " +
      blip.name() +
      (blip.topic() ? ". - " + blip.topic() : "");

    blipListItem
      .append("div")
      .attr("class", "blip-list-item triggerOpenModal")
      .attr("data-modal", blip.description())
      .attr("aria-controls", blip.description())
      .text(blipText);

    /*blipListItem.append('a')
      .attr('class', 'btn bg-main-color triggerOpenModal')
      .attr('data-modal', blip.description())
      .attr('aria-controls', blip.description())
      .text(blipText);*/

    var mouseOver = function() {
      d3.selectAll("g.blip-link").attr("opacity", 0.3);
      group.attr("opacity", 1.0);
      blipListItem.selectAll(".blip-list-item").classed("highlight", true);
      tip.show(blip.name());
    };

    var mouseOut = function() {
      d3.selectAll("g.blip-link").attr("opacity", 1.0);
      blipListItem.selectAll(".blip-list-item").classed("highlight", false);
      tip
        .hide()
        .style("left", 0)
        .style("top", 0);
    };

    blipListItem.on("mouseover", mouseOver).on("mouseout", mouseOut);
    group.on("mouseover", mouseOver).on("mouseout", mouseOut);
  }

  function removeHomeLink() {
    d3.select(".home-link").remove();
  }

  function createHomeLink(pageElement) {
    const backButtonText = document.querySelector('.pg-radar-back-button-text').innerText;

    if (pageElement.select(".home-link").empty()) {
      const buttonContainer = pageElement
        .append("div")
        .html(`<span>${backButtonText}</span>`)
        .classed("home-link", true)
        .classed("selected", true)
        .on("click", redrawFullRadar)
        .append("svg")
        .attr("width", "16px")
        .attr("height", "16px")
        .attr("viewbox", "0 0 16 16")
        .attr("fill", "none");

        buttonContainer.append("path")
        .attr(
          "d",
          "M0.504639 8H15.4953"
        )
        .attr(
          "stroke", "#1A2138"
        )
        .attr("stroke-width", "0.8")
        .attr("stroke-linecap", "round");
        
        buttonContainer.append("path")
        .attr(
          "d",
          "M8.49528 0.666504L0.733276 7.49917C0.589776 7.62573 0.507568 7.80784 0.507568 7.99917C0.507568 8.1905 0.589776 8.37261 0.733276 8.49917L8.49528 15.3332"
        )
        .attr(
          "stroke", "#1A2138"
        )
        .attr("stroke-width", "0.8")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");
    }
  }

  function removeRadarLegend() {
    d3.select(".legend").remove();
  }

  function redrawFullRadar() {
    removeHomeLink();
    removeRadarLegend();

    svg.style("left", 0).style("right", 0);

    d3.selectAll(".button")
      .classed("selected", false)
      .classed("full-view", true);

    d3.selectAll(".quadrant-table").classed("selected", false);
    d3.selectAll(".home-link").classed("selected", false);

    d3.selectAll(".quadrant-group")
      .transition()
      .duration(1000)
      .attr("transform", "scale(1)");

    d3.selectAll(".quadrant-group .blip-link")
      .transition()
      .duration(1000)
      .attr("transform", "scale(1)");

    d3.selectAll(".quadrant-group").style("pointer-events", "auto");

    toggleLineTexts('none');
  }

  function plotRadarHeader() {
    var header = d3.select("radar").insert("div", ".error-container").classed('pg-radar-main-foot', true);
    return header;
  }

  function plotQuadrantButtons(quadrants, header) {
    function addButton(quadrant) {
      radarElement
        .append("div")
        .attr("class", "quadrant-table " + quadrant.order);

      header
        .append("div")
        .attr("class", "button " + quadrant.order + " full-view")
        .text(quadrant.quadrant.name())
        .on("mouseover", mouseoverQuadrant.bind({}, quadrant.order))
        .on("mouseout", mouseoutQuadrant.bind({}, quadrant.order))
        .on(
          "click",
          selectQuadrant.bind({}, quadrant.order, quadrant.startAngle)
        );
    }

    _.each([0, 1, 2, 3], function(i) {
      addButton(quadrants[i]);
    });
  }

  function mouseoverQuadrant(order) {
    d3.select(".quadrant-group-" + order).style("opacity", 1);
    d3.selectAll(".quadrant-group:not(.quadrant-group-" + order + ")").style(
      "opacity",
      0.3
    );
  }

  function mouseoutQuadrant(order) {
    d3.selectAll(".quadrant-group:not(.quadrant-group-" + order + ")").style(
      "opacity",
      1
    );
  }

  function selectQuadrant(order, startAngle) {
    d3.selectAll(".home-link").classed("selected", false);
    createHomeLink(d3.select(".pg-radar-main-foot"));

    d3.selectAll(".button")
      .classed("selected", false)
      .classed("full-view", false);
    d3.selectAll(".button." + order).classed("selected", true);
    d3.selectAll(".quadrant-table").classed("selected", false);
    d3.selectAll(".quadrant-table." + order).classed("selected", true);
    d3.selectAll(".blip-item-description").classed("expanded", false);

    var scale = 2;

    var adjustX =
      Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle));
    var adjustY =
      Math.cos(toRadian(startAngle)) + Math.sin(toRadian(startAngle));

    var translateX =
      ((-1 * (1 + adjustX) * size) / 2) * (scale - 1) +
      -adjustX * (1 - scale / 2) * size;
    var translateY =
      -1 * (1 - adjustY) * (size / 2 - 7) * (scale - 1) -
      ((1 - adjustY) / 2) * (1 - scale / 2) * size;

    var translateXAll =
      (((1 - adjustX) / 2) * size * scale) / 2 +
      ((1 - adjustX) / 2) * (1 - scale / 2) * size;
    var translateYAll = (((1 + adjustY) / 2) * size * scale) / 2;

    const containerWidth = document.querySelector('.cp-tech-radar').scrollWidth;

    var moveRight = ((1 + adjustX) * (1 * containerWidth - size)) / 2;
    var moveLeft = ((1 - adjustX) * (1 * containerWidth - size)) / 2;

    var blipScale = 3 / 4;
    var blipTranslate = (1 - blipScale) / blipScale;

    svg.style("left", moveLeft + "px").style("right", moveRight + "px");
    d3.select(".quadrant-group-" + order)
      .transition()
      .duration(1000)
      .attr(
        "transform",
        "translate(" + translateX + "," + translateY + ")scale(" + scale + ")"
      );
    d3.selectAll(".quadrant-group-" + order + " .blip-link text").each(
      function() {
        var x = d3.select(this).attr("x");
        var y = d3.select(this).attr("y");
        d3.select(this.parentNode)
          .transition()
          .duration(1000)
          .attr(
            "transform",
            "scale(" +
              blipScale +
              ")translate(" +
              blipTranslate * x +
              "," +
              blipTranslate * y +
              ")"
          );
      }
    );

    d3.selectAll(".quadrant-group").style("pointer-events", "auto");

    d3.selectAll(".quadrant-group:not(.quadrant-group-" + order + ")")
      .transition()
      .duration(1000)
      .style("pointer-events", "none")
      .attr(
        "transform",
        "translate(" + translateXAll + "," + translateYAll + ")scale(0)"
      );

    toggleLineTexts('block');
  }

  function toggleLineTexts(value) {
    d3.selectAll('.line-text').style('display', value)
  }

  self.init = function() {
    radarElement = d3
      .select("radar")
      .append("div")
      .attr("id", "radar");
    return self;
  };

  self.plot = function() {
    var rings, quadrants;

    rings = radar.rings();
    quadrants = radar.quadrants();
    var header = plotRadarHeader();

    // plotQuadrantButtons(quadrants, header);

    radarElement.style("height", size + 14 + "px");
    svg = radarElement.append("svg").call(tip);
    svg
      .attr("id", "radar-plot")
      .attr("width", size)
      .attr("height", size + 14);

    _.each(quadrants, function(quadrant) {
      var quadrantGroup = plotQuadrant(rings, quadrant);
      plotLines(quadrantGroup, quadrant);
      plotTexts(quadrantGroup, rings, quadrant);
      plotBlips(quadrantGroup, rings, quadrant);
    });

    toggleLineTexts('none');
  };

  return self;
};

module.exports = Radar;

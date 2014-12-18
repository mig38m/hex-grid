/**
 * This module defines a constructor for Tile objects.
 *
 * Tile objects handle the particle logic and the hexagon SVG-shape logic for a single
 * hexagonal tile within a Grid.
 *
 * @module Tile
 */
(function () {
  /**
   * @typedef {Object} PostData
   * @property {String} id
   * @property {String} titleShort
   * @property {String} titleLong
   * @property {String} thumbnailSrc
   * @property {Array.<String>} mainImages
   * @property {String} content
   */

  // TODO: fix how the open/close post jobs animate the tile size to use the scale transform

  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var config;

  config = {};

  config.dragCoeff = 0.01;

  config.neighborSpringCoeff = 0.00001;
  config.neighborDampingCoeff = 0.001;

  config.innerAnchorSpringCoeff = 0.00004;
  config.innerAnchorDampingCoeff = 0.001;

  config.borderAnchorSpringCoeff = 0.00004;
  config.borderAnchorDampingCoeff = 0.001;

  config.forceSuppressionLowerThreshold = 0.0005;
  config.velocitySuppressionLowerThreshold = 0.0005;
  // TODO: add similar, upper thresholds

  //  --- Dependent parameters --- //

  config.computeDependentValues = function () {
    config.forceSuppressionThresholdNegative = -config.forceSuppressionLowerThreshold;
    config.velocitySuppressionThresholdNegative = -config.velocitySuppressionLowerThreshold;
  };

  config.computeDependentValues();

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  /**
   * Creates the polygon element for this tile.
   *
   * @this Tile
   */
  function createElement() {
    var tile, id, width, height;

    tile = this;

    width = tile.grid.tileHalfWidth * 2;
    height = tile.grid.tileHalfHeight * 2;

    id = !isNaN(tile.originalIndex) ? tile.originalIndex : parseInt(Math.random() * 1000000 + 1000);

    tile.div = document.createElement('div');
    tile.grid.wrapper.appendChild(tile.div);
    tile.div.style.position = 'absolute';
    tile.div.style.width = width + 'px';
    tile.div.style.height = height + 'px';

    tile.svg = document.createElementNS(window.hg.util.svgNamespace, 'svg');
    tile.div.appendChild(tile.svg);
    tile.svg.style.width = width + 'px';
    tile.svg.style.height = height + 'px';

    tile.polygon = document.createElementNS(window.hg.util.svgNamespace, 'polygon');
    tile.svg.appendChild(tile.polygon);

    tile.div.id = 'hg-div-' + id;
    tile.polygon.id = 'hg-polygon-' + id;
    tile.polygon.setAttribute('data-hg-tile-polygon', 'data-hg-tile-polygon');
    tile.div.setAttribute('data-hg-tile-div', 'data-hg-tile-div');
    tile.polygon.style.cursor = 'pointer';

    setPoints.call(tile);

    // Set the color and vertices
    draw.call(tile);
  }

  /**
   * Creates the particle properties for this tile.
   *
   * @this Tile
   * @param {Number} mass
   */
  function createParticle(mass) {
    var tile;

    tile = this;

    tile.particle = {};
    tile.particle.px = tile.currentAnchor.x;
    tile.particle.py = tile.currentAnchor.y;
    tile.particle.vx = 0;
    tile.particle.vy = 0;
    tile.particle.fx = 0;
    tile.particle.fy = 0;
    tile.particle.m = mass;
    tile.particle.forceAccumulatorX = 0;
    tile.particle.forceAccumulatorY = 0;
  }

  /**
   * @this Tile
   */
  function setPoints() {
    var tile, i, pointsString;

    tile = this;

    tile.vertexDeltas = computeVertexDeltas(window.hg.Grid.config.tileOuterRadius, tile.grid.isVertical);

    for (i = 0, pointsString = ''; i < 12;) {
      pointsString += (tile.vertexDeltas[i++] + tile.grid.tileHalfWidth) + ',' +
        (tile.vertexDeltas[i++] + tile.grid.tileHalfHeight) + ' ';
    }

    tile.polygon.setAttribute('points', pointsString);
  }

  /**
   * Creates a new TilePost object with this Tile's post data.
   *
   * @this Tile
   */
  function createTilePost() {
    var tile = this;

    tile.polygon.setAttribute('data-hg-post-tile-polygon', 'data-hg-post-tile-polygon');
    tile.div.setAttribute('data-hg-post-tile-div', 'data-hg-post-tile-div');

    tile.tilePost = new window.hg.TilePost(tile);
  }

  /**
   * Destroys this Tile's TilePost object.
   *
   * @this Tile
   */
  function destroyTilePost() {
    var tile = this;

    tile.polygon.removeAttribute('data-hg-post-tile-polygon');
    tile.div.removeAttribute('data-hg-post-tile-div');

    tile.tilePost.destroy();
    tile.tilePost = null;
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  /**
   * Initializes some static fields that can be pre-computed.
   */
  function initStaticFields() {
    var i, theta, deltaTheta, horizontalStartTheta, verticalStartTheta;

    deltaTheta = Math.PI / 3;
    horizontalStartTheta = -deltaTheta;
    verticalStartTheta = Math.PI / 6 - 2 * deltaTheta;

    config.horizontalSines = [];
    config.horizontalCosines = [];
    for (i = 0, theta = horizontalStartTheta; i < 6; i += 1, theta += deltaTheta) {
      config.horizontalSines[i] = Math.sin(theta);
      config.horizontalCosines[i] = Math.cos(theta);
    }

    config.verticalSines = [];
    config.verticalCosines = [];
    for (i = 0, theta = verticalStartTheta; i < 6; i += 1, theta += deltaTheta) {
      config.verticalSines[i] = Math.sin(theta);
      config.verticalCosines[i] = Math.cos(theta);
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  /**
   * Sets this tile's content.
   *
   * @this Tile
   * @param {?Object} postData
   */
  function setContent(postData) {
    var tile, usedToHoldContent;

    tile = this;

    usedToHoldContent = tile.holdsContent;

    tile.postData = postData;
    tile.holdsContent = !!postData;

    if (usedToHoldContent) {
      destroyTilePost.call(tile);
      createTilePost.call(tile);
    } else {
      createTilePost.call(tile);
    }
  }

  /**
   * Sets this tile's neighbor tiles.
   *
   * @this Tile
   * @param {Array.<Tile>} neighborTiles
   */
  function setNeighborTiles(neighborTiles) {
    var tile, i, neighborTile;

    tile = this;

    for (i = 0; i < 6; i += 1) {
      neighborTile = neighborTiles[i];

      setTileNeighborState(tile, i, neighborTile);
    }
  }

  /**
   * Sets this tile's color values.
   *
   * @this Tile
   * @param {Number} hue
   * @param {Number} saturation
   * @param {Number} lightness
   */
  function setColor(hue, saturation, lightness) {
    var tile = this;

    if (tile.isHighlighted) {
      hue = hue + window.hg.HighlightHoverJob.config.deltaHue;
      saturation = saturation + window.hg.HighlightHoverJob.config.deltaSaturation;
      lightness = lightness + window.hg.HighlightHoverJob.config.deltaLightness;
    }

    tile.originalColor.h = hue;
    tile.originalColor.s = saturation;
    tile.originalColor.l = lightness;
    
    tile.currentColor.h = hue;
    tile.currentColor.s = saturation;
    tile.currentColor.l = lightness;
  }

  /**
   * Sets whether this tile is highlighted.
   *
   * @this Tile
   * @param {Boolean} isHighlighted
   */
  function setIsHighlighted(isHighlighted) {
    var tile, hue, saturation, lightness, backgroundImageScreenOpacity;

    tile = this;

    if (isHighlighted) {
      if (tile.isHighlighted) {
        // Nothing is changing
        hue = tile.originalColor.h;
        saturation = tile.originalColor.s;
        lightness = tile.originalColor.l;
      } else {
        // Add the highlight
        hue = tile.originalColor.h + window.hg.HighlightHoverJob.config.deltaHue * window.hg.HighlightHoverJob.config.opacity;
        saturation = tile.originalColor.s + window.hg.HighlightHoverJob.config.deltaSaturation * window.hg.HighlightHoverJob.config.opacity;
        lightness = tile.originalColor.l + window.hg.HighlightHoverJob.config.deltaLightness * window.hg.HighlightHoverJob.config.opacity;
      }
    } else {
      if (tile.isHighlighted) {
        // Remove the highlight
        hue = tile.originalColor.h - window.hg.HighlightHoverJob.config.deltaHue * window.hg.HighlightHoverJob.config.opacity;
        saturation = tile.originalColor.s - window.hg.HighlightHoverJob.config.deltaSaturation * window.hg.HighlightHoverJob.config.opacity;
        lightness = tile.originalColor.l - window.hg.HighlightHoverJob.config.deltaLightness * window.hg.HighlightHoverJob.config.opacity;
      } else {
        // Nothing is changing
        hue = tile.originalColor.h;
        saturation = tile.originalColor.s;
        lightness = tile.originalColor.l;
      }
    }

    tile.originalColor.h = hue;
    tile.originalColor.s = saturation;
    tile.originalColor.l = lightness;

    tile.currentColor.h = hue;
    tile.currentColor.s = saturation;
    tile.currentColor.l = lightness;

    tile.isHighlighted = isHighlighted;
  }

  /**
   * Update the state of this tile particle for the current time step.
   *
   * @this Tile
   * @param {Number} currentTime
   * @param {Number} deltaTime
   */
  function update(currentTime, deltaTime) {
    var tile, i, count, neighborStates, isBorderTile, neighborState, lx, ly, lDotX, lDotY,
        dotProd, length, temp, springForceX, springForceY;

    tile = this;

    if (!tile.particle.isFixed) {

      // Some different properties should be used when the grid is expanded
      neighborStates = tile.getNeighborStates();
      isBorderTile = tile.getIsBorderTile();

      // --- Accumulate forces --- //

      // --- Drag force --- //

      tile.particle.forceAccumulatorX += -config.dragCoeff * tile.particle.vx;
      tile.particle.forceAccumulatorY += -config.dragCoeff * tile.particle.vy;

      // --- Spring forces from neighbor tiles --- //

      for (i = 0, count = neighborStates.length; i < count; i += 1) {
        neighborState = neighborStates[i];

        if (neighborState) {
          if (neighborState.springForceX) {
            tile.particle.forceAccumulatorX += neighborState.springForceX;
            tile.particle.forceAccumulatorY += neighborState.springForceY;

            neighborState.springForceX = 0;
            neighborState.springForceY = 0;
          } else {
            lx = neighborState.tile.particle.px - tile.particle.px;
            ly = neighborState.tile.particle.py - tile.particle.py;
            lDotX = neighborState.tile.particle.vx - tile.particle.vx;
            lDotY = neighborState.tile.particle.vy - tile.particle.vy;
            dotProd = lx * lDotX + ly * lDotY;
            length = Math.sqrt(lx * lx + ly * ly);

            temp = (config.neighborSpringCoeff * (length - neighborState.restLength) +
                config.neighborDampingCoeff * dotProd / length) / length;
            springForceX = lx * temp;
            springForceY = ly * temp;

            tile.particle.forceAccumulatorX += springForceX;
            tile.particle.forceAccumulatorY += springForceY;

            neighborState.neighborsRelationshipObj.springForceX = -springForceX;
            neighborState.neighborsRelationshipObj.springForceY = -springForceY;
          }
        }
      }

      // --- Spring forces from currentAnchor point --- //

      lx = tile.currentAnchor.x - tile.particle.px;
      ly = tile.currentAnchor.y - tile.particle.py;
      length = Math.sqrt(lx * lx + ly * ly);

      if (length > 0) {
        lDotX = -tile.particle.vx;
        lDotY = -tile.particle.vy;
        dotProd = lx * lDotX + ly * lDotY;

        if (isBorderTile) {
          temp = (config.borderAnchorSpringCoeff * length + config.borderAnchorDampingCoeff *
              dotProd / length) / length;
        } else {
          temp = (config.innerAnchorSpringCoeff * length + config.innerAnchorDampingCoeff *
              dotProd / length) / length;
        }

        springForceX = lx * temp;
        springForceY = ly * temp;

        tile.particle.forceAccumulatorX += springForceX;
        tile.particle.forceAccumulatorY += springForceY;
      }

      // --- Update particle state --- //

      tile.particle.fx = tile.particle.forceAccumulatorX / tile.particle.m * deltaTime;
      tile.particle.fy = tile.particle.forceAccumulatorY / tile.particle.m * deltaTime;
      tile.particle.px += tile.particle.vx * deltaTime;
      tile.particle.py += tile.particle.vy * deltaTime;
      tile.particle.vx += tile.particle.fx;
      tile.particle.vy += tile.particle.fy;

      // Kill all velocities and forces below a threshold
      tile.particle.fx = tile.particle.fx < config.forceSuppressionLowerThreshold &&
          tile.particle.fx > config.forceSuppressionThresholdNegative ?
          0 : tile.particle.fx;
      tile.particle.fy = tile.particle.fy < config.forceSuppressionLowerThreshold &&
          tile.particle.fy > config.forceSuppressionThresholdNegative ?
          0 : tile.particle.fy;
      tile.particle.vx = tile.particle.vx < config.velocitySuppressionLowerThreshold &&
          tile.particle.vx > config.velocitySuppressionThresholdNegative ?
          0 : tile.particle.vx;
      tile.particle.vy = tile.particle.vy < config.velocitySuppressionLowerThreshold &&
          tile.particle.vy > config.velocitySuppressionThresholdNegative ?
          0 : tile.particle.vy;

      // Reset force accumulator for next time step
      tile.particle.forceAccumulatorX = 0;
      tile.particle.forceAccumulatorY = 0;
    }
  }

  /**
   * Update the SVG attributes for this tile to match its current particle state.
   *
   * @this Tile
   */
  function draw() {//**;// TODO: the fill updates are too slow; can I just change opacity of a screen instead?
    var tile, colorString, translateString;

    tile = this;

    translateString = 'scale(' + tile.scaleFactor + ') ' +
      'translate3d(' + (tile.particle.px - tile.grid.tileHalfWidth) + 'px,' +
      (tile.particle.py - tile.grid.tileHalfHeight) + 'px,0px)';

    window.hg.util.applyTransform(tile.div, translateString);

    if (!tile.holdsContent) {
      // Set the color
      colorString = 'hsl(' + tile.currentColor.h + ',' + tile.currentColor.s + '%,' + tile.currentColor.l + '%)';
      tile.polygon.setAttribute('fill', colorString);
    } else {
      // Set the position and opacity of the TilePost
      tile.tilePost.draw();
    }
  }

  /**
   * Adds the given force, which will take effect during the next call to update.
   *
   * @this Tile
   * @param {Number} fx
   * @param {Number} fy
   */
  function applyExternalForce(fx, fy) {
    var tile;

    tile = this;

    tile.particle.forceAccumulatorX += fx;
    tile.particle.forceAccumulatorY += fy;
  }

  /**
   * Fixes the position of this tile to the given coordinates.
   *
   * @this Tile
   * @param {Number} px
   * @param {Number} py
   */
  function fixPosition(px, py) {
    var tile;

    tile = this;

    tile.particle.isFixed = true;
    tile.particle.px = px;
    tile.particle.py = py;
  }

  /**
   * @returns {Object}
   */
  function getNeighborStates() {
    var tile = this;
    return tile.grid.isPostOpen ? tile.expandedState.neighborStates : tile.neighborStates;
  }

  /**
   * @returns {Boolean}
   */
  function getIsBorderTile() {
    var tile = this;
    return tile.grid.isPostOpen ? tile.expandedState.isBorderTile : tile.isBorderTile;
  }

  /**
   * @param {Boolean} isBorderTile
   */
  function setIsBorderTile(isBorderTile) {
    var tile = this;

    if (tile.grid.isPostOpen) {
      tile.expandedState.isBorderTile = isBorderTile;
    } else {
      tile.isBorderTile = isBorderTile;
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Computes the offsets of the vertices from the center of the hexagon.
   *
   * @param {Number} radius
   * @param {Boolean} isVertical
   * @returns {Array.<Number>}
   */
  function computeVertexDeltas(radius, isVertical) {
    var trigIndex, coordIndex, sines, cosines, vertexDeltas;

    // Grab the pre-computed sine and cosine values
    if (isVertical) {
      sines = config.verticalSines;
      cosines = config.verticalCosines;
    } else {
      sines = config.horizontalSines;
      cosines = config.horizontalCosines;
    }

    for (trigIndex = 0, coordIndex = 0, vertexDeltas = [];
         trigIndex < 6;
         trigIndex += 1) {
      vertexDeltas[coordIndex++] = radius * cosines[trigIndex];
      vertexDeltas[coordIndex++] = radius * sines[trigIndex];
    }

    return vertexDeltas;
  }

  /**
   * Creates the neighbor-tile state for the given tile according to the given neighbor tile. Also
   * sets the reciprocal state for the neighbor tile.
   *
   * @param {Tile} tile
   * @param {Number} neighborRelationIndex
   * @param {?Tile} neighborTile
   */
  function setTileNeighborState(tile, neighborRelationIndex, neighborTile) {
    var neighborStates, neighborNeighborStates,
        neighborNeighborRelationIndex;

    neighborStates = tile.getNeighborStates();

    if (neighborTile) {
      // Initialize the neighbor relation data from this tile to its neighbor
      initializeTileNeighborRelationData(neighborStates, neighborRelationIndex, neighborTile);

      // -- Give the neighbor tile a reference to this tile --- //

      neighborNeighborStates = neighborTile.getNeighborStates();

      neighborNeighborRelationIndex = (neighborRelationIndex + 3) % 6;

      // Initialize the neighbor relation data from the neighbor to this tile
      initializeTileNeighborRelationData(neighborNeighborStates, neighborNeighborRelationIndex,
          tile);

      // Share references to each other's neighbor relation objects
      neighborStates[neighborRelationIndex].neighborsRelationshipObj =
          neighborNeighborStates[neighborNeighborRelationIndex];
      neighborNeighborStates[neighborNeighborRelationIndex].neighborsRelationshipObj =
          neighborStates[neighborRelationIndex];
    } else {
      neighborStates[neighborRelationIndex] = null;
    }

    // ---  --- //

    function initializeTileNeighborRelationData(neighborStates, neighborRelationIndex,
                                                neighborTile) {
      neighborStates[neighborRelationIndex] = neighborStates[neighborRelationIndex] || {
        tile: neighborTile,
        restLength: window.hg.Grid.config.tileShortLengthWithGap,
        neighborsRelationshipObj: null,
        springForceX: 0,
        springForceY: 0
      };
    }
  }

  /**
   * @param {Tile} tile
   * @param {Sector} sector
   * @param {Number} majorIndex
   * @param {Number} minorIndex
   */
  function initializeTileExpandedState(tile, sector, majorIndex, minorIndex) {
    tile.expandedState = {
      sector: sector,
      sectorMajorIndex: majorIndex,
      sectorMinorIndex: minorIndex,
      neighborStates: [],
      isBorderTile: false
    };
  }

  /**
   * @this Tile
   */
  function destroy() {
    var tile = this;

    if (tile.holdsContent) {
      destroyTilePost.call(tile);
    }
    tile.grid.wrapper.removeChild(tile.div);

    tile.div = null;
    tile.svg = null;
    tile.polygon = null;
  }

  /**
   * Sets this Tile and its TilePost to have a display of none.
   *
   * @this Tile
   */
  function hide() {
    var tile = this;

    tile.div.style.display = 'none';
    if (tile.holdsContent) {
      tile.tilePost.elements.title.style.display = 'none';
    }
  }

  /**
   * Sets this Tile and its TilePost to have a display of block.
   *
   * @this Tile
   */
  function show() {
    var tile = this;

    tile.div.style.display = 'block';
    if (tile.holdsContent) {
      tile.tilePost.elements.title.style.display = 'block';
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {Grid} grid
   * @param {Number} anchorX
   * @param {Number} anchorY
   * @param {Number} hue
   * @param {Number} saturation
   * @param {Number} lightness
   * @param {?PostData} postData
   * @param {Number} tileIndex
   * @param {Number} rowIndex
   * @param {Number} columnIndex
   * @param {Boolean} isMarginTile
   * @param {Boolean} isBorderTile
   * @param {Boolean} isCornerTile
   * @param {Boolean} isInLargerRow
   * @param {Number} mass
   */
  function Tile(grid, anchorX, anchorY, hue, saturation, lightness, postData, tileIndex, rowIndex, columnIndex,
                isMarginTile, isBorderTile, isCornerTile, isInLargerRow, mass) {
    var tile = this;

    tile.grid = grid;
    tile.div = null;
    tile.svg = null;
    tile.polygon = null;
    tile.currentAnchor = {x: anchorX, y: anchorY};
    tile.originalAnchor = {x: anchorX, y: anchorY};
    tile.sectorAnchorOffset = {x: Number.NaN, y: Number.NaN};
    tile.vertexDeltas = null;

    tile.originalColor = {h: hue, s: saturation, l: lightness};
    tile.currentColor = {h: hue, s: saturation, l: lightness};

    tile.scaleFactor = 1;
    tile.postData = postData;
    tile.holdsContent = !!postData;
    tile.tilePost = null;
    tile.originalIndex = tileIndex;
    tile.rowIndex = rowIndex;
    tile.columnIndex = columnIndex;
    tile.isMarginTile = isMarginTile;
    tile.isBorderTile = isBorderTile;
    tile.isCornerTile = isCornerTile;
    tile.isInLargerRow = isInLargerRow;

    tile.expandedState = null;

    tile.isHighlighted = false;

    tile.imageScreenOpacity = Number.NaN;

    tile.neighborStates = [];
    tile.particle = null;

    tile.setContent = setContent;
    tile.setNeighborTiles = setNeighborTiles;
    tile.setColor = setColor;
    tile.setIsHighlighted = setIsHighlighted;
    tile.update = update;
    tile.draw = draw;
    tile.applyExternalForce = applyExternalForce;
    tile.fixPosition = fixPosition;
    tile.getNeighborStates = getNeighborStates;
    tile.getIsBorderTile = getIsBorderTile;
    tile.setIsBorderTile = setIsBorderTile;
    tile.destroy = destroy;
    tile.hide = hide;
    tile.show = show;

    createParticle.call(tile, mass);
    createElement.call(tile);

    if (tile.holdsContent) {
      createTilePost.call(tile);
    }
  }

  Tile.computeVertexDeltas = computeVertexDeltas;
  Tile.setTileNeighborState = setTileNeighborState;
  Tile.initializeTileExpandedState = initializeTileExpandedState;
  Tile.config = config;

  // Expose this module
  window.hg = window.hg || {};
  window.hg.Tile = Tile;

  initStaticFields();

  console.log('Tile module loaded');
})();

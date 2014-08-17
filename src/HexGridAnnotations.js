'use strict';

/**
 * This module defines a constructor for HexGridAnnotations objects.
 *
 * HexGridAnnotations objects creates and modifies visual representations of various aspects of a
 * HexGrid. This can be very useful for testing purposes.
 *
 * @module HexGridAnnotations
 */
(function () {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var config = {};

  config.forceLineLengthMultiplier = 4000;
  config.velocityLineLengthMultiplier = 300;

  config.contentTileHue = 227;
  config.contentTileSaturation = 50;
  config.contentTileLightness = 30;

  config.borderTileHue = 267;
  config.borderTileSaturation = 0;
  config.borderTileLightness = 30;

  config.cornerTileHue = 267;
  config.cornerTileSaturation = 50;
  config.cornerTileLightness = 30;

  config.annotations = {
    'contentTiles': {
      enabled: false,
      create: fillContentTiles,
      destroy: unfillContentTiles,
      update: function () {/* Do nothing */}
    },
    'borderTiles': {
      enabled: false,
      create: fillBorderTiles,
      destroy: unfillBorderTiles,
      update: function () {/* Do nothing */}
    },
    'cornerTiles': {
      enabled: false,
      create: fillCornerTiles,
      destroy: unfillCornerTiles,
      update: function () {/* Do nothing */}
    },
    'transparentTiles': {
      enabled: false,
      create: makeTilesTransparent,
      destroy: makeTilesVisible,
      update: function () {/* Do nothing */}
    },
    'tileAnchorCenters': {
      enabled: false,
      create: createTileAnchorCenters,
      destroy: destroyTileAnchorCenters,
      update: updateTileAnchorCenters
    },
    'tileParticleCenters': {
      enabled: false,
      create: createTileParticleCenters,
      destroy: destroyTileParticleCenters,
      update: updateTileParticleCenters
    },
    'tileDisplacementColors': {
      enabled: false,
      create: createTileDisplacementColors,
      destroy: destroyTileDisplacementColors,
      update: updateTileDisplacementColors
    },
    'tileInnerRadii': {
      enabled: false,
      create: createTileInnerRadii,
      destroy: destroyTileInnerRadii,
      update: updateTileInnerRadii
    },
    'tileOuterRadii': {
      enabled: false,
      create: createTileOuterRadii,
      destroy: destroyTileOuterRadii,
      update: updateTileOuterRadii
    },
    'tileIndices': {
      enabled: true,
      create: createTileIndices,
      destroy: destroyTileIndices,
      update: updateTileIndices
    },
    'tileForces': {
      enabled: false,
      create: createTileForces,
      destroy: destroyTileForces,
      update: updateTileForces
    },
    'tileVelocities': {
      enabled: false,
      create: createTileVelocities,
      destroy: destroyTileVelocities,
      update: updateTileVelocities
    },
    'tileNeighborConnections': {
      enabled: false,
      create: createTileNeighborConnections,
      destroy: destroyTileNeighborConnections,
      update: updateTileNeighborConnections
    },
    'contentAreaGuidelines': {
      enabled: false,
      create: drawContentAreaGuideLines,
      destroy: removeContentAreaGuideLines,
      update:  function () {/* Do nothing */}
    },
    'lineAnimationGapPoints': {
      enabled: false,
      create: function () {/* Do nothing */},
      destroy: destroyLineAnimationGapPoints,
      update:  updateLineAnimationGapPoints
    },
    'lineAnimationCornerData': {
      enabled: false,
      create: function () {/* Do nothing */},
      destroy: destroyLineAnimationCornerConfigurations,
      update:  updateLineAnimationCornerConfigurations
    }
  };

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  // --------------------------------------------------- //
  // Annotation creation functions

  /**
   * Draws content tiles with a different color.
   *
   * @this HexGridAnnotations
   */
  function fillContentTiles() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      if (annotations.grid.tiles[i].holdsContent) {
        annotations.grid.tiles[i].setColor(config.contentTileHue, config.contentTileSaturation,
            config.contentTileLightness);
      }
    }
  }

  /**
   * Draws border tiles with a different color.
   *
   * @this HexGridAnnotations
   */
  function fillBorderTiles() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.borderTiles.length; i < count; i += 1) {
      annotations.grid.borderTiles[i].setColor(config.borderTileHue, config.borderTileSaturation,
          config.borderTileLightness);
    }
  }

  /**
   * Draws corner tiles with a different color.
   *
   * @this HexGridAnnotations
   */
  function fillCornerTiles() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.borderTiles.length; i < count; i += 1) {
      if (annotations.grid.borderTiles[i].isCornerTile) {
        annotations.grid.borderTiles[i].setColor(config.cornerTileHue,
            config.cornerTileSaturation, config.cornerTileLightness);
      }
    }
  }

  /**
   * Draws all of the tiles as transparent.
   *
   * @this HexGridAnnotations
   */
  function makeTilesTransparent() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.grid.tiles[i].element.setAttribute('opacity', '0');
    }
  }

  /**
   * Draws vertical guidelines along the left and right sides of the main content area.
   *
   * @this HexGridAnnotations
   */
  function drawContentAreaGuideLines() {
    var annotations, line;

    annotations = this;
    annotations.contentAreaGuideLines = [];

    line = document.createElementNS(hg.util.svgNamespace, 'line');
    line.setAttribute('x1', annotations.grid.contentAreaLeft);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', annotations.grid.contentAreaLeft);
    line.setAttribute('y2', annotations.grid.height);
    line.setAttribute('stroke', 'red');
    line.setAttribute('stroke-width', '2');
    annotations.grid.svg.appendChild(line);
    annotations.contentAreaGuideLines[0] = line;

    line = document.createElementNS(hg.util.svgNamespace, 'line');
    line.setAttribute('x1', annotations.grid.contentAreaRight);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', annotations.grid.contentAreaRight);
    line.setAttribute('y2', annotations.grid.height);
    line.setAttribute('stroke', 'red');
    line.setAttribute('stroke-width', '2');
    annotations.grid.svg.appendChild(line);
    annotations.contentAreaGuideLines[1] = line;
  }

  /**
   * Creates a dot at the center of each tile at its current position.
   *
   * @this HexGridAnnotations
   */
  function createTileParticleCenters() {
    var annotations, i, count;

    annotations = this;
    annotations.tileParticleCenters = [];

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.tileParticleCenters[i] = document.createElementNS(hg.util.svgNamespace, 'circle');
      annotations.tileParticleCenters[i].setAttribute('r', '4');
      annotations.tileParticleCenters[i].setAttribute('fill', 'gray');
      annotations.grid.svg.appendChild(annotations.tileParticleCenters[i]);
    }
  }

  /**
   * Creates a dot at the center of each tile at its anchor position.
   *
   * @this HexGridAnnotations
   */
  function createTileAnchorCenters() {
    var annotations, i, count;

    annotations = this;
    annotations.tileAnchorLines = [];
    annotations.tileAnchorCenters = [];

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.tileAnchorLines[i] = document.createElementNS(hg.util.svgNamespace, 'line');
      annotations.tileAnchorLines[i].setAttribute('stroke', '#bbbbbb');
      annotations.tileAnchorLines[i].setAttribute('stroke-width', '2');
      annotations.grid.svg.appendChild(annotations.tileAnchorLines[i]);
      annotations.tileAnchorCenters[i] = document.createElementNS(hg.util.svgNamespace, 'circle');
      annotations.tileAnchorCenters[i].setAttribute('r', '4');
      annotations.tileAnchorCenters[i].setAttribute('fill', 'white');
      annotations.grid.svg.appendChild(annotations.tileAnchorCenters[i]);
    }
  }

  /**
   * Creates a circle over each tile at its anchor position, which will be used to show colors
   * that indicate its displacement from its original position.
   *
   * @this HexGridAnnotations
   */
  function createTileDisplacementColors() {
    var annotations, i, count;

    annotations = this;
    annotations.tileDisplacementCircles = [];

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.tileDisplacementCircles[i] = document.createElementNS(hg.util.svgNamespace, 'circle');
      annotations.tileDisplacementCircles[i].setAttribute('r', '80');
      annotations.tileDisplacementCircles[i].setAttribute('opacity', '0.4');
      annotations.tileDisplacementCircles[i].setAttribute('fill', 'white');
      annotations.grid.svg.appendChild(annotations.tileDisplacementCircles[i]);
    }
  }

  /**
   * Creates the inner radius of each tile.
   *
   * @this HexGridAnnotations
   */
  function createTileInnerRadii() {
    var annotations, i, count;

    annotations = this;
    annotations.tileInnerRadii = [];

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.tileInnerRadii[i] = document.createElementNS(hg.util.svgNamespace, 'circle');
      annotations.tileInnerRadii[i].setAttribute('stroke', 'blue');
      annotations.tileInnerRadii[i].setAttribute('stroke-width', '1');
      annotations.tileInnerRadii[i].setAttribute('fill', 'transparent');
      annotations.grid.svg.appendChild(annotations.tileInnerRadii[i]);
    }
  }

  /**
   * Creates the outer radius of each tile.
   *
   * @this HexGridAnnotations
   */
  function createTileOuterRadii() {
    var annotations, i, count;

    annotations = this;
    annotations.tileOuterRadii = [];

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.tileOuterRadii[i] = document.createElementNS(hg.util.svgNamespace, 'circle');
      annotations.tileOuterRadii[i].setAttribute('stroke', 'green');
      annotations.tileOuterRadii[i].setAttribute('stroke-width', '1');
      annotations.tileOuterRadii[i].setAttribute('fill', 'transparent');
      annotations.grid.svg.appendChild(annotations.tileOuterRadii[i]);
    }
  }

  /**
   * Creates lines connecting each tile to each of its neighbors.
   *
   * @this HexGridAnnotations
   */
  function createTileNeighborConnections() {
    var annotations, i, j, iCount, jCount, tile, neighbor;

    annotations = this;
    annotations.neighborLines = [];

    for (i = 0, iCount = annotations.grid.tiles.length; i < iCount; i += 1) {
      tile = annotations.grid.tiles[i];
      annotations.neighborLines[i] = [];

      for (j = 0, jCount = tile.neighbors.length; j < jCount; j += 1) {
        neighbor = tile.neighbors[j];

        if (neighbor) {
          annotations.neighborLines[i][j] = document.createElementNS(hg.util.svgNamespace, 'line');
          annotations.neighborLines[i][j].setAttribute('stroke', 'purple');
          annotations.neighborLines[i][j].setAttribute('stroke-width', '1');
          annotations.grid.svg.appendChild(annotations.neighborLines[i][j]);
        }
      }
    }
  }

  /**
   * Creates lines representing the cumulative force acting on each tile.
   *
   * @this HexGridAnnotations
   */
  function createTileForces() {
    var annotations, i, count;

    annotations = this;
    annotations.forceLines = [];

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.forceLines[i] = document.createElementNS(hg.util.svgNamespace, 'line');
      annotations.forceLines[i].setAttribute('stroke', 'orange');
      annotations.forceLines[i].setAttribute('stroke-width', '2');
      annotations.grid.svg.appendChild(annotations.forceLines[i]);
    }
  }

  /**
   * Creates lines representing the velocity of each tile.
   *
   * @this HexGridAnnotations
   */
  function createTileVelocities() {
    var annotations, i, count;

    annotations = this;
    annotations.velocityLines = [];

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.velocityLines[i] = document.createElementNS(hg.util.svgNamespace, 'line');
      annotations.velocityLines[i].setAttribute('stroke', 'red');
      annotations.velocityLines[i].setAttribute('stroke-width', '2');
      annotations.grid.svg.appendChild(annotations.velocityLines[i]);
    }
  }

  /**
   * Creates the index of each tile.
   *
   * @this HexGridAnnotations
   */
  function createTileIndices() {
    var annotations, i, count;

    annotations = this;
    annotations.indexTexts = [];

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.indexTexts[i] = document.createElementNS(hg.util.svgNamespace, 'text');
      annotations.indexTexts[i].setAttribute('font-size', '16');
      annotations.indexTexts[i].setAttribute('fill', 'black');
      annotations.indexTexts[i].innerHTML = annotations.grid.tiles[i].index;
      annotations.grid.svg.appendChild(annotations.indexTexts[i]);
    }
  }

  // --------------------------------------------------- //
  // Annotation destruction functions

  /**
   * Draws content tiles with a different color.
   *
   * @this HexGridAnnotations
   */
  function unfillContentTiles() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      if (annotations.grid.tiles[i].holdsContent) {
        annotations.grid.tiles[i].setColor(hg.HexGrid.config.tileHue,
            hg.HexGrid.config.tileSaturation, hg.HexGrid.config.tileLightness);
      }
    }
  }

  /**
   * Draws border tiles with a different color.
   *
   * @this HexGridAnnotations
   */
  function unfillBorderTiles() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.borderTiles.length; i < count; i += 1) {
      annotations.grid.borderTiles[i].setColor(hg.HexGrid.config.tileHue,
          hg.HexGrid.config.tileSaturation, hg.HexGrid.config.tileLightness);
    }
  }

  /**
   * Draws corner tiles with a different color.
   *
   * @this HexGridAnnotations
   */
  function unfillCornerTiles() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.borderTiles.length; i < count; i += 1) {
      if (annotations.grid.borderTiles[i].isCornerTile) {
        annotations.grid.borderTiles[i].setColor(hg.HexGrid.config.tileHue,
            hg.HexGrid.config.tileSaturation, hg.HexGrid.config.tileLightness);
      }
    }
  }

  /**
   * Draws all of the tiles as transparent.
   *
   * @this HexGridAnnotations
   */
  function makeTilesVisible() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.grid.tiles[i].element.setAttribute('opacity', '1');
    }
  }

  /**
   * Draws vertical guidelines along the left and right sides of the main content area.
   *
   * @this HexGridAnnotations
   */
  function removeContentAreaGuideLines() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.contentAreaGuideLines.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.contentAreaGuideLines[i]);
    }

    annotations.contentAreaGuideLines = [];
  }

  /**
   * Destroys a dot at the center of each tile at its current position.
   *
   * @this HexGridAnnotations
   */
  function destroyTileParticleCenters() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.tileParticleCenters.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.tileParticleCenters[i]);
    }

    annotations.tileParticleCenters = [];
  }

  /**
   * Destroys a dot at the center of each tile at its anchor position.
   *
   * @this HexGridAnnotations
   */
  function destroyTileAnchorCenters() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.tileAnchorLines.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.tileAnchorLines[i]);
      annotations.grid.svg.removeChild(annotations.tileAnchorCenters[i]);
    }

    annotations.tileAnchorLines = [];
    annotations.tileAnchorCenters = [];
  }

  /**
   * Destroys a circle over each tile at its anchor position, which will be used to show colors
   * that indicate its displacement from its original position.
   *
   * @this HexGridAnnotations
   */
  function destroyTileDisplacementColors() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.tileDisplacementCircles.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.tileDisplacementCircles[i]);
    }

    annotations.tileDisplacementCircles = [];
  }

  /**
   * Destroys the inner radius of each tile.
   *
   * @this HexGridAnnotations
   */
  function destroyTileInnerRadii() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.tileInnerRadii.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.tileInnerRadii[i]);
    }

    annotations.tileInnerRadii = [];
  }

  /**
   * Destroys the outer radius of each tile.
   *
   * @this HexGridAnnotations
   */
  function destroyTileOuterRadii() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.tileOuterRadii.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.tileOuterRadii[i]);
    }

    annotations.tileOuterRadii = [];
  }

  /**
   * Destroys lines connecting each tile to each of its neighbors.
   *
   * @this HexGridAnnotations
   */
  function destroyTileNeighborConnections() {
    var annotations, i, j, iCount, jCount;

    annotations = this;

    for (i = 0, iCount = annotations.neighborLines.length; i < iCount; i += 1) {
      for (j = 0, jCount = annotations.neighborLines[i].length; j < jCount; j += 1) {
        if (annotations.neighborLines[i][j]) {
          annotations.grid.svg.removeChild(annotations.neighborLines[i][j]);
        }
      }
    }

    annotations.neighborLines = [];
  }

  /**
   * Destroys lines representing the cumulative force acting on each tile.
   *
   * @this HexGridAnnotations
   */
  function destroyTileForces() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.forceLines.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.forceLines[i]);
    }

    annotations.forceLines = [];
  }

  /**
   * Destroys lines representing the velocity of each tile.
   *
   * @this HexGridAnnotations
   */
  function destroyTileVelocities() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.velocityLines.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.velocityLines[i]);
    }

    annotations.velocityLines = [];
  }

  /**
   * Destroys the index of each tile.
   *
   * @this HexGridAnnotations
   */
  function destroyTileIndices() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.indexTexts.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.indexTexts[i]);
    }

    annotations.indexTexts = [];
  }

  /**
   * Destroys the dots at the positions of each corner gap point of each line animation.
   *
   * @this HexGridAnnotations
   */
  function destroyLineAnimationGapPoints() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.lineAnimationGapDots.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.lineAnimationGapDots[i]);
    }
  }

  /**
   * Destroys annotations describing the corner configurations of each line animation.
   *
   * @this HexGridAnnotations
   */
  function destroyLineAnimationCornerConfigurations() {
    var annotations, i, count;

    annotations = this;
**;
    for (i = 0, count = annotations.lineAnimationSelfCornerDots.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.lineAnimationSelfCornerDots[i]);
    }

    for (i = 0, count = annotations.lineAnimationLowerNeighborCornerDots.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.lineAnimationLowerNeighborCornerDots[i]);
    }

    for (i = 0, count = annotations.lineAnimationUpperNeighborCornerDots.length; i < count; i += 1) {
      annotations.grid.svg.removeChild(annotations.lineAnimationUpperNeighborCornerDots[i]);
    }
  }

  // --------------------------------------------------- //
  // Annotation updating functions

  /**
   * Updates a dot at the center of each tile at its current position.
   *
   * @this HexGridAnnotations
   */
  function updateTileParticleCenters() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.tileParticleCenters[i].setAttribute('cx', annotations.grid.tiles[i].particle.px);
      annotations.tileParticleCenters[i].setAttribute('cy', annotations.grid.tiles[i].particle.py);
    }
  }

  /**
   * Updates a dot at the center of each tile at its anchor position.
   *
   * @this HexGridAnnotations
   */
  function updateTileAnchorCenters() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.tileAnchorLines[i].setAttribute('x1', annotations.grid.tiles[i].particle.px);
      annotations.tileAnchorLines[i].setAttribute('y1', annotations.grid.tiles[i].particle.py);
      annotations.tileAnchorLines[i].setAttribute('x2', annotations.grid.tiles[i].centerX);
      annotations.tileAnchorLines[i].setAttribute('y2', annotations.grid.tiles[i].centerY);
      annotations.tileAnchorCenters[i].setAttribute('cx', annotations.grid.tiles[i].centerX);
      annotations.tileAnchorCenters[i].setAttribute('cy', annotations.grid.tiles[i].centerY);
    }
  }

  /**
   * Updates the color of a circle over each tile at its anchor position according to its
   * displacement from its original position.
   *
   * @this HexGridAnnotations
   */
  function updateTileDisplacementColors() {
    var annotations, i, count, deltaX, deltaY, angle, distance, colorString;

    annotations = this;

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      deltaX = annotations.grid.tiles[i].particle.px - annotations.grid.tiles[i].originalCenterX;
      deltaY = annotations.grid.tiles[i].particle.py - annotations.grid.tiles[i].originalCenterY;
      angle = Math.atan2(deltaX, deltaY) * 180 / Math.PI;
      distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      colorString = 'hsl(' + angle + ',' +
          distance / hg.WaveAnimationJob.config.displacementWavelength * 100 + '%,80%)';

      annotations.tileDisplacementCircles[i].setAttribute('fill', colorString);
      annotations.tileDisplacementCircles[i]
          .setAttribute('cx', annotations.grid.tiles[i].particle.px);
      annotations.tileDisplacementCircles[i]
          .setAttribute('cy', annotations.grid.tiles[i].particle.py);
    }
  }

  /**
   * Updates the inner radius of each tile.
   *
   * @this HexGridAnnotations
   */
  function updateTileInnerRadii() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.tileInnerRadii[i].setAttribute('cx', annotations.grid.tiles[i].particle.px);
      annotations.tileInnerRadii[i].setAttribute('cy', annotations.grid.tiles[i].particle.py);
      annotations.tileInnerRadii[i].setAttribute('r', annotations.grid.tiles[i].outerRadius * hg.HexGrid.config.sqrtThreeOverTwo);
    }
  }

  /**
   * Updates the outer radius of each tile.
   *
   * @this HexGridAnnotations
   */
  function updateTileOuterRadii() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.tileOuterRadii[i].setAttribute('cx', annotations.grid.tiles[i].particle.px);
      annotations.tileOuterRadii[i].setAttribute('cy', annotations.grid.tiles[i].particle.py);
      annotations.tileOuterRadii[i].setAttribute('r', annotations.grid.tiles[i].outerRadius);
    }
  }

  /**
   * Updates lines connecting each tile to each of its neighbors.
   *
   * @this HexGridAnnotations
   */
  function updateTileNeighborConnections() {
    var annotations, i, j, iCount, jCount, tile, neighbor;

    annotations = this;

    for (i = 0, iCount = annotations.grid.tiles.length; i < iCount; i += 1) {
      tile = annotations.grid.tiles[i];

      for (j = 0, jCount = tile.neighbors.length; j < jCount; j += 1) {
        neighbor = tile.neighbors[j];

        if (neighbor) {
          annotations.neighborLines[i][j].setAttribute('x1', tile.particle.px);
          annotations.neighborLines[i][j].setAttribute('y1', tile.particle.py);
          annotations.neighborLines[i][j].setAttribute('x2', neighbor.tile.particle.px);
          annotations.neighborLines[i][j].setAttribute('y2', neighbor.tile.particle.py);
        }
      }
    }
  }

  /**
   * Updates lines representing the cumulative force acting on each tile.
   *
   * @this HexGridAnnotations
   */
  function updateTileForces() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.forceLines[i].setAttribute('x1', annotations.grid.tiles[i].particle.px);
      annotations.forceLines[i].setAttribute('y1', annotations.grid.tiles[i].particle.py);
      annotations.forceLines[i].setAttribute('x2', annotations.grid.tiles[i].particle.px + annotations.grid.tiles[i].particle.fx * config.forceLineLengthMultiplier);
      annotations.forceLines[i].setAttribute('y2', annotations.grid.tiles[i].particle.py + annotations.grid.tiles[i].particle.fy * config.forceLineLengthMultiplier);
    }
  }

  /**
   * Updates lines representing the velocity of each tile.
   *
   * @this HexGridAnnotations
   */
  function updateTileVelocities() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.velocityLines[i].setAttribute('x1', annotations.grid.tiles[i].particle.px);
      annotations.velocityLines[i].setAttribute('y1', annotations.grid.tiles[i].particle.py);
      annotations.velocityLines[i].setAttribute('x2', annotations.grid.tiles[i].particle.px + annotations.grid.tiles[i].particle.vx * config.velocityLineLengthMultiplier);
      annotations.velocityLines[i].setAttribute('y2', annotations.grid.tiles[i].particle.py + annotations.grid.tiles[i].particle.vy * config.velocityLineLengthMultiplier);
    }
  }

  /**
   * Updates the index of each tile.
   *
   * @this HexGridAnnotations
   */
  function updateTileIndices() {
    var annotations, i, count;

    annotations = this;

    for (i = 0, count = annotations.grid.tiles.length; i < count; i += 1) {
      annotations.indexTexts[i].setAttribute('x', annotations.grid.tiles[i].particle.px - 10);
      annotations.indexTexts[i].setAttribute('y', annotations.grid.tiles[i].particle.py + 6);
    }
  }

  /**
   * Draws a dot at the position of each corner gap point of each line animation.
   *
   * @this HexGridAnnotations
   */
  function updateLineAnimationGapPoints() {
    var annotations, i, iCount, j, jCount, k, line;

    annotations = this;

    destroyLineAnimationGapPoints.call(annotations);
    annotations.lineAnimationGapDots = [];

    if (annotations.grid.animations.lineAnimations) {
      for (k = 0, i = 0, iCount = annotations.grid.animations.lineAnimations.length; i < iCount;
           i += 1) {
        line = annotations.grid.animations.lineAnimations[i];

        for (j = 0, jCount = line.gapPoints.length; j < jCount; j += 1, k += 1) {
          annotations.lineAnimationGapDots[k] =
              document.createElementNS(hg.util.svgNamespace, 'circle');
          annotations.lineAnimationGapDots[k].setAttribute('cx', line.gapPoints[j].x);
          annotations.lineAnimationGapDots[k].setAttribute('cy', line.gapPoints[j].y);
          annotations.lineAnimationGapDots[k].setAttribute('r', '4');
          annotations.lineAnimationGapDots[k].setAttribute('fill', 'orange');
          annotations.grid.svg.appendChild(annotations.lineAnimationGapDots[k]);
        }
      }
    }
  }

  /**
   * Draws some annotations describing the corner configurations of each line animation.
   *
   * @this HexGridAnnotations
   */
  function updateLineAnimationCornerConfigurations() {// TODO
    var annotations, i, iCount, j, jCount, k, line;

    annotations = this;
**;
    destroyLineAnimationGapPoints.call(annotations);
    annotations.lineAnimationGapDots = [];

    if (annotations.grid.animations.lineAnimations) {
      for (k = 0, i = 0, iCount = annotations.grid.animations.lineAnimations.length; i < iCount;
           i += 1) {
        line = annotations.grid.animations.lineAnimations[i];

        for (j = 0, jCount = line.gapPoints.length; j < jCount; j += 1, k += 1) {
          annotations.lineAnimationGapDots[k] =
              document.createElementNS(hg.util.svgNamespace, 'circle');
          annotations.lineAnimationGapDots[k].setAttribute('cx', line.gapPoints[j].x);
          annotations.lineAnimationGapDots[k].setAttribute('cy', line.gapPoints[j].y);
          annotations.lineAnimationGapDots[k].setAttribute('r', '4');
          annotations.lineAnimationGapDots[k].setAttribute('fill', 'orange');
          annotations.grid.svg.appendChild(annotations.lineAnimationGapDots[k]);
        }
      }
    }

//    for (i = 0, count = annotations.lineAnimationSelfCornerDots.length; i < count; i += 1) {
//      annotations.grid.svg.removeChild(annotations.lineAnimationSelfCornerDots[i]);
//    }
//
//    for (i = 0, count = annotations.lineAnimationLowerNeighborCornerDots.length; i < count; i += 1) {
//      annotations.grid.svg.removeChild(annotations.lineAnimationLowerNeighborCornerDots[i]);
//    }
//
//    for (i = 0, count = annotations.lineAnimationUpperNeighborCornerDots.length; i < count; i += 1) {
//      annotations.grid.svg.removeChild(annotations.lineAnimationUpperNeighborCornerDots[i]);
//    }

//    function () {
//      if (lowerNeighbor) {
//        if (upperNeighbor) {
//          count = 3;
//          xSum = tile.particle.px + lowerNeighbor.tile.particle.px + upperNeighbor.tile.particle.px;
//          ySum = tile.particle.py + lowerNeighbor.tile.particle.py + upperNeighbor.tile.particle.py;
//        } else {
//          count = 2;
//          xSum = tile.vertices[corner * 2] + lowerNeighbor.tile.vertices[lowerNeighborCorner * 2];
//          ySum = tile.vertices[corner * 2 + 1] +
//              lowerNeighbor.tile.vertices[lowerNeighborCorner * 2 + 1];
//        }
//      } else {
//        if (upperNeighbor) {
//          count = 2;
//          xSum = tile.vertices[corner * 2] + upperNeighbor.tile.vertices[upperNeighborCorner * 2];
//          ySum = tile.vertices[corner * 2 + 1] +
//              upperNeighbor.tile.vertices[upperNeighborCorner * 2 + 1];
//        } else {
//          count = 1;
//          xSum = tile.vertices[corner * 2];
//          ySum = tile.vertices[corner * 2 + 1];
//        }
//      }
//    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  /**
   * Updates the animation progress of this AnimationJob to match the given time.
   *
   * @this HexGridAnnotations
   * @param {number} currentTime
   * @param {number} deltaTime
   */
  function update(currentTime, deltaTime) {
    var annotations, key;

    annotations = this;

    for (key in annotations.annotations) {
      if (annotations.annotations[key].enabled) {
        annotations.annotations[key].update.call(annotations);
      }
    }
  }

  /**
   * Toggles whether the given annotation is enabled.
   *
   * @this HexGridAnnotations
   * @param {string} annotation
   * @param {boolean} enabled
   * @throws {Error}
   */
  function toggleAnnotationEnabled(annotation, enabled) {
    var annotations;

    annotations = this;

    annotations.annotations[annotation].enabled = enabled;

    if (enabled) {
      annotations.annotations[annotation].create.call(annotations);
    } else {
      annotations.annotations[annotation].destroy.call(annotations);
    }
  }

  /**
   * Computes spatial parameters of the tile annotations and creates SVG elements to represent
   * these annotations.
   *
   * @this HexGridAnnotations
   */
  function createAnnotations() {
    var annotations, key;

    annotations = this;

    for (key in annotations.annotations) {
      if (annotations.annotations[key].enabled) {
        annotations.annotations[key].create.call(annotations);
      }
    }
  }

  /**
   * Destroys the SVG elements used to represent grid annotations.
   *
   * @this HexGridAnnotations
   */
  function destroyAnnotations() {
    var annotations, key;

    annotations = this;

    for (key in annotations.annotations) {
      annotations.annotations[key].destroy.call(annotations);
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @param {HexGrid} grid
   */
  function HexGridAnnotations(grid) {
    var annotations = this;

    annotations.grid = grid;
    annotations.annotations = hg.util.shallowCopy(config.annotations);

    annotations.contentAreaGuideLines = [];
    annotations.tileParticleCenters = [];
    annotations.tileAnchorLines = [];
    annotations.tileAnchorCenters = [];
    annotations.tileDisplacementCircles = [];
    annotations.tileInnerRadii = [];
    annotations.tileOuterRadii = [];
    annotations.neighborLines = [];
    annotations.forceLines = [];
    annotations.velocityLines = [];
    annotations.indexTexts = [];
    annotations.lineAnimationGapDots = [];

    annotations.toggleAnnotationEnabled = toggleAnnotationEnabled;
    annotations.update = update;
    annotations.createAnnotations = createAnnotations;
    annotations.destroyAnnotations = destroyAnnotations;
  }

  HexGridAnnotations.config = config;

  // Expose this module
  if (!window.hg) window.hg = {};
  window.hg.HexGridAnnotations = HexGridAnnotations;

  console.log('HexGridAnnotations module loaded');
})();

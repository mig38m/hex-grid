'use strict';

/**
 * This module defines a singleton that helps coordinate the various components of the hex-grid
 * package.
 *
 * The controller singleton handles provides convenient helper functions for creating and staring
 * grids and animations. It stores these objects and updates them in response to various system
 * events--e.g., window resize.
 *
 * @module controller
 */
(function () {
  var controller = {},
      config = {};

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Creates a Grid object and registers it with the animator.
   *
   * @param {HTMLElement} parent
   * @param {Array.<Object>} tileData
   * @param {boolean} isVertical
   * @returns {number} The ID (actually index) of the new Grid.
   */
  function createNewHexGrid(parent, tileData, isVertical) {
    var grid, index, annotations, input;

    grid = new hg.Grid(parent, tileData, isVertical);
    controller.grids.push(grid);
    hg.animator.startJob(grid);
    index = controller.grids.length - 1;
    grid.index = index;

    createColorResetAnimation(index);
    createColorShiftAnimation(index);
    createColorWaveAnimation(index);
    createDisplacementWaveAnimation(index);

    annotations = grid.annotations;
    hg.animator.startJob(annotations);
    controller.annotations.push(annotations);

    input = new hg.Input(grid);
    controller.inputs.push(input);

    startRecurringAnimations(index);

    return index;
  }

  /**
   * Starts repeating any AnimationJobs that are configured to recur.
   *
   * @param {number} gridIndex
   */
  function startRecurringAnimations(gridIndex) {
    if (hg.HighlightHoverJob.config.isRecurring) {
      controller.toggleHighlightHoverJobRecurrence(
          gridIndex, true,
          hg.HighlightHoverJob.config.avgDelay,
          hg.HighlightHoverJob.config.delayDeviationRange);
    }

    if (hg.HighlightRadiateJob.config.isRecurring) {
      controller.toggleHighlightRadiateJobRecurrence(
          gridIndex, true,
          hg.HighlightRadiateJob.config.avgDelay,
          hg.HighlightRadiateJob.config.delayDeviationRange);
    }

    if (hg.LineJob.config.isRecurring) {
      controller.toggleRandomLineJobRecurrence(
          gridIndex, true,
          hg.LineJob.config.avgDelay,
          hg.LineJob.config.delayDeviationRange);
    }

    if (hg.LinesRadiateJob.config.isRecurring) {
      controller.toggleLinesRadiateJobRecurrence(
          gridIndex, true,
          hg.LinesRadiateJob.config.avgDelay,
          hg.LinesRadiateJob.config.delayDeviationRange);
    }
  }

  /**
   * Creates a new ColorResetJob with the grid at the given index.
   *
   * @param {number} gridIndex
   */
  function createColorResetAnimation(gridIndex) {
    var job = new hg.ColorResetJob(controller.grids[gridIndex]);
    controller.colorResetJobs.push(job);
    restartColorResetAnimation(gridIndex);

    controller.grids[gridIndex].animations.colorResetAnimations =
        controller.grids[gridIndex].animations.colorResetAnimations || [];
    controller.grids[gridIndex].animations.colorResetAnimations.push(job);
  }

  /**
   * Creates a new ColorShiftJob with the grid at the given index.
   *
   * @param {number} gridIndex
   */
  function createColorShiftAnimation(gridIndex) {
    var job = new hg.ColorShiftJob(controller.grids[gridIndex]);
    controller.colorShiftJobs.push(job);
    restartColorShiftAnimation(gridIndex);

    controller.grids[gridIndex].animations.colorShiftAnimations =
        controller.grids[gridIndex].animations.colorShiftAnimations || [];
    controller.grids[gridIndex].animations.colorShiftAnimations.push(job);
  }

  /**
   * Creates a new ColorWaveJob with the grid at the given index.
   *
   * @param {number} gridIndex
   */
  function createColorWaveAnimation(gridIndex) {
    var job = new hg.ColorWaveJob(controller.grids[gridIndex]);
    controller.colorWaveJobs.push(job);
    restartColorWaveAnimation(gridIndex);

    controller.grids[gridIndex].animations.colorWaveAnimations =
        controller.grids[gridIndex].animations.colorWaveAnimations || [];
    controller.grids[gridIndex].animations.colorWaveAnimations.push(job);
  }

  /**
   * Creates a new DisplacementWaveJob with the grid at the given index.
   *
   * @param {number} gridIndex
   */
  function createDisplacementWaveAnimation(gridIndex) {
    var job = new hg.DisplacementWaveJob(controller.grids[gridIndex]);
    controller.displacementWaveJobs.push(job);
    restartDisplacementWaveAnimation(gridIndex);

    controller.grids[gridIndex].animations.displacementWaveAnimations =
        controller.grids[gridIndex].animations.displacementWaveAnimations || [];
    controller.grids[gridIndex].animations.displacementWaveAnimations.push(job);
  }

  /**
   * Restarts the ColorResetJob at the given index.
   *
   * @param {number} index
   */
  function restartColorResetAnimation(index) {
    var job = controller.colorResetJobs[index];

    if (!job.isComplete) {
      hg.animator.cancelJob(job);
    }

    job.init();
    hg.animator.startJob(job);
  }

  /**
   * Restarts the ColorShiftJob at the given index.
   *
   * @param {number} index
   */
  function restartColorShiftAnimation(index) {
    var job = controller.colorShiftJobs[index];

    if (!job.isComplete) {
      hg.animator.cancelJob(job);
    }

    job.init();
    hg.animator.startJob(job);
  }

  /**
   * Restarts the ColorWaveJob at the given index.
   *
   * @param {number} index
   */
  function restartColorWaveAnimation(index) {
    var job = controller.colorWaveJobs[index];

    if (!job.isComplete) {
      hg.animator.cancelJob(job);
    }

    job.init();
    hg.animator.startJob(job);
  }

  /**
   * Restarts the DisplacementWaveJob at the given index.
   *
   * @param {number} index
   */
  function restartDisplacementWaveAnimation(index) {
    var job = controller.displacementWaveJobs[index];

    if (!job.isComplete) {
      hg.animator.cancelJob(job);
    }

    job.init();
    hg.animator.startJob(job);
  }

  /**
   * Expands the Grid to show the post at the given tile index.
   *
   * @param {number} gridIndex
   * @param {Tile} tile
   */
  function openPost(gridIndex, tile) {
    var job, grid;

    grid = controller.grids[gridIndex];

    grid.animations.openPostAnimations = grid.animations.openPostAnimations || [];

    job = new hg.OpenPostJob(grid, tile, onComplete);
    controller.openPostJobs.push(job);
    hg.animator.startJob(job);

    function onComplete(job) {
      controller.grids[gridIndex].animations.openPostAnimations.splice(
          controller.grids[gridIndex].animations.openPostAnimations.indexOf(job), 1);
    }
  }

  /**
   * Creates a new LinesRadiateJob based off the tile at the given index.
   *
   * @param {number} gridIndex
   * @param {Tile} tile
   */
  function createLinesRadiateAnimation(gridIndex, tile) {
    var job, i, count, grid;

    grid = controller.grids[gridIndex];

    grid.animations.lineAnimations = grid.animations.lineAnimations || [];

    job = new hg.LinesRadiateJob(grid, tile, onComplete);
    controller.linesRadiateJobs.push(job);
    hg.animator.startJob(job);

    for (i = 0, count = job.lineJobs.length; i < count; i += 1) {
      grid.animations.lineAnimations.push(job.lineJobs[i]);
    }

    function onComplete(job) {
      controller.grids[gridIndex].animations.lineAnimations.splice(
          controller.grids[gridIndex].animations.lineAnimations.indexOf(job), 1);
    }
  }

  /**
   * Creates a new random LineJob.
   *
   * @param {number} gridIndex
   */
  function createRandomLineAnimation(gridIndex) {
    var job;

    controller.grids[gridIndex].animations.lineAnimations =
        controller.grids[gridIndex].animations.lineAnimations || [];

    job = hg.LineJob.createRandomLineJob(controller.grids[gridIndex],
        onComplete);
    controller.randomLineJobs.push(job);
    hg.animator.startJob(job);

    controller.grids[gridIndex].animations.lineAnimations.push(job);

    function onComplete() {
      controller.grids[gridIndex].animations.lineAnimations.splice(
          controller.grids[gridIndex].animations.lineAnimations.indexOf(job), 1);
    }
  }

  /**
   * Creates a new HighlightHoverJob based off the tile at the given index.
   *
   * @param {number} gridIndex
   * @param {Tile} tile
   */
  function createHighlightHoverAnimation(gridIndex, tile) {
    var job;

    controller.grids[gridIndex].animations.highlightHoverAnimations =
        controller.grids[gridIndex].animations.highlightHoverAnimations || [];

    job = new hg.HighlightHoverJob(tile, onComplete);
    controller.highlightHoverJobs.push(job);
    hg.animator.startJob(job);

    controller.grids[gridIndex].animations.highlightHoverAnimations.push(job);

    function onComplete() {
      controller.grids[gridIndex].animations.highlightHoverAnimations.splice(
          controller.grids[gridIndex].animations.highlightHoverAnimations.indexOf(job), 1);
    }
  }

  /**
   * Creates a new HighlightRadiateJob based off the tile at the given index.
   *
   * @param {number} gridIndex
   * @param {Tile} tile
   */
  function createHighlightRadiateAnimation(gridIndex, tile) {
    var job, grid, startPoint;

    grid = controller.grids[gridIndex];

    controller.grids[gridIndex].animations.highlightRadiateAnimations =
        controller.grids[gridIndex].animations.highlightRadiateAnimations || [];

    startPoint = {
      x: tile.originalCenterX,
      y: tile.originalCenterY
    };

    job = new hg.HighlightRadiateJob(startPoint, grid, onComplete);
    controller.highlightRadiateJobs.push(job);
    hg.animator.startJob(job);

    controller.grids[gridIndex].animations.highlightRadiateAnimations.push(job);

    function onComplete() {
      controller.grids[gridIndex].animations.highlightRadiateAnimations.splice(
          controller.grids[gridIndex].animations.highlightRadiateAnimations.indexOf(job), 1);
    }
  }

  /**
   * Creates a HighlightRadiateJob based off of a random tile.
   *
   * @param {number} gridIndex
   */
  function createRandomHighlightRadiateAnimation(gridIndex) {
    var tileIndex = parseInt(Math.random() * hg.controller.grids[gridIndex].tiles.length);
    createHighlightRadiateAnimation(gridIndex, hg.controller.grids[gridIndex].tiles[tileIndex]);
  }

  /**
   * Creates a HighlightHoverJob based off of a random tile.
   *
   * @param {number} gridIndex
   */
  function createRandomHighlightHoverAnimation(gridIndex) {
    var tileIndex = parseInt(Math.random() * hg.controller.grids[gridIndex].tiles.length);
    createHighlightHoverAnimation(gridIndex, hg.controller.grids[gridIndex].tiles[tileIndex]);
  }

  /**
   * Creates a LinesRadiateJob based off of a random tile.
   *
   * @param {number} gridIndex
   */
  function createRandomLinesRadiateAnimation(gridIndex) {
    var tileIndex = parseInt(Math.random() * hg.controller.grids[gridIndex].tiles.length);
    createLinesRadiateAnimation(gridIndex, hg.controller.grids[gridIndex].tiles[tileIndex]);
  }

  /**
   * Toggles whether an AnimationJob is automatically repeated.
   *
   * @param {Function} jobCreator
   * @param {Array.<number>} jobTimeouts
   * @param {number} gridIndex
   * @param {boolean} isRecurring
   * @param {number} avgDelay
   * @param {number} delayDeviationRange
   */
  function toggleJobRecurrence(jobCreator, jobTimeouts, gridIndex, isRecurring, avgDelay,
                               delayDeviationRange) {
    var minDelay, maxDelay, actualDelayRange;

    // Compute the delay deviation range
    minDelay = avgDelay - delayDeviationRange * 0.5;
    minDelay = minDelay > 0 ? minDelay : 1;
    maxDelay = avgDelay + delayDeviationRange * 0.5;
    actualDelayRange = maxDelay - minDelay;

    // Stop any pre-existing recurrence
    if (jobTimeouts[gridIndex]) {
      clearTimeout(jobTimeouts[gridIndex]);
      jobTimeouts[gridIndex] = null;
    }

    // Should we start the recurrence?
    if (isRecurring) {
      jobTimeouts[gridIndex] = setTimeout(recur, avgDelay);
    }

    /**
     * Creates a new occurrence of the AnimationJob and starts a new timeout to repeat this.
     */
    function recur() {
      var delay = Math.random() * actualDelayRange + minDelay;
      jobCreator(gridIndex);
      jobTimeouts[gridIndex] = setTimeout(recur, delay);
    }
  }

  /**
   * Event listener for the window resize event.
   *
   * Resizes all of the hex-grid components.
   */
  function resize() {
    controller.grids.forEach(function (grid, index) {
      hg.animator.cancelAll();
      grid.resize();
      restartColorResetAnimation(index);
      restartColorShiftAnimation(index);
      restartColorWaveAnimation(index);
      restartDisplacementWaveAnimation(index);
      hg.animator.startJob(grid);
      hg.animator.startJob(controller.annotations[index]);
    });
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this singleton

  controller.grids = [];
  controller.inputs = [];
  controller.annotations = [];
  controller.colorResetJobs = [];
  controller.colorShiftJobs = [];
  controller.displacementWaveJobs = [];
  controller.colorWaveJobs = [];
  controller.openPostJobs = [];
  controller.linesRadiateJobs = [];
  controller.randomLineJobs = [];
  controller.highlightHoverJobs = [];
  controller.highlightRadiateJobs = [];

  controller.highlightHoverRecurrenceTimeouts = [];
  controller.highlightRadiateRecurrenceTimeouts = [];
  controller.linesRadiateRecurrenceTimeouts = [];
  controller.randomLineRecurrenceTimeouts = [];

  controller.config = config;

  controller.createNewHexGrid = createNewHexGrid;
  controller.restartColorShiftAnimation = restartColorShiftAnimation;
  controller.restartColorWaveAnimation = restartColorWaveAnimation;
  controller.restartDisplacementWaveAnimation = restartDisplacementWaveAnimation;
  controller.openPost = openPost;
  controller.createLinesRadiateAnimation = createLinesRadiateAnimation;
  controller.createRandomLineAnimation = createRandomLineAnimation;
  controller.createHighlightHoverAnimation = createHighlightHoverAnimation;
  controller.createHighlightRadiateAnimation = createHighlightRadiateAnimation;
  controller.createRandomHighlightRadiateAnimation = createRandomHighlightRadiateAnimation;
  controller.createRandomHighlightHoverAnimation = createRandomHighlightHoverAnimation;
  controller.createRandomLinesRadiateAnimation = createRandomLinesRadiateAnimation;

  controller.toggleHighlightHoverJobRecurrence =
      toggleJobRecurrence.bind(controller, createRandomHighlightHoverAnimation,
          controller.highlightHoverRecurrenceTimeouts);
  controller.toggleHighlightRadiateJobRecurrence =
      toggleJobRecurrence.bind(controller, createRandomHighlightRadiateAnimation,
          controller.highlightRadiateRecurrenceTimeouts);
  controller.toggleLinesRadiateJobRecurrence =
      toggleJobRecurrence.bind(controller, createRandomLinesRadiateAnimation,
          controller.linesRadiateRecurrenceTimeouts);
  controller.toggleRandomLineJobRecurrence =
      toggleJobRecurrence.bind(controller, createRandomLineAnimation,
          controller.randomLineRecurrenceTimeouts);
  controller.resize = resize;

  // Expose this module
  if (!window.hg) window.hg = {};
  window.hg.controller = controller;

  window.addEventListener('resize', resize, false);

  console.log('controller module loaded');
})();

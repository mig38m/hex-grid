/**
 * @typedef {AnimationJob} DisplacementPulseJob
 */

/**
 * This module defines a constructor for DisplacementPulseJob objects.
 *
 * @module DisplacementPulseJob
 */
(function () {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var config = {};

  config.duration = 500;

  // TODO:

  config.isRecurring = false;
  config.avgDelay = 4000;
  config.delayDeviationRange = 3800;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  /**
   * Calculates and stores the initial and maximal displacement values for all tiles.
   *
   * @this DisplacementPulseJob
   */
  function initializeDisplacements() {
    var job, i, iCount, j, jCount, k, tiles;

    job = this;

    job.displacements = [];

    k = 0;

    if (job.grid.isPostOpen) {
      // Consider all of the old AND new tiles
      for (i = 0, iCount = job.grid.sectors.length; i < iCount; i += 1) {
        tiles = job.grid.sectors[i].tiles;

        for (j = 0, jCount = tiles.length; j < jCount; j += 1) {
          job.displacements[k] = {
            tile: ,
            startX: ,
            startY: ,
            endX: ,
            endY:
          };
          k += 1;
        }
      }
    } else {
      for (i = 0, iCount = job.grid.tiles.length; i < iCount; i += 1) {
        **;
      }
    }

    // TODO:
//    var job, i, count, deltaX, deltaY, distanceOffset;
//
//    job = this;
//
//    distanceOffset = -window.hg.Grid.config.tileShortLengthWithGap;
//
//    for (i = 0, count = job.grid.tiles.length; i < count; i += 1) {
//      deltaX = job.grid.tiles[i].originalAnchorX - job.startPoint.x;
//      deltaY = job.grid.tiles[i].originalAnchorY - job.startPoint.y;
//      job.tileDistances[i] = Math.sqrt(deltaX * deltaX + deltaY * deltaY) + distanceOffset;
//    }**;
  }

  /**
   * @this DisplacementPulseJob
   */
  function handleComplete(wasCancelled) {
    var job = this;

    console.log('DisplacementPulseJob ' + (wasCancelled ? 'cancelled' : 'completed'));

    job.isComplete = true;

    job.onComplete();
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  /**
   * Sets this DisplacementPulseJob as started.
   *
   * @this DisplacementPulseJob
   */
  function start() {
    var job = this;

    job.startTime = Date.now();
    job.isComplete = false;
  }

  /**
   * Updates the animation progress of this DisplacementPulseJob to match the given time.
   *
   * This should be called from the overall animation loop.
   *
   * @this DisplacementPulseJob
   * @param {number} currentTime
   * @param {number} deltaTime
   */
  function update(currentTime, deltaTime) {
    // TODO:

    // TODO: use an ease-out curve to determine progress at each frame

//    var job, currentMaxDistance, currentMinDistance, i, count, distance, waveWidthRatio,
//        oneMinusDurationRatio, animatedSomeTile;
//
//    job = this;
//
//    if (currentTime > job.startTime + config.duration) {
//      handleComplete.call(job, false);
//    } else {
//      oneMinusDurationRatio = 1 - (currentTime - job.startTime) / config.duration;
//
//      currentMaxDistance = config.shimmerSpeed * (currentTime - job.startTime);
//      currentMinDistance = currentMaxDistance - config.shimmerWaveWidth;
//
//      animatedSomeTile = false;
//
//      for (i = 0, count = job.grid.tiles.length; i < count; i += 1) {
//        distance = job.tileDistances[i];
//
//        if (distance > currentMinDistance && distance < currentMaxDistance) {
//          waveWidthRatio = (distance - currentMinDistance) / config.shimmerWaveWidth;
//
//          updateTile(job.grid.tiles[i], waveWidthRatio, oneMinusDurationRatio);
//
//          animatedSomeTile = true;
//        }
//      }
//
//      if (!animatedSomeTile) {
//        handleComplete.call(job, false);
//      }
//    }**;
  }

  /**
   * Draws the current state of this DisplacementPulseJob.
   *
   * This should be called from the overall animation loop.
   *
   * @this DisplacementPulseJob
   */
  function draw() {
    // This animation job updates the state of actual tiles, so it has nothing of its own to draw
  }

  /**
   * Stops this DisplacementPulseJob, and returns the element its original form.
   *
   * @this DisplacementPulseJob
   */
  function cancel() {
    var job = this;

    handleComplete.call(job, true);
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {Grid} grid
   * @param {Tile} tile
   * @param {Function} onComplete
   */
  function DisplacementPulseJob(grid, tile, onComplete) {
    var job = this;

    job.grid = grid;
    job.tile = tile;
    job.startTime = 0;
    job.isComplete = false;

    job.displacements = null;

    job.start = start;
    job.update = update;
    job.draw = draw;
    job.cancel = cancel;
    job.onComplete = onComplete;

    console.log('DisplacementPulseJob created');
  }

  DisplacementPulseJob.config = config;

  // Expose this module
  window.hg = window.hg || {};
  window.hg.DisplacementPulseJob = DisplacementPulseJob;

  console.log('DisplacementPulseJob module loaded');
})();

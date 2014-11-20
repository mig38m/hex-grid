# hex-grid

[![Flattr this git repo][flattr-image]][flattr-url]

#### A dynamic, expandable, animated grid of hexagonal tiles for displaying posts

_See this running at [www.jackieandlevi.com/hex-grid][demo-url]!_

Levi was bored with the standard grid layout and wanted to play with particle systems and crazy animations. So he made
hex-grid.

Levi uses this package for his professional portfolio, so you know it must be pretty cool!

## Features

Some features of this package include:

- A particle system complete with neighbor and anchor position spring forces.
- An assortment of **persistent** animations that make the grid _exciting to watch_.
- An assortment of **transient** animations that make the grid _exciting to interact with_.
- A control panel that enables you to adjust most of the many different parameters of this system.
- The ability to display custom collections of posts.
    - These posts will be displayed within individual tiles.
    - These tile posts can be expanded for more information.
    - The contents of these posts use standard [Markdown syntax][markdown-url], which is then parsed by the system for
      displaying within the grid.

## Included Example

An example app is included in this project's repository. This currently uses data from Levi's portfolio, but there are
plans to include a separate data collection.

The media for Levi's portfolio is stored in an [AWS S3 bucket][aws-s3-url]. The textual content and metadata is stored
in a MongoDB database hosted by [MongoLab][mongolab-url].

## Acknowledgements / Technology Stack

The following packages/libraries/projects were used in the development of hex-grid:

- [Gulp.js][gulp-url]
- [Bower][bower-url]
- [dat.gui][dat-gui-url]
- [Showdown][showdown-url]
- Additional packages that are available via [NPM][npm-url] (these are listed within the `package.json` file)

## License

MIT



[demo-url]: http://www.jackieandlevi.com/hex-grid
[markdown-url]: http://daringfireball.net/projects/markdown/
[aws-s3-url]: http://aws.amazon.com/s3/
[mongolab-url]: https://mongolab.com
[dat-gui-url]: http://code.google.com/p/dat-gui
[gulp-url]: http://gulpjs.com
[bower-url]: http://bower.io
[npm-url]: https://npmjs.org
[showdown-url]: https://github.com/showdownjs/showdown

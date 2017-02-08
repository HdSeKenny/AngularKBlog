const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const env = require('./src/configs/development');
const webpackConfigDev = require('./webpack.config.dev');
const webpackConfigProd = require('./webpack.config.prod');
const config = require('./src/configs');
const CHUNK_REGEX = /^([A-Za-z0-9_\-]+)\..*/;
const babelrc = fs.readFileSync('./.babelrc');
const babelLoaderQuery = {};

try {
  babelLoaderQuery = JSON.parse(babelrc);
  console.log(babelLoaderQuery);
} catch (err) {
  console.error('==>     ERROR: Error parsing your .babelrc.');
  console.error(err);
}

module.exports = function(grunt) {

  require("load-grunt-tasks")(grunt);

  grunt.initConfig({
    // project variables
    project: {
      build: path.join(__dirname, '/src/public/build'),
      public: 'src/public',
      test: './unitTest/build'

    },
    // clean build
    clean: [path.join(__dirname, '/src/public/build/js')],

    less: {
      dev: {
        files: {
          "./src/public/styles/main.css": "./src/public/styles/main.less"
        }
      },
      prod: {
        files: {
          "./src/public/styles/main.css": "./src/public/styles/main.less"
        },
        options: {
          compress: true
        }
      }
    },
    // webpack bundling
    webpack: {
      prod: webpackConfigProd,
      test: {
        context: path.join(__dirname, '/unitTest'),
        resolve: {
          extensions: ['', '.js', '.jsx']
        },
        entry: {
          test: ['./index.js']
        },
        output: {
          path: '<%= project.test %>',

          filename: '[name].js',
          chunkFilename: '[name].[chunkhash].js'
        },
        module: {
          loaders: [
            { test: /\.jsx?$/, exclude: /node_modules/, loader: require.resolve('babel-loader') }, {
              test: /\.json$/,
              exclude: /node_modules/,
              loaders: ['json-loader']
            }
          ]
        },
        plugins: [
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify('development')
            }
          }),
          new webpack.optimize.CommonsChunkPlugin('common.js', undefined, 2)
        ],

        stats: {
          colors: true
        },

        devtool: 'source-map'
      },
      buildWithSource: {
        resolve: {
          extensions: ['', '.js', '.jsx']
        },
        entry: './src/client.js',
        output: {
          path: '<%= project.build %>/js',
          filename: '[name].js',
          chunkFilename: '[name].js'
        },
        module: {
          loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loaders: ['babel?' + JSON.stringify(babelLoaderQuery)]
          }, {
            test: /\.json$/,
            exclude: /node_modules/,
            loaders: ['json-loader']
          }]
        },
        plugins: [
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify('development')
            }
          }),

          // These are performance optimizations for your bundles
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.OccurenceOrderPlugin(),
          new webpack.optimize.CommonsChunkPlugin('common.js', 2),
          //new webpack.optimize.UglifyJsPlugin({
          //    compress: {
          //        warnings: false
          //    },
          //    output: {
          //        comments: false
          //    }
          //}),

          // generates webpack assets config to use hashed assets in production mode
          function webpackStatsPlugin() {
            this.plugin('done', function(stats) {
              var data = stats.toJson();
              var assets = data.assetsByChunkName;
              var output = {
                assets: {},
                cdnPath: this.options.output.publicPath
              };

              Object.keys(assets).forEach(function eachAsset(key) {
                var value = assets[key];
                // if `*.[chunkhash].min.js` regex matched, then use file name for key
                var matches = key.match(CHUNK_REGEX);
                if (matches) {
                  key = matches[1];
                }
                output.assets[key] = config.path_prefix + '/static/build/js/' + value;
              });
              if (grunt.file.exists(path.join(__dirname, '/src/public/build', 'essentials.js'))) {
                //add essentials
                output.assets["essentials"] = config.path_prefix + '/static/build/essentials.js';
              }
              fs.writeFileSync(
                path.join(__dirname, '/src/public/build', 'assets.json'),
                JSON.stringify(output, null, 4)
              );
            });
          }
        ],
        // removes verbosity from builds
        progress: true,
        devtool: 'inline-source-map'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },

    'webpack-dev-server': {
      options: {
        host: '0.0.0.0',
        hot: true,
        historyApiFallback: true,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
        },
        port: env.hot_server_port,
        webpack: webpackConfigDev,
        publicPath: webpackConfigDev.output.publicPath,
        contentBase: 'http://' + env.hot_server_host + ':' + env.hot_server_port
      },
      start: {
        keepAlive: true
      }
    },

    watch: {
      options: {
        nospawn: true
      },

      less: {
        files: ["<%= project.public %>/styles/**/*.less"],
        tasks: ["less:dev"]
      }
    }

  });

  //development environment task
  grunt.registerTask('default', ['clean', 'less:dev', 'webpack-dev-server']);

  //production environment task
  grunt.registerTask('prod', ['clean', 'less:prod', 'webpack:prod']);
  grunt.registerTask('buildWithSource', ['clean', 'less:prod', 'webpack:buildWithSource']);

  //test task
  grunt.registerTask('test', ['clean', 'webpack:test', 'karma']);

};

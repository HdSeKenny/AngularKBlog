var webpack = require('webpack');
var path = require('path');
var env = require('./src/configs/development');
var fs = require('fs');
var CHUNK_REGEX = /^([A-Za-z0-9_\-]+)\..*/;
var _ = require('lodash');
var babelrc = fs.readFileSync('./.babelrc');
var babelLoaderQuery = JSON.parse(babelrc);
var serverConfig = require('./src/configs/index');

// get the ignored module list by the 'supported_modes' which was defined in configs/index
var webpackIgnore = require('./webpack.ignore')[serverConfig.supported_modes];

// Load ignore list from webpack.ignore.json
// modules in the ignore list won't be packaged into the bundle
// about 'vertx', see: https://github.com/yahoo/fluxible/issues/138
var ignoreString = '(' + webpackIgnore.concat('vertx').join('|') + ')$';
console.log('Dev Ignore String: ', ignoreString);

var config = {
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  entry: [
    'webpack-dev-server/client?http://' + env.hot_server_host + ':' + env.hot_server_port,
    'webpack/hot/dev-server',
    './src/client.js',
    'react-addons-perf'
  ],
  output: {
    path: path.join(__dirname, '/src/public/build/js'),
    filename: '[name].js',
    publicPath: 'http://' + env.hot_server_host + ':' + env.hot_server_port + '/build/js'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: [/node_modules/],
      loaders: ['react-hot', 'babel']
    }, {
      test: /\.json$/,
      exclude: /node_modules/,
      loaders: ['json-loader']
    }, {
      // expose for chrome react dev tools
      test: require.resolve('react'),
      loader: 'expose?React'
    }, {
      // expose for chrome react perf
      test: require.resolve('react-addons-perf'),
      loader: 'expose?Perf'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),

    new webpack.IgnorePlugin(RegExp(ignoreString)),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),

    new webpack.optimize.CommonsChunkPlugin('common.js', undefined, 2),

    function webpackStatsPlugin() {
      this.plugin('done', function(stats) {
        var data = stats.toJson();
        var assets = data.assetsByChunkName;
        console.log(assets);
        var output = {
          assets: {},
          cdnPath: this.options.output.publicPath
        };
        Object.keys(assets).forEach(function eachAsset(key) {
          var value = assets[key];
          var matches = key.match(CHUNK_REGEX);
          if (matches) {
            key = matches[1];
          }
          output.assets[key] = 'http://' + env.hot_server_host + ':' + env.hot_server_port + '/build/js/' + (_.isArray(value) ? value[0] : value);
        });
        fs.writeFileSync(
          path.join(__dirname, '/src/public/build', 'assets.json'),
          JSON.stringify(output, null, 4)
        );
      });
    }
  ],
  stats: {
    colors: true
  },
  devtool: 'eval'
};

module.exports = config;

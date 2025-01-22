const path = require('path');
const webpack = require('webpack');
const yargs = require('yargs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const config = require('config');


// Phaser webpack config
const phaserModule = path.join(__dirname, '/node_modules/phaser-ce/');
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
const pixi = path.join(phaserModule, 'build/custom/pixi.js');
const p2 = path.join(phaserModule, 'build/custom/p2.js');

const options = yargs.alias('p', 'production').argv;
const isProduction = options.production;

const webpackConfig = {
    entry: {
        main: ['@babel/polyfill', path.resolve(__dirname, 'src/index.js')]//,path.resolve(__dirname,'lib/core.js')
    },
    output: {
        path: !isProduction
            ? path.resolve(__dirname, 'dist')
            : path.resolve(__dirname, 'dist', '[git-revision-hash]'),
        publicPath: isProduction?'./':'/',
        filename: 'main.bundle.js'
    },
    watch: false,
    plugins: [
        new FriendlyErrorsWebpackPlugin(),

        new HtmlWebpackPlugin({
            template: './index.html',
            filename: 'index.html',
            inject: 'body'
        }),
        new CopyWebpackPlugin([{
            from: 'assets',
            to: 'assets'
        }])/* ,
        new CopyWebpackPlugin([{
            from: 'json',
            to: 'json'
        }]) */
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /pixi\.js/,
                use: 'expose-loader?PIXI'
            },
            {
                test: /phaser-split\.js$/,
                use: 'expose-loader?Phaser'
            },
            {
                test: /p2\.js/,
                use: 'expose-loader?p2'
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            { 
                test: /\.(png|woff|woff2|eot|ttf|svg|otf|ttc)$/,
                loader: 'url-loader?limit=100000' 
            }
        ]
    },
    
    devServer: {
        // host:'192.168.1.100',
        historyApiFallback: true,
        quiet: true
    }
};

if (!isProduction) {
    webpackConfig.devtool = 'inline-source-map'
}

module.exports = webpackConfig;

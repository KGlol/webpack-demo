// 获取基础配置 配置文件webpack.config.js

const options = require('../webpack.config')
const Webpack = require('./webpack')

// console.log(options);
new Webpack(options)
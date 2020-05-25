const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// 3.0版本后的clean-webpack-plugin 需要解构才能new
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// 开启多线程构建
const HappyPack = require('happypack')

module.exports = {
  mode: 'production',
  // devetool: 'cheap-module-source-map', // sourceMap设置 生产环境下 速度慢 定位更准确
  devtool: 'cheap-module-source-map', // sourceMap设置 开发环境下 速度较快
  // entry: './src/index.js', // 默认为./src
  entry: {
    main: './src/index.js', 
    submain: './src/index2.js'
  },
  output: {
    filename: '[name].js', // 此处name指entry下的键名
    path: path.resolve(__dirname, 'build') // output路径必须为绝对路径
  },

   // webpack默认找js文件，设置兼容jsx
   resolve: {
    // import jsx文件时不必再写后缀名(写上后缀名查找更快)
    extensions: ['.js', '.jsx'],
    // 别名
    alias: {
      '@':path.resolve(__dirname, 'src')
    }
  },

  // loader 让 webpack 能够去处理那些非 JavaScript 文件（webpack 自身只理解 JavaScript）
  // loader 可以将所有类型的文件转换为 webpack 能够处理的有效模块
  module: {
    noParse: /node_modules\/(jquery\.js)/,
    rules: [
      {
        // 图片处理
        test: /\.(png|jpe?g|gif$)/i, // 指定目标文件类型
        use: { // 指定使用哪个loader

          // loader: 'file-loader',
          loader: 'url-loader',
          options: {
            outputPath: 'images/',
            name: '[name]_[hash].[ext]',
            limit: 20480, // 单位字节， url-loader类似file-loader，但是当图片小于限制的体积时，会将图片转化成base64格式，减少网路清请求，减小应用大小
          }
        },
      }, {

        // 处理sass scss css 文件
        test: /\.css$/,
        // sytle-loader 将样式插入header， css-loader将css文件处理
        // use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'] // loader执行顺序由后向前 css-loader -> style-loader
        // MiniCssExtractPlugin.loader用于在生产huanjing将css文件分离出来
        use: [{
          loader: MiniCssExtractPlugin.loader
        }, {
          loader: 'css-loader',
          options: {
            modules: {
            auto: true
            }
          }
          }] // loader执行顺序由后向前 css-loader -> style-loader
      }, {

        // 处理sass scss css 文件
        test: /\.s(a|c)ss$/,
        // sytle-loader 将样式插入header， css-loader将css文件处理
        // use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'] // loader执行顺序由后向前 css-loader -> style-loader
        // MiniCssExtractPlugin.loader用于在生产huanjing将css文件分离出来
        use: [{
          loader: MiniCssExtractPlugin.loader
        }, {
          loader: 'css-loader',
            options: {
              modules: {
              auto: true
            }
          }
          }, 'postcss-loader', 'sass-loader'] // loader执行顺序由后向前 css-loader -> style-loader
      },{
        // test: /\.s(a|c)ss&/
      }, {

        // babel编译js
        // @babel/core 为babel核心 babel-loader为webpack加载js文件，@babel/preset-env负责es6->es5
        // 但@babel/preset-env并不能编译所有的（如map方法， promise等）es6新语法, 所以需要在就是文件中引入@babel/polyfill,并在options中设置按需加载，控制体积
        test: /\.jsx?$/,
        exclude: /node_modules/, // 比正则和include的优先级高
        include: path.resolve(__dirname, 'src'), // 只查找src下的文件
        loader: 'babel-loader', // 帮助webpack加载js文件
        // options: {
        //     //  使用@babel/preset-env处理js文件
        //   'presets': ['@babel/preset-env', {
        //       useBuiltIns: 'usage' // 在js中引入@babel/polyfill会使打包后的js文件体积过大，这里设置按需加载减小打包后的体积
        //     }]
        // }
        // 这种方式的打包的好处在于不会污染全局变量
        // options之内的设置可以直接直接放在对应的设置文件里，如.babelrc等
        options: {
          "plugins": [
            [
              "@babel/plugin-transform-runtime",
              {
                "absoluteRuntime": false,
                // 默认false, 不填充 | 2 支持全局变量和静态属性 | 3 支持全局变量静态属性及实例属性
                // 需要下载依赖 npm install --save @babel/runtime-corejs3
                "corejs": 3, //false | 2 | 3
                "helpers": true,
                "regenerator": true,
                "useESModules": false,
                "version": "7.0.0-beta.0"
              }
            ]
          ]
        }
        // use: 'happypack/loader?id=js', // 只在大型项目中开启多线程打包优化
      }
    ]
  },

  // optimize-css-assets-webpack-plugin压缩其合并（同选择器名合并）代码
  optimization: {
    minimizer: [ new OptimizeCSSAssetsPlugin({})], // 需要传入空对象
  },

  plugins: [
    // 将模板文件打包到dist文件，并把生成的资源文件注入html文件
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    // 打包前将dist文件夹清空
    new CleanWebpackPlugin(),

    // 模块热重载（只更改变化的地方，代码更改不会直接刷新页面）
    new webpack.HotModuleReplacementPlugin(),

    // 用于生产环境分离css文件
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),

    // 只在大型项目中开启多线程打包优化
    // new HappyPack({
    //   id: 'js',
    //   use: [
    //     {
    //       loader: 'babel-loader',
    //       options: {
    //         "plugins": [
    //           [
    //             "@babel/plugin-transform-runtime",
    //             {
    //               "absoluteRuntime": false,
    //               "corejs": 3, //false | 2 | 3
    //               "helpers": true,
    //               "regenerator": true,
    //               "useESModules": false,
    //               "version": "7.0.0-beta.0"
    //             }
    //           ]
    //         ]
    //       }
    //     },
    //     'eslint-loader' // eslint格式检查
    //   ]
    // })

  ]

  // //设置本地服务(webpack-dev-server将读取devServer设置)
  // //webpack-dev-server会在内存中进行项目打包
  // devServer: {
  //   contentBase: './build', // 本地服务内容来源
  //   port: 8081, // 设置端口
  //   open: true, // 运行项目时自动打开浏览器，或者在package,json中配置脚本'webpack-dev-server --open'
  //   hot: true, // 是否开启热重载
  //   hotOnly: true
  // }
}
const path = require('path')

// node下读取文件的方法
const fs = require('fs')
// 生成抽象语法树
const { parse } = require('@babel/parser')

const traverse = require('@babel/traverse')

const { transfromFromAst } = require('@babel/core')

module.exports = class Webpack {
  constructor({ entry, output }) {
    // super(options)
    console.log({ entry, output });
    this.entry = entry
    this.output = output
    this.run()

  }

  run() {
    // 运行解析器
    const info = this.analyser(this.entry)
    // 对象info包含当前模块的文件名，依赖，和内部的代码
 
    // 递归分析
    const moduleArr = [info]
    for (let i = 0; i < moduleArr.length; i++) {
      const {dependencies} = moduleArr[i];
      if(dependencies) {
        for(let j  in dependencies) {
          moduleArr.push(this.analyser(dependencies[j]))
        }
      }
    }

  }

  analyser(filename) {
    // 1.取文件中的内容
    const content = fs.readFileSync(filename, 'utf-8')
    // console.log(content);

    // 2.模块分析 分析依赖哪些模块，以及以来路径 使用@babel/parser
    // ast为解析的抽象语法树
    const ast = parse(content, {
      sourceType: 'module'
    })

    // 3.根据body的解析结果， 遍历出所有引入的模块，推荐使用babel下的 @babel/traverse
    const dependencies = {}
    traverse(ast, {
      ImportDeclaration({ node }) {
        //拼接依赖的路径
        const newFileName = './' + path.join(
          path.dirname(filename), //当前模块的路径（如index.js）
          node.source.value //依赖的相对路径
        )
        // 储存依赖路径
        dependencies[node.source.value] = newFileName
      }
    })

    // 通过babel 分析并编译内容 @babel/core babel/preset-env transfromFromAst
    const { code } = transfromFromAst(Ast, null, {
      presets: ['@babel/preset-env'] // 通过@babel/preset-env解析es6语法
    })

    return {
      filename, //入口文件名
      depandence, // 依赖的路径对象
      code // 解析后的代码
    }
  }
}
/* eslint-disable @typescript-eslint/no-var-requires */
const { name: pkgName } = require('./package.json')
const { join } = require('path')
const { DefinePlugin } = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const PostCSSNested = require('postcss-nested')
/* eslint-enable */

const distDir = join(__dirname, 'dist')

const ignoreRedirect = (context) => {
  // Ignore any redirects.
  context.route = context.originalRoute

  return context
}

const html = (context) => {
  // Remove /index.html from the output path if the dir name ends with a .html file extension.
  // For example: /dist/dir/special.html/index.html -> /dist/dir/special.html
  if (context.route.endsWith('.html')) {
    context.outputPath = join(distDir, context.route)
  }

  return context
}

const pluginOptions = {
  define: {
    'process.env': {
      PROJECT_NAME: JSON.stringify(pkgName),
    }
  },
  compression: {
    test: /\.(js|css)(\?.*)?$/i,
    threshold: 8192,
  },
  prerender: {
    // Required - The path to the webpack-outputted app to prerender.
    staticDir: distDir,
    // Required - Routes to render.
    routes: [
      '/404.html',
      '/',
      '/about',
      '/repos',
    ],
    postProcess(context) {
      html(context)
      ignoreRedirect(context)

      return context
    },
    minify: {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      decodeEntities: true,
      keepClosingSlash: true,
      sortAttributes: true,
    },
  },
}

let webpackPlugins = [
  new DefinePlugin(pluginOptions.define),
]
if (process.env.NODE_ENV === 'production') {
  webpackPlugins = [
    ...webpackPlugins,
    new CompressionPlugin(pluginOptions.compression),
    new PrerenderSPAPlugin(pluginOptions.prerender),
  ]
}

module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    plugins: webpackPlugins,
  },
  chainWebpack(config) {
    config
      .plugin('fork-ts-checker')
      .tap(args => {
        Object.assign(args[0], {
          workers: 2,
          memoryLimit: 1024,
        })
        return args
      })
  },
  css: {
    loaderOptions: {
      postcss: {
        // options here will be passed to postcss-loader
        plugins: [
          PostCSSNested(),
        ],
      },
    },
  },
}

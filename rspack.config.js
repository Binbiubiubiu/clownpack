const replaceEnvs = {};
const CleanCSSPlugin = require("less-plugin-clean-css");
const postcssImport = require("postcss-import");
const postcssUrl = require("postcss-url");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const NpmImport = require("less-plugin-npm-import");
const minifyPlugin = require("@rspack/plugin-minify");

function resolveLoader(loader) {
  let resolvedLoader;
  try {
    resolvedLoader = require.resolve(loader);
  } catch (error) {
    resolvedLoader = loader;
  }
  return resolvedLoader;
}

function createCSSRule(test, loader, options = {}) {
  function createRule({ forceCssModule = false, ...rest } = {}) {
    const loaders = [];

    const postcssLoader = {
      loader: "postcss-loader",
      options: {
        sourceMap: options.sourceMap ?? false,
        postcssOptions: {
          plugins: [
            "postcss-import",
            "postcss-url",
            "autoprefixer",
            [
              "cssnano",
              {
                preset: [
                  "default",
                  {
                    mergeLonghand: false,
                    cssDeclarationSorter: false,
                  },
                ],
              },
            ],
          ],
        },
      },
    };
    loaders.push(postcssLoader);

    if (loader) {
      loaders.push({
        loader,
        options,
      });
    }

    return {
      ...rest,
      use: loaders,
      type: forceCssModule ? "css/module" : "css",
    };
  }

  return {
    test,
    oneOf: [
      createRule({
        resourceQuery: /module/,
        forceCssModule: true,
      }),
      createRule({
        resourceQuery: /\?vue/,
      }),
      createRule({
        test: /\.module\.\w+$/,
        forceCssModule: true,
      }),
      createRule(),
    ],
  };
}

function createJsxRule(isTs) {
  let test = /\.jsx$/;
  let presets = ["@vue/babel-preset-app"];
  if (isTs) {
    test = /\.tsx$/;
    presets.push("@babel/preset-typescript");
  }
  return {
    test,
    use: [
      {
        loader: "babel-loader",
        options: {
          presets,
        },
      },
    ],
  };
}

/** @type {import('@rspack/cli').Configuration} */
const config = {
  context: __dirname,
  entry: {
    main: "./src/main.ts",
  },
  output: {
    library: {
      name: "MyLibrary",
      type: "umd",
      export: "default",
      umdNamedDefine: true,
      // extend?
      // inlineDynamicImports: true,
    },
  },
  resolve: {
    browserField: true,
    extensions: [".ts", ".tsx", ".js", ".jsx", ".vue", ".css", ".less"],
    // ...nodeResolveOpts,
  },
  module: {
    rules: [
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ["@svgr/webpack"],
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        type: "asset",
      },
      createJsxRule(),
      createJsxRule(true),
      createCSSRule(/\.css$/),
      // createCSSRule(/\.p(ost)?css$/),
      createCSSRule(
        /\.scss$/,
        "sass-loader",
        Object.assign(
          {},
          {}, //loaderOptions.scss || loaderOptions.sass
        ),
      ),
      createCSSRule(/\.sass$/, "sass-loader", {
        sassOptions: Object.assign(
          {},
          // loaderOptions.sass && loaderOptions.sass.sassOptions,
          {
            indentedSyntax: true,
          },
        ),
      }),
      createCSSRule(
        /\.less$/,
        "less-loader",
        {}, //loaderOptions.less
      ),
      createCSSRule(
        /\.styl(us)?$/,
        "stylus-loader",
        {},
        //  loaderOptions.stylus
      ),
    ],
  },
  devtool: "source-map", // "source-map", //umd?.sourcemap,
  // externals: {
  //   vue: "Vue",
  //   "vue-property-decorator": "vuePropertyDecorator",
  //   // ...(umd?.globals)
  // },
  optimization: {
    minimize: true,
    minimizer: [
      new minifyPlugin({
        minifier: "terser",
      }),
    ],
  },
  target: ["web", "browserslist"],
  builtins: {
    define: {
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      ...replaceEnvs,
    },
    html: [{ template: "./public/index.html" }],
    // decorator: true,
    css: {
      modules: {
        localIdentName: "[name]_[local]_[hash:5]",
      },
    },
    progress: true,
  },
};
module.exports = config;

import Config from "webpack-5-chain";
import type { IBuildOptions } from "../types";
// import { getPostcssBrowsers } from "../utils";

export { useCss };

function useCss(config: Config, opts: IBuildOptions) {
  const rulesConfig = [
    { name: "css", test: /\.css(\?.*)?$/ },
    {
      name: "less",
      test: /\.less(\?.*)?$/,
      loader: require.resolve("less-loader"),
      loaderOptions: {
        implementation: require("less"),
        lessOptions: {
          javascriptEnabled: true,
        },
        ...opts.lessLoader,
      },
    },
    {
      name: "sass",
      test: /\.(sass|scss)(\?.*)?$/,
      loader: require.resolve("sass-loader"),
      loaderOptions: opts.sassLoader || {},
    },
    {
      name: "stylus",
      test: /\.styl(us)?(\?.*)?$/,
      loader: require.resolve("stylus-loader"),
      loaderOptions: {
        implementation: require("stylus"),
        ...opts.stylusLoader,
      },
    },
  ];

  for (const { name, test, loader, loaderOptions } of rulesConfig) {
    const rule = config.module.rule(name).test(test);
    const nestRulesConfig = [
      {
        rule: rule.oneOf("force-css-modules").resourceQuery(/modules/),
        forceCssModule: true,
      },
      {
        rule: rule.oneOf("normal-modules").test(/\.module\.\w+$/),
      },
      {
        rule: rule.oneOf("normal").sideEffects(true),
      },
    ].filter(Boolean);

    for (const { rule, forceCssModule } of nestRulesConfig) {
      if (opts.styleLoader) {
        rule
          .use("style-loader")
          .loader(require.resolve("style-loader"))
          .options({ base: 0, esModule: true, ...opts.styleLoader });
      } else {
        rule
          .use("mini-css-extract-plugin")
          .loader(require("mini-css-extract-plugin").loader)
          .options({
            publicPath: "./",
            emit: true,
            esModule: true,
          });
      }

      rule
        .use("css-loader")
        .loader(require.resolve("css-loader"))
        .options({
          importLoaders: 1,
          esModule: true,
          url: {
            filter: (url: string) => {
              // Don't parse absolute URLs
              // ref: https://github.com/webpack-contrib/css-loader#url
              if (url.startsWith("/")) return false;
              return true;
            },
          },
          import: true,
          modules: {
            localIdentName: "[name]_[local]_[hash:base64:5]",
            auto: forceCssModule ? undefined : true,
            ...opts.cssLoaderModules,
          },
          ...opts.cssLoader,
        });

      const extraPostcssEnvOptions: any = {};
      if (opts.browerslist) {
        extraPostcssEnvOptions.browsers = opts.browerslist; // getPostcssBrowsers(opts),
      }
      rule
        .use("postcss-loader")
        .loader(require.resolve("postcss-loader"))
        .options({
          postcssOptions: {
            ident: "postcss",
            plugins: [
              require("postcss-flexbugs-fixes"),
              require("postcss-preset-env")({
                autoprefixer: {
                  flexbox: "no-2009",
                  ...opts.autoprefixer,
                },
                stage: 3,
                ...extraPostcssEnvOptions,
              }),
              ...(opts.extraPostCSSPlugins || []),
            ],
            ...opts.postcssLoader,
          },
        });

      if (loader) {
        let resolvedLoader;
        try {
          resolvedLoader = require.resolve(loader);
        } catch (error) {
          resolvedLoader = loader;
        }
        rule
          .use(loader)
          .loader(resolvedLoader)
          .options(loaderOptions || {});
      }
    }
  }
}

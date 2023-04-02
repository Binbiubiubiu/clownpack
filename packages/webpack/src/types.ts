import type { PluginItem } from "@clownpack/core";
import type { Pattern } from "copy-webpack-plugin";
import type webpack from "webpack";
import type Config from "webpack-5-chain";

export { JSMinifier, CSSMinifier, Env };
export type { IBuildOptions, IAnyObject, IPluginAPIWithWebpack };

enum Env {
  development = "development",
  production = "production",
}

enum JSMinifier {
  terser = "terser",
  swc = "swc",
  esbuild = "esbuild",
  uglifyJs = "uglifyJs",
  none = "none",
}

enum CSSMinifier {
  esbuild = "esbuild",
  cssnano = "cssnano",
  parcelCSS = "parcelCSS",
  none = "none",
}

type IAnyObject<Value = any> = Record<string, Value>;

interface IBuildOptions {
  devtool?: Config.DevTool;
  /**
   * 当前运行目录
   */
  cwd: string;
  /**
   * 运行环境
   */
  env: `${Env}`;
  /**
   * 入口
   */
  entry: Record<string, string>;
  /**
   * 支持平台
   */
  browerslist?: string | string[];
  /**
   * 路径别名
   */
  alias?: Record<string, string>;
  /**
   * 额外依赖
   */
  externals?: string[];
  /**
   * webpack缓存配置
   */
  cache?: webpack.Configuration["cache"];
  /**
   * copy插件配置
   */
  copy?: Pattern[];
  /**
   * 全局变量定义
   */
  define?: IAnyObject;
  /**
   * 监听模式配置
   */
  watch?: boolean | webpack.Configuration["watch"] | webpack.Configuration["watchOptions"];
  /**
   * 依赖分析
   */
  analyze?: boolean | IAnyObject;
  /**
   * css代码压缩工具
   */
  cssMinifier?: `${CSSMinifier}`;
  /**
   * css代码压缩配置
   */
  cssMinifierOptions?: IAnyObject;
  /**
   * js代码压缩工具
   */
  jsMinifier?: `${JSMinifier}`;
  /**
   * js代码压缩配置
   */
  jsMinifierOptions?: IAnyObject;
  /**
   * 清空输出目录
   */
  clean?: boolean | webpack.CleanPlugin["options"];

  /**
   * svgo 配置
   */
  svgoLoader?: IAnyObject;
  /**
   * 静态资源行内处理限制大小
   */
  inlineLimit?: number;
  /**
   * less 配置
   */
  lessLoader?: IAnyObject;
  /**
   * sass 配置
   */
  sassLoader?: IAnyObject;
  /**
   * stylus 配置
   */
  stylusLoader?: IAnyObject;
  /**
   * styleloader 配置
   */
  styleLoader?: IAnyObject;
  /**
   * css 配置
   */
  cssLoader?: IAnyObject;
  /**
   * css 模块化配置
   */
  cssLoaderModules?: IAnyObject;
  /**
   * postcss 配置
   */
  postcssLoader?: IAnyObject;
  /**
   * autoprefixer 配置
   */
  // @ts-ignore
  autoprefixer?: import("autoprefixer").Options;
  /**
   * 额外postcss插件
   */
  extraPostCSSPlugins?: PluginItem;
  /**
   * 名称
   */
  name?: string;
  /**
   * 输出文件夹
   */
  outDir?: string;
  /**
   * 输出资源前缀
   */
  publicPath?: string;
  /**
   * 资源是否hash
   */
  hash?: boolean;

  /**
   * 额外babel预设
   */
  extraBabelPresets?: any[];
  /**
   * 额外babel插件
   */
  extraBabelPlugins?: any[];
  /**
   * webpack-chain 配置
   */
  chainWebpack?(
    config: Config,
    opts: { env: `${Env}`; webpack: typeof webpack },
  ): void | Promise<void>;
  /**
   * 修改webpack配置
   */
  modifyWebpackConfig?(
    config: webpack.Configuration,
    opts: { env: `${Env}`; webpack: typeof webpack },
  ): webpack.Configuration | Promise<webpack.Configuration>;
  /**
   * 构建是否完成
   */
  onBuildComplete?(opts: {
    err?: Error | null;
    stats?: webpack.Stats;
    isFirstCompile: boolean;
    close?: webpack.Watching["close"];
  }): void | Promise<void>;
}

interface IPluginAPIWithWebpack {
  chainWebpack(fn: IBuildOptions["chainWebpack"]): void;
  modifyWebpackConfig(fn: IBuildOptions["modifyWebpackConfig"]): void;
}

import type { PluginItem } from "@clownpack/core";
import type { IAnyObject } from "@clownpack/helper";
import type webpack from "webpack";
import type Config from "webpack-5-chain";

/**
 * 打包环境变量
 * @public
 */
export enum Env {
  development = "development",
  production = "production",
}

/**
 * 打包转换器
 * @public
 */
export enum Transpiler {
  babel = "babel",
  swc = "swc",
  esbuild = "esbuild",
}

/**
 * js压缩器
 * @public
 */
export enum JSMinifier {
  terser = "terser",
  swc = "swc",
  esbuild = "esbuild",
  uglifyJs = "uglifyJs",
}

/**
 * css压缩器
 * @public
 */
export enum CSSMinifier {
  esbuild = "esbuild",
  cssnano = "cssnano",
  parcelCSS = "parcelCSS",
}

/**
 * @public
 */
export interface IBuildOptions {
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
  browserslist?: string | string[];
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
  copy?: import("copy-webpack-plugin").Pattern[];
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
   * js编译工具
   */
  transpiler?: `${Transpiler}`;
  /**
   * js编译工具配置
   */
  transpilerOptions?: IAnyObject;
  /**
   * css代码压缩工具
   */
  cssMinifier?: boolean | `${CSSMinifier}`;
  /**
   * css代码压缩配置
   */
  cssMinifierOptions?: IAnyObject;
  /**
   * js代码压缩工具
   */
  jsMinifier?: boolean | `${JSMinifier}`;
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
   * 是否esModule
   */
  esModule?: boolean;
  /**
   * styleloader 配置
   */
  styleLoader?: IAnyObject;
  /**
   * css是否单独抽离独立文件
   */
  cssExtract?:
    | boolean
    | (import("mini-css-extract-plugin").PluginOptions &
        import("mini-css-extract-plugin").LoaderOptions);
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
  extraPostCSSPlugins?: PluginItem[];
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
  extraBabelPresets?: PluginItem[];
  /**
   * 额外babel插件
   */
  extraBabelPlugins?: PluginItem[];
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

/**
 * 配合webpack插件的插件方法
 * @public
 */
// rome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface IPluginAPI extends Pick<IBuildOptions, "chainWebpack" | "modifyWebpackConfig"> {}
/**
 * 配合webpack插件的项目配置
 * @public
 */
// rome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface IConfiguration
  extends Pick<IBuildOptions, "chainWebpack" | "modifyWebpackConfig"> {}

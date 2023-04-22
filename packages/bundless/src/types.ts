import type { IAnyObject, IPkg } from '@clownpack/helper';

/**
 * 打包环境变量
 * @public
 */
export enum Env {
  development = 'development',
  production = 'production',
}

/**
 * @public
 */
export enum Format {
  cjs = 'cjs',
  esm = 'esm',
}

/**
 * 打包转换器
 * @public
 */
export enum Transpiler {
  babel = 'babel',
  swc = 'swc',
  esbuild = 'esbuild',
}

/**
 * @public
 */
export type PluginItem = string | [string, IAnyObject];

/**
 * @public
 */
export interface IBuildOptions {
  /**
   * 名称
   */
  name?: string;
  /**
   * 当前运行目录
   */
  cwd: string;
  /**
   * 运行环境
   */
  env: `${Env}`;
  /**
   * package.json
   */
  pkg: IPkg;
  /**
   * 入口
   */
  input: string;
  /**
   * 路径别名
   */
  alias?: Record<string, string | string[] | false>;
  /**
   * 全局变量定义
   */
  define?: IAnyObject;
  /**
   *  target
   */
  targets: string | Array<string> | { [key: string]: string };
  /**
   * 额外babel预设
   */
  extraBabelPresets?: PluginItem[];
  /**
   * 额外babel插件
   */
  extraBabelPlugins?: PluginItem[];
  /**
   * js编译工具
   */
  transpiler?: `${Transpiler}`;
  /**
   * js编译工具配置
   */
  transpilerOptions?: IAnyObject;

  /**
   * 输出文件夹
   */
  outDir?: string;
  /**
   * sourcemap
   */
  sourcemap?: boolean;

  /**
   * 模块
   */
  format: `${Format}`;
}

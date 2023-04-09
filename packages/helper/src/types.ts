/**
 * @public
 */
export type IAnyObject = Record<string, any>;

/**
 * @public
 */
export interface IPkg {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

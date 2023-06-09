export const DEFAULT_FRAMEWORK_NAME = 'bundle';
export const DEFAULT_CONFIG_EXTENSIONS = ['.js', '.ts', '.mjs', '.mts', '.cts'];

export const DEFAULT_NODE_ENV = process.env.NODE_ENV || 'production';

export const SHORT_ENV: Record<string, string> = {
  development: 'dev',
  production: 'prod',
  test: 'test',
};

export const OUTPUT_DIR = 'dist';
export const SOURCE_DIR = 'src';

export const LOCAL_EXT = '.local';

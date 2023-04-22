import { transform } from '@swc/core';
import type { IBuildOptions } from '../types';

const isTs = (p: string) => p.endsWith('.ts') || p.endsWith('.tsx');

export default function swcTransformer(this: IBuildOptions, content: string) {}

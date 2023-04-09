import deepmerge from "@fastify/deepmerge";

/**
 * @public
 */
export const merge: ReturnType<typeof deepmerge> = deepmerge();

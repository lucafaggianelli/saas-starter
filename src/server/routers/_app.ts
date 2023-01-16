/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from '../trpc';
import { projectRouter } from './project';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),

  project: projectRouter,
});

export type AppRouter = typeof appRouter;

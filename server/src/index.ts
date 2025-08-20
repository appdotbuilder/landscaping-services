import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  serviceTypeSchema,
  createServiceInputSchema,
  updateServiceInputSchema,
  createPhotoInputSchema,
  updatePhotoInputSchema,
  updateCompanyContactInputSchema
} from './schema';

// Import handlers
import { getServices } from './handlers/get_services';
import { getServiceByType } from './handlers/get_service_by_type';
import { createService } from './handlers/create_service';
import { updateService } from './handlers/update_service';
import { deleteService } from './handlers/delete_service';
import { createPhoto } from './handlers/create_photo';
import { updatePhoto } from './handlers/update_photo';
import { deletePhoto } from './handlers/delete_photo';
import { getCompanyContact } from './handlers/get_company_contact';
import { updateCompanyContact } from './handlers/update_company_contact';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Service endpoints
  getServices: publicProcedure
    .query(() => getServices()),

  getServiceByType: publicProcedure
    .input(z.object({ type: serviceTypeSchema }))
    .query(({ input }) => getServiceByType(input.type)),

  createService: publicProcedure
    .input(createServiceInputSchema)
    .mutation(({ input }) => createService(input)),

  updateService: publicProcedure
    .input(updateServiceInputSchema)
    .mutation(({ input }) => updateService(input)),

  deleteService: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteService(input.id)),

  // Photo endpoints
  createPhoto: publicProcedure
    .input(createPhotoInputSchema)
    .mutation(({ input }) => createPhoto(input)),

  updatePhoto: publicProcedure
    .input(updatePhotoInputSchema)
    .mutation(({ input }) => updatePhoto(input)),

  deletePhoto: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deletePhoto(input.id)),

  // Company contact endpoints
  getCompanyContact: publicProcedure
    .query(() => getCompanyContact()),

  updateCompanyContact: publicProcedure
    .input(updateCompanyContactInputSchema)
    .mutation(({ input }) => updateCompanyContact(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
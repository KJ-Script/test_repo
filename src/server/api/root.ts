import { createTRPCRouter } from "../trpc";
import { analyticsRouter } from "./routers/analytics";
import { mobileRouter } from "./routers/app";
import { contactRouter } from "./routers/contact";
import { priceRouter } from "./routers/price";
import { providerRouter } from "./routers/providers";
import { queueRouter } from "./routers/queue";
import { roleRouter } from "./routers/role";
import { routeRouter } from "./routers/routes";
import { scheduleRouter } from "./routers/schedule";
import { stationRouter } from "./routers/stations";
import { transactionRouter } from "./routers/transaction";
import { userRouter } from "./routers/users";
import { vehicleLevelRouter } from "./routers/vehicle_levels";
import { vehicleRouter } from "./routers/vehicles";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  station: stationRouter,
  vehicleLevel: vehicleLevelRouter,
  provider: providerRouter,
  vehicle: vehicleRouter,
  route: routeRouter,
  price: priceRouter,
  schedule: scheduleRouter,
  queue: queueRouter,
  transaction: transactionRouter,
  role: roleRouter,
  analytics: analyticsRouter,
  mobile: mobileRouter,
  contact: contactRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

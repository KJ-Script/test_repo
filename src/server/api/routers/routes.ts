import { db } from "@/lib/db";
import {
  createTRPCRouter,
  protectedProcedure,
  routeCreateProcedure,
  routeDeleteProcedure,
  routeUpdateProcedure,
  routeViewProcedure,
} from "@/server/trpc";
import { z } from "zod";

export const routeRouter = createTRPCRouter({
  getRouteForStation: routeViewProcedure
    .input(
      z.object({
        station_id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const routes = await db.route.findMany({
        where: {
          station_id: input.station_id,
        },
        select: {
          id: true,
          creator: true,
          destination_name: true,
          destination_region: true,
          destination_latitude: true,
          destination_longitude: true,
          station: true,
          distance: true,
        },
      });
      return routes;
    }),
  getAll: routeViewProcedure.query(async ({ ctx }) => {
    const routes = await db.route.findMany({
      select: {
        id: true,
        creator: true,
        destination_name: true,
        destination_region: true,
        destination_latitude: true,
        destination_longitude: true,
        station: true,
        distance: true,
      },
      where: {
        is_deleted: false,
        ...(!(
          ctx.session.user.role.privileges.includes("StationCreate") ||
          ctx.session.user.role.privileges.includes("ViewRegionalAnalytics")
        ) && {
          station_id: ctx.session.user.station_id,
        }),
        ...(ctx.session.user.role.privileges.includes(
          "ViewRegionalAnalytics"
        ) && {
          station: {
            region: ctx.session.user.station.region,
          },
        }),
      },
    });
    return routes;
  }),
  create: routeCreateProcedure
    .input(
      z.object({
        destination_name: z.string().min(2, {
          message: "Destination name is required.",
        }),
        destination_region: z.string(),
        destination_latitude: z.string(),
        destination_longitude: z.string(),
        distance: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createRoute = await db.route.create({
        // @ts-ignore
        data: {
          destination_name: input.destination_name,
          destination_region: input.destination_region,
          distance: input.distance,
          ...(input.destination_latitude && {
            destination_latitude: input.destination_latitude,
          }),
          ...(input.destination_longitude && {
            destination_longitude: input.destination_longitude,
          }),
          station_id: ctx.session.user?.station_id,
          creator_id: ctx.session.user?.id,
        },
      });

      return {
        message: "New route created",
        station: createRoute.id,
      };
    }),
  update: routeUpdateProcedure
    .input(
      z.object({
        destination_name: z.string(),
        destination_region: z.string(),
        destination_latitude: z.string(),
        destination_longitude: z.string(),
        distance: z.number(),
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.route.update({
        data: {
          ...(input.destination_name && {
            destination_name: input.destination_name,
          }),
          ...(input.destination_region && {
            destination_region: input.destination_region,
          }),
          ...(input.destination_latitude && {
            destination_latitude: input.destination_latitude,
          }),
          ...(input.destination_longitude && {
            destination_longitude: input.destination_longitude,
          }),
          ...(input.distance && {
            distance: input.distance,
          }),
        },
        where: {
          id: input.id,
        },
      });
      return { message: "Route updated" };
    }),

  delete: routeDeleteProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.route.update({
        where: {
          id: input.id,
        },
        data: {
          is_deleted: true,
        },
      });
      return { message: "Route deleted." };
    }),
});

import { db } from "@/lib/db";
import {
  createTRPCRouter,
  publicProcedure,
  stationCreateProcedure,
  stationDeleteProcedure,
  stationUpdateProcedure,
  stationViewProcedure,
} from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const stationRouter = createTRPCRouter({
  getAll: stationViewProcedure.query(async ({ ctx }) => {
    const stations = await db.station.findMany({
      select: {
        id: true,
        creator: true,
        name: true,
        region: true,
        lat: true,
        long: true,
      },
      where: {
        is_deleted: false,
        ...(ctx.session.user.role.privileges.includes(
          "ViewRegionalAnalytics"
        ) && {
          region: ctx.session.user.station.region,
        }),
      },
    });
    return stations;
  }),
  create: stationCreateProcedure
    .input(
      z.object({
        region: z.string().min(2, {
          message: "Region is required.",
        }),
        name: z.string().min(2, {
          message: "Station name is required.",
        }),
        lat: z.string(),
        long: z.string(),
        // creator_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createStation = await db.station.create({
        data: {
          name: input.name,
          region: input.region,
          ...(input.lat && { lat: input.lat }),
          ...(input.long && { long: input.long }),
          creator_id: ctx.session.user.id,
        },
      });

      return {
        message: "New station created",
        station: createStation.id,
      };
    }),
  update: stationUpdateProcedure
    .input(
      z.object({
        id: z.number(),
        region: z.string().min(2, {
          message: "Region is required.",
        }),
        name: z.string().min(2, {
          message: "Station name is required.",
        }),
        lat: z.string(),
        long: z.string(),
        // creator_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.station.update({
        data: {
          ...(input.region && { region: input.region }),
          ...(input.name && { name: input.name }),
          ...(input.lat && { lat: input.lat }),
          ...(input.long && { long: input.long }),
          // ...(input.creator_id && { creator_id: input.creator_id }),
        },
        where: {
          id: input.id,
        },
      });
    }),
  delete: stationDeleteProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.station.update({
        where: {
          id: input.id,
        },
        data: {
          is_deleted: true,
        },
      });
      return { message: "Station deleted" };
    }),
});

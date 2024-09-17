import { db } from "@/lib/db";
import {
  createTRPCRouter,
  priceCreateProcedure,
  priceDeleteProcedure,
  priceUpdateProcedure,
  priceViewProcedure,
  protectedProcedure,
} from "@/server/trpc";
import { z } from "zod";

export const priceRouter = createTRPCRouter({
  getAll: priceViewProcedure.query(async ({ ctx }) => {
    const prices = await db.price.findMany({
      select: {
        id: true,
        creator: true,
        price: true,
        route: true,
        service_charge: true,
        vehicle_level: true,
        total_price: true,
        station: true,
        vat: true,
      },
      where: {
        is_deleted: false,
        ...(!(
          ctx.session.user.role.privileges.includes("StationCreate") ||
          ctx.session.user.role.privileges.includes("ViewRegionalAnalytics")
        ) && {
          station_id: ctx.session.user.station_id,
        }),
      },
    });
    return prices;
  }),
  create: priceCreateProcedure
    .input(
      z.object({
        price: z.number(),
        service_charge: z.number(),
        vat: z.number(),
        vehicle_level_id: z.number(),
        route_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createPrice = await db.price.create({
        data: {
          price: input.price,
          service_charge: input.service_charge,
          total_price: input.price + input.service_charge + input.vat,
          route_id: input.route_id,
          vehicle_level_id: input.vehicle_level_id,
          station_id: ctx.session.user!.station_id,
          creator_id: ctx.session.user!.id,
        },
      });

      return {
        message: "New price created",
        station: createPrice.id,
      };
    }),
  update: priceUpdateProcedure
    .input(
      z.object({
        price: z.number(),
        service_charge: z.number(),
        vehicle_level_id: z.number(),
        route_id: z.number(),
        id: z.number(),
        vat: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.price.update({
        data: {
          ...(input.price && { price: input.price }),
          ...(input.service_charge && { service_charge: input.service_charge }),
          ...(input.vat && { vat: input.vat }),
          ...(input.vehicle_level_id && {
            vehicle_level_id: input.vehicle_level_id,
          }),
          total_price: input.price + input.service_charge + input.vat,
          ...(input.route_id && { route_id: input.route_id }),
        },
        where: {
          id: input.id,
        },
      });
      return { message: "Price updated" };
    }),

  delete: priceDeleteProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.price.update({
        where: {
          id: input.id,
        },
        data: {
          is_deleted: true,
        },
      });
      return { message: "Price deleted" };
    }),
});

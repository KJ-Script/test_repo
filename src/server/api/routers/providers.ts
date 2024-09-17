import { db } from "@/lib/db";
import { filterDateValues } from "@/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  providerCreateProcedure,
  providerDeleteProcedure,
  providerUpdateProcedure,
  providerViewProcedure,
  viewAnalyticsProcedure,
} from "@/server/trpc";
import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod";

export const providerRouter = createTRPCRouter({
  getAll: providerViewProcedure.query(async ({ ctx }) => {
    const providers = await db.provider.findMany({
      select: {
        id: true,
        name: true,
        region: true,
        phone_number: true,
        creator: true,
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
    return providers;
  }),
  create: providerCreateProcedure
    .input(
      z.object({
        name: z.string().min(2, {
          message: "Name is required.",
        }),
        region: z.string(),
        phone_number: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createProvider = await db.provider.create({
        //@ts-ignore
        data: {
          name: input.name,
          region: input.region,
          ...(input.phone_number && { phone_number: input.phone_number }),
          station_id: ctx.session.user?.station_id,
          creator_id: ctx.session.user?.id,
        },
      });

      return {
        message: "New provider created",
        station: createProvider.id,
      };
    }),
  performancePerAssociation: viewAnalyticsProcedure
    .input(
      z.object({
        filter_type: z.string(),
        from: z.date().optional(),
        to: z.date().optional(),
        associationId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const vehicleHistory = await db.queue.findMany({
        where: {
          is_deleted: false,
          ...{
            station: {
              region: ctx.session.user.station.region,
            },
          },
          ...(input.filter_type == "interval" && {
            created_at: {
              gte:
                //@ts-ignore
                addDays(startOfDay(input.from), 1),
              lte:
                //@ts-ignore
                addDays(endOfDay(input.to), 1),
            },
          }),
          ...(input.filter_type !== "interval" && {
            created_at: {
              //@ts-ignore
              gte:
                //@ts-ignore
                filterDateValues[input.filter_type],
            },
            paid: true,
          }),
          booked_seat_count: {
            not: 0,
          },
          ...(input.associationId! > 0 && {
            vehicle: {
              provider_id: input.associationId,
            },
          }),
        },
        select: {
          price: {
            select: {
              route: true,
            },
          },
          booked_seat_count: true,
          created_at: true,
          id: true,
        },
      });
      const distanceCovered = vehicleHistory.reduce(
        (acc, p) => acc + p.price.route.distance,
        0
      );

      const passengers = vehicleHistory.reduce(
        (acc, p) => acc + p.booked_seat_count,
        0
      );

      const checkoutCount = vehicleHistory.length;

      const groupedData = new Map();
      vehicleHistory.forEach((entry) => {
        const date = new Date(entry.created_at).toISOString().split("T")[0]; // Extract yyyy-mm-dd
        if (groupedData.has(date)) {
          groupedData.get(date).passengers += entry.booked_seat_count;
          groupedData.get(date).checkoutCount += 1;
        } else {
          groupedData.set(date, {
            date,
            passengers: entry.booked_seat_count,
            checkoutCount: 1,
          });
        }
      });
      let routes: any = {};
      vehicleHistory.forEach((v) => {
        if (routes[v.price.route.destination_name]) {
          routes[v.price.route.destination_name].count += 1;
        } else {
          routes[v.price.route.destination_name] = {
            route: v.price.route.destination_name,
            count: 1,
          };
        }
      });

      const routeDistribution = Object.values(routes);
      const chartData = Array.from(groupedData.values());

      return {
        distanceCovered,
        passengers,
        checkoutCount,
        chartData,
        routeDistribution,
      };
    }),
  update: providerUpdateProcedure
    .input(
      z.object({
        name: z.string().min(2, {
          message: "Name is required.",
        }),
        region: z.string(),
        phone_number: z.string(),
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.provider.update({
        data: {
          ...(input.name && { name: input.name }),
          ...(input.region && { region: input.region }),
          ...(input.phone_number && { phone_number: input.phone_number }),
        },
        where: {
          id: input.id,
        },
      });
    }),

  delete: providerDeleteProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.provider.update({
        where: {
          id: input.id,
        },
        data: {
          is_deleted: true,
        },
      });
      return { message: "Provider deleted" };
    }),
});

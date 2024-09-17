import { db } from "@/lib/db";
import { filterDateValues } from "@/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  vehicleCreateProcedure,
  vehicleDeleteProcedure,
  vehicleUpdateProcedure,
  vehicleViewProcedure,
  viewAnalyticsProcedure,
} from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { startOfDay, endOfDay, addDays, subDays } from "date-fns";

export const vehicleRouter = createTRPCRouter({
  getAll: vehicleViewProcedure.query(async ({ ctx }) => {
    const vehicles = await db.vehicle.findMany({
      select: {
        id: true,
        creator: true,
        region: true,
        level: true,
        provider: true,
        plate_number: true,
        side_number: true,
        seat_capacity: true,
        provider_id: true,
        level_id: true,
        is_deleted: false,
      },
    });
    return vehicles;
  }),
  create: vehicleCreateProcedure
    .input(
      z.object({
        plate_number: z.string().min(2, {
          message: "Plate Number is required.",
        }),
        seat_capacity: z.number(),
        region: z.string().min(2, { message: "Region is required" }),
        side_number: z.string(),
        provider_id: z.number(),
        level_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createVehicle = await db.vehicle.create({
        //@ts-ignore
        data: {
          plate_number: input.plate_number,
          region: input.region,
          ...(input.seat_capacity && { seat_capacity: input.seat_capacity }),
          ...(input.side_number && { side_number: input.side_number }),
          level_id: input.level_id,
          provider_id: input.provider_id,
          station_id: ctx.session.user?.station_id,
          creator_id: ctx.session.user?.id,
        },
      });

      return {
        message: "New vehicle created",
        station: createVehicle.id,
      };
    }),
  update: vehicleUpdateProcedure
    .input(
      z.object({
        plate_number: z.string(),
        seat_capacity: z.number(),
        region: z.string(),
        side_number: z.string(),
        provider_id: z.number(),
        level_id: z.number(),
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.vehicle.update({
        data: {
          ...(input.plate_number && { plate_number: input.plate_number }),
          ...(input.seat_capacity && { seat_capacity: input.seat_capacity }),
          ...(input.region && { region: input.region }),
          ...(input.side_number && { side_number: input.side_number }),
          ...(input.provider_id && { provider_id: input.provider_id }),
          ...(input.level_id && { level_id: input.level_id }),
        },
        where: {
          id: input.id,
        },
      });
      return { message: "Vehicle updated" };
    }),

  delete: vehicleDeleteProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.vehicle.update({
        where: {
          id: input.id,
        },
        data: {
          is_deleted: true,
        },
      });
      return { message: "Vehicle deleted" };
    }),
  getPerformance: viewAnalyticsProcedure
    .input(
      z.object({
        plateNumber: z.string(),
        filter_type: z.string(),
        from: z.date().optional(),
        to: z.date().optional(),
        stationId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (input.stationId) {
        const vehicleHistory = await db.queue.findMany({
          where: {
            is_deleted: false,
            ...(input.stationId > 0
              ? { station_id: input.stationId }
              : {
                  station: {
                    region: ctx.session.user.station.region,
                  },
                }),
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
      }

      const vehicle = await db.vehicle.findUnique({
        where: {
          plate_number: input.plateNumber,
        },
      });

      if (!vehicle) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vehicle doesn't exist",
        });
      }

      const vehicleHistory = await db.queue.findMany({
        where: {
          vehicle_id: vehicle.id,
          is_deleted: false,
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

      const groupedData = new Map();

      vehicleHistory.forEach((entry) => {
        const date = new Date(entry.created_at).toISOString().split("T")[0]; // Extract yyyy-mm-dd
        console.log(date);

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

      const chartData = Array.from(groupedData.values());
      const routeDistribution = Object.values(routes);

      return {
        distanceCovered,
        passengers,
        checkoutCount,
        chartData,
        routeDistribution,
      };
    }),
});

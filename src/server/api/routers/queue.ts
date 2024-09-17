import { db } from "@/lib/db";
import { filterDateValues, getDate } from "@/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  queueCreateProcedure,
  queueUpdateProcedure,
  queueViewProcedure,
} from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { startOfDay, endOfDay, addDays, subDays } from "date-fns";
import { getCsrfToken } from "next-auth/react";

export const queueRouter = createTRPCRouter({
  getVehiclePerformance: queueViewProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      })
    )
    .query(async ({ input, ctx }) => {
      const queue = await db.queue.findMany({
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
          creator: true,
          station: {
            select: {
              name: true,
              region: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              plate_number: true,
              level: true,
              provider: true,
              region: true,
              seat_capacity: true,
              side_number: true,
            },
          },
          created_at: true,
          booked_seat_count: true,
          enabled: true,
          paid: true,
          checked_out: true,
          price: {
            include: {
              route: true,
            },
          },
          seat_full: true,
          order: true,
        },
        where: {
          created_at: {
            gte: input.from,
            lte: input.to,
          },
          ...(!(
            ctx.session.user.role.privileges.includes("StationCreate") ||
            ctx.session.user.role.privileges.includes("ViewRegionalAnalytics")
          ) && {
            station_id: ctx.session.user.station_id,
          }),
          ...((ctx.session.user.role.privileges.includes("StationCreate") ||
            ctx.session.user.role.privileges.includes(
              "ViewRegionalAnalytics"
            )) && {
            station: {
              region: ctx.session.user.station.region,
            },
          }),
          paid: true,
        },
      });

      let vehiclePerformance: any = {};
      for (let i = 0; i < queue.length; i++) {
        if (vehiclePerformance[queue[i].vehicle.id]) {
          vehiclePerformance[queue[i].vehicle.id].checkout_count =
            vehiclePerformance[queue[i].vehicle.id].checkout_count += 1;
          vehiclePerformance[queue[i].vehicle.id].distance_covered =
            vehiclePerformance[queue[i].vehicle.id].distance_covered +
            queue[i].price.route.distance;
        } else {
          vehiclePerformance[queue[i].vehicle.id] = {};
          vehiclePerformance[queue[i].vehicle.id].plate_number =
            queue[i].vehicle.plate_number;
          vehiclePerformance[queue[i].vehicle.id].checkout_count = 1;
          vehiclePerformance[queue[i].vehicle.id].distance_covered =
            queue[i].price.route.distance;
        }
      }
      interface VehiclePerformance {
        plate_number: string;
        checkout_count: number;
        distance_covered: number;
      }
      const vehiclePerformanceSummary: VehiclePerformance[] =
        Object.values(vehiclePerformance);

      return vehiclePerformanceSummary;
    }),
  getHistoryForVehicle: queueViewProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      })
    )
    .query(async ({ input, ctx }) => {}),
  getHistory: queueViewProcedure
    .input(
      z.object({
        filter_type: z.string(),
        from: z.date().optional(),
        to: z.date().optional(),
        stationId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const queue = await db.queue.findMany({
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
          creator: true,
          station: {
            select: {
              name: true,
              region: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              plate_number: true,
              level: true,
              provider: true,
              region: true,
              seat_capacity: true,
              side_number: true,
            },
          },
          created_at: true,
          created_at_app: true,
          booked_seat_count: true,
          enabled: true,
          paid: true,
          checked_out: true,
          price: {
            include: {
              route: true,
            },
          },
          seat_full: true,
          order: true,
        },
        where: {
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
              gte:
                //@ts-ignore
                filterDateValues[input.filter_type],
            },
          }),
          OR: [
            {
              ...(input.filter_type == "interval" && {
                created_at_app: {
                  gte:
                    //@ts-ignore
                    addDays(startOfDay(input.from), 1),
                  lte:
                    //@ts-ignore
                    addDays(endOfDay(input.to), 1),
                },
              }),
              ...(input.filter_type !== "interval" && {
                created_at_app: {
                  //@ts-ignore
                  gte:
                    //@ts-ignore
                    filterDateValues[input.filter_type],
                },
              }),
            },
            {
              created_at_app: null,
            },
          ],
          ...(!(
            ctx.session.user.role.privileges.includes("StationCreate") ||
            ctx.session.user.role.privileges.includes("ViewRegionalAnalytics")
          ) && {
            station_id: ctx.session.user.station_id,
          }),
          ...((ctx.session.user.role.privileges.includes("StationCreate") ||
            ctx.session.user.role.privileges.includes(
              "ViewRegionalAnalytics"
            )) &&
          input?.stationId > 0
            ? {
                station_id: input.stationId,
              }
            : {
                station: {
                  region: ctx.session.user.station.region,
                },
              }),
          paid: true,
        },
      });

      const queueIds = queue.map((q) => q.id);
      const payTransactions = await db.driverPaymentTransaction.findMany({
        where: {
          queue_id: {
            in: queueIds,
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
          }),
        },
        select: {
          queue_id: true,
          created_at: true,
          amount: true,
          queue: {
            select: {
              price: {
                select: {
                  price: true,
                },
              },
            },
          },
        },
      });

      const history = queue.map((queue) => {
        return {
          ...queue,
          booked_seat_count: Math.round(
            //@ts-ignore
            payTransactions.find((p) => p.queue_id == queue.id)?.amount /
              //@ts-ignore
              payTransactions.find((p) => p.queue_id == queue.id)?.queue.price
                .price
          ),
          paidTime: payTransactions.find((p) => p.queue_id == queue.id),
        };
      });

      return history;
    }),
  getToday: queueViewProcedure.query(async ({ ctx }) => {
    const { today, endOfDay, startOfDay } = getDate();

    const queue = await db.queue.findMany({
      select: {
        id: true,
        creator: true,
        station: {
          select: {
            name: true,
            region: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            plate_number: true,
            level: true,
            provider: true,
            region: true,
            seat_capacity: true,
            side_number: true,
          },
        },
        booked_seat_count: true,
        enabled: true,
        paid: true,
        checked_out: true,
        price: {
          include: {
            route: true,
          },
        },
        seat_full: true,
        order: true,
      },
      where: {
        is_deleted: false,
        created_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
        ...(!ctx.session.user.role.privileges.includes("StationCreate") && {
          station_id: ctx.session.user.station_id,
        }),
      },
    });
    return queue;
  }),
  add: queueCreateProcedure
    .input(
      z.object({
        vehicle_plate_number: z.string(),
        route_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vehicle = await db.vehicle.findFirst({
        where: {
          plate_number: input.vehicle_plate_number,
        },
      });

      if (!vehicle) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vehicle doesn't exist",
        });
      }

      if (!vehicle.seat_capacity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vehicle doesn't have seat capacity",
        });
      }

      const price = await db.price.findFirst({
        where: {
          vehicle_level_id: vehicle.level_id,
          route_id: input.route_id,
          is_deleted: false,
        },
      });

      if (!price) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Route doesn't exist",
        });
      }

      const { today, endOfDay, startOfDay } = getDate();
      const alreadyInQueue = await db.queue.findFirst({
        where: {
          vehicle_id: vehicle.id,
          paid: false,
          is_deleted: false,
          created_at: {
            gte: startOfDay,
            lt: endOfDay,
          },
          station_id: ctx.session.user.station_id,
        },
      });

      if (alreadyInQueue) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vehicle is already in queue.",
        });
      }

      const queueListForRoute = await db.queue.findMany({
        where: {
          price: {
            route_id: input.route_id,
          },
          checked_out: false,
          created_at: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      let vehicleOrder = queueListForRoute.length
        ? queueListForRoute.length + 1
        : 1;
      const vehicleInSchedule = await db.schedule.findFirst({
        where: {
          route_id: input.route_id,
          plate_number: vehicle.plate_number,
          expired: false,
        },
      });

      let inSchedule = vehicleInSchedule ? true : false;

      const addToQueue = await db.queue.create({
        data: {
          booked_seat_count: 0,
          checked_out: false,
          enabled: false,
          paid: false,
          seat_full: false,
          creator_id: 1,
          price_id: price!.id,
          station_id: ctx.session.user.station_id,
          vehicle_id: vehicle.id,
          order: vehicleOrder,
          seat_capacity: vehicle.seat_capacity,
        },
        select: {
          id: true,
          creator: true,
          station: {
            select: {
              name: true,
              region: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              plate_number: true,
              level: true,
              provider: true,
              region: true,
              seat_capacity: true,
              side_number: true,
            },
          },
          booked_seat_count: true,
          enabled: true,
          paid: true,
          checked_out: true,
          price: {
            include: {
              route: true,
            },
          },
          seat_full: true,
          order: true,
        },
      });

      return {
        message: "Vehicle added to queue",
        queue: addToQueue,
        inSchedule,
      };
    }),
  enable: queueUpdateProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const queueToToggle = await db.queue.findUnique({
        where: {
          id: input.id,
        },
      });
      await db.queue.update({
        data: {
          enabled: !queueToToggle?.enabled,
        },
        where: {
          id: input.id,
        },
      });
    }),
  checkout: queueUpdateProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const queueToToggle = await db.queue.findUnique({
        where: {
          id: input.id,
        },
      });
      await db.queue.update({
        data: {
          checked_out: !queueToToggle?.checked_out,
        },
        where: {
          id: input.id,
        },
      });
    }),
  // clear: publicProcedure.mutation(async ({ ctx, input }) => {
  //   await db.queue.deleteMany({
  //     where: {
  //       checked_out: false,
  //     },
  //   });
  //   return { message: "Queue cleared" };
  // }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.queue.update({
        data: {
          is_deleted: true,
          updating_id: ctx.session.user?.id,
        },
        where: {
          id: input.id,
        },
      });
      return { message: "Queue deleted" };
    }),
});

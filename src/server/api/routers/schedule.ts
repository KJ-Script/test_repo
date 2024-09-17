import { db } from "@/lib/db";
import { getYYYYMMDD } from "@/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  scheduleCreateProcedure,
  scheduleDeleteProcedure,
  scheduleViewProcedure,
  viewAnalyticsProcedure,
  viewRegionalAnalyticsProcedure,
} from "@/server/trpc";
import { Vehicle } from "@prisma/client";
import { z } from "zod";

export interface PlateCountItem {
  plate_number: string;
  count: number;
}

export const scheduleRouter = createTRPCRouter({
  getAll: scheduleViewProcedure.query(async ({ ctx }) => {
    const schedules = await db.schedule.findMany({
      select: {
        id: true,
        creator: true,
        created_at: true,
        expired: true,
        route: true,
        plate_number: true,
      },
      where: {
        is_deleted: false,
        expired: false,
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
    return schedules;
  }),
  getWarningPerRoute: viewAnalyticsProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        route_id: z.number(),
        station_id: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const schedule = await db.schedule.findMany({
        where: {
          station_id: input.station_id,
          route_id: input.route_id,
          expired: false,
          is_deleted: false,
        },
      });
      const vehiclesInSchedule = schedule.map((s) => s.plate_number);

      const vehiclesCovered = await db.queue.findMany({
        where: {
          is_deleted: false,
          vehicle: {
            plate_number: {
              in: vehiclesInSchedule,
            },
          },
          price: {
            route_id: input.route_id,
          },
          created_at: {
            gte: input.from,
            lte: input.to,
          },
        },
        select: {
          vehicle: true,
          created_at: true,
          price: {
            select: {
              route: true,
            },
          },
        },
      });

      const groupedByDate = vehiclesCovered.reduce(
        (result: any, currentItem) => {
          const dateKey = getYYYYMMDD(currentItem.created_at); // Extract date without time
          if (!result[dateKey]) {
            result[dateKey] = [];
          }
          result[dateKey].push(currentItem);
          return result;
        },
        {}
      );
      interface PlateCount {
        [plate_number: string]: number;
      }
      let vehiclesInWarning: PlateCount = {};

      console.log(groupedByDate);

      Object.entries(groupedByDate).forEach(([key, value]) => {
        //@ts-ignore
        const vehiclesCovering = value;

        for (let i = 0; i < vehiclesInSchedule.length; i++) {
          //@ts-ignore
          let currentCoveringV = vehiclesCovering.find(
            (v: any) => v.vehicle.plate_number == vehiclesInSchedule[i]
          );

          if (!currentCoveringV) {
            if (!vehiclesInWarning[vehiclesInSchedule[i]]) {
              vehiclesInWarning[vehiclesInSchedule[i]] = 1;
            } else vehiclesInWarning[vehiclesInSchedule[i]] += 1;
          }
        }
      });

      function convertToObjectArray(inputObj: PlateCount): PlateCountItem[] {
        return Object.entries(inputObj).map(([plate_number, count]) => ({
          plate_number,
          count,
        }));
      }

      const warning: PlateCountItem[] = convertToObjectArray(vehiclesInWarning);

      console.log(warning);

      return warning;
    }),
  getWarningForStation: viewRegionalAnalyticsProcedure
    .input(
      z.object({
        station_id: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const schedule = await db.schedule.findMany({
        where: {
          station_id: input.station_id,
          is_deleted: false,
        },
      });
      // const vehiclesInSchedule = schedule.map((s) => s.vehicle_id);
      // const vehiclesCovered = await db.queue.findMany({
      //   where: {
      //     vehicle_id: {
      //       in: vehiclesInSchedule,
      //     },
      //   },
      //   select: {
      //     vehicle: true,
      //     price: {
      //       select: {
      //         route: true,
      //       },
      //     },
      //   },
      // });
      // let vehiclesInWarning: Vehicle[] = [];
      // for (let i = 0; i < vehiclesInSchedule.length; i++) {
      //   const covered = vehiclesCovered.find(
      //     (v) => v.vehicle.id == vehiclesInSchedule[i]
      //   );
      //   //@ts-ignore
      //   vehiclesInSchedule.push(covered.vehicle);
      // }

      return [];
    }),
  create: scheduleCreateProcedure
    .input(
      z.array(
        z.object({
          vehicle_plate_number: z.string(),
          route_id: z.number(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      await db.schedule.updateMany({
        data: {
          expired: true,
        },
        where: {
          route_id: input[0].route_id,
        },
      });

      // for (let i = 0; i < input.length; i++) {
      //   const vehicle = await db.vehicle.findFirst({
      //     //@ts-ignore
      //     where: {
      //       station_id: ctx.session.user?.station_id,
      //       plate_number: input[i].vehicle_plate_number,
      //     },
      //   });
      //   if (vehicle) {
      //     data.push({
      //       route_id: input[i].route_id,
      //       vehicle_id: vehicle?.id,
      //     });
      //   }
      // }

      if (input.length) {
        const createSchedule = await db.schedule.createMany({
          //@ts-ignore
          data: input.map((data) => {
            return {
              plate_number: data.vehicle_plate_number,
              route_id: data.route_id,
              station_id: ctx.session.user?.station_id,
              creator_id: ctx.session.user?.id,
            };
          }),
        });
        return {
          message: "New Schedule created",
        };
      }
      return {
        message: "No schedule to create",
      };
    }),
  deleteAllForRoute: scheduleDeleteProcedure
    .input(
      z.object({
        route_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.schedule.updateMany({
        where: {
          route_id: input.route_id,
        },
        data: {
          is_deleted: true,
        },
      });
      return { message: "Schedule for route cleared." };
    }),
});

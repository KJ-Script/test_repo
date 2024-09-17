import { db } from "@/lib/db";
import { filterDateValues, getDate } from "@/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  viewAnalyticsProcedure,
  viewRegionalOrStationAnalyticsProcedure,
} from "@/server/trpc";
import { startOfDay, endOfDay, addDays, subDays } from "date-fns";
import { z } from "zod";

export const analyticsRouter = createTRPCRouter({
  getMonthlyStationsRanking: viewAnalyticsProcedure.query(async ({ ctx }) => {
    // get all the destinations
    const { today, endOfDay, startOfDay } = getDate();
    const todayQueues = await db.queue.findMany({
      where: {
        is_deleted: false,
        created_at: {
          //@ts-ignore
          gte: subDays(new Date(Date.now()), 30),
          lt: new Date(Date.now()),
        },
        paid: true,
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
      },
      select: {
        booked_seat_count: true,
        vehicle: {
          select: {
            plate_number: true,
          },
        },
        station: {
          select: {
            id: true,
            name: true,
          },
        },
        price: {
          select: {
            route: {
              select: {
                id: true,
                destination_name: true,
              },
            },
          },
        },
      },
    });

    const summaryArray: any = [];

    // I love adyam so so so much!!!

    // Create a summary object for each station
    todayQueues.forEach((item) => {
      const stationId = item.station.id;
      const stationName = item.station.name;
      const passengersCount = item.booked_seat_count;
      const routeId = item.price.route.id;

      const vehiclePlateNumber = item.vehicle.plate_number;

      // Check if a summary object already exists for the station
      const existingSummary = summaryArray.find(
        (summary: any) => summary.station_id === stationId
      );

      if (existingSummary) {
        existingSummary.passengers_count += passengersCount;
        if (!existingSummary.routes.includes(routeId)) {
          existingSummary.routes.push(routeId);
        }
        if (!existingSummary.vehicles.includes(vehiclePlateNumber)) {
          existingSummary.vehicles.push(vehiclePlateNumber);
        }
      } else {
        // Create a new summary object for the station
        const newSummary = {
          station_id: stationId,
          station_name: stationName,
          passengers_count: passengersCount,
          routes: [routeId],
          vehicles: [vehiclePlateNumber],
        };
        summaryArray.push(newSummary);
      }
    });
    //
    const all_stations = await db.station.findMany({
      select: {
        id: true,
        name: true,
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

    const station_counts = all_stations.map((station) => {
      const station_active = summaryArray.find(
        (s: any) => s.station_id == station.id
      );
      if (station_active) {
        return station_active;
      } else {
        return {
          station_id: station.id,
          station_name: station.name,
          passengers_count: 0,
          routes: [],
          vehicles: [],
        };
      }
    });
    station_counts.sort((a, b) => b.passengers_count - a.passengers_count);
    console.log(station_counts);
    return station_counts;
  }),
  getVehiclesServedRatio: viewAnalyticsProcedure.query(
    async ({ ctx, input }) => {
      const vehicles = await db.vehicle.count({ where: { is_deleted: false } });
      const queues = await db.queue.findMany({
        where: {
          is_deleted: false,
          created_at: {
            //@ts-ignore
            gte: subDays(new Date(Date.now()), 30),
            lte: new Date(Date.now()),
          },
        },
        distinct: "vehicle_id",
      });

      return [
        {
          name: "Serving",
          value: queues.length,
        },
        {
          name: "Not Serving",
          value: vehicles - queues.length,
        },
      ];
    }
  ),
  getRoutesForStation: viewRegionalOrStationAnalyticsProcedure
    .input(
      z.object({
        station_id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const routes = await db.route.findMany({
        where: {
          // station_id: input.station_id,
          ...(input.station_id && {
            station_id: input.station_id,
          }),
          ...((ctx.session.user.role.privileges.includes("StationCreate") ||
            (ctx.session.user.role.privileges.includes(
              "ViewRegionalAnalytics"
            ) &&
              !input.station_id)) && {
            station: {
              region: ctx.session.user.station.region,
            },
          }),
          is_deleted: false,
        },
        select: {
          destination_name: true,
          distance: true,
          station: {
            select: {
              name: true,
            },
          },
        },
      });
      return routes;
    }),
  getAllEmployees: viewAnalyticsProcedure.query(async ({ ctx, input }) => {
    const employees = await db.user.findMany({
      where: {
        is_deleted: false,
      },
      select: {
        first_name: true,
        last_name: true,
        email: true,
        station: {
          select: {
            name: true,
          },
        },
      },
    });
    return employees;
  }),
  getEmployeesForStation: viewRegionalOrStationAnalyticsProcedure
    .input(
      z.object({
        station_id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const employees = await db.user.findMany({
        where: {
          // station_id: input.station_id,
          is_deleted: false,
          ...(input.station_id && {
            station_id: ctx.session.user.station_id,
          }),
          ...((ctx.session.user.role.privileges.includes("StationCreate") ||
            (ctx.session.user.role.privileges.includes(
              "ViewRegionalAnalytics"
            ) &&
              !input.station_id)) && {
            station: {
              region: ctx.session.user.station.region,
            },
          }),
        },
        select: {
          first_name: true,
          last_name: true,
          email: true,
        },
      });
      return employees;
    }),
  passengersOnEachRoute: viewRegionalOrStationAnalyticsProcedure
    .input(
      z.object({
        station_id: z.number(),
        filterDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { today, endOfDay, startOfDay } = getDate();

      const filteredTotal = await db.ticketPurchaseTransaction.findMany({
        where: {
          created_at: {
            ...(input.filterDate == "today"
              ? {
                  gte: startOfDay,
                  lte: endOfDay,
                }
              : {
                  //@ts-ignore
                  gte: filterDateValues[input.filterDate],
                }),
          },
          NOT: {
            type: "REPRINT",
          },
          // station_id: input.station_id,
          ...(input.station_id && {
            station_id: input.station_id,
          }),
          ...((ctx.session.user.role.privileges.includes("StationCreate") ||
            (ctx.session.user.role.privileges.includes(
              "ViewRegionalAnalytics"
            ) &&
              !input.station_id)) && {
            station: {
              region: ctx.session.user.station.region,
            },
          }),
        },
        select: {
          queue: {
            select: {
              price: {
                select: {
                  route: {
                    select: {
                      destination_name: true,
                      id: true,
                      station: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
              vehicle: {
                select: {
                  id: true,
                },
              },
            },
          },
          ticket_count: true,
        },
      });
      const groupedData = new Map();

      filteredTotal.forEach((entry) => {
        const route = entry.queue.price.route.id; // Extract yyyy-mm-dd
        if (groupedData.has(route)) {
          groupedData.get(route).ticket_count += entry.ticket_count;
          let cur_route = groupedData.get(route);
          if (
            !cur_route.vehicles.find((v: any) => v == entry.queue.vehicle.id)
          ) {
            groupedData.get(route).vehicles = [
              ...groupedData.get(route).vehicles,
              entry.queue.vehicle.id,
            ];
          }
        } else {
          groupedData.set(route, {
            vehicles: [entry.queue.vehicle.id],
            route_id: entry.queue.price.route.id,
            destination_name: entry.queue.price.route.destination_name,
            station_name: entry.queue.price.route.station.name,
            ticket_count: entry.ticket_count,
          });
        }
      });

      // Convert Map values to an array
      const result = Array.from(groupedData.values());

      const routes_for_station = await db.route.findMany({
        select: {
          id: true,
          destination_name: true,
          station: {
            select: {
              name: true,
            },
          },
        },
        where: {
          // station_id: input.station_id,
          ...(input.station_id && {
            station_id: input.station_id,
          }),
          ...((ctx.session.user.role.privileges.includes("StationCreate") ||
            (ctx.session.user.role.privileges.includes(
              "ViewRegionalAnalytics"
            ) &&
              !input.station_id)) && {
            station: {
              region: ctx.session.user.station.region,
            },
          }),
        },
      });

      const passengers_on_each_route = routes_for_station.map((route) => {
        const route_active = result.find((s: any) => s.route_id == route.id);
        if (route_active) {
          return route_active;
        } else {
          return {
            vehicles: [],
            route_id: route.id,
            destination_name: route.destination_name,
            station_name: route.station.name,
            ticket_count: 0,
          };
        }
      });

      return passengers_on_each_route;
    }),
  filterTotalPassengersForStation: viewRegionalOrStationAnalyticsProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        station_id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const filteredTotal = await db.ticketPurchaseTransaction.findMany({
        where: {
          created_at: {
            gte: input.from,
            lte: input.to,
          },
          NOT: {
            type: "REPRINT",
          },
          // ...(!(
          //   ctx.session.user.role.privileges.includes("StationCreate") ||
          //   (ctx.session.user.role.privileges.includes(
          //     "ViewRegionalAnalytics"
          //   ) &&
          //     input.station_id)
          // ) && {
          //   station_id: ctx.session.user.station_id,
          // }),
          // ...((ctx.session.user.role.privileges.includes("StationCreate") ||
          //   ctx.session.user.role.privileges.includes(
          //     "ViewRegionalAnalytics"
          //   )) && {
          //   station: {
          //     region: ctx.session.user.station.region,
          //   },
          // }),
          ...(input.station_id && {
            station_id: input.station_id,
          }),
          ...((ctx.session.user.role.privileges.includes("StationCreate") ||
            (ctx.session.user.role.privileges.includes(
              "ViewRegionalAnalytics"
            ) &&
              !input.station_id)) && {
            station: {
              region: ctx.session.user.station.region,
            },
          }),
        },
        select: {
          queue: {
            select: {
              id: true,
              vehicle_id: true,
            },
          },
          created_at: true,
          ticket_count: true,
        },
      });

      const groupedData = new Map();

      filteredTotal.forEach((entry) => {
        const date = new Date(entry.created_at).toISOString().split("T")[0]; // Extract yyyy-mm-dd
        if (groupedData.has(date)) {
          groupedData.get(date).ticket_count += entry.ticket_count;
          let vehicleExists = groupedData
            .get(date)
            .vehicles.find((id: number) => id == entry.queue.vehicle_id);
          if (!vehicleExists) {
            groupedData.get(date).vehicles = [
              ...groupedData.get(date).vehicles,
              entry.queue.vehicle_id,
            ];
          }
        } else {
          groupedData.set(date, {
            date,
            ticket_count: entry.ticket_count,
            vehicles: [entry.queue.vehicle_id],
          });
        }
      });

      // Convert Map values to an array
      const result = Array.from(groupedData.values());

      return result;
    }),
  getAnalyticsCountsForStation: viewRegionalOrStationAnalyticsProcedure
    .input(
      z.object({ station_id: z.number(), filterDate: z.string().optional() })
    )
    .query(async ({ ctx, input }) => {
      console.log(input.filterDate);

      const { today, endOfDay, startOfDay } = getDate();

      const routes = await db.route.count({
        where: {
          // station_id: input.station_id,
          ...(input.station_id && {
            station_id: input.station_id,
          }),
          ...((ctx.session.user.role.privileges.includes("StationCreate") ||
            (ctx.session.user.role.privileges.includes(
              "ViewRegionalAnalytics"
            ) &&
              !input.station_id)) && {
            station: {
              region: ctx.session.user.station.region,
            },
          }),
          is_deleted: false,
        },
      });

      const employees = await db.user.count({
        where: {
          // station_id: input.station_id,
          ...(input.station_id && {
            station_id: input.station_id,
          }),
          ...((ctx.session.user.role.privileges.includes("StationCreate") ||
            (ctx.session.user.role.privileges.includes(
              "ViewRegionalAnalytics"
            ) &&
              !input.station_id)) && {
            station: {
              region: ctx.session.user.station.region,
            },
          }),
          is_deleted: false,
        },
      });

      const liveVehicles = await db.queue.count({
        where: {
          is_deleted: false,
          // station_id: input.station_id,
          ...(input.station_id && {
            station_id: input.station_id,
          }),
          ...((ctx.session.user.role.privileges.includes("StationCreate") ||
            (ctx.session.user.role.privileges.includes(
              "ViewRegionalAnalytics"
            ) &&
              !input.station_id)) && {
            station: {
              region: ctx.session.user.station.region,
            },
          }),
          paid: false,
          created_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const vehiclesOut = await db.queue.count({
        where: {
          // station_id: input.station_id,
          ...(input.station_id && {
            station_id: input.station_id,
          }),
          ...((ctx.session.user.role.privileges.includes("StationCreate") ||
            (ctx.session.user.role.privileges.includes(
              "ViewRegionalAnalytics"
            ) &&
              !input.station_id)) && {
            station: {
              region: ctx.session.user.station.region,
            },
          }),
          is_deleted: false,
          paid: true,
          created_at: {
            ...(input.filterDate == "today"
              ? {
                  gte: startOfDay,
                  lte: endOfDay,
                }
              : {
                  //@ts-ignore
                  gte: filterDateValues[input.filterDate],
                }),
          },
        },
      });

      const passengers = await db.ticketPurchaseTransaction.aggregate({
        _sum: {
          ticket_count: true,
        },
        where: {
          // station_id: input.station_id,
          ...(input.station_id && {
            station_id: input.station_id,
          }),
          ...((ctx.session.user.role.privileges.includes("StationCreate") ||
            (ctx.session.user.role.privileges.includes(
              "ViewRegionalAnalytics"
            ) &&
              !input.station_id)) && {
            station: {
              region: ctx.session.user.station.region,
            },
          }),
          created_at: {
            ...(input.filterDate == "today"
              ? {
                  gte: startOfDay,
                  lte: endOfDay,
                }
              : {
                  //@ts-ignore
                  gte: filterDateValues[input.filterDate],
                }),
          },
          NOT: {
            type: "REPRINT",
          },
        },
      });

      return {
        counts: {
          employees,
          liveVehicles,
          routes,
          passengers: passengers._sum,
          vehiclesOut,
        },
      };
    }),
  getAnalyticsForStation: viewRegionalOrStationAnalyticsProcedure
    .input(z.object({ station_id: z.number() }))
    .query(async ({ input }) => {
      const routes = await db.route.findMany({
        where: {
          station_id: input.station_id,
        },
      });

      const employees = await db.user.findMany({
        where: {
          station_id: input.station_id,
          is_deleted: false,
        },
        select: {
          email: true,
          first_name: true,
          last_name: true,
        },
      });
    }),
  getStationDailyCounts: viewAnalyticsProcedure.query(async ({ ctx }) => {
    // get all the destinations
    const { today, endOfDay, startOfDay } = getDate();

    console.log(ctx.session.user.station.region);

    const todayQueues = await db.queue.findMany({
      where: {
        is_deleted: false,
        created_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
        paid: true,
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
      },
      select: {
        booked_seat_count: true,
        vehicle: {
          select: {
            plate_number: true,
          },
        },
        station: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
        price: {
          select: {
            route: {
              select: {
                id: true,
                destination_name: true,
              },
            },
          },
        },
      },
    });

    const summaryArray: any = [];

    // Create a summary object for each station
    todayQueues.forEach((item) => {
      const stationId = item.station.id;
      const stationName = item.station.name;
      const passengersCount = item.booked_seat_count;
      const routeId = item.price.route.id;

      const vehiclePlateNumber = item.vehicle.plate_number;

      // Check if a summary object already exists for the station
      const existingSummary = summaryArray.find(
        (summary: any) => summary.station_id === stationId
      );

      if (existingSummary) {
        existingSummary.passengers_count += passengersCount;
        if (!existingSummary.routes.includes(routeId)) {
          existingSummary.routes.push(routeId);
        }
        if (!existingSummary.vehicles.includes(vehiclePlateNumber)) {
          existingSummary.vehicles.push(vehiclePlateNumber);
        }
      } else {
        // Create a new summary object for the station
        const newSummary = {
          station_id: stationId,
          station_name: stationName,
          passengers_count: passengersCount,
          routes: [routeId],
          vehicles: [vehiclePlateNumber],
        };
        summaryArray.push(newSummary);
      }
    });

    const all_stations = await db.station.findMany({
      select: {
        id: true,
        name: true,
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

    const station_counts = all_stations.map((station) => {
      const station_active = summaryArray.find(
        (s: any) => s.station_id == station.id
      );
      if (station_active) {
        return station_active;
      } else {
        return {
          station_id: station.id,
          station_name: station.name,
          passengers_count: 0,
          routes: [],
          vehicles: [],
        };
      }
    });

    return station_counts;
  }),
  filterTotalPassengers: viewAnalyticsProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const filteredTotal = await db.ticketPurchaseTransaction.findMany({
        where: {
          created_at: {
            gte: input.from,
            lte: input.to,
          },
          NOT: {
            type: "REPRINT",
          },
          ...(!ctx.session.user.role.privileges.includes(
            "ViewRegionalAnalytics"
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
        select: {
          queue: {
            select: {
              id: true,
              vehicle_id: true,
            },
          },
          created_at: true,
          ticket_count: true,
        },
        orderBy: {
          created_at: "asc",
        },
      });
      const groupedData = new Map();

      filteredTotal.forEach((entry) => {
        const date = new Date(entry.created_at).toISOString().split("T")[0]; // Extract yyyy-mm-dd
        if (groupedData.has(date)) {
          groupedData.get(date).ticket_count += entry.ticket_count;
          let vehicleExists = groupedData
            .get(date)
            .vehicles.find((id: number) => id == entry.queue.vehicle_id);
          if (!vehicleExists) {
            groupedData.get(date).vehicles = [
              ...groupedData.get(date).vehicles,
              entry.queue.vehicle_id,
            ];
          }
        } else {
          groupedData.set(date, {
            date,
            ticket_count: entry.ticket_count,
            vehicles: [entry.queue.vehicle_id],
          });
        }
      });

      // Convert Map values to an array
      const result = Array.from(groupedData.values());

      return result;
    }),
  getTotalPassengersToday: viewAnalyticsProcedure.query(async ({ ctx }) => {
    const { today, endOfDay, startOfDay } = getDate();
    const dailyUserCount = await db.ticketPurchaseTransaction.aggregate({
      _sum: {
        ticket_count: true,
      },
      where: {
        created_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
        NOT: {
          type: "REPRINT",
        },
        ...(!ctx.session.user.role.privileges.includes(
          "ViewRegionalAnalytics"
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

    return dailyUserCount;
  }),
  getRoutesCoveredToday: viewAnalyticsProcedure.query(async ({ ctx }) => {
    const { today, endOfDay, startOfDay } = getDate();
    const routesCoveredToday = await db.queue.findMany({
      distinct: "price_id",
      where: {
        is_deleted: false,
        created_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
        paid: true,
        ...(!ctx.session.user.role.privileges.includes(
          "ViewRegionalAnalytics"
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
      select: {
        price: {
          select: {
            route: {
              select: {
                destination_name: true,
              },
            },
          },
        },
      },
    });
    const destinations = routesCoveredToday.map(
      (queue) => queue.price.route.destination_name
    );

    return destinations;
  }),
  getVehiclesCheckedOutCount: viewAnalyticsProcedure.query(async ({ ctx }) => {
    const { today, endOfDay, startOfDay } = getDate();
    const routesCoveredToday = await db.queue.count({
      where: {
        is_deleted: false,
        created_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
        paid: true,
        ...(!ctx.session.user.role.privileges.includes(
          "ViewRegionalAnalytics"
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

    return routesCoveredToday;
  }),

  getPassengersHistory: protectedProcedure
    .input(
      z.object({
        date: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const history = await db.ticketPurchaseTransaction.findMany({
        where: {
          station_id: ctx.session.user?.station_id,
          created_at: {
            gte: input.date
              ? //@ts-ignore
                addDays(startOfDay(input.date), 1)
              : //@ts-ignore
                startOfDay(new Date()),
            lt: input.date
              ? //@ts-ignore
                addDays(endOfDay(input.date), 1)
              : //@ts-ignore
                addDays(startOfDay(new Date()), 1),
          },
        },
        select: {
          ticket_count: true,
          amount: true,
          creator: {
            select: {
              email: true,
            },
          },
          passenger_detail: true,
          queue: {
            include: {
              vehicle: {
                include: {
                  level: true,
                },
              },
              price: {
                include: {
                  route: true,
                },
              },
              station: true,
            },
          },
          created_at: true,
        },
      });
      return history;
    }),
});

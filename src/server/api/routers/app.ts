import { db } from "@/lib/db";
import {
  appProtectedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/trpc";
import { z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { User, Vehicle } from "@prisma/client";
import { getDate } from "@/lib/utils";
import { addDays, endOfDay, startOfDay, subDays } from "date-fns";
import jwt from "jsonwebtoken";

export const mobileRouter = createTRPCRouter({
  signIn: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
        type: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let user = await db.user.findUnique({
        where: {
          email: input.email,
        },
        select: {
          role: true,
          password: true,
          email: true,
          id: true,
          station: {
            select: {
              name: true,
              id: true,
              region: true,
            },
          },
        },
      });

      if (!user || !user.password) {
        throw new Error("No user found");
      }

      const passwordMatch = await bcrypt.compare(input.password, user.password);

      if (!passwordMatch) {
        throw new Error("Incorrect password");
      }
      if (!process.env.APP_AUTH_TOKEN) {
        throw new Error("Token not provided");
      }
      const token = jwt.sign({ user_id: user.id }, process.env.APP_AUTH_TOKEN, {
        expiresIn: "12hr",
      });

      if (input?.type == "online") {
        if (!user.role.privileges.includes("TicketBook")) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        }

        const cashiers = await db.user.findMany({
          where: {
            station_id: user.station.id,
            is_deleted: false,
            role: {
              privileges: {
                has: "AcceptTicketerRequest",
              },
            },
          },
          select: {
            id: true,
            email: true,
          },
        });
        const contact = await db.contact.findMany({
          where: {
            station_id: user.station.id,
            is_deleted: false,
          },
        });
        return {
          ...user,
          role: { privileges: null },
          password: null,
          jwt: token,
          cashiers,
          contact,
        };
      }

      // prices
      const prices = await db.price.findMany({
        where: {
          station_id: user.station.id,
          is_deleted: false,
        },
      });

      // contacts
      const contact = await db.contact.findMany({
        where: {
          station_id: user.station.id,
          is_deleted: false,
        },
      });

      // vehicles
      const vehicles = await db.vehicle.findMany({
        where: {
          is_deleted: false,
          station_id: user.station.id,
        },
      });

      // providers
      const providers = await db.provider.findMany({
        where: {
          is_deleted: false,
        },
      });

      // schedule
      const schedule = await db.schedule.findMany({
        where: { station_id: user.station.id },
      });

      // users for station
      const users = await db.user.findMany({
        where: {
          station_id: user.station.id,
          is_deleted: false,
        },
        select: {
          role: {
            select: {
              privileges: true,
            },
          },
          password: true,
          first_name: true,
          last_name: true,
          phone_number: true,
          email: true,
          id: true,
          station: {
            select: {
              name: true,
              id: true,
              region: true,
            },
          },
        },
      });

      // routes
      const routes = await db.route.findMany({
        where: {
          station_id: user.station.id,
          is_deleted: false,
        },
      });

      // vehicle levels
      const vehicle_levels = await db.vehicleLevel.findMany();

      return {
        users,
        providers,
        vehicles,
        prices,
        routes,
        contact,
        vehicle_levels,
        schedule,
        jwt: token,
      };
    }),

  getVehiclePerformance: appProtectedProcedure
    .input(
      z.object({
        plateNumber: z.string(),
        filter_type: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
        stationId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.stationId) {
        const vehicleHistory = await db.queue.findMany({
          where: {
            ...(input.stationId > 0
              ? { station_id: input.stationId }
              : {
                  station: {
                    region: ctx.user.station.region,
                  },
                }),
            ...(input.filter_type == "interval" && {
              created_at: {
                gte:
                  //@ts-ignore
                  addDays(startOfDay(new Date(input.from)), 1),
                lte:
                  //@ts-ignore
                  addDays(endOfDay(new Date(input.to)), 1),
              },
            }),
            ...(input.filter_type !== "interval" && {
              created_at: {
                //@ts-ignore
                //@ts-ignore
                gte: startOfDay(filterDateValues[input.filter_type]),
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
          ...(input.filter_type == "interval" && {
            created_at: {
              gte:
                //@ts-ignore
                addDays(startOfDay(new Date(input.from)), 1),
              lte:
                //@ts-ignore
                addDays(endOfDay(new Date(input.to)), 1),
            },
          }),
          ...(input.filter_type !== "interval" && {
            created_at: {
              //@ts-ignore
              gte:
                //@ts-ignore
                startOfDay(filterDateValues[input.filter_type]),
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

  getTodayQueues: appProtectedProcedure.mutation(async ({ input, ctx }) => {
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
        station_id: ctx.station_id,
      },
    });
    return queue;
  }),

  purchaseTicket: appProtectedProcedure
    .input(
      z.object({
        queue_id: z.number(),
        ticket_count: z.number(),
        type: z.string(),
        passenger_detail: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const queue = await db.queue.findUnique({
        select: {
          price: {
            select: {
              route: true,
              total_price: true,
            },
          },
          booked_seat_count: true,
          enabled: true,
          checked_out: true,
          seat_capacity: true,
          order: true,
        },
        where: {
          id: input.queue_id,
          enabled: true,
        },
      });
      if (!queue) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      if (input.type == "BOOK") {
        const vehicle_filled =
          queue.booked_seat_count + input.ticket_count == queue.seat_capacity;
        await db.queue.update({
          data: {
            booked_seat_count: queue.booked_seat_count + input.ticket_count,
            enabled: vehicle_filled ? !queue.enabled : queue.enabled,
            checked_out: vehicle_filled ? true : false,
            seat_full: vehicle_filled ? true : false,
          },
          where: {
            id: input.queue_id,
          },
        });
      }
      await db.ticketPurchaseTransaction.create({
        data: {
          ...(input.passenger_detail && {
            passenger_detail: input.passenger_detail,
          }),
          queue_id: input.queue_id,
          amount: input.ticket_count * queue.price.total_price,
          ticket_count: input.ticket_count,
          creator_id: ctx.user.id,
          station_id: ctx.station_id,
          type:
            input.type == "BOOK"
              ? "BOOK"
              : input.type == "REPRINT"
              ? "REPRINT"
              : "EXTRA",
        },
      });
    }),

  sendCashierRequest: appProtectedProcedure
    .input(
      z.object({
        cashier_id: z.number(),
        type: z.string(),
        amount: z.number(),
        ticket_price: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.ticketerToCashierTransaction.create({
        data: {
          ticketer_id: ctx.user.id,
          cashier_id: input.cashier_id,
          type: input.type == "CASH" ? "CASH" : "TICKET",
          station_id: ctx.user.station_id,
          amount: input.amount,
          ...(input.ticket_price && { ticket_price: input.ticket_price }),
        },
      });
    }),

  sync: publicProcedure
    .input(
      z.object({
        queues: z.array(
          z.array(
            z.object({
              id: z.string(),
              vehicleId: z.string(),
              priceId: z.number(),
              stationId: z.number(),
              creatorId: z.number(),
              checkoutTime: z.string(),
              createdAt: z.string(),
              bookedSeatCount: z.number(),
              checkedOut: z.boolean(),
              paid: z.boolean(),
              enabled: z.boolean(),
              seatFull: z.boolean(),
              order: z.number(),
              seatCapacity: z.number(),
            })
          )
        ),
        newVehicles: z.array(
          z.array(
            z.object({
              id: z.string(),
              station_id: z.number(),
              plate_number: z.string(),
              seat_capacity: z.number(),
              region: z.string(),
              side_number: z.string(),
              creator_id: z.number(),
              level_id: z.number(),
              provider_id: z.number(),
            })
          )
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const queues = input.queues[0];
      const newVehicles = input.newVehicles[0];

      const newVehiclesPlateNumber = newVehicles.map((v) => v.plate_number);
      if (newVehicles.length) {
        await db.vehicle.createMany({
          data: newVehicles.map((vehicle) => {
            return {
              level_id: vehicle.level_id,
              plate_number: vehicle.plate_number,
              provider_id: vehicle.provider_id,
              station_id: vehicle.station_id,
              creator_id: vehicle.creator_id,
              seat_capacity: vehicle.seat_capacity,
              side_number: vehicle.side_number,
              region: vehicle.region,
            };
          }),
          skipDuplicates: true,
        });
      }

      let vehicle_plate_numbers: any = [];
      for (let i = 0; i < queues.length; i++) {
        if (!vehicle_plate_numbers.includes(queues[i].vehicleId)) {
          vehicle_plate_numbers.push(queues[i].vehicleId);
        }
      }

      const vehiclesInQueue = await db.vehicle.findMany({
        where: {
          plate_number: { in: vehicle_plate_numbers },
        },
      });

      let curDate = new Date();

      // create the queues
      await db.queue.createMany({
        //@ts-ignore
        data: queues.map((q) => {
          return {
            booked_seat_count:
              q.bookedSeatCount <= q.seatCapacity
                ? q.bookedSeatCount
                : q.seatCapacity,
            seat_capacity: q.seatCapacity,
            checked_out: true,
            enabled: false,
            created_at: curDate,
            created_at_app: new Date(q.checkoutTime),
            order: 1,
            paid: true,
            price_id: q.priceId,
            seat_full: q.seatFull,
            creator_id: q.creatorId,
            station_id: q.stationId,
            vehicle_id: vehiclesInQueue.find(
              (v) => v.plate_number == q.vehicleId
            )?.id,
          };
        }),
      });

      const newQueues = await db.queue.findMany({
        where: {
          created_at: curDate,
        },
        select: {
          id: true,
          price: true,
          booked_seat_count: true,
          creator_id: true,
          station_id: true,
        },
      });

      // simulate ticket buying
      await db.ticketPurchaseTransaction.createMany({
        //@ts-ignore
        data: newQueues.map((q) => {
          return {
            queue_id: q.id,
            amount: q.booked_seat_count * q.price.total_price,
            ticket_count: q.booked_seat_count,
            creator_id: q.creator_id,
            station_id: q.station_id,
            type: "BOOK",
          };
        }),
      });

      // simulate request to cashier
      await db.ticketerToCashierTransaction.createMany({
        //@ts-ignore
        data: newQueues.map((q) => {
          return {
            created_at: curDate,
            ticketer_id: q.creator_id,
            cashier_id: q.creator_id,
            type: "CASH",
            station_id: q.station_id,
            amount: q.booked_seat_count * q.price.total_price,
          };
        }),
      });

      const newCashierRequests = await db.ticketerToCashierTransaction.findMany(
        {
          where: {
            created_at: curDate,
          },
        }
      );

      await db.driverPaymentTransaction.createMany({
        //@ts-ignore
        data: newQueues.map((q) => {
          return {
            queue_id: q.id,
            creator_id: q.creator_id,
            station_id: q.station_id,
            amount: q.booked_seat_count * q.price.price,
          };
        }),
      });

      const cashierRequestsIds = newCashierRequests.map((r) => r.id);

      await db.ticketerToCashierTransaction.updateMany({
        data: {
          status: "ACCEPTED",
        },
        where: {
          id: { in: cashierRequestsIds },
        },
      });
      return;
    }),

  getCounts: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let user = await db.user.findUnique({
        where: {
          email: input.email,
        },
        select: {
          role: true,
          password: true,
          email: true,
          id: true,
          station: {
            select: {
              name: true,
              id: true,
              region: true,
            },
          },
        },
      });

      if (!user || !user.password) {
        throw new Error("No user found");
      }

      const passwordMatch = await bcrypt.compare(input.password, user.password);

      if (!passwordMatch) {
        throw new Error("Incorrect password");
      }
      if (!process.env.APP_AUTH_TOKEN) {
        throw new Error("Token not provided");
      }
      const token = jwt.sign({ user_id: user.id }, process.env.APP_AUTH_TOKEN, {
        expiresIn: "12hr",
      });

      const { today, endOfDay, startOfDay } = getDate();

      if (user.role.privileges.includes("ViewFinanceAnalytics")) {
        const filteredTotal = await db.ticketPurchaseTransaction.findMany({
          where: {
            created_at: {
              gte: startOfDay,
              lt: endOfDay,
            },
            NOT: {
              type: "REPRINT",
            },
            station_id: user.station.id,
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
                        distance: true,
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
            distance: true,
            station: {
              select: {
                name: true,
              },
            },
          },
          where: {
            station_id: user.station.id,
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
              distance: route.distance,
            };
          }
        });

        const passengerHistory = await db.ticketPurchaseTransaction.findMany({
          where: {
            created_at: {
              //@ts-ignore
              gte: subDays(new Date(Date.now()), 7),
              lt: new Date(Date.now()),
            },
            NOT: {
              type: "REPRINT",
            },
            station_id: user.station.id,
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

        const historyGroupedData = new Map();

        passengerHistory.forEach((entry) => {
          const date = new Date(entry.created_at).toISOString().split("T")[0]; // Extract yyyy-mm-dd
          if (historyGroupedData.has(date)) {
            historyGroupedData.get(date).ticket_count += entry.ticket_count;
            let vehicleExists = historyGroupedData
              .get(date)
              .vehicles.find((id: number) => id == entry.queue.vehicle_id);
            if (!vehicleExists) {
              historyGroupedData.get(date).vehicles = [
                ...historyGroupedData.get(date).vehicles,
                entry.queue.vehicle_id,
              ];
            }
          } else {
            historyGroupedData.set(date, {
              date,
              ticket_count: entry.ticket_count,
              vehicles: [entry.queue.vehicle_id],
            });
          }
        });

        // Convert Map values to an array
        const history = Array.from(historyGroupedData.values()).map((h) => {
          return {
            date: h.date,
            vehicles: h.vehicles.length,
            passengers: h.ticket_count,
          };
        });

        return {
          type: "route",
          token,
          station: user.station,
          counts: passengers_on_each_route.map((p, i) => {
            return {
              id: p.route_id,
              name: p.destination_name,
              dailyPassengers: p.ticket_count,
              distance: p.distance,
              checkedOutVehicles: p.vehicles?.length,
            };
          }),
          history,
        };
      } else if (user.role.privileges.includes("ViewRegionalAnalytics")) {
        const todayQueues = await db.queue.findMany({
          where: {
            created_at: {
              gte: startOfDay,
              lt: endOfDay,
            },
            paid: true,
            station: {
              region: user.station.region,
            },
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
            ...(user.role.privileges.includes("ViewRegionalAnalytics") && {
              region: user.station.region,
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

        // break
        const monthlyQueue = await db.queue.findMany({
          where: {
            created_at: {
              //@ts-ignore
              gte: subDays(new Date(Date.now()), 30),
              lt: new Date(Date.now()),
            },
            paid: true,

            station: {
              region: user.station.region,
            },
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

        const monthlySummaryArray: any = [];

        // I love adyam so so so much!!!

        // Create a summary object for each station
        monthlyQueue.forEach((item) => {
          const stationId = item.station.id;
          const stationName = item.station.name;
          const passengersCount = item.booked_seat_count;
          const routeId = item.price.route.id;

          const vehiclePlateNumber = item.vehicle.plate_number;

          // Check if a summary object already exists for the station
          const existingSummary = monthlySummaryArray.find(
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
            monthlySummaryArray.push(newSummary);
          }
        });
        //
        const all_stations_history = await db.station.findMany({
          select: {
            id: true,
            name: true,
          },
          where: {
            ...(user.role.privileges.includes("ViewRegionalAnalytics") && {
              region: user.station.region,
            }),
          },
        });

        const station_history_counts = all_stations_history.map((station) => {
          const station_active = monthlySummaryArray.find(
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
        station_history_counts.sort(
          (a, b) => b.passengers_count - a.passengers_count
        );

        const filteredTotal = await db.ticketPurchaseTransaction.findMany({
          where: {
            created_at: {
              //@ts-ignore
              gte: subDays(new Date(Date.now()), 7),
              lt: new Date(Date.now()),
            },
            NOT: {
              type: "REPRINT",
            },

            station: {
              region: user.station.region,
            },
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

        return {
          type: "station",
          token,
          region: user.station.region,
          counts: station_counts.map((p) => {
            return {
              id: p.station_id,
              name: p.station_name,
              dailyPassengers: p.passengers_count,
              activeVehicles: p.vehicles?.length,
              monthlyPassengers: station_history_counts.find(
                (m) => m.station_id == p.station_id
              ).passengers_count,
            };
          }),
          history: result.map((h) => {
            return {
              date: h.date,
              vehicles: h.vehicles?.length,
              passengers: h.ticket_count,
            };
          }),
        };
      }
      return;
    }),

  getRegionalVehiclePerformance: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: {
          email: input.email,
        },
        select: {
          password: true,
          role: true,
          station: true,
        },
      });

      if (!user) {
        throw new Error("Incorrect email or password");
      }

      const passwordMatch = await bcrypt.compare(input.password, user.password);

      if (!passwordMatch) {
        throw new Error("Incorrect email or password");
      }

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
            //@ts-ignore
            gte: subDays(new Date(Date.now()), 1),
            lt: new Date(Date.now()),
          },
          ...(user.role.privileges.includes("ViewRegionalAnalytics") && {
            station: {
              region: user.station.region,
            },
          }),
          ...(user.role.privileges.includes("ViewFinanceAnalytics") && {
            station: {
              id: user.station.id,
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

  getJourneyHistory: publicProcedure
    .input(
      z.object({
        token: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
        cursor: z.number().optional(),
        all: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.APP_AUTH_TOKEN) {
        throw new Error("App token not provided");
      }
      if (!input.token) {
        throw new Error("Not authorized");
      }

      const user_session: any = jwt.verify(
        input.token,
        process.env.APP_AUTH_TOKEN!
      );

      if (!user_session?.user_id) {
        throw new Error("Not authorized");
      }

      const user = await db.user.findUnique({
        where: {
          id: user_session.user_id!,
        },
        select: {
          password: true,
          role: true,
          station: true,
        },
      });
      if (!user) {
        throw new Error("Not authorized");
      }

      const queue = await db.queue.findMany({
        orderBy: {
          id: "asc",
        },
        ...(!input.all && { take: 300 }),
        ...(input.cursor && { skip: 1 }),
        ...(input.cursor && {
          cursor: {
            id: input.cursor,
          },
        }),
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
            //@ts-ignore
            gte: input.from
              ? //@ts-ignore
                addDays(startOfDay(new Date(input.from)), 1)
              : //@ts-ignore
                startOfDay(new Date()),
            lte: input.to //@ts-ignore
              ? addDays(endOfDay(new Date(input.to)), 1)
              : //@ts-ignore
                addDays(startOfDay(new Date()), 1),
          },
          ...(user.role.privileges.includes("ViewRegionalAnalytics") && {
            station: {
              region: user.station.region,
            },
          }),
          ...(user.role.privileges.includes("ViewFinanceAnalytics") && {
            station: {
              id: user.station.id,
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
        },
        select: {
          queue_id: true,
          created_at: true,
        },
      });

      const payments = await db.driverPaymentTransaction.findMany({
        where: {
          queue_id: {
            in: queueIds,
          },
        },
        select: {
          queue_id: true,
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

      let history = queue.map((queue) => {
        return {
          ...queue,
          booked_seat_count: Math.round(
            //@ts-ignore
            payments.find((p) => p.queue_id == queue.id)?.amount /
              //@ts-ignore
              payments.find((p) => p.queue_id == queue.id)?.queue.price.price
          ),
          paidTime: payTransactions.find((p) => p.queue_id == queue.id),
        };
      });
      const vehicleCountMap = new Map();

      history.forEach((item) => {
        const vehicleId = item.vehicle.id;
        vehicleCountMap.set(
          vehicleId,
          (vehicleCountMap.get(vehicleId) || 0) + 1
        );
      });

      // Add checkout_count field to each object in the array
      history.forEach((item) => {
        const vehicleId = item.vehicle.id;
        //@ts-ignore
        item.checkout_count = vehicleCountMap.get(vehicleId);
      });

      return history;
    }),
});

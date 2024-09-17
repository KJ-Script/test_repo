import { db } from "@/lib/db";
import { getDate } from "@/lib/utils";
import {
  acceptTicketerRequestProcedure,
  auditCashierProcedure,
  auditManagerProcedure,
  auditTicketerProcedure,
  createTRPCRouter,
  payDriverProcedure,
  protectedProcedure,
  publicProcedure,
  requestToCashierProcedure,
  stationCreateProcedure,
  ticketBookProcedure,
  viewRequestToCashierHistoryProcedure,
} from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { object, z } from "zod";
import { startOfDay, endOfDay, addDays, subDays } from "date-fns";

export const transactionRouter = createTRPCRouter({
  transactionHistoryForQueue: protectedProcedure
    .input(z.object({ queue_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const transactionsForQueue = await db.ticketPurchaseTransaction.findMany({
        where: {
          queue_id: input.queue_id,
        },
        select: {
          queue: true,
          amount: true,
          type: true,
          creator: true,
          ticket_count: true,
        },
      });
      // console.log(transactionsForQueue);

      // let history: any = {};
      // transactionsForQueue.forEach((t) => {
      //   if (history[t.creator.email]) {
      //     if (history[t.creator.email][t.type]) {
      //       history[t.creator.email][t.type] =
      //         history[t.creator.email][t.type] + 1;
      //     } else {
      //       history[t.creator.email][t.type] = 0;
      //     }
      //   } else {
      //     history[t.creator.email] = {};
      //   }
      // });
      const convertedData = transactionsForQueue.reduce(
        (result: any, entry: any) => {
          const creatorEmail = entry.creator.email;
          const type = entry.type;
          const ticketCount = entry.ticket_count;

          // Initialize the creator entry if not present
          if (!result[creatorEmail]) {
            result[creatorEmail] = {
              creator: creatorEmail,
              BOOK: 0,
              REPRINT: 0,
              EXTRA: 0,
            };
          }

          // Update the ticket count based on the type
          result[creatorEmail][type] += ticketCount;

          return result;
        },
        {}
      );

      // Convert the object to an array
      const history = Object.values(convertedData);

      return history;
    }),
  getToday: publicProcedure.query(() => {}),
  purchaseTicket: ticketBookProcedure
    .input(
      z.object({
        queue_id: z.number(),
        ticket_count: z.number(),
        amount: z.number(),
        type: z.string(),
        passenger_detail: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      if (input.type == "BOOK") {
        const queue = await db.queue.findUnique({
          select: {
            price: {
              select: {
                route: true,
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
          },
        });
        if (!queue) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }
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
          amount: input.amount,
          ticket_count: input.ticket_count,
          creator_id: ctx.session.user.id,
          station_id: ctx.session.user.station_id,
          type:
            input.type == "BOOK"
              ? "BOOK"
              : input.type == "REPRINT"
              ? "REPRINT"
              : "EXTRA",
        },
      });
    }),
  ticketerToCashierRequest: requestToCashierProcedure
    .input(
      z.object({
        cashier_id: z.number(),
        type: z.string(),
        amount: z.number(),
        ticket_price: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      await db.ticketerToCashierTransaction.create({
        data: {
          ticketer_id: ctx.session.user.id,
          cashier_id: input.cashier_id,
          type: input.type == "CASH" ? "CASH" : "TICKET",
          station_id: ctx.session.user.station_id,
          amount: input.amount,
          ...(input.ticket_price && { ticket_price: input.ticket_price }),
        },
      });
    }),
  requestsForSpecificCashier: viewRequestToCashierHistoryProcedure.query(
    async ({ ctx }) => {
      const { today, endOfDay, startOfDay } = getDate();
      const todayRequests = await db.ticketerToCashierTransaction.findMany({
        where: {
          created_at: {
            gte: startOfDay,
            lt: endOfDay,
          },
          ...(!ctx.session.user.role.privileges.includes("UserCreate") && {
            cashier_id: ctx.session.user.id,
          }),
          station_id: ctx.session.user.station_id,
        },
        select: {
          amount: true,
          type: true,
          id: true,
          cashier: {
            select: {
              email: true,
              first_name: true,
            },
          },
          status: true,
          ticketer: {
            select: {
              email: true,
              first_name: true,
            },
          },
        },
      });
      return todayRequests;
    }
  ),
  ticketerToCashierRequestHistory: viewRequestToCashierHistoryProcedure.query(
    async ({ ctx }) => {
      const { today, endOfDay, startOfDay } = getDate();
      const todayRequests = await db.ticketerToCashierTransaction.findMany({
        where: {
          created_at: {
            gte: startOfDay,
            lt: endOfDay,
          },
          ...(!ctx.session.user.role.privileges.includes("UserCreate") &&
            !ctx.session.user.role.privileges.includes(
              "AcceptTicketerRequest"
            ) && {
              ticketer_id: ctx.session.user.id,
            }),
        },
        select: {
          amount: true,
          type: true,
          id: true,
          cashier: {
            select: {
              email: true,
              first_name: true,
            },
          },
          status: true,
          ticketer: {
            select: {
              email: true,
              first_name: true,
            },
          },
        },
      });
      return todayRequests;
    }
  ),
  acceptTicketerRequest: acceptTicketerRequestProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.ticketerToCashierTransaction.update({
        data: {
          status: "ACCEPTED",
        },
        where: {
          id: input.id,
        },
      });
    }),
  rejectTicketerRequest: acceptTicketerRequestProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.ticketerToCashierTransaction.update({
        data: {
          status: "REJECTED",
        },
        where: {
          id: input.id,
        },
      });
    }),
  auditTicketerDailyHistory: auditTicketerProcedure.query(
    async ({ ctx, input }) => {
      const { endOfDay, startOfDay, today } = getDate();
      const ticketers = await db.user.findMany({
        where: {
          station_id: ctx.session.user.station_id,
          is_deleted: false,
        },
      });

      const ticketerIds = ticketers.map((ticketer) => ticketer.id);

      const ticketers_debt = await db.ticketPurchaseTransaction.findMany({
        where: {
          created_at: {
            gt: startOfDay,
            lte: endOfDay,
          },
          type: {
            in: ["BOOK", "EXTRA"],
          },
          creator_id: { in: ticketerIds },
        },
      });

      const ticketers_book_type = await db.ticketPurchaseTransaction.groupBy({
        by: ["creator_id", "type"],
        _sum: {
          ticket_count: true,
          amount: true,
        },
        where: {
          created_at: {
            gt: startOfDay,
            lte: endOfDay,
          },
          creator_id: { in: ticketerIds },
        },
      });

      const ticketers_returned = await db.ticketerToCashierTransaction.groupBy({
        by: ["ticketer_id", "type"],
        _sum: {
          amount: true,
        },
        where: {
          created_at: {
            gt: startOfDay,
            lte: endOfDay,
          },
          ticketer_id: { in: ticketerIds },
        },
      });

      console.log(ticketers_book_type);

      const ticketersDebtSum = ticketers_debt.reduce((acc: any, debt) => {
        const ticketerId = debt.creator_id;
        if (!acc[ticketerId]) {
          acc[ticketerId] = 0;
        }
        acc[ticketerId] += debt.amount;
        return acc;
      }, {});

      const ticketersPaid = await db.ticketerToCashierTransaction.findMany({
        where: {
          ticketer_id: { in: ticketerIds },
          status: "ACCEPTED",
          created_at: {
            gt: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const ticketersPaidSum = ticketersPaid.reduce((acc: any, paid) => {
        const ticketerId = paid.ticketer_id;
        if (!acc[ticketerId]) {
          acc[ticketerId] = 0;
        }
        acc[ticketerId] += paid.amount;
        return acc;
      }, {});

      const ticketersAudited = await db.ticketerAudit.findMany({
        where: {
          audited_id: { in: ticketerIds },
          created_at: {
            gt: startOfDay,
            lte: endOfDay,
          },
          audit_type: "TICKETER",
        },
      });

      const ticketersAuditedSum = ticketersAudited.reduce(
        (acc: any, audited) => {
          const ticketerId = audited.audited_id;
          if (!acc[ticketerId]) {
            acc[ticketerId] = 0;
          }
          acc[ticketerId] += audited.balance;
          return acc;
        },
        {}
      );

      const allUserIds = Array.from(
        new Set([
          ...Object.keys(ticketersPaidSum),
          ...Object.keys(ticketersDebtSum),
        ])
      );

      const balanceData: any = {};
      let audit_data: any = [];
      allUserIds.forEach((userId: any) => {
        const debtAmount = ticketersDebtSum[userId] || 0;
        const paymentAmount = ticketersPaidSum[userId] || 0;
        const auditedAmount = ticketersAuditedSum[userId] || 0;

        const balance = paymentAmount - debtAmount + auditedAmount * -1;
        balanceData[userId] = balance;

        audit_data.push({
          ticketer: ticketers.find((ticketer) => ticketer.id == Number(userId)),
          balance,
          book:
            (ticketers_book_type.find(
              (t) => t.creator_id == userId && t.type == "BOOK"
            )?._sum.ticket_count || 0) +
            ` [${
              ticketers_book_type
                .find((t) => t.creator_id == userId && t.type == "BOOK")
                ?._sum.amount?.toFixed(2) || 0
            }]`,
          reprint:
            (ticketers_book_type.find(
              (t) => t.creator_id == userId && t.type == "REPRINT"
            )?._sum?.ticket_count || 0) +
            ` [${
              ticketers_book_type
                .find((t) => t.creator_id == userId && t.type == "REPRINT")
                ?._sum.amount?.toFixed(2) || 0
            }]`,
          extra:
            (ticketers_book_type.find(
              (t) => t.creator_id == userId && t.type == "EXTRA"
            )?._sum?.ticket_count || 0) +
            ` [${
              ticketers_book_type
                .find((t) => t.creator_id == userId && t.type == "EXTRA")
                ?._sum.amount?.toFixed(2) || 0
            }]`,
          returnedTicket:
            ticketers_returned
              .find((t) => t.ticketer_id == userId && t.type == "TICKET")
              ?._sum.amount?.toFixed(2) || 0,
          returnedCash:
            ticketers_returned
              .find((t) => t.ticketer_id == userId && t.type == "CASH")
              ?._sum.amount?.toFixed(2) || 0,
        });
      });

      return audit_data;
    }
  ),
  auditTicketer: auditTicketerProcedure
    .input(
      z.object({
        ticketer_id: z.number(),
        balance: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { endOfDay, startOfDay, today } = getDate();

      await db.ticketerAudit.create({
        data: {
          balance: input.balance,
          audited_id: input.ticketer_id,
          auditer_id: ctx.session.user.id,
          station_id: ctx.session.user.station_id,
          audit_type: "TICKETER",
        },
      });
    }),

  getCashiers: publicProcedure.input(z.any()).query(async ({ input }) => {
    const { endOfDay, startOfDay } = getDate();

    const cashiers = await db.user.findMany({
      where: {
        is_deleted: false,
        station_id: input.station_id,
        // role: {
        //   privileges: {
        //     has: "AcceptTicketerRequest",
        //   },
        // },
      },
    });
    return cashiers;
  }),
  getCashierDebt: publicProcedure
    .input(z.object({ cashier_id: z.number(), station_id: z.number() }))
    .query(async ({ input }) => {
      const { endOfDay, startOfDay } = getDate();
      const cashierDebt = await db.ticketerToCashierTransaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          cashier_id: input.cashier_id,
          station_id: input.station_id,
          status: "ACCEPTED",
          created_at: {
            gt: startOfDay,
            lte: endOfDay,
          },
        },
      });

      return cashierDebt;
    }),
  checkCashierPaid: publicProcedure
    .input(z.object({ cashier_id: z.number(), station_id: z.number() }))
    .query(async ({ input }) => {
      const { endOfDay, startOfDay } = getDate();
      const cashierPaidCheck = await db.driverPaymentTransaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          creator_id: input.cashier_id,
          station_id: input.station_id,
          created_at: {
            gt: startOfDay,
            lte: endOfDay,
          },
        },
      });

      return cashierPaidCheck;
    }),

  checkCashierAudited: publicProcedure
    .input(z.object({ cashier_id: z.number(), station_id: z.number() }))
    .query(async ({ input }) => {
      const { endOfDay, startOfDay } = getDate();
      const cashierAuditedCheck = await db.ticketerAudit.findFirst({
        where: {
          audited_id: input.cashier_id,
          created_at: {
            gt: startOfDay,
            lte: endOfDay,
          },
          audit_type: "CASHIER",
        },
      });
      return cashierAuditedCheck;
    }),

  auditCashierDailyHistory: auditCashierProcedure.query(
    async ({ ctx, input }) => {
      const cashiers = await db.user.findMany({
        where: {
          is_deleted: false,
          station_id: ctx.session.user.station_id,
          // role: {
          //   privileges: {
          //     has: "AcceptTicketerRequest",
          //   },
          // },
        },
        select: {
          id: true,
          email: true,
        },
      });

      let audit_details = [];
      const cashierIds = cashiers.map((cashier) => cashier.id);
      // for (let i = 0; i < cashiers.length; i++) {
      const cashier_debt = await db.ticketerToCashierTransaction.groupBy({
        by: ["cashier_id"],
        _sum: {
          amount: true,
        },
        where: {
          station_id: ctx.session.user.station_id,
          status: "ACCEPTED",
          type: "CASH",
          created_at: {
            //@ts-ignore
            gte: startOfDay(new Date()),
            //@ts-ignore
            lt: endOfDay(new Date()),
          },
        },
      });
      const cashier_paid = await db.driverPaymentTransaction.groupBy({
        by: ["creator_id"],
        _sum: {
          amount: true,
        },
        where: {
          station_id: ctx.session.user.station_id,
          created_at: {
            //@ts-ignore
            gte: startOfDay(new Date()),
            //@ts-ignore
            lt: endOfDay(new Date()),
          },
        },
      });

      const cashier_audited_check = await db.ticketerAudit.findMany({
        where: {
          audited_id: { in: cashierIds },
          created_at: {
            //@ts-ignore
            gte: startOfDay(new Date()),
            //@ts-ignore
            lt: endOfDay(new Date()),
          },
          audit_type: "CASHIER",
        },
        select: {
          audited_id: true,
        },
      });

      const audit_data = cashier_debt.map((d) => {
        let cashier = cashiers.find((c) => c.id == d.cashier_id);
        return {
          cashier,
          paid: cashier_paid.find((p) => p.creator_id == d.cashier_id)?._sum
            .amount,
          debt: d._sum.amount,
          balance:
            //@ts-ignore
            cashier_paid.find((p) => p.creator_id == d.cashier_id)?._sum
              .amount - //@ts-ignore
            d._sum.amount,
          audited: cashier_audited_check.find((cashier) =>
            cashier.audited_id == d.cashier_id ? true : false
          ),
        };
      });

      return audit_data;
    }
  ),
  auditCashier: auditCashierProcedure
    .input(
      z.object({
        cashier_id: z.number(),
        balance: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { endOfDay, startOfDay, today } = getDate();
      await db.ticketerAudit.create({
        data: {
          balance: input.balance,
          audited_id: input.cashier_id,
          auditer_id: ctx.session.user.id,
          station_id: ctx.session.user.station_id,
          audit_type: "CASHIER",
        },
      });
    }),
  payDriver: protectedProcedure
    .input(
      z.object({
        queue_id: z.number(),
        amount: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const alreadyPaid = await db.queue.findUnique({
        where: {
          id: input.queue_id,
          paid: true,
        },
      });
      if (alreadyPaid)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Driver already paid.",
        });

      const cashier_debt = await db.ticketerToCashierTransaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          cashier_id: ctx?.session.user.id,
          status: "ACCEPTED",
          type: "CASH",
          created_at: {
            //@ts-ignore
            gte: startOfDay(new Date()),
            //@ts-ignore
            lt: endOfDay(new Date()),
          },
        },
      });

      const cashier_paid = await db.driverPaymentTransaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          creator_id: ctx?.session.user.id,
          created_at: {
            //@ts-ignore
            gte: startOfDay(new Date()),
            //@ts-ignore
            lt: endOfDay(new Date()),
          },
        },
      });

      const cashier_balance =
        //@ts-ignore
        cashier_debt._sum.amount - cashier_paid._sum.amount;

      console.log(cashier_balance);

      if (cashier_balance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance.",
        });
      }

      await db.driverPaymentTransaction.create({
        data: {
          amount: input.amount,
          queue_id: input.queue_id,
          station_id: ctx.session.user?.station_id,
          creator_id: ctx.session.user?.id,
        },
      });
      await db.queue.update({
        data: {
          paid: true,
        },
        where: {
          id: input.queue_id,
        },
      });
    }),
  sendManagerRequest: payDriverProcedure
    .input(
      z.object({
        amount: z.number(),
        date: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      let requestExists = await db.managerRequest.findFirst({
        where: {
          manager_id: ctx.session.user?.id,
          date: {
            gte:
              //@ts-ignore
              addDays(startOfDay(input.date), 1),
            lt:
              //@ts-ignore
              addDays(endOfDay(input.date), 1),
          },
        },
      });
      if (requestExists) {
        await db.managerRequest.update({
          where: {
            id: requestExists.id,
          },
          data: {
            amount: input.amount,
          },
        });
        return;
      }
      await db.managerRequest.create({
        data: {
          amount: input.amount,
          manager_id: ctx.session.user?.id,
          date:
            //@ts-ignore
            addDays(input.date, 1),
        },
      });

      return;
    }),
  getManagerRequests: auditManagerProcedure
    .input(
      z.object({
        date: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log(
        input.date
          ? //@ts-ignore
            startOfDay(input.date)
          : //@ts-ignore
            startOfDay(new Date())
      );
      let stations = await db.station.findMany();
      const ticketerRequests = await db.ticketerToCashierTransaction.groupBy({
        by: ["station_id"],
        _sum: {
          amount: true,
        },
        where: {
          status: "ACCEPTED",
          type: "CASH",
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
      });

      const driverPayment = await db.driverPaymentTransaction.groupBy({
        by: ["station_id"],
        _sum: {
          amount: true,
        },
        where: {
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
      });

      console.log(ticketerRequests, driverPayment);

      const stationsEarning = stations.map((s) => {
        return {
          earning:
            (ticketerRequests.find((t) => t.station_id == s.id)?._sum.amount ||
              0) -
            (driverPayment.find((d) => d.station_id == s.id)?._sum?.amount ||
              0),
          station: s,
        };
      });

      const manager_requests = await db.managerRequest.findMany({
        where: {
          date: {
            gte: input.date
              ? //@ts-ignore
                addDays(startOfDay(new Date(input.date)), 1)
              : //@ts-ignore
                startOfDay(new Date()),
            lt: input.date
              ? //@ts-ignore
                addDays(endOfDay(new Date(input.date)), 1)
              : //@ts-ignore
                addDays(startOfDay(new Date()), 1),
          },
        },
        select: {
          manager: {
            select: {
              station: true,
              email: true,
            },
          },
          date: true,
          amount: true,
        },
      });
      interface RequestByStationsInterface {
        station: string;
        manager: string;
        region: string;
        amount: number;
        earning: number;
        date: Date;
      }
      let requestsByStations: RequestByStationsInterface[] = [];

      stationsEarning.forEach((s) => {
        let m = manager_requests.find(
          (re) => re.manager?.station.id == s.station.id
        );
        if (!m) {
          requestsByStations.push({
            station: s.station.name,
            region: s.station.region,
            manager: "",
            amount: 0,
            date: input.date || new Date(),
            earning: s.earning,
          });
        }
        manager_requests.forEach((m) => {
          if (m.manager?.station.id == s.station.id) {
            requestsByStations.push({
              station: s.station.name,
              region: s.station.region,
              manager: m.manager.email,
              amount: m.amount,
              date: m.date,
              earning: s.earning,
            });
          }
        });
      });

      return requestsByStations;
    }),
});

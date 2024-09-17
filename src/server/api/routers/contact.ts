import { db } from "@/lib/db";
import {
  createTRPCRouter,
  priceCreateProcedure,
  protectedProcedure,
  roleViewProcedure,
  routeCreateProcedure,
  routeDeleteProcedure,
  routeUpdateProcedure,
  routeViewProcedure,
} from "@/server/trpc";
import { z } from "zod";

export const contactRouter = createTRPCRouter({
  getAll: routeViewProcedure.query(async ({ ctx }) => {
    const contacts = await db.contact.findMany({
      select: {
        id: true,
        creator: true,
        station: true,
        phone_number: true,
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
    return contacts;
  }),
  create: roleViewProcedure
    .input(
      z.object({
        phone_number: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createContact = await db.contact.create({
        data: {
          phone_number: input.phone_number,
          station_id: ctx.session.user?.station_id,
          creator_id: ctx.session.user?.id,
        },
      });

      return {
        message: "New contact added",
        station: createContact.id,
      };
    }),
  update: priceCreateProcedure
    .input(
      z.object({
        phone_number: z.string(),
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.contact.update({
        data: {
          ...(input.phone_number && {
            phone_number: input.phone_number,
          }),
        },
        where: {
          id: input.id,
        },
      });
      return { message: "Contact updated" };
    }),

  delete: roleViewProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.contact.update({
        where: {
          id: input.id,
        },
        data: {
          is_deleted: true,
        },
      });
      return { message: "Contact deleted." };
    }),
});

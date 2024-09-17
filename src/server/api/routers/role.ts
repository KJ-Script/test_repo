import { db } from "@/lib/db";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  roleCreateProcedure,
  roleDeleteProcedure,
  roleUpdateProcedure,
  roleViewProcedure,
} from "@/server/trpc";
import { Privileges } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const roleRouter = createTRPCRouter({
  create: roleCreateProcedure
    .input(
      z.object({
        name: z.string().min(2, { message: "Role name is required" }),
        privileges: z.string().array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx?.session?.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (
        input.privileges.includes("StationCreate") ||
        // input.privileges.includes("StationView") ||
        input.privileges.includes("StationUpdate") ||
        input.privileges.includes("StationDelete")
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      if (
        !ctx.session.user.role.privileges.includes("StationCreate") &&
        (input.privileges.includes("StationDriverManagement") ||
          input.privileges.includes("RegionalDriverManagement") ||
          input.privileges.includes("DriverManagementCashier"))
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const role = await db.role.create({
        data: {
          name: input.name,
          //@ts-ignore
          privileges: [...input.privileges],
          station_id: ctx.session.user.station_id,
          creator_id: ctx.session.user.id,
        },
      });

      return role.id;
    }),
  update: roleUpdateProcedure
    .input(
      z.object({
        name: z.string().min(2, { message: "Role name is required" }),
        privileges: z.string().array(),
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedRole = await db.role.update({
        data: {
          name: input.name,
          //@ts-ignore
          privileges: [...input.privileges],
        },
        where: {
          id: input.id,
        },
      });
      return updatedRole.id;
    }),
  getPrivileges: roleCreateProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: {
        email: ctx.session.user.email,
      },
      select: {
        role: true,
      },
    });
    if (user?.role.privileges.includes("StationCreate")) {
      return Object.values(Privileges);
    }
    return Object.values(Privileges).filter(
      (privilege) =>
        privilege !== "StationCreate" &&
        privilege !== "StationDelete" &&
        privilege !== "StationUpdate" &&
        privilege !== "StationView" &&
        privilege !== "AuditManager" &&
        privilege !== "StationDriverManagement" &&
        privilege !== "RegionalDriverManagement" &&
        privilege !== "DriverManagementCashier" &&
        privilege !== "ViewRegionalAnalytics"
    );
  }),
  getAll: roleViewProcedure.query(async ({ ctx }) => {
    console.log(!ctx.session.user.role.privileges.includes("StationCreate"));

    const roles = await db.role.findMany({
      where: {
        ...(!ctx.session.user.role.privileges.includes("StationCreate") && {
          NOT: {
            privileges: {
              hasSome: [
                "StationCreate",
                "StationUpdate",
                // "StationView",
                "StationDelete",
                "RegionalDriverManagement",
                "StationDriverManagement",
                "DriverManagementCashier",
              ],
            },
          },
        }),
        is_deleted: false,
      },
      select: {
        id: true,
        creator: true,
        name: true,
        privileges: true,
      },
    });
    return roles;
  }),
  delete: roleDeleteProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.role.update({
        where: {
          id: input.id,
        },
        data: {
          is_deleted: true,
        },
      });
      return;
    }),
});

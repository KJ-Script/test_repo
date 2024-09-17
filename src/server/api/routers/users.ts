import { db } from "@/lib/db";
import {
  createTRPCRouter,
  protectedProcedure,
  userCreateProcedure,
  userDeleteProcedure,
  userUpdateProcedure,
  userViewProcedure,
  viewCashiersProcedure,
} from "@/server/trpc";
import { any, number, z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { Privileges } from "@prisma/client";

export const userRouter = createTRPCRouter({
  getAll: userViewProcedure.query(async ({ ctx }) => {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone_number: true,
        station_id: true,
        role: true,
      },
      where: {
        is_deleted: false,
        NOT: {
          role: {
            privileges: {
              has: "StationCreate",
            },
          },
        },
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
    return users;
  }),
  getCashiers: viewCashiersProcedure.query(async ({ ctx }) => {
    if (!ctx?.session?.user?.station_id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone_number: true,
        station_id: true,
      },
      where: {
        is_deleted: false,
        ...(!ctx.session.user.role.privileges.includes("StationCreate") && {
          station_id: ctx.session.user.station_id,
        }),
        role: {
          NOT: {
            privileges: {
              has: Privileges.StationCreate,
            },
          },
          privileges: {
            has: Privileges.AcceptTicketerRequest,
          },
        },
      },
    });
    return users;
  }),
  getById: userViewProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone_number: true,
          station_id: true,
          role: true,
        },
      });
      return user;
    }),
  create: userCreateProcedure
    .input(
      z.object({
        firstName: z.string().min(2, {
          message: "First name must be at least 2 characters.",
        }),
        lastName: z.string().min(2, {
          message: "First name must be at least 2 characters.",
        }),
        phoneNumber: z.string().min(8, {
          message: "Phone number must be at least 8 characters.",
        }),
        role_id: z.number(),
        station_id: z.number(),
        email: z.string().email({
          message: "Invalid email address.",
        }),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const newUser = await db.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          role_id: input.role_id,
          first_name: input.firstName,
          last_name: input.lastName,
          phone_number: input.phoneNumber,
          station_id: input.station_id
            ? input.station_id
            : ctx.session.user.station_id,
        },
      });
      return { message: "New user created", user: newUser.id };
    }),

  updatePassword: protectedProcedure
    .input(
      z.object({
        current_password: z.string(),
        new_password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userToUpdate = await db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!userToUpdate) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const passwordMatch = await bcrypt.compare(
        input.current_password,
        userToUpdate.password
      );

      if (!passwordMatch) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Wrong current password!",
        });
      }
      const hashedPassword: string | null =
        input.new_password && (await bcrypt.hash(input.new_password, 10));

      await db.user.update({
        data: {
          password: hashedPassword,
        },
        where: {
          id: userToUpdate.id,
        },
      });
      return { message: "Password updated", user: userToUpdate.id };
    }),

  update: userUpdateProcedure
    .input(
      z.object({
        id: z.number(),
        station_id: z.any(),
        firstName: z.string(),
        lastName: z.string(),
        phoneNumber: z.string(),
        role_id: z.number(),
        email: z.string(),
        new_password: z.string(),
        current_password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userToUpdate = await db.user.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!userToUpdate) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      if (input.current_password && input.new_password) {
        const passwordMatch = await bcrypt.compare(
          input.current_password,
          userToUpdate.password
        );

        if (!passwordMatch) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }
      }
      const hashedPassword: string | null =
        input.new_password && (await bcrypt.hash(input.new_password, 10));

      const updatedUser = await db.user.update({
        // @ts-ignore
        data: {
          ...(input.email && { email: input.email }),
          ...(hashedPassword && { password: hashedPassword }),
          ...(input.role_id && { role_id: input.role_id }),
          ...(input.firstName && { first_name: input.firstName }),
          ...(input.lastName && { last_name: input.lastName }),
          ...(input.phoneNumber && { phone_number: input.phoneNumber }),
        },
        where: {
          id: input.id,
        },
      });
      return { message: "New user created", user: updatedUser.id };
    }),

  delete: userDeleteProcedure
    .input(
      z.object({
        id: z.number(),
        station_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.station_id !== input.station_id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const deleteUser = await db.user.update({
        where: {
          id: input.id,
        },
        data: {
          is_deleted: true,
        },
      });

      return { message: "User deleted" };
    }),
});

import { db } from "@/lib/db";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const vehicleLevelRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const vehicleLevels = await db.vehicleLevel.findMany({
      select: {
        id: true,
        name: true,
        level: true,
        description: true,
      },
      where: {
        is_deleted: false,
      },
    });
    return vehicleLevels;
  }),
  create: publicProcedure
    .input(
      z.object({
        level: z.number(),
        description: z.string().min(2, {
          message: "Description is required.",
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createVehicleLevel = await db.vehicleLevel.create({
        data: {
          name: input.description + " ደረጃ " + input.level,
          level: input.level,
          description: input.description,
        },
      });

      return {
        message: "New vehicle level created",
        station: createVehicleLevel.id,
      };
    }),
  update: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, {
          message: "Name is required.",
        }),
        level: z.number(),
        description: z.string().min(2, {
          message: "Description is required.",
        }),
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.vehicleLevel.update({
        data: {
          ...(input.name && { name: input.name }),
          ...(input.level && { level: input.level }),
          ...(input.description && { description: input.description }),
        },
        where: {
          id: input.id,
        },
      });
    }),

  // delete: publicProcedure
  //   .input(
  //     z.object({
  //       id: z.number(),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     await db.vehicleLevel.delete({
  //       where: {
  //         id: input.id,
  //       },
  //     });
  //     return { message: "Station deleted" };
  //   }),
});

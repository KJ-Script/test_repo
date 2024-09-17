import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { getServerAuthSession } from "@/server/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  headers: Headers;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
export const createInnerTRPCContext = async (opts: CreateContextOptions) => {
  const session = await getServerAuthSession();

  return {
    session,
    headers: opts.headers,
    db,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: { req: NextRequest }) => {
  // Fetch stuff that depends on the request

  return await createInnerTRPCContext({
    headers: opts.req.headers,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;
const { middleware } = t;

const enforceUserIsAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });
  if (!userDetail) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceAppAuth = middleware(async ({ ctx, next }) => {
  const headersList = headers();
  const authorization = headersList.get("authorization");
  if (!authorization) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const token = authorization.split(" ")[1];
  if (!process.env.APP_AUTH_TOKEN) {
    throw new Error("No app auth token provided");
  }
  const payload = jwt.verify(token, process.env.APP_AUTH_TOKEN);
  if (!payload) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  console.log(payload);

  const user = await db.user.findUnique({
    where: {
      //@ts-ignore
      id: payload.user_id,
    },
    include: {
      station: true,
    },
  });

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      user,
      station_id: user?.station_id,
      station: user.station,
    },
  });
});

const enforceStationCreatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("StationCreate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceStationViewPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
      station: true,
    },
  });

  if (!userDetail?.role.privileges.includes("StationView")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceStationUpdatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("StationUpdate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceStationDeletePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("StationDelete")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceVehicleCreatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("VehicleCreate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceVehicleViewPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("VehicleView")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceVehicleUpdatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("VehicleUpdate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceVehicleDeletePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("VehicleDelete")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceRouteCreatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("RouteCreate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceRouteViewPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
      station: true,
    },
  });

  if (!userDetail?.role.privileges.includes("RouteView")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceRouteUpdatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("RouteUpdate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceRouteDeletePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("RouteDelete")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforcePriceCreatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("PriceCreate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforcePriceViewPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("PriceView")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforcePriceUpdatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("PriceUpdate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforcePriceDeletePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("PriceDelete")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceProviderCreatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("ProviderCreate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceProviderViewPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
      station: true,
    },
  });

  if (!userDetail?.role.privileges.includes("ProviderView")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceProviderUpdatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("ProviderUpdate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceProviderDeletePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("ProviderDelete")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceUserCreatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("UserCreate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceUserViewPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
      station: true,
    },
  });

  if (!userDetail?.role.privileges.includes("UserView")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceUserUpdatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("UserUpdate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceUserDeletePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("UserDelete")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceRoleCreatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("RoleCreate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceRoleViewPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("RoleView")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceRoleUpdatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("RoleUpdate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceRoleDeletePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("RoleDelete")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceScheduleCreatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("ScheduleCreate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceScheduleViewPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
      station: true,
    },
  });

  if (!userDetail?.role.privileges.includes("ScheduleView")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceScheduleUpdatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("ScheduleUpdate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceScheduleDeletePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("ScheduleDelete")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceQueueCreatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("QueueCreate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceQueueViewPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
      station: true,
    },
  });

  if (!userDetail?.role.privileges.includes("QueueView")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceQueueUpdatePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("QueueUpdate")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceQueueDeletePrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("QueueDelete")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceTicketBookPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("TicketBook")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceTicketReprintPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("TicketReprint")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceTicketExtraPrintPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("TicketExtraPrint")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforcePayDriverPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("PayDriver")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceRequestToCashierPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("RequestToCashier")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceViewCashiersPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("ViewCashiers")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceViewRequestToCashierHistoryPrivilege = middleware(
  async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const userDetail = await db.user.findUnique({
      where: {
        email: ctx.session.user.email,
      },
      select: {
        password: false,
        email: true,
        role: true,
        id: true,
        station_id: true,
      },
    });

    if (!userDetail?.role.privileges.includes("ViewRequestToCashierHistory")) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        session: { ...ctx.session, user: userDetail },
      },
    });
  }
);

const enforceAcceptTicketerRequestPrivilege = middleware(
  async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const userDetail = await db.user.findUnique({
      where: {
        email: ctx.session.user.email,
      },
      select: {
        password: false,
        email: true,
        role: true,
        id: true,
        station_id: true,
      },
    });

    if (!userDetail?.role.privileges.includes("AcceptTicketerRequest")) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        session: { ...ctx.session, user: userDetail },
      },
    });
  }
);
const enforceAuditTicketerPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("AuditTicketer")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});
const enforceAuditCashierPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("AuditCashier")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});
const enforceAuditManagerPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
    },
  });

  if (!userDetail?.role.privileges.includes("AuditManager")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});
const enforceViewAnalyticsPrivilege = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userDetail = await db.user.findUnique({
    where: {
      email: ctx.session.user.email,
    },
    select: {
      password: false,
      email: true,
      role: true,
      id: true,
      station_id: true,
      station: true,
    },
  });

  if (
    !userDetail?.role.privileges.includes("ViewFinanceAnalytics") &&
    !userDetail?.role.privileges.includes("ViewRegionalAnalytics")
  ) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: userDetail },
    },
  });
});

const enforceRegionalOrStationAnalyticsPrivilege = middleware(
  async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const userDetail = await db.user.findUnique({
      where: {
        email: ctx.session.user.email,
      },
      select: {
        station: true,
        password: false,
        email: true,
        role: true,
        id: true,
        station_id: true,
      },
    });

    if (
      !(
        userDetail?.role.privileges.includes("ViewRegionalAnalytics") ||
        userDetail?.role.privileges.includes("ViewFinanceAnalytics")
      )
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        session: { ...ctx.session, user: userDetail },
      },
    });
  }
);

const enforceViewRegionalAnalyticsPrivilege = middleware(
  async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user || !ctx.session.user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const userDetail = await db.user.findUnique({
      where: {
        email: ctx.session.user.email,
      },
      select: {
        password: false,
        email: true,
        role: true,
        id: true,
        station_id: true,
        station: true,
      },
    });

    if (!userDetail?.role.privileges.includes("ViewRegionalAnalytics")) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        session: { ...ctx.session, user: userDetail },
      },
    });
  }
);

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

export const stationCreateProcedure = t.procedure.use(
  enforceStationCreatePrivilege
);
export const stationViewProcedure = t.procedure.use(
  enforceStationViewPrivilege
);
export const stationUpdateProcedure = t.procedure.use(
  enforceStationUpdatePrivilege
);
export const stationDeleteProcedure = t.procedure.use(
  enforceStationDeletePrivilege
);

export const vehicleCreateProcedure = t.procedure.use(
  enforceVehicleCreatePrivilege
);
export const vehicleViewProcedure = t.procedure.use(
  enforceVehicleViewPrivilege
);
export const vehicleUpdateProcedure = t.procedure.use(
  enforceVehicleUpdatePrivilege
);
export const vehicleDeleteProcedure = t.procedure.use(
  enforceVehicleDeletePrivilege
);

export const routeCreateProcedure = t.procedure.use(
  enforceRouteCreatePrivilege
);
export const routeViewProcedure = t.procedure.use(enforceRouteViewPrivilege);
export const routeUpdateProcedure = t.procedure.use(
  enforceRouteUpdatePrivilege
);
export const routeDeleteProcedure = t.procedure.use(
  enforceRouteDeletePrivilege
);

export const priceCreateProcedure = t.procedure.use(
  enforcePriceCreatePrivilege
);
export const priceViewProcedure = t.procedure.use(enforcePriceViewPrivilege);
export const priceUpdateProcedure = t.procedure.use(
  enforcePriceUpdatePrivilege
);
export const priceDeleteProcedure = t.procedure.use(
  enforcePriceDeletePrivilege
);

export const providerCreateProcedure = t.procedure.use(
  enforceProviderCreatePrivilege
);
export const providerViewProcedure = t.procedure.use(
  enforceProviderViewPrivilege
);
export const providerUpdateProcedure = t.procedure.use(
  enforceProviderUpdatePrivilege
);
export const providerDeleteProcedure = t.procedure.use(
  enforceProviderDeletePrivilege
);

export const userCreateProcedure = t.procedure.use(enforceUserCreatePrivilege);
export const userViewProcedure = t.procedure.use(enforceUserViewPrivilege);
export const userUpdateProcedure = t.procedure.use(enforceUserUpdatePrivilege);
export const userDeleteProcedure = t.procedure.use(enforceUserDeletePrivilege);

export const roleCreateProcedure = t.procedure.use(enforceRoleCreatePrivilege);
export const roleViewProcedure = t.procedure.use(enforceRoleViewPrivilege);
export const roleUpdateProcedure = t.procedure.use(enforceRoleUpdatePrivilege);
export const roleDeleteProcedure = t.procedure.use(enforceRoleDeletePrivilege);

export const scheduleCreateProcedure = t.procedure.use(
  enforceScheduleCreatePrivilege
);
export const scheduleViewProcedure = t.procedure.use(
  enforceScheduleViewPrivilege
);
export const scheduleUpdateProcedure = t.procedure.use(
  enforceScheduleUpdatePrivilege
);
export const scheduleDeleteProcedure = t.procedure.use(
  enforceScheduleDeletePrivilege
);

export const queueCreateProcedure = t.procedure.use(
  enforceQueueCreatePrivilege
);
export const queueViewProcedure = t.procedure.use(enforceQueueViewPrivilege);
export const queueUpdateProcedure = t.procedure.use(
  enforceQueueUpdatePrivilege
);
export const queueDeleteProcedure = t.procedure.use(
  enforceQueueDeletePrivilege
);

export const ticketBookProcedure = t.procedure.use(enforceTicketBookPrivilege);
export const ticketReprintProcedure = t.procedure.use(
  enforceTicketReprintPrivilege
);
export const ticketExtraPrintProcedure = t.procedure.use(
  enforceTicketExtraPrintPrivilege
);

export const payDriverProcedure = t.procedure.use(enforcePayDriverPrivilege);

export const requestToCashierProcedure = t.procedure.use(
  enforceRequestToCashierPrivilege
);

export const viewCashiersProcedure = t.procedure.use(
  enforceViewCashiersPrivilege
);

export const viewRequestToCashierHistoryProcedure = t.procedure.use(
  enforceViewRequestToCashierHistoryPrivilege
);

export const acceptTicketerRequestProcedure = t.procedure.use(
  enforceAcceptTicketerRequestPrivilege
);

export const auditTicketerProcedure = t.procedure.use(
  enforceAuditTicketerPrivilege
);
export const auditCashierProcedure = t.procedure.use(
  enforceAuditCashierPrivilege
);
export const viewAnalyticsProcedure = t.procedure.use(
  enforceViewAnalyticsPrivilege
);

export const viewRegionalAnalyticsProcedure = t.procedure.use(
  enforceViewRegionalAnalyticsPrivilege
);

export const viewRegionalOrStationAnalyticsProcedure = t.procedure.use(
  enforceRegionalOrStationAnalyticsPrivilege
);
export const auditManagerProcedure = t.procedure.use(
  enforceAuditManagerPrivilege
);
export const appProtectedProcedure = t.procedure.use(enforceAppAuth);

// export const managerProcedure = t.procedure.use(isManager);
// export const adminProcedure = t.procedure.use(isManagerOrAbove);
// export const superAdminProcedure = t.procedure.use(isSuperAdmin);

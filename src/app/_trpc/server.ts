import { AppRouter, appRouter } from "@/server/api/root";
import {
  createTRPCProxyClient,
  loggerLink,
  TRPCClientError,
} from "@trpc/client";
import { callProcedure } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { createTRPCContext } from "@/server/trpc";
import { NextRequest } from "next/server";
import { cookies, headers } from "next/headers";
import { transformer } from "./shared";

// Create a mock NextRequest object
const createMockRequest = (): NextRequest => {
  return {
    headers: headers(),
    cookies: cookies(),
  } as unknown as NextRequest;
};

export const serverApi = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    () => {
      return ({ op }) => {
        return observable((observer) => {
          const mockReq = createMockRequest();
          createTRPCContext({ req: mockReq })
            .then((ctx) => {
              return callProcedure({
                procedures: appRouter._def.procedures,
                path: op.path,
                rawInput: op.input,
                ctx,
                type: op.type,
              });
            })
            .then((data) => {
              observer.next({ result: { data } });
              observer.complete();
            })
            .catch((cause) => {
              observer.error(TRPCClientError.from(cause));
            });
        });
      };
    },
  ],
});

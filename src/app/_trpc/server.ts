import {
  createTRPCProxyClient,
  httpLink,
  loggerLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { cookies } from "next/headers";

import { type AppRouter } from "@/server/api/root";
import { getUrl, transformer } from "./shared";

export const serverApi = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    httpLink({
      url: getUrl(),
      headers() {
        return {
          cookie: cookies().toString(),
          "x-trpc-source": "rsc",
        };
      },
    }),
  ],
});

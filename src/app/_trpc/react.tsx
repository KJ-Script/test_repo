"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  httpLink,
  loggerLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";

import { type AppRouter } from "@/server/api/root";
import { getUrl, transformer } from "./shared";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export const clientApi = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: {
  children: React.ReactNode;
  cookies: string;
  session: Session;
}) {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    clientApi.createClient({
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
              cookie: props.cookies,
              "x-trpc-source": "react",
            };
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={props.session}>
        <clientApi.Provider client={trpcClient} queryClient={queryClient}>
          {props.children}
        </clientApi.Provider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

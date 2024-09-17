import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cookies } from "next/headers";
import { TRPCReactProvider } from "../_trpc/react";
import { Session, getServerSession } from "next-auth";
import { SiteHeader } from "@/components/layouts/header/header";
import { Shell } from "@/components/shells/shell";
import { authOptions } from "@/server/auth";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SocketProvider } from "@/providers/socket-provider";
import Head from "next/head";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ETrip",
  description: "ETrip",
};

export default async function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Analytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <TRPCReactProvider session={session} cookies={cookies().toString()}>
            <SocketProvider>
              <SiteHeader />
              <Shell>{children}</Shell>
            </SocketProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

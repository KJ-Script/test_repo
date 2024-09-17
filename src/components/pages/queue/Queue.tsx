import React from "react";
import { serverApi } from "@/app/_trpc/server";
import QueueTable from "./tables/QueueTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCsrfToken } from "next-auth/react";

const QueueContent = async () => {
  const headersList = headers();
  const csrfToken = await getCsrfToken();

  let initialData: Awaited<
    ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>
  > = [];
  let routes: Awaited<
    ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>
  > = [];
  const session: any = await getServerSession(authOptions);

  try {
    initialData = await serverApi.queue.getToday.query();
    routes = await serverApi.route.getAll.query();
  } catch (e) {
    console.log(e);
  }

  if (!session || !session.user) {
    redirect("/signin");
  }

  return (
    <div className="w-full">
      <QueueTable
        initialData={initialData}
        routes={routes}
        session={session}
        csrfToken={csrfToken}
      />
    </div>
  );
};

export default QueueContent;

import React from "react";
import { serverApi } from "@/app/_trpc/server";
import RouteTable from "./tables/RouteTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

const RouteContent = async () => {
  let routes: Awaited<
    ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>
  > = [];
  let session: any;
  try {
    session = await getServerSession(authOptions);
    routes = await serverApi.route.getAll.query();
  } catch (e) {}

  return (
    <div className="w-full">
      <RouteTable initialData={routes} session={session} />
    </div>
  );
};

export default RouteContent;

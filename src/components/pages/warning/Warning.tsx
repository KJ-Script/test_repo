import React from "react";
import { serverApi } from "@/app/_trpc/server";
import WarningTable from "./tables/WarningTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { subDays } from "date-fns";
import { PlateCountItem } from "@/server/api/routers/schedule";

const WarningContent = async () => {
  let initialData: PlateCountItem[] = [];
  let route: Awaited<
    ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>
  > = [];

  let session: any;
  try {
    session = await getServerSession(authOptions);
    route = await serverApi.route.getAll.query();
    initialData = await serverApi.schedule.getWarningPerRoute.query({
      //@ts-ignore
      from: subDays(new Date(Date.now()), 1),
      to: new Date(Date.now()),
      route_id: route[0]?.id,
      station_id: session.user.image.station.id,
    });
  } catch (e) {
    console.log(e);
  }

  return (
    <div className="w-full">
      <WarningTable route={route} initialData={initialData} session={session} />
    </div>
  );
};

export default WarningContent;

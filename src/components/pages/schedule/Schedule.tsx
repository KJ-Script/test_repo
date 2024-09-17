import React from "react";
import { serverApi } from "@/app/_trpc/server";
import ScheduleTable from "./tables/ScheduleTable";

const ScheduleContent = async () => {
  let schedule: Awaited<
    ReturnType<(typeof serverApi)["schedule"]["getAll"]["query"]>
  > = [];
  let routes: Awaited<
    ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>
  > = [];
  try {
    schedule = await serverApi.schedule.getAll.query();
    routes = await serverApi.route.getAll.query();
  } catch (e) {
    console.log("error fetching schedule data", e);
  }

  return (
    <div className="w-full">
      <ScheduleTable initialData={schedule} routes={routes} />
    </div>
  );
};

export default ScheduleContent;

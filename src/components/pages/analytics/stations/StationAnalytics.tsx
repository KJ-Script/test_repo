import { serverApi } from "@/app/_trpc/server";
import React from "react";
import StationFilter from "./layout/StationFilter";

const StationAnalytics = async () => {
  let stations: Awaited<
    ReturnType<(typeof serverApi)["station"]["getAll"]["query"]>
  > = [];
  try {
    stations = await serverApi.station.getAll.query();
  } catch (e) {
    console.log("error fetching stations", e);
  }
  return <StationFilter initialData={stations} />;
};

export default StationAnalytics;

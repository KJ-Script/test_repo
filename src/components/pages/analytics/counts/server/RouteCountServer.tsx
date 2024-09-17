import React from "react";
import RoutesCoveredCountSkeleton from "../skeletons/RoutesCoveredCountSkeleton";
import RoutesCount from "../RoutesCount";
import { serverApi } from "@/app/_trpc/server";

const RouteCountServer = async () => {
  let initialData;
  try {
    initialData = await serverApi.analytics.getRoutesCoveredToday.query();
    return <RoutesCount routesCoveredToday={initialData} />;
  } catch (e) {
    console.log(e);
    return <RoutesCoveredCountSkeleton />;
  }
};

export default RouteCountServer;

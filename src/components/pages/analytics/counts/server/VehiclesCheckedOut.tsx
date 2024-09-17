import React from "react";
import VehiclesCheckedOutSkeleton from "./VehiclesCheckedOutSkeleton";
import { serverApi } from "@/app/_trpc/server";
import VehiclesCheckedOut_Count from "../VehiclesCount";

const VehiclesCheckedOutServer = async () => {
  let initialData;
  try {
    initialData = await serverApi.analytics.getVehiclesCheckedOutCount.query();

    return <VehiclesCheckedOut_Count vehiclesOutCount={initialData} />;
  } catch (e) {
    console.log(e);
    return <VehiclesCheckedOutSkeleton />;
  }
};

export default VehiclesCheckedOutServer;

import React from "react";
import VehiclesServedDiagram from "../VehiclesServedDiagram";
import { serverApi } from "@/app/_trpc/server";

const VehicleServedServer = async () => {
  // let initialData;
  try {
    // initialData = await serverApi.analytics.getVehiclesServedRatio.query();
    return <VehiclesServedDiagram initialData={undefined} />;
  } catch (e) {
    console.log(e);
    return <div></div>;
  }
};

export default VehicleServedServer;

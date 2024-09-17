"use server";
import React from "react";
import VehicleTable from "./tables/VehicleTable";
import { serverApi } from "@/app/_trpc/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

const VehicleContent = async () => {
  let count = 2;
  let vehicles: Awaited<
    ReturnType<(typeof serverApi)["vehicle"]["getAll"]["query"]>
  > = [];
  let session;
  try {
    session = await getServerSession(authOptions);
    vehicles = await serverApi.vehicle.getAll.query();
  } catch (e) {
    console.log("error fetching vehicles", e);
  }

  return (
    <div className="w-full">
      <VehicleTable initialData={vehicles} session={session} />
    </div>
  );
};

export default VehicleContent;

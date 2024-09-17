import React from "react";
import { serverApi } from "@/app/_trpc/server";
import StationTable from "./tables/StationTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { redirect } from "next/navigation";

const StationContent = async () => {
  let session;
  try {
    session = await getServerSession(authOptions);

    const user = await serverApi.user.getById.query({
      id: Number(session?.user.id),
    });

    if (!user?.role.privileges.includes("StationView")) {
      redirect("/");
    }
  } catch (e) {
    console.log(e);
  }
  let stations: Awaited<
    ReturnType<(typeof serverApi)["station"]["getAll"]["query"]>
  > = [];
  try {
    stations = await serverApi.station.getAll.query();
  } catch (e) {
    console.log("error fetching stations", e);
  }
  return (
    <div className="w-full">
      <StationTable initialData={stations} session={session} />
    </div>
  );
};

export default StationContent;

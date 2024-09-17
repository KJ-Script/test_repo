import React from "react";
import { serverApi } from "@/app/_trpc/server";
import JourneyHistoryTable from "./tables/JourneyHistoryTable";
import { subDays } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { redirect } from "next/navigation";

const JourneyHistoryContent = async () => {
  const session: any = await getServerSession(authOptions);
  let currentStation = session.user.image.station.id;
  const type = session?.user?.image?.role?.privileges.includes(
    "ViewRegionalAnalytics"
  )
    ? "regional"
    : "station";

  return (
    <div className="w-full">
      <JourneyHistoryTable currentStation={currentStation} type={type} />
    </div>
  );
};

export default JourneyHistoryContent;

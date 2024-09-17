import { serverApi } from "@/app/_trpc/server";
import React from "react";
import MonthlyStationRanking from "../MonthlyStationRanking";

const MonthlyStationRankingServer = async () => {
  // let initialData;
  try {
    // initialData = await serverApi.analytics.getMonthlyStationsRanking.query();
    return <MonthlyStationRanking initialData={undefined} />;
  } catch (e) {
    console.log(e);
    return <div></div>;
  }
};

export default MonthlyStationRankingServer;

import { serverApi } from "@/app/_trpc/server";
import React from "react";
import PassengersCount from "../PassengersCount";
import { headers } from "next/headers";

const PassengersCountServer = async () => {
  let dailyTicket;
  try {
    dailyTicket = await serverApi.analytics.getTotalPassengersToday.query();
    return <PassengersCount dailyPassengersCount={dailyTicket} />;
  } catch (e) {}
};

export default PassengersCountServer;

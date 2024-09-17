import React from "react";
import PassengerHistoryTable from "./_components/PassengerHistoryTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

const PassengerHistory = async () => {
  const session: any = await getServerSession(authOptions);

  return <PassengerHistoryTable session={session} />;
};

export default PassengerHistory;

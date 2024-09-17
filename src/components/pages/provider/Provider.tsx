import React from "react";
import { serverApi } from "@/app/_trpc/server";
import ProviderTable from "./tables/ProviderTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

const ProviderContent = async () => {
  let providers: Awaited<
    ReturnType<(typeof serverApi)["provider"]["getAll"]["query"]>
  > = [];
  let session;
  try {
    session = await getServerSession(authOptions);
    providers = await serverApi.provider.getAll.query();
  } catch (e) {
    console.log("couldn't fetch providers", e);
  }

  return (
    <div className="w-full">
      <ProviderTable initialData={providers} session={session} />
    </div>
  );
};

export default ProviderContent;

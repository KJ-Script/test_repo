import { serverApi } from "@/app/_trpc/server";
import ProviderContent from "@/components/pages/provider/Provider";
import ProviderTableSkeleton from "@/components/pages/provider/sekeletons/ProviderTableSkeleton";
import React, { Suspense } from "react";

const Provider = async () => {
  return (
    <Suspense fallback={<ProviderTableSkeleton />}>
      <ProviderContent />
    </Suspense>
  );
};

export default Provider;

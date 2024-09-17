import { serverApi } from "@/app/_trpc/server";
import RouteContent from "@/components/pages/route/Route";
import RouteTableSkeleton from "@/components/pages/route/sekeletons/RouteTableSkeleton";
import React, { Suspense } from "react";

const Route = async () => {
  return (
    <Suspense fallback={<RouteTableSkeleton />}>
      <RouteContent />
    </Suspense>
  );
};

export default Route;

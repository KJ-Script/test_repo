import TicketerRequestsContent from "@/components/pages/ticketers-request-history/TicketerRequests";
import TicketerRequestsTableSkeleton from "@/components/pages/ticketers-request-history/sekeletons/TicketerRequestsTableSkeleton";
import React, { Suspense } from "react";

const TicketerRequests = () => {
  return (
    <Suspense fallback={<TicketerRequestsTableSkeleton />}>
      <TicketerRequestsContent />
    </Suspense>
  );
};

export default TicketerRequests;

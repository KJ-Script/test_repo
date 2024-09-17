import RequestToCashier from "@/components/pages/requests-to-cashier/RequestToCashier";
import RequestToCashierTableSkeleton from "@/components/pages/requests-to-cashier/sekeletons/RequestToCashierTableSkeleton";
import React, { Suspense } from "react";

const RequestToCashierHistory = () => {
  return (
    <Suspense fallback={<RequestToCashierTableSkeleton />}>
      <RequestToCashier />
    </Suspense>
  );
};

export default RequestToCashierHistory;

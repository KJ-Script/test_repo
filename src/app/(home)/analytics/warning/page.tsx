import QueueTableSkeleton from "@/components/pages/queue/sekeletons/QueueTableSkeleton";
import WarningContent from "@/components/pages/warning/Warning";
import React, { Suspense } from "react";

const Warning = () => {
  return (
    <Suspense fallback={<QueueTableSkeleton />}>
      <WarningContent />
    </Suspense>
  );
};

export default Warning;

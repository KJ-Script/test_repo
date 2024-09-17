import { serverApi } from "@/app/_trpc/server";
import JourneyHistoryContent from "@/components/pages/journey-history/JourneyHistory";
import QueueContent from "@/components/pages/queue/Queue";
import QueueTableSkeleton from "@/components/pages/queue/sekeletons/QueueTableSkeleton";
import React, { Suspense } from "react";

const JourneyHistory = async () => {
  return (
    <Suspense fallback={<QueueTableSkeleton />}>
      <JourneyHistoryContent />
    </Suspense>
  );
};

export default JourneyHistory;

import { serverApi } from "@/app/_trpc/server";
import QueueContent from "@/components/pages/queue/Queue";
import QueueTableSkeleton from "@/components/pages/queue/sekeletons/QueueTableSkeleton";
import React, { Suspense } from "react";
import { headers } from "next/headers";

const Queue = async () => {
  const headersList = headers();
  return (
    <Suspense fallback={<QueueTableSkeleton />}>
      <QueueContent />
    </Suspense>
  );
};

export default Queue;

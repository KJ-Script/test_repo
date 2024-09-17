import ScheduleContent from "@/components/pages/schedule/Schedule";
import ScheduleTableSkeleton from "@/components/pages/schedule/sekeletons/ScheduleTableSkeleton";
import React, { Suspense } from "react";

const Schedule = async () => {
  return (
    <Suspense fallback={<ScheduleTableSkeleton />}>
      <ScheduleContent />
    </Suspense>
  );
};

export default Schedule;

import AuditTicketerContent from "@/components/pages/audit-ticketer/AuditTicketerContent";
import AuditTicketerTableSkeleton from "@/components/pages/audit-ticketer/sekeletons/AuditTicketerTableSkeleton";
import React, { Suspense } from "react";

const AuditTicketer = () => {
  return (
    <Suspense fallback={<AuditTicketerTableSkeleton />}>
      <AuditTicketerContent />
    </Suspense>
  );
};

export default AuditTicketer;

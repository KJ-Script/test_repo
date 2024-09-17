import AuditCashierContent from "@/components/pages/audit-cashier/AuditCashierContent";
import AuditCashierTableSkeleton from "@/components/pages/audit-cashier/sekeletons/AuditCashierTableSkeleton";
import React, { Suspense } from "react";

const AuditCashiers = () => {
  return (
    <Suspense fallback={<AuditCashierTableSkeleton />}>
      <AuditCashierContent />
    </Suspense>
  );
};

export default AuditCashiers;

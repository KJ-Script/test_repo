import RoleContent from "@/components/pages/role/Role";
import RoleTableSkeleton from "@/components/pages/role/sekeletons/RoleTableSkeleton";
import React, { Suspense } from "react";

const Role = () => {
  return (
    <Suspense fallback={<RoleTableSkeleton />}>
      <RoleContent />
    </Suspense>
  );
};

export default Role;

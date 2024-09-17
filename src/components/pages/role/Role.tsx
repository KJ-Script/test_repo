import React from "react";
import { serverApi } from "@/app/_trpc/server";
import RoleTable from "./tables/RoleTable";

const RoleContent = async () => {
  let initialData: Awaited<
    ReturnType<(typeof serverApi)["role"]["getAll"]["query"]>
  > = [];

  try {
    initialData = await serverApi.role.getAll.query();
  } catch (e) {
    console.log(e);
  }
  return (
    <div className="w-full">
      <RoleTable initialData={initialData} />
    </div>
  );
};

export default RoleContent;

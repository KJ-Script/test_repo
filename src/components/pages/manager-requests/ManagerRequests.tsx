import { serverApi } from "@/app/_trpc/server";
import RequestToCashierTable from "./tables/ManagerRequestsTable";
import ManagerRequestsTable from "./tables/ManagerRequestsTable";

const ManagerRequestsData = async () => {
  return (
    <div className="w-full">
      <ManagerRequestsTable />
    </div>
  );
};

export default ManagerRequestsData;

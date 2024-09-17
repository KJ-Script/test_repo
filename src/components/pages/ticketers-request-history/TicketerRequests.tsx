import { serverApi } from "@/app/_trpc/server";
import AuditTicketerTable from "./tables/TicketerRequestsTable";
import TicketerRequestsTable from "./tables/TicketerRequestsTable";

const TicketerRequestsContent = async () => {
  let requestHistory: Awaited<
    ReturnType<
      (typeof serverApi)["transaction"]["requestsForSpecificCashier"]["query"]
    >
  > = [];

  try {
    requestHistory =
      await serverApi.transaction.ticketerToCashierRequestHistory.query();
  } catch (e) {}

  return (
    <div className="w-full">
      <TicketerRequestsTable initialData={requestHistory} />
    </div>
  );
};

export default TicketerRequestsContent;

import { serverApi } from "@/app/_trpc/server";
import RequestToCashierTable from "./tables/RequestToCashierTable";

const RequestToCashier = async () => {
  let requestHistory: Awaited<
    ReturnType<
      (typeof serverApi)["transaction"]["ticketerToCashierRequestHistory"]["query"]
    >
  > = [];

  try {
    requestHistory =
      await serverApi.transaction.ticketerToCashierRequestHistory.query();
  } catch (e) {}

  return (
    <div className="w-full">
      <RequestToCashierTable initialData={requestHistory} />
    </div>
  );
};

export default RequestToCashier;

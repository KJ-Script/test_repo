import { serverApi } from "@/app/_trpc/server";
import AuditTicketerTable from "./tables/AuditCashierTable";

const AuditCashierContent = async () => {
  let auditHistory: Awaited<
    ReturnType<
      (typeof serverApi)["transaction"]["auditCashierDailyHistory"]["query"]
    >
  > = [];

  try {
    auditHistory = await serverApi.transaction.auditCashierDailyHistory.query();
  } catch (e) {}

  return (
    <div className="w-full">
      <AuditTicketerTable initialData={auditHistory} />
    </div>
  );
};

export default AuditCashierContent;

import { serverApi } from "@/app/_trpc/server";
import AuditTicketerTable from "./tables/AuditTicketerTable";

const AuditTicketerContent = async () => {
  let auditHistory: Awaited<
    ReturnType<
      (typeof serverApi)["transaction"]["auditTicketerDailyHistory"]["query"]
    >
  > = [];

  try {
    auditHistory =
      await serverApi.transaction.auditTicketerDailyHistory.query();
  } catch (e) {
    console.log(e);
  }

  return (
    <div className="w-full">
      <AuditTicketerTable initialData={auditHistory || []} />
    </div>
  );
};

export default AuditTicketerContent;

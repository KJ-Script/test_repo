import { serverApi } from "@/app/_trpc/server";
import StationAnalytics from "@/components/pages/analytics/stations/StationAnalytics";
import StationContent from "@/components/pages/station/Station";
import StationTableSkeleton from "@/components/pages/station/sekeletons/StationTableSkeleton";
import { authOptions } from "@/server/auth";
import { Loader2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const Station = async () => {
  const session: any = await getServerSession(authOptions);

  // if (
  //   session?.user?.image?.role?.privileges.includes("ViewRegionalAnalytics")
  // ) {
  //   return (
  //     <Suspense fallback={<Loader2 className="animate-spin" />}>
  //       <StationAnalytics />
  //     </Suspense>
  //   );
  // }

  return (
    <Suspense fallback={<StationTableSkeleton />}>
      <StationContent />
    </Suspense>
  );
};

export default Station;

import { serverApi } from "@/app/_trpc/server";
import JourneyHistoryContent from "@/components/pages/journey-history/JourneyHistory";
import QueueContent from "@/components/pages/queue/Queue";
import QueueTableSkeleton from "@/components/pages/queue/sekeletons/QueueTableSkeleton";
import VehiclePerformanceContent from "@/components/pages/vehicle-performance/VehiclePerformance";
import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { redirect } from "next/navigation";
import AssociationReportFilter from "./_components/AssociationReportFilter";

const Association = async () => {
  const session: any = await getServerSession(authOptions);
  if (!session || !session?.user) {
    redirect("/signin");
  }
  let initialAssociation;

  try {
    const association = await db.provider.findMany({
      where: {
        creator: {
          //@ts-ignore
          station: {
            region: session.user.image.station.region,
          },
        },
      },
      take: 1,
    });
    initialAssociation = association[0].id;
  } catch (e) {
    console.log(e);
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-[80vh] flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <AssociationReportFilter initialAssociation={initialAssociation || 1} />
    </Suspense>
  );
};

export default Association;

import { serverApi } from "@/app/_trpc/server";
import JourneyHistoryContent from "@/components/pages/journey-history/JourneyHistory";
import QueueContent from "@/components/pages/queue/Queue";
import QueueTableSkeleton from "@/components/pages/queue/sekeletons/QueueTableSkeleton";
import VehiclePerformanceContent from "@/components/pages/vehicle-performance/VehiclePerformance";
import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";
import VehiclePerformanceFilter from "./_components/VehiclePerformanceFilter";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { redirect } from "next/navigation";

const VehiclePerformance = async () => {
  const session: any = await getServerSession(authOptions);
  if (!session || !session?.user) {
    redirect("/signin");
  }
  let initialPlateNumber = "";
  let region = "";
  let currentStation = session.user.image.station.id;

  try {
    const queue = await db.queue.findMany({
      where: {
        creator: {
          //@ts-ignore
          station: {
            region: session.user.image.station.region,
          },
        },
      },
      take: 1,
      select: {
        vehicle: true,
      },
    });
    initialPlateNumber = queue[0].vehicle.plate_number;
    region = queue[0].vehicle.region;
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
      <VehiclePerformanceFilter
        initialPlateNumber={initialPlateNumber}
        region={region}
        currentStation={currentStation}
      />
    </Suspense>
  );
};

export default VehiclePerformance;

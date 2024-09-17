"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation2 } from "lucide-react";
import RoutesCoveredCountSkeleton from "./skeletons/RoutesCoveredCountSkeleton";

const RoutesCount = async ({
  routesCoveredToday,
}: {
  routesCoveredToday: Awaited<
    ReturnType<
      (typeof serverApi)["analytics"]["getRoutesCoveredToday"]["query"]
    >
  >;
}) => {
  const getRoutes = clientApi.analytics.getRoutesCoveredToday.useQuery(
    undefined,
    {
      initialData: routesCoveredToday,
    }
  );

  if (getRoutes.isLoading) {
    return <RoutesCoveredCountSkeleton />;
  }

  return (
    <Card className="flex-1">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Navigation2 />
          <div className="flex flex-col">
            <span className="font-bold">
              {getRoutes?.data ? getRoutes?.data.length : 0}
            </span>
            <span className="text-gray-500">
              Route{getRoutes.data.length > 1 ? "s" : ""} Covered
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoutesCount;

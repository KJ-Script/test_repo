import { serverApi } from "@/app/_trpc/server";
import PassengersCount from "./PassengersCount";
import { Suspense } from "react";
import PassengerCountSkeleton from "./skeletons/PassengerCountSkeleton";
import RoutesCount from "./RoutesCount";
import RoutesCoveredCountSkeleton from "./skeletons/RoutesCoveredCountSkeleton";
import VehiclesCheckedOut_Count from "./VehiclesCount";

const Counts = async () => {
  let dailyTicket;
  let routesCoveredToday;
  let vehiclesOut;
  try {
    dailyTicket = await serverApi.analytics.getTotalPassengersToday.query();
    routesCoveredToday =
      await serverApi.analytics.getRoutesCoveredToday.query();
    vehiclesOut = await serverApi.analytics.getVehiclesCheckedOutCount.query();
  } catch (e) {
    console.log(e);
  }

  return (
    <div className="flex w-full">
      <Suspense fallback={<PassengerCountSkeleton />}>
        <PassengersCount dailyPassengersCount={dailyTicket || null} />
      </Suspense>
    </div>
  );
};

export default Counts;

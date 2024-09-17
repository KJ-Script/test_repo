import { serverApi } from "@/app/_trpc/server";
import { Suspense } from "react";
import PassengerCountSkeleton from "./counts/skeletons/PassengerCountSkeleton";
import PassengersCount from "./counts/PassengersCount";
import RoutesCoveredCountSkeleton from "./counts/skeletons/RoutesCoveredCountSkeleton";
import RoutesCount from "./counts/RoutesCount";
import VehiclesCheckedOut_Count from "./counts/VehiclesCount";
import CountsAreaChart from "./charts/CountsAreaChart";
import CountsPieChart from "./charts/CountsPieChart";
import StationsMap from "./map/Map";
import PassengerHistoryBarChart from "./charts/PassengerHistoryBarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PassengersOnEachStationText from "./cards/PassengersOnEachStationText";
import PassengerOnEachStationRadialBarChart from "./charts/PassengerOnEachStationRadialBarChart";
import { PassengerVsVehicleLineChart } from "./charts/PassengerVsVehicleLineChart";
import AllEmployees from "./cards/AllEmployees";
import VehiclesServedDiagram from "./cards/VehiclesServedDiagram";
import MonthlyStationRanking from "./cards/MonthlyStationRanking";
import VehiclesOnEachStation from "./cards/VehiclesOnEachStationText";
import VehiclesOnEachStationChart from "./cards/VehiclesOnEachStationChart";
import PassengersCountServer from "./counts/server/PassengersCountServer";
import CountsAreaChartSkeleton from "./charts/server/CountsAreaChartSkeleton";
import CountsAreaChartServer from "./charts/server/CountsAreaChartServer";
import RouteCountServer from "./counts/server/RouteCountServer";
import VehiclesCheckedOutServer from "./counts/server/VehiclesCheckedOut";
import VehiclesCheckedOutSkeleton from "./counts/server/VehiclesCheckedOutSkeleton";
import CountsPieChartServer from "./charts/server/CountsPieChartServer";
import PassengerHistoryBarChartServer from "./charts/server/PassengerHistoryBarChartServer";
import PassengerHistoryBarChartSkeleton from "./charts/server/PassengerHistoryBarChartSkeleton";
import PassengersOnEachStationServer from "./cards/server/PassengersOnEachStationServer";
import PassengersOnEachStationSkeleton from "./cards/server/PassengersOnEachStationSkeleton";
import PassengerOnEachStationRadialServer from "./charts/server/PassengerOnEachStationRadialServer";
import PassengerOnEachStationRadialSkeleton from "./charts/server/PassengerOnEachStationRadialSkeleton";
import PassengerVsVehicleServer from "./charts/server/PassengerVsVehicleServer";
import VehiclesOnEachStationServer from "./cards/server/VehiclesOnEachStationServer";
import VehiclesOnEachStationSkeleton from "./cards/server/VehiclesOnEachStationSkeleton";
import VehiclesOnEachStationChartSkeleton from "./cards/server/VehiclesOnEachStationChartSkeleton";
import VehicleOnEachStationChartServer from "./cards/server/VehicleOnEachStationChartServer";
import { Skeleton } from "@/components/ui/skeleton";
import AllEmployeeServer from "./cards/server/AllEmployeeServer";
import VehicleServedServer from "./cards/server/VehicleServedServer";
import { Loader2 } from "lucide-react";
import MonthlyStationRankingServer from "./cards/server/MonthlyStationRankingServer";
import { headers } from "next/headers";

const Analytics = async () => {
  const nonce = headers().get("x-nonce");

  let dailyTicket;
  let routesCoveredToday;
  let vehiclesOut;
  let counts;
  let passengerHistory: Awaited<
    ReturnType<
      (typeof serverApi)["analytics"]["filterTotalPassengers"]["query"]
    >
  > = [];

  return (
    <div className="w-full">
      {/* <div className="w-[87vw] overflow-hidden -z-10 h-[60vh]">
        <StationsMap />
      </div> */}
      <div className="z-10 mt-8 bg-inherit grid gap-5 md:grid-cols-2 grid-cols-1 items-start">
        <div className="flex flex-col gap-5">
          <Suspense fallback={<PassengerCountSkeleton />}>
            <PassengersCountServer />
          </Suspense>
          <div className="w-full h-[50vh] border rounded-lg my-2">
            <Suspense fallback={<CountsAreaChartSkeleton />}>
              <CountsAreaChartServer />
            </Suspense>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex gap-2">
            <Suspense fallback={<RoutesCoveredCountSkeleton />}>
              <RouteCountServer />
            </Suspense>
            <Suspense fallback={<VehiclesCheckedOutSkeleton />}>
              <VehiclesCheckedOutServer />
            </Suspense>
          </div>
          <div className="w-full h-[50vh] border rounded-lg my-2">
            <Suspense fallback={<CountsAreaChartSkeleton />}>
              <CountsPieChartServer />
            </Suspense>
          </div>
        </div>
      </div>
      <Suspense fallback={<PassengerHistoryBarChartSkeleton />}>
        <PassengerHistoryBarChartServer />
      </Suspense>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 my-4">
        <Suspense fallback={<PassengersOnEachStationSkeleton />}>
          <PassengersOnEachStationServer />
        </Suspense>
        <Suspense fallback={<PassengerOnEachStationRadialSkeleton />}>
          <PassengerOnEachStationRadialServer />
        </Suspense>
      </div>
      <Suspense fallback={<PassengerHistoryBarChartSkeleton />}>
        <PassengerVsVehicleServer />
      </Suspense>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 my-4">
        <Suspense fallback={<VehiclesOnEachStationSkeleton />}>
          <VehiclesOnEachStationServer />
        </Suspense>
        <Suspense fallback={<VehiclesOnEachStationChartSkeleton />}>
          <VehicleOnEachStationChartServer />
        </Suspense>
      </div>
      <Suspense fallback={<PassengerHistoryBarChartSkeleton />}>
        <AllEmployeeServer />
      </Suspense>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 my-4">
        <Card className="col-span-4 lg:col-span-3  space-y-4">
          <CardHeader>
            <CardTitle>Vehicles Serving vs Not Serving</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Loader2 className="animate-spin" />}>
              <VehicleServedServer />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-4  space-y-4">
          <CardHeader>
            <CardTitle>Monthly Station Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Loader2 className="animate-spin" />}>
              <MonthlyStationRankingServer />
            </Suspense>{" "}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

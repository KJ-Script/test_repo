import CountsAreaChart from "../CountsAreaChart";
import { serverApi } from "@/app/_trpc/server";
import CountsAreaChartSkeleton from "./CountsAreaChartSkeleton";

const CountsAreaChartServer = async () => {
  let initialData;
  try {
    // initialData = await serverApi.analytics.getStationDailyCounts.query();
    return <CountsAreaChart initialData={undefined} />;
  } catch (e) {
    console.log(e);
    return <CountsAreaChartSkeleton />;
  }
};

export default CountsAreaChartServer;

import { clientApi } from "@/app/_trpc/react";
import React, { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { renderActiveShape } from "../../charts/CountsPieChart";
import { colors, getRandomColor } from "@/lib/utils";
import { FilterDateKey } from "./StationAnalyticsCounts";
import { Loader2 } from "lucide-react";

const PassengerOnEachRoutePieChart = ({
  stationId,
  filterDateValue,
}: {
  stationId: number;
  filterDateValue: string;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: counts, isLoading } =
    clientApi.analytics.passengersOnEachRoute.useQuery({
      station_id: stationId,
      filterDate: filterDateValue,
    });

  const chart_data = counts?.length
    ? counts.map((station: any) => {
        return {
          name: station.destination_name,
          passengers: station.ticket_count,
          label: "passengers",
        };
      })
    : [];

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="h-[50vh]">
      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart width={400} height={400}>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chart_data}
              cx="50%"
              cy="50%"
              innerRadius={100}
              outerRadius={140}
              fill="#8884d8"
              dataKey="passengers"
              onMouseEnter={onPieEnter}
            >
              {chart_data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={getRandomColor(index)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PassengerOnEachRoutePieChart;

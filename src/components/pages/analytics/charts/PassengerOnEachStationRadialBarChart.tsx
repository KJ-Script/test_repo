"use client";
import { clientApi } from "@/app/_trpc/react";
import React, { useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { colors } from "@/lib/utils";
import { renderActiveShape } from "./CountsPieChart";
import PassengerOnEachStationRadialSkeleton from "./server/PassengerOnEachStationRadialSkeleton";

// const style = {
//   top: "50%",
//   right: 0,
//   transform: "translate(0, -50%)",
//   lineHeight: "24px",
// };

const PassengerOnEachStationRadialBarChart = ({
  initialData,
}: {
  initialData: any;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: counts, isLoading } =
    clientApi.analytics.getStationDailyCounts.useQuery(undefined, {
      initialData,
    });

  const stations = counts?.length
    ? counts.map((station: any, i: number) => {
        return {
          name: station.station_name,
          passengers: station.passengers_count,
          fill: colors[i],
          label: "passengers",
        };
      })
    : [];

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  if (isLoading) {
    return <PassengerOnEachStationRadialSkeleton />;
  }
  return (
    <div className="h-[50vh]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={stations}
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={140}
            fill="#8884d8"
            dataKey="passengers"
            onMouseEnter={onPieEnter}
          >
            {stations.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PassengerOnEachStationRadialBarChart;

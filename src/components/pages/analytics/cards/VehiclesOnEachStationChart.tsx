"use client";
import { clientApi } from "@/app/_trpc/react";
import { colors } from "@/lib/utils";
import React, { useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import { renderActiveShape } from "../charts/CountsPieChart";
import VehiclesOnEachStationChartSkeleton from "./server/VehiclesOnEachStationChartSkeleton";

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const style = {
  top: "50%",
  right: 0,
  transform: "translate(0, -50%)",
  lineHeight: "24px",
};

const VehiclesOnEachStationChart = ({ initialData }: { initialData: any }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: counts, isLoading } =
    clientApi.analytics.getStationDailyCounts.useQuery(undefined, {
      initialData,
    });

  const stations = counts?.length
    ? counts.map((station: any) => {
        return {
          name: station.station_name,
          value: station.vehicles.length,
          label: "vehicles",
        };
      })
    : [];
  const { data } = clientApi.analytics.getVehiclesServedRatio.useQuery();

  const chart_data = data ? data : [];
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  if (isLoading) {
    return <VehiclesOnEachStationChartSkeleton />;
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
            dataKey="value"
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

export default VehiclesOnEachStationChart;

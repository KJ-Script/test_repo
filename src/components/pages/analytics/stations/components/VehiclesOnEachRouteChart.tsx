"use client";
import { clientApi } from "@/app/_trpc/react";
import { colors, getRandomColor } from "@/lib/utils";
import React, { useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import { renderActiveShape } from "../../charts/CountsPieChart";
import { Loader2 } from "lucide-react";

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

const VehiclesOnEachRouteChart = ({
  stationId,
  filterDateValue,
}: {
  stationId: any;
  filterDateValue: string;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, isLoading } =
    clientApi.analytics.passengersOnEachRoute.useQuery({
      station_id: stationId,
      filterDate: filterDateValue,
    });

  const vehicles = data?.length
    ? data.map((route: any) => {
        return {
          name: route.destination_name,
          value: route.vehicles.length,
          label: "Vehicles",
        };
      })
    : [];

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart width={400} height={400}>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={vehicles}
              cx="50%"
              cy="50%"
              innerRadius={100}
              outerRadius={140}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {vehicles.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={getRandomColor(index)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default VehiclesOnEachRouteChart;

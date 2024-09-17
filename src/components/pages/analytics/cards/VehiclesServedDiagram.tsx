"use client";
import { clientApi } from "@/app/_trpc/react";
import { colors } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

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

const VehiclesServedDiagram = ({ initialData }: { initialData: any }) => {
  const { data, isLoading } =
    clientApi.analytics.getVehiclesServedRatio.useQuery(undefined, {
      initialData,
    });

  const chart_data = data ? data : [];
  if (isLoading) {
    return <Loader2 className="animate-spin" />;
  }
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart width={400} height={350}>
        <Pie
          data={chart_data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {chart_data.map((entry, index: number) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Legend layout="vertical" verticalAlign="top" align="right" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default VehiclesServedDiagram;

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
import { colors, getRandomColor } from "@/lib/utils";
import { renderActiveShape } from "../../charts/CountsPieChart";

const style = {
  top: "50%",
  right: 0,
  transform: "translate(0, -50%)",
  lineHeight: "24px",
};

const RoutesRadialBarChart = ({ stationId }: { stationId: number }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: routes } = clientApi.analytics.getRoutesForStation.useQuery({
    station_id: stationId,
  });
  const chart_data = routes?.length
    ? routes.map((station: any, i: number) => {
        return {
          name: station.destination_name,
          distance: station.distance,
          fill: colors[i],
          label: "KM",
        };
      })
    : [];

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="h-[50vh]">
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
            dataKey="distance"
            onMouseEnter={onPieEnter}
          >
            {chart_data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={getRandomColor(index)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RoutesRadialBarChart;

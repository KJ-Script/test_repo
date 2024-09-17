"use client";
import React, { PureComponent, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { DatePickerWithRange } from "../filter/DateRange";
import { Button } from "@/components/ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PassengerHistoryPDF from "../exports/PassengerHistoryPDF";
import { DateRange } from "react-day-picker";
import { addDays, subDays } from "date-fns";
import { clientApi } from "@/app/_trpc/react";
import { colors } from "@/lib/utils";
import { serverApi } from "@/app/_trpc/server";
import PassengerHistoryBarChartSkeleton from "./server/PassengerHistoryBarChartSkeleton";

const PassengerHistoryBarChart = ({ initialData }: { initialData: any }) => {
  const [date, setDate] = useState<DateRange>({
    //@ts-ignore
    from: subDays(new Date(Date.now()), 30),
    to: new Date(Date.now()),
  });

  const filteredCount =
    //@ts-ignore
    clientApi.analytics.filterTotalPassengers.useQuery(
      {
        from: date?.from,
        to: date?.to,
      },
      {
        initialData,
      }
    );

  let chart_data = filteredCount.data
    ? filteredCount.data.sort((a, b) => (a.date > b.date ? 1 : -1))
    : [];

  const getPath = (x: any, y: any, width: any, height: any) => {
    return `M${x},${y + height}C${x + width / 3},${y + height} ${
      x + width / 2
    },${y + height / 3}
    ${x + width / 2}, ${y}
    C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${
      x + width
    }, ${y + height}
    Z`;
  };

  const TriangleBar = (props: any) => {
    const { fill, x, y, width, height } = props;

    return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
  };

  if (filteredCount.isLoading) {
    return <PassengerHistoryBarChartSkeleton />;
  }
  return (
    <>
      <div className="flex items-end gap-2 mb-2">
        <DatePickerWithRange date={date} setDate={setDate} />
        <PDFDownloadLink
          document={
            <PassengerHistoryPDF
              history={chart_data}
              startDate={date?.from + ""}
              endDate={date?.to + ""}
            />
          }
        >
          <Button size="sm">Export</Button>
        </PDFDownloadLink>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          width={500}
          height={300}
          data={chart_data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis dataKey="date" />
          <YAxis />
          <Bar
            dataKey="ticket_count"
            fill="#8884d8"
            shape={<TriangleBar />}
            label={{ position: "top" }}
          >
            {chart_data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default PassengerHistoryBarChart;

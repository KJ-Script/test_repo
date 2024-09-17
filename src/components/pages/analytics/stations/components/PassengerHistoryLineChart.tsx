"use client";

import { clientApi } from "@/app/_trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DatePickerWithRange } from "../../filter/DateRange";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PassengerHistoryForStationPDF from "../../exports/PassengerHistoryForStationPDF";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { subDays } from "date-fns";
import { Loader2 } from "lucide-react";

export function PassengerHistoryLineChart({
  stationId,
}: {
  stationId: number;
}) {
  const [date, setDate] = useState<DateRange>({
    //@ts-ignore
    from: subDays(new Date(Date.now()), 30),
    to: new Date(Date.now()),
  });

  const filteredCount =
    //@ts-ignore
    clientApi.analytics.filterTotalPassengersForStation.useQuery({
      station_id: stationId,
      //@ts-ignore
      from: date?.from,
      //@ts-ignore
      to: date?.to,
    });

  const chartData = filteredCount.data
    ? filteredCount.data.map((d) => {
        return {
          date: d.date,
          passengers: d.ticket_count,
          vehicle_count: d.vehicles.length,
        };
      })
    : [];

  return (
    <Card className="col-span-7">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end space-y-1.5 p-6">
        <CardTitle>Passengers vs Vehicles</CardTitle>
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-2 mb-2">
          <DatePickerWithRange date={date} setDate={setDate} />
          <PDFDownloadLink
            document={
              <PassengerHistoryForStationPDF
                history={chartData}
                startDate={date?.from + ""}
                endDate={date?.to + ""}
              />
            }
          >
            <Button size="sm">Export</Button>
          </PDFDownloadLink>
        </div>
      </div>
      <CardContent className="pl-2">
        {filteredCount.isLoading ? (
          <div className="flex items-center justify-center h-[30vh]">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={chartData || []}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="passengers"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line type="monotone" dataKey="vehicle_count" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

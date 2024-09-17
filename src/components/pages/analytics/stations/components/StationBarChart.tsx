"use client";

import { clientApi } from "@/app/_trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { DatePickerWithRange } from "../../filter/DateRange";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PassengerHistoryForStationPDF from "../../exports/PassengerHistoryForStationPDF";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { subDays } from "date-fns";
import { Loader2 } from "lucide-react";

export function StationBarChart({ stationId }: { stationId: number }) {
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

  let chart_data = filteredCount.data
    ? filteredCount.data.sort((a, b) => (a.date > b.date ? 1 : -1))
    : [];

  return (
    <Card className="col-span-7">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end space-y-1.5 p-6">
        <CardTitle>Passenger History</CardTitle>
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-2 mb-2">
          <DatePickerWithRange date={date} setDate={setDate} />
          <PDFDownloadLink
            document={
              <PassengerHistoryForStationPDF
                history={chart_data}
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
            <BarChart data={chart_data}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Bar
                dataKey="ticket_count"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

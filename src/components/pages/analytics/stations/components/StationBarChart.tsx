"use client";

import { clientApi } from "@/app/_trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { DatePickerWithRange } from "../../filter/DateRange";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { subDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function StationBarChart({ stationId }: { stationId: number }) {
  const [date, setDate] = useState<DateRange>({
    //@ts-ignore
    from: subDays(new Date(Date.now()), 30),
    to: new Date(Date.now()),
  });
  const doc = new jsPDF();

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

  const exportPdf = () => {
    const header = [["Date", "Passengers"]];
    const data = chart_data.map((h) => [h.date, h.ticket_count]);
    const startD = `${date.from?.getFullYear()}-${
      date.from?.getMonth()! + 1
    }-${date.from?.getDate()}`;
    const endD = `${date.to?.getFullYear()}-${
      date.to?.getMonth()! + 1
    }-${date.to?.getDate()}`;
    const titleHeight = 20;

    doc.setFontSize(16);
    doc.text(`PassengerHistory from ${startD} to ${endD}`, 14, 15);
    doc.setFontSize(12);

    autoTable(doc, {
      head: header,
      //@ts-ignore
      body: data,
      startY: titleHeight,
    });
    if (!date?.from || !date?.to) {
      //@ts-ignore
      doc.save(`Journey_History_from_${filterDateValues[filterDate]}.pdf`);
      return;
    }

    //@ts-ignore
    doc.save(`Journey_History-${startD}-to-${endD}.pdf`);
  };

  return (
    <Card className="col-span-7">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end space-y-1.5 p-6">
        <CardTitle>Passenger History</CardTitle>
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-2 mb-2">
          <DatePickerWithRange date={date} setDate={setDate} />
          <Button onClick={exportPdf}>Export</Button>
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

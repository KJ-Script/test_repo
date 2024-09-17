"use client";
import { clientApi } from "@/app/_trpc/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

const MonthlyStationRanking = ({ initialData }: { initialData: any }) => {
  const { data: ranking, isLoading } =
    clientApi.analytics.getMonthlyStationsRanking.useQuery(undefined, {
      initialData,
    });
  if (isLoading) {
    return <Loader2 className="animate-spin" />;
  }
  return (
    <ScrollArea className="h-[50vh] pr-6 pb-6 w-full">
      {ranking?.length ? (
        ranking.map((d: any) => (
          <div className="flex my-6 items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>{d.station_name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {d.station_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {d.passengers_count} Passengers Served
              </p>
            </div>
            <div className="ml-auto font-medium">{d.passengers_count}</div>
          </div>
        ))
      ) : (
        <div></div>
      )}
    </ScrollArea>
  );
};

export default MonthlyStationRanking;

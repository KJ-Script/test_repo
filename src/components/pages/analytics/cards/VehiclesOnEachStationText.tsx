"use client";
import { clientApi } from "@/app/_trpc/react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import VehiclesOnEachStationSkeleton from "./server/VehiclesOnEachStationSkeleton";

const VehiclesOnEachStation = ({ initialData }: { initialData: any }) => {
  const { data: counts, isLoading } =
    clientApi.analytics.getStationDailyCounts.useQuery(undefined, {
      initialData,
    });

  const stations = counts?.length
    ? counts.map((station: any) => {
        return {
          name: station.station_name,
          vehicles: station.vehicles.length,
        };
      })
    : [];
  if (isLoading) {
    return <VehiclesOnEachStationSkeleton />;
  }
  return (
    <ScrollArea className="h-[50vh] pr-6 pb-6 w-full">
      {stations?.length ? (
        stations.map((d: any) => (
          <div className="flex my-6 items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>{d.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{d.name}</p>
              <p className="text-sm text-muted-foreground">
                {d.vehicles} active vehicle{d.vehicles > 1 ? "s" : ""}
              </p>
            </div>
            <div className="ml-auto font-medium">{d.vehicles}</div>
          </div>
        ))
      ) : (
        <div></div>
      )}
    </ScrollArea>
  );
};

export default VehiclesOnEachStation;

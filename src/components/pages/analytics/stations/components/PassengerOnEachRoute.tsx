import { clientApi } from "@/app/_trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

const PassengerOnEachRoute = ({
  stationId,
  filterDateValue,
}: {
  stationId: number;
  filterDateValue: string;
}) => {
  const { data, isLoading } =
    clientApi.analytics.passengersOnEachRoute.useQuery({
      station_id: stationId,
      filterDate: filterDateValue,
    });

  return (
    <ScrollArea className="h-[50vh] pr-6 pb-6 w-full">
      {data?.length ? (
        data.map((d) => (
          <div className="flex my-6 items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>
                {d.destination_name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {d.destination_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {d.station_name + " to " + d.destination_name}
              </p>
            </div>
            <div className="ml-auto font-medium">{d.ticket_count}</div>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-[30vh]">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </ScrollArea>
  );
};

export default PassengerOnEachRoute;

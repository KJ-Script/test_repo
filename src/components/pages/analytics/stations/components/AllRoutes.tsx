import { clientApi } from "@/app/_trpc/react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const AllRoutes = ({ station_id }: { station_id: number }) => {
  const { data: routes } = clientApi.analytics.getRoutesForStation.useQuery({
    station_id,
  });

  return (
    <ScrollArea className="h-[50vh] pr-6 pb-6 w-full">
      {routes?.length ? (
        routes.map((d) => (
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
                {d.station.name + " to " + d.destination_name}
              </p>
            </div>
            <div className="ml-auto font-medium">{d.distance}Km</div>
          </div>
        ))
      ) : (
        <div></div>
      )}
    </ScrollArea>
  );
};

export default AllRoutes;

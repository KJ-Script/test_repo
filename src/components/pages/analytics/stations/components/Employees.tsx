import { clientApi } from "@/app/_trpc/react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Employees = ({ station_id }: { station_id: number }) => {
  const { data: stationEmployees } =
    clientApi.analytics.getEmployeesForStation.useQuery({
      station_id: station_id,
    });
  return (
    <Card className="col-span-7">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end space-y-1.5 p-6"></div>
      <CardContent className="pl-2 w-full flex justify-center">
        <Carousel className="w-full max-w-lg">
          <CarouselContent className="-ml-1">
            {(stationEmployees || []).map((employee, index) => (
              <CarouselItem
                key={index}
                className="pl-1 md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1">
                  <Card>
                    <CardContent className="flex flex-col aspect-square items-center justify-center p-6">
                      <div className="text-2xl w-28 h-28 rounded-full bg-primary flex items-center justify-center font-semibold">
                        {employee?.email?.substring(0, 2)?.toUpperCase()}
                      </div>
                      <p className="mt-2 text-sm">
                        {employee?.first_name?.toUpperCase() +
                          " " +
                          employee?.last_name?.toUpperCase()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
      {stationEmployees?.length ? (
        <p className="text-center mb-4 font-bold text-2xl">
          {" "}
          🎉{stationEmployees?.length} Employees
        </p>
      ) : (
        <></>
      )}
    </Card>
  );
};

export default Employees;

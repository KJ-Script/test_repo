"use client";
import { clientApi } from "@/app/_trpc/react";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StationsList = ({
  stationId,
  setStationId,
}: {
  stationId: any;
  setStationId: any;
}) => {
  const getStations = clientApi.station.getAll.useQuery();
  return (
    <Select
      onValueChange={(value) => setStationId(Number(value))}
      defaultValue={stationId + ""}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select station" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Stations</SelectLabel>
          <SelectItem value={-1 + ""}>All</SelectItem>
          {(getStations.data || []).map((station) => (
            <SelectItem value={station.id + ""}>{station.name}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default StationsList;

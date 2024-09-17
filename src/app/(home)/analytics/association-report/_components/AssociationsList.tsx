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

const AssociationsList = ({
  associationId,
  setAssociationId,
}: {
  associationId: any;
  setAssociationId: any;
}) => {
  const getAssociations = clientApi.provider.getAll.useQuery();
  return (
    <Select
      onValueChange={(value) => setAssociationId(Number(value))}
      defaultValue={associationId + ""}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select station" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Stations</SelectLabel>
          <SelectItem value={-1 + ""}>All</SelectItem>
          {(getAssociations.data || []).map((association) => (
            <SelectItem value={association.id + ""}>
              {association.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default AssociationsList;

"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { regionsShortCode } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  plate_number: z.string().min(2, { message: "Plate Number is required" }),
  seat_capacity: z.string(),
  region: z.string().min(2, { message: "Region is required" }),
  side_number: z.string(),
  provider_id: z.string(),
  level_id: z.string(),
});

const EditVehicleForm = ({
  vehicle,
  vehicleLevels,
  providers,
}: {
  vehicle: Awaited<
    ReturnType<(typeof serverApi)["vehicle"]["getAll"]["query"]>
  >[0];
  providers: Awaited<
    ReturnType<(typeof serverApi)["provider"]["getAll"]["query"]>
  >;
  vehicleLevels: Awaited<
    ReturnType<(typeof serverApi)["vehicleLevel"]["getAll"]["query"]>
  >;
}) => {
  const updateVehicle = clientApi.vehicle.update.useMutation({
    onSettled: () => {
      form.reset();
      toast({
        variant: "default",
        description: "Vehicle updated",
      });
      clientApi.vehicle.getAll.useQuery().refetch();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate_number: vehicle.plate_number,
      seat_capacity: String(vehicle.seat_capacity),
      region: vehicle.region,
      side_number: vehicle.side_number || "",
      provider_id: String(vehicle.provider_id),
      level_id: String(vehicle.level_id),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (
      !values.plate_number &&
      !values.seat_capacity &&
      !values.region &&
      !values.side_number &&
      !values.provider_id &&
      !values.level_id
    ) {
      form.setError("side_number", {
        message: "Please fill out at least one field.",
      });
      return;
    }

    updateVehicle.mutate({
      level_id: Number(values.level_id),
      plate_number: values.plate_number,
      provider_id: Number(values.provider_id),
      region: values.region,
      seat_capacity: Number(values.seat_capacity),
      side_number: values.side_number,
      id: vehicle.id,
    });
  }
  return (
    <div className="w-full mt-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="plate_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plate Number*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="seat_capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seat Capacity</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the region." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {regionsShortCode.map((region) => (
                      <SelectItem
                        value={String(region.value)}
                        key={region.value}
                      >
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="level_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the vehicle level." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicleLevels.map((level) => (
                      <SelectItem value={String(level.id)} key={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="provider_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the provider." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem value={String(provider.id)} key={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="side_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Side Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={updateVehicle.isLoading}
            type="submit"
            className="w-full"
          >
            {updateVehicle.isLoading && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Update
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditVehicleForm;

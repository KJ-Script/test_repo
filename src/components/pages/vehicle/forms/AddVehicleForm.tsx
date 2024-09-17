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

const formSchema = z.object({
  plate_number: z.string().min(2, { message: "Plate Number is required" }),
  seat_capacity: z.string(),
  region: z.string().min(2, { message: "Region is required" }),
  side_number: z.string(),
  provider_id: z.string(),
  level_id: z.string(),
});

const AddVehicleForm = ({
  providers,
  vehicleLevels,
}: {
  providers: Awaited<
    ReturnType<(typeof serverApi)["provider"]["getAll"]["query"]>
  >;
  vehicleLevels: Awaited<
    ReturnType<(typeof serverApi)["vehicleLevel"]["getAll"]["query"]>
  >;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate_number: "",
      seat_capacity: "",
      region: "",
      side_number: "",
    },
  });

  const createVehicle = clientApi.vehicle.create.useMutation({
    onSettled: () => {
      form.reset();
      clientApi.user.getAll.useQuery().refetch();
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createVehicle.mutate({
      plate_number: values.plate_number,
      region: values.region,
      provider_id: Number(values.provider_id),
      seat_capacity: Number(values.seat_capacity),
      side_number: values.side_number,
      level_id: Number(values.level_id),
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
                  <Input {...field} type="number" min={1} />
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
            disabled={createVehicle.isLoading}
            type="submit"
            className="w-full"
          >
            {createVehicle.isLoading && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Register
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddVehicleForm;

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
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  region: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  latitude: z.string(),
  longitude: z.string(),
});

const EditStationForm = ({
  station,
}: {
  station: Awaited<
    ReturnType<(typeof serverApi)["station"]["getAll"]["query"]>
  >[0];
}) => {
  const updateStation = clientApi.station.update.useMutation({
    onSettled: () => {
      form.reset();
      clientApi.station.getAll.useQuery().refetch();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: station.name,
      region: station.region,
      //@ts-ignore
      latitude: station.lat,
      //@ts-ignore
      longitude: station.long,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    updateStation.mutate({
      name: values.name,
      region: values.region,
      lat: values.latitude,
      long: values.longitude,
      id: station.id,
    });
  }
  return (
    <div className="w-full mt-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Station name*</FormLabel>
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
                <FormLabel>Station Region*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={updateStation.isLoading}
            type="submit"
            className="w-full"
          >
            {updateStation.isLoading && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Update
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditStationForm;

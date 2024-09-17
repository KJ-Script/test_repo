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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { regionsFull } from "@/lib/utils";

const formSchema = z.object({
  destination_name: z.string().min(2, {
    message: "Destination name is required.",
  }),
  destination_region: z.string().min(2, {
    message: "Destination region is required.",
  }),
  destination_latitude: z.string(),
  destination_longitude: z.string(),
  distance: z.string().min(1, {
    message: "Distance region is required.",
  }),
});

const AddRouteForm = () => {
  const createRoute = clientApi.route.create.useMutation({
    onSettled: () => {
      form.reset();
      clientApi.route.getAll.useQuery().refetch();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination_name: "",
      destination_region: "",
      destination_latitude: "",
      destination_longitude: "",
      distance: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!Number(values.distance)) {
      return form.setError("distance", {
        message: "Not a valid number",
      });
    }

    createRoute.mutate({
      destination_name: values.destination_name,
      destination_region: values.destination_region,
      destination_latitude: values.destination_latitude,
      destination_longitude: values.destination_longitude,
      distance: Number(values.distance),
    });
  }
  return (
    <div className="w-full mt-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="destination_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination name*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination_region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Region*</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the destination region." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {regionsFull.map((region) => (
                      <SelectItem
                        value={String(region.value)}
                        key={region.value}
                      >
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination_latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Latitude</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination_longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Longitude</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="distance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distance</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={createRoute.isLoading}
            type="submit"
            className="w-full"
          >
            {createRoute.isLoading && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Register
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddRouteForm;

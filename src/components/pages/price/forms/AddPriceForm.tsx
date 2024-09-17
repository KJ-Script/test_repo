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

const formSchema = z.object({
  price: z.string(),
  service_charge: z.string(),
  vat: z.string(),
  vehicle_level_id: z.string().min(1, { message: "Vehicle Level is required" }),
  route_id: z.string().min(1, { message: "Route is required" }),
});

const AddPriceForm = ({
  routes,
  vehicleLevels,
}: {
  routes: Awaited<ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>>;
  vehicleLevels: Awaited<
    ReturnType<(typeof serverApi)["vehicleLevel"]["getAll"]["query"]>
  >;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: "",
      service_charge: "",
      vehicle_level_id: "",
      route_id: "",
      vat: "",
    },
  });

  const createPrice = clientApi.price.create.useMutation({
    onSettled: () => {
      form.reset();
      clientApi.user.getAll.useQuery().refetch();
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!Number(values.price)) {
      return form.setError("price", {
        message: "Not a valid number",
      });
    }
    if (!Number(values.service_charge) && Number(values.service_charge) !== 0) {
      return form.setError("service_charge", {
        message: "Not a valid number",
      });
    }
    if (!Number(values.vat) && Number(values.vat) !== 0) {
      return form.setError("vat", {
        message: "Not a valid number",
      });
    }
    createPrice.mutate({
      price: Number(values.price),
      service_charge: Number(values.service_charge),
      route_id: Number(values.route_id),
      vehicle_level_id: Number(values.vehicle_level_id),
      vat: Number(values.vat),
    });
  }
  return (
    <div className="w-full mt-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original Price*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="service_charge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Charge*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vat*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vehicle_level_id"
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
            name="route_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the Destination." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem value={String(route.id)} key={route.id}>
                        {route.destination_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Button
            disabled={createPrice.isLoading}
            type="submit"
            className="w-full"
          >
            {createPrice.isLoading && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Register
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddPriceForm;

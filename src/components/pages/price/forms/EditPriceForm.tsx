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
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  price: z.string(),
  service_charge: z.string(),
  vehicle_level_id: z.string(),
  route_id: z.string(),
  vat: z.string(),
});

const EditPriceForm = ({
  price,
  vehicleLevels,
  routes,
  session,
}: {
  price: Awaited<ReturnType<(typeof serverApi)["price"]["getAll"]["query"]>>[0];
  routes: Awaited<ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>>;
  vehicleLevels: Awaited<
    ReturnType<(typeof serverApi)["vehicleLevel"]["getAll"]["query"]>
  >;
  session: any;
}) => {
  const updatePrice = clientApi.price.update.useMutation({
    onSettled: () => {
      form.reset();
      toast({
        variant: "default",
        description: "Price updated",
      });
      clientApi.vehicle.getAll.useQuery().refetch();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: price.price + "",
      service_charge: price.service_charge + "",
      vehicle_level_id: "",
      route_id: "",
      vat: price.vat + "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (
      !values.price &&
      !values.route_id &&
      !values.service_charge &&
      !values.vehicle_level_id
    ) {
      form.setError("vehicle_level_id", {
        message: "Please fill out at least one field.",
      });
      return;
    }

    updatePrice.mutate({
      price: Number(values.price),
      service_charge: Number(values.service_charge),
      vat: Number(values.vat),
      route_id: Number(values.route_id),
      vehicle_level_id: Number(values.vehicle_level_id),
      id: price.id,
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
          <div
            className={`${
              !session?.user?.image?.role?.privileges.includes(
                "ViewRegionalAnalytics"
              )
                ? ""
                : "hidden"
            }`}
          >
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
          </div>

          <Button
            disabled={updatePrice.isLoading}
            type="submit"
            className="w-full"
          >
            {updatePrice.isLoading && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Update
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditPriceForm;

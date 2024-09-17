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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { regionsFull } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  region: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  phone_number: z.string(),
});

const EditProviderForm = ({
  provider,
}: {
  provider: Awaited<
    ReturnType<(typeof serverApi)["provider"]["getAll"]["query"]>
  >[0];
}) => {
  const updateProvider = clientApi.provider.update.useMutation({
    onSettled: () => {
      form.reset();
      clientApi.provider.getAll.useQuery().refetch();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: provider.name,
      region: provider.region,
      //@ts-ignore
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    updateProvider.mutate({
      name: values.name,
      region: values.region,
      phone_number: values.phone_number,
      id: provider.id,
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
                <FormLabel>Provider name*</FormLabel>
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
                <FormLabel>Provider Region*</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the region." />
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
                </Select>{" "}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={updateProvider.isLoading}
            type="submit"
            className="w-full"
          >
            {updateProvider.isLoading && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Update
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditProviderForm;

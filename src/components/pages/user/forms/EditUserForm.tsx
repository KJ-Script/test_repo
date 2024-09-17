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
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  role: z.string(),
  email: z.string(),
  current_password: z.string(),
  new_password: z.string(),
});

const EditUserForm = ({
  user,
  roles,
}: {
  user: Awaited<ReturnType<(typeof serverApi)["user"]["getAll"]["query"]>>[0];
  roles: Awaited<ReturnType<(typeof serverApi)["role"]["getAll"]["query"]>>;
}) => {
  const updateUser = clientApi.user.update.useMutation({
    onSettled: () => {
      clientApi.user.getAll.useQuery().refetch();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phoneNumber: user.phone_number,
      current_password: "",
      role: user.role.id + "",
      new_password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (
      !values.current_password &&
      !values.email &&
      !values.firstName &&
      !values.lastName &&
      !values.new_password &&
      !values.phoneNumber &&
      !values.role
    ) {
      form.setError("new_password", {
        message: "Please fill out at least one field.",
      });
      return;
    }

    updateUser.mutate({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      new_password: values.new_password,
      phoneNumber: values.phoneNumber,
      role_id: Number(values.role),
      current_password: "",
      id: user.id,
      // @ts-ignore
      station_id: user.station_id,
    });
  }
  return (
    <div className="w-full mt-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the role." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem value={role.id + ""}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={updateUser.isLoading}
            type="submit"
            className="w-full"
          >
            {updateUser.isLoading && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Update
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditUserForm;

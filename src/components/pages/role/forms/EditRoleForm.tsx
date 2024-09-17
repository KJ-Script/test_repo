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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string(),
});

const EditRoleForm = ({
  allPrivileges,
  role,
}: {
  allPrivileges: Awaited<
    ReturnType<(typeof serverApi)["role"]["getPrivileges"]["query"]>
  >;
  role: Awaited<ReturnType<(typeof serverApi)["role"]["getAll"]["query"]>>[0];
}) => {
  const updateRoleMutation = clientApi.role.update.useMutation({
    onSuccess: () => {
      form.reset();
      toast({
        title: "Role updated.",
      });
    },
    onError: (e) => {
      toast({
        title: "Couldn't update role.",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role.name || "",
    },
  });
  const [privilegeSelected, setPrivilegeSelected] = useState<string[]>(
    role.privileges
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    updateRoleMutation.mutate({
      privileges: privilegeSelected,
      name: values.name,
      id: role.id,
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
                <FormLabel>Role name*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ToggleGroup
            type="multiple"
            className="flex w-full flex-wrap overflow-y-scroll h-[60vh] mb-3"
          >
            {allPrivileges.map((curPrivilege: any) => (
              <div
                className={`inline-flex items-center justify-center border h-10 px-3 rounded-md text-sm cursor-pointer font-medium ring-offset-background transition-colors ${
                  privilegeSelected.includes(curPrivilege)
                    ? "bg-accent"
                    : "bg-transparent"
                }`}
                key={curPrivilege}
                onClick={() => {
                  if (privilegeSelected.includes(curPrivilege)) {
                    setPrivilegeSelected(
                      privilegeSelected.filter((item) => item !== curPrivilege)
                    );
                  } else {
                    setPrivilegeSelected([...privilegeSelected, curPrivilege]);
                  }
                }}
              >
                {curPrivilege}
              </div>
            ))}
          </ToggleGroup>

          <Button
            disabled={updateRoleMutation.isLoading}
            type="submit"
            className="w-full"
          >
            {updateRoleMutation.isLoading && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Register
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditRoleForm;

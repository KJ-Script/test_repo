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

const AddRoleForm = ({
  privileges,
}: {
  privileges: Awaited<
    ReturnType<(typeof serverApi)["role"]["getPrivileges"]["query"]>
  >;
}) => {
  console.log(privileges);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });
  const createRole = clientApi.role.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Role created",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Couldn't create role",
        variant: "destructive",
      });
    },
  });
  const [privilegeSelected, setPrivilegeSelected] = useState<string[]>([]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createRole.mutate({
      name: values.name,
      privileges: privilegeSelected,
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
            {privileges.map((privilege: any) => (
              <ToggleGroupItem
                value={privilege}
                key={privilege}
                onClick={() => {
                  if (privilegeSelected.includes(privilege)) {
                    setPrivilegeSelected(
                      privilegeSelected.filter((item) => item !== privilege)
                    );
                  } else {
                    setPrivilegeSelected([...privilegeSelected, privilege]);
                  }
                }}
              >
                {privilege + ""}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Button
            disabled={createRole.isLoading}
            type="submit"
            className="w-full"
          >
            {createRole.isLoading && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Register
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddRoleForm;

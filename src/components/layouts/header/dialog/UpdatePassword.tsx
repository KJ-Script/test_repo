"use client";
import { clientApi } from "@/app/_trpc/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeDollarSignIcon,
  CalendarIcon,
  Loader2,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const formSchema = z.object({
  current_password: z.string().min(6, "Password must be at least 6 characters"),
  new_password: z.string().min(6, "Password must be at least 6 characters"),
});

const UpdatePasswordDialog = () => {
  const [date, setDate] = useState<Date>();
  const updatePasswordMutation = clientApi.user.updatePassword.useMutation({
    onSuccess: () => {
      toast({
        title: "Password updated",
        variant: "default",
        style: {
          border: "3px solid green",
        },
      });
      signOut({
        redirect: true,
        callbackUrl: "/",
      });
    },
    onError: (e) => {
      toast({
        title: "Couldn't update password.",
        variant: "destructive",
        description: e.message,
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    updatePasswordMutation.mutate({
      current_password: values.current_password,
      new_password: values.new_password,
    });
  }

  return (
    <AlertDialog
      onOpenChange={() => {
        form.reset();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <UserIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Password</AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password *</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password *</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                type="submit"
                disabled={
                  !form.getValues("current_password") ||
                  !form.getValues("new_password")
                }
              >
                {updatePasswordMutation.isLoading && (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                )}
                Update
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpdatePasswordDialog;

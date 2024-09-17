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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeDollarSignIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  cashier: z.string().min(1, { message: "Cashier is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  type: z.string().min(1, { message: "Request Type is required" }),
  ticket_price: z.string(),
});

const TransactionDialog = () => {
  const ticketerToCashierTransactionMutation =
    clientApi.transaction.ticketerToCashierRequest.useMutation({
      onSuccess: () => {
        toast({
          title: "Request sent to cashier",
          variant: "default",
          style: {
            border: "3px solid green",
          },
        });
        form.reset();
      },
      onError: (e) => {
        toast({
          title: "Couldn't send request to cashier.",
          variant: "destructive",
          description: e.message,
        });
      },
    });
  const cashiers = clientApi.user.getCashiers.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cashier: "",
      amount: "",
      type: "",
      ticket_price: "0",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!Number(values.amount)) {
      return form.setError("amount", {
        message: "Not a valid number",
      });
    }
    if (values.type == "TICKET" && !Number(values.ticket_price)) {
      return form.setError("ticket_price", {
        message: "Not a valid number",
      });
    }

    ticketerToCashierTransactionMutation.mutate({
      amount: Number(values.amount),
      cashier_id: Number(values.cashier),
      type: values.type,
      ticket_price: values.type == "TICKET" ? Number(values.ticket_price) : 0,
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <BadgeDollarSignIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send request to cashier</AlertDialogTitle>
          <AlertDialogDescription>
            Choose the cashier, select the type of request, enter the amount and
            click send
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="cashier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cashier</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cashier." />
                    </SelectTrigger>
                    <SelectContent>
                      {(cashiers.data || []).map((cashier) => (
                        <SelectItem value={cashier.id + ""} key={cashier.id}>
                          {cashier.email}
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
              name="type"
              render={({ field }) => (
                <>
                  <FormItem>
                    <FormLabel>Request Type</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select request type." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">CASH</SelectItem>
                        <SelectItem value="TICKET">TICKET</SelectItem>
                      </SelectContent>
                      <FormMessage />
                    </Select>
                  </FormItem>
                  {form.getValues("type") == "TICKET" && (
                    <FormField
                      control={form.control}
                      name="ticket_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ticket price</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                type="submit"
                disabled={ticketerToCashierTransactionMutation.isLoading}
              >
                {ticketerToCashierTransactionMutation.isLoading && (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                )}
                Continue
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TransactionDialog;

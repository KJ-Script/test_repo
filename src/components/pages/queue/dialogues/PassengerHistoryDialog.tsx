"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
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
import { Loader2, Plus, RefreshCcw, SofaIcon } from "lucide-react";
import { useRef, useState } from "react";
import AddVehicleDrawer from "../../vehicle/drawers/AddVehicleDrawer";
import { useReactToPrint } from "react-to-print";
import CheckoutTicket from "../tickets/CheckoutTicket";
import { ScrollArea } from "@/components/ui/scroll-area";

const PassengerHistoryDialog = ({
  queue,
  setPassengersForQueue,
}: {
  queue:
    | Awaited<ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>>[0]
    | null;
  setPassengersForQueue: any;
}) => {
  if (!queue) {
    return;
  }
  const { data: passengerHistory, isLoading } =
    clientApi.transaction.transactionHistoryForQueue.useQuery(
      {
        queue_id: queue.id,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

  return (
    <AlertDialog
      open={queue != null}
      onOpenChange={(o) => {
        setPassengersForQueue(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Passenger History</AlertDialogTitle>
          <AlertDialogDescription>
            Ticket history for this queue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isLoading ? (
          <div className="flex w-full h-full justify-center items-center">
            <Loader2 />
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-6 p-2 border">
              <div className="col-span-3">Agent</div>
              <div>Booked</div>
              <div>Reprint</div>
              <div>Extra</div>
            </div>

            {(passengerHistory || []).map((his: any) => (
              <div className="grid grid-cols-6 p-2 border">
                <div className="col-span-3">{his.creator}</div>
                <div>{his.BOOK}</div>
                <div>{his.REPRINT}</div>
                <div>{his.EXTRA}</div>
              </div>
            ))}
          </ScrollArea>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PassengerHistoryDialog;

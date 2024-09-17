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
import { Loader2, Plus, RefreshCcw } from "lucide-react";
import { useRef, useState } from "react";
import AddVehicleDrawer from "../../vehicle/drawers/AddVehicleDrawer";
import { useReactToPrint } from "react-to-print";
import CheckoutTicket from "../tickets/CheckoutTicket";
import { useSocket } from "@/providers/socket-provider";

const PayDriverDialog = ({
  queue,
  type,
  stationId,
  setQueueToPay,
}: {
  queue:
    | Awaited<ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>>[0]
    | null;
  type: string;
  stationId: any;
  setQueueToPay: any;
}) => {
  if (!queue) {
    return;
  }
  const { socket } = useSocket();
  const [ticketCount, setTicketCount] = useState<number>(
    queue.booked_seat_count
  );
  const [plateNumber, setPlateNumber] = useState<string>(
    queue?.vehicle?.plate_number
  );
  const [open, setOpen] = useState(false);
  const payDriverMutation = clientApi.transaction.payDriver.useMutation({
    onSuccess: () => {
      toast({
        title: "Driver paid",
        description: `Driver paid ${ticketCount * queue.price.price} Birr`,
      });
      socket?.emit("changeQueue", { stationId });
      handlePrint();
      setQueueToPay(null);
      setOpen(false);
    },
    onError: (e) => {
      toast({
        title: "Couldn't pay driver",
        variant: "destructive",
        description: e?.message,
      });
    },
  });
  const ticketRef = useRef<any>();
  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    onAfterPrint: () => {
      setQueueToPay(null);
    },
  });
  const payDriver = async () => {
    if (type == "reprint") {
      handlePrint();
      return;
    }
    payDriverMutation.mutate({
      amount: ticketCount * queue.price.price,
      queue_id: queue.id,
    });
  };

  return (
    <AlertDialog
      open={queue !== null}
      onOpenChange={(o) => {
        setQueueToPay(null);
      }}
    >
      <AlertDialogTrigger className="p-4 border rounded-lg bg-black text-white">
        {type == "pay" ? "Pay" : "Reprint"}
      </AlertDialogTrigger>
      <AlertDialogContent className="h-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Pay driver</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the amount and click pay.
          </AlertDialogDescription>
          <div className="flex flex-col gap-5 my-8">
            <div className="flex gap-5">
              <Label className="flex items-center">Ticket Amount</Label>
              <Input
                className="flex-1"
                type="number"
                onChange={(e) => {
                  setTicketCount(
                    //@ts-ignore
                    parseInt(e.target.value) > queue.vehicle.seat_capacity
                      ? queue.vehicle.seat_capacity
                      : parseInt(e.target.value)
                  );
                }}
                value={ticketCount}
                //@ts-ignore
                max={queue.vehicle.seat_capacity}
                min={0}
              />
            </div>
            <div className="flex gap-5">
              <Label className="flex items-center">Plate Number</Label>
              <Input
                className="flex-1"
                type="number"
                onChange={(e) => {
                  setPlateNumber(e.target.value || "");
                }}
                value={plateNumber}
              />
            </div>
            <p className="">
              Total: {((ticketCount || 0) * queue.price.price).toLocaleString()}
            </p>
          </div>
        </AlertDialogHeader>
        <CheckoutTicket
          ref={ticketRef}
          queue={queue}
          seatCount={ticketCount}
          plateNumber={plateNumber}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button disabled={payDriverMutation.isLoading} onClick={payDriver}>
            {payDriverMutation.isLoading && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            {type == "reprint" ? "Reprint" : "Pay"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PayDriverDialog;

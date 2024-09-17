import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { serverApi } from "@/app/_trpc/server";
import { useReactToPrint } from "react-to-print";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import PassengerTicket from "../tickets/PassengerTicket";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/app/_trpc/react";
import { toast } from "@/components/ui/use-toast";

const BookTicketDrawer = ({
  queue,
  type,
}: {
  queue: Awaited<
    ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>
  >[0];
  type: string;
}) => {
  const purchaseTicketMutation =
    clientApi.transaction.purchaseTicket.useMutation({
      onSuccess: () => {
        toast({
          title: "Tickets saved",
          description: `${seatCount} ticket${
            seatCount > 1 ? "s" : ""
          } has been ${
            type !== "Extra" ? type.toLowerCase() + "ed" : "booked extra"
          }`,
        });
        handlePrint();
        setOpen(false);
        setSeatCount(0);
      },
      onError: (e) => {
        toast({
          title: "Couldn't purchase tickets",
          description: e.message,
          variant: "destructive",
        });
      },
    });
  const ticketRef = useRef<any>();
  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
  });
  const [seatCount, setSeatCount] = useState<number>(0);

  const purchaseTicket = async () => {
    if (type == "Book") {
      purchaseTicketMutation.mutate({
        queue_id: queue.id,
        amount: queue.price.total_price * seatCount,
        ticket_count: seatCount,
        type: "BOOK",
      });
    } else if (type == "Reprint") {
      purchaseTicketMutation.mutate({
        queue_id: queue.id,
        amount: queue.price.total_price * seatCount,
        ticket_count: seatCount,
        type: "REPRINT",
      });
    } else {
      purchaseTicketMutation.mutate({
        queue_id: queue.id,
        amount: queue.price.total_price * seatCount,
        ticket_count: seatCount,
        type: "EXTRA",
      });
    }
  };

  const [open, setOpen] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
      }}
    >
      <SheetTrigger className="px-4 rounded-lg border">{type}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Dispense Tickets</SheetTitle>
          <SheetDescription className="mb-3">
            Enter the number of tickets you want to dispense and click print to
            print them out.
          </SheetDescription>
          <Separator />
        </SheetHeader>
        <div className="flex items-center gap-2 justify-center">
          <Input
            placeholder="number of tickets"
            type="number"
            value={seatCount}
            className="my-3"
            onChange={(e) => {
              queue.vehicle.seat_capacity &&
              parseInt(e.target.value) >
                queue.vehicle.seat_capacity - queue.booked_seat_count &&
              type == "Book"
                ? setSeatCount(
                    queue.vehicle.seat_capacity - queue.booked_seat_count
                  )
                : setSeatCount(parseInt(e.target.value));
            }}
            //@ts-ignore
            max={queue.vehicle.seat_capacity}
            min={0}
          />
          <Button
            className="h-full"
            onClick={() => {
              setSeatCount(
                //@ts-ignore
                queue.vehicle.seat_capacity - queue.booked_seat_count
              );
            }}
          >
            Max
          </Button>
        </div>
        <div className="w-[300px] h-[350px] overflow-y-scroll border border-gray-600 rounded-md">
          <PassengerTicket
            ref={ticketRef}
            queue={queue}
            seatCount={seatCount}
            type={type}
            passengerName=""
          />
        </div>

        <div className="mt-3">
          <Input
            placeholder="passenger name"
            value={seatCount}
            className="my-3"
            onChange={(e) => {}}
          />
          Total: {(seatCount * queue.price.total_price || 0).toFixed(2)} Birr
        </div>
        <Button
          className="w-full mt-3"
          onClick={purchaseTicket}
          disabled={!seatCount || purchaseTicketMutation.isLoading}
        >
          {purchaseTicketMutation.isLoading && (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          )}
          Print
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default BookTicketDrawer;

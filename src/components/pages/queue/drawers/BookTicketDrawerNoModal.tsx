import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { serverApi } from "@/app/_trpc/server";
import { useReactToPrint } from "react-to-print";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import PassengerTicket from "../tickets/PassengerTicket";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/app/_trpc/react";
import { toast } from "@/components/ui/use-toast";
import { useSocket } from "@/providers/socket-provider";
import { useSession } from "next-auth/react";

const BookTicketDrawerNoModal = ({
  queue,
  setQueue,
  type,
  session,
}: {
  queue:
    | Awaited<ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>>[0]
    | null;
  setQueue: any;
  type: string;
  session: any;
}) => {
  const { socket } = useSocket();
  const [passengerName, setPassengerName] = useState<string>("");
  const stationId = session?.user?.image?.station?.id;

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
        socket?.emit("changeQueue", { stationId });
        handlePrint();
        setQueue(null);
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
    if (!queue) {
      setQueue(null);
      return;
    }
    if (type == "Book") {
      purchaseTicketMutation.mutate({
        queue_id: queue.id,
        amount: queue.price.total_price * seatCount,
        ticket_count: seatCount,
        passenger_detail: passengerName,
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

  if (!queue) {
    return <div></div>;
  }
  return (
    <div className="fixed inset-0 z-50 bg-background/10 backdrop-blur-sm animate-in fade-in-0">
      <div
        className="w-3/4 left-0 h-full fixed"
        onClick={() => {
          setQueue(null);
        }}
      ></div>
      <div className="fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out animate-in duration-300 inset-y-0 right-0 h-full w-3/4  border-l slide-in-from-right sm:max-w-sm">
        <div
          onClick={() => {
            setQueue(null);
          }}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-secondary"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </div>
        <SheetHeader>
          <div className="text-lg font-semibold text-foreground">
            Dispense Tickets
          </div>
          <div className="text-sm text-muted-foreground mb-3">
            Enter the number of tickets you want to dispense <br /> and click
            print to print them out.
          </div>
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
            passengerName={
              //@ts-ignore
              queue?.passenger_name ? queue?.passenger_name : passengerName
            }
          />
        </div>
        <div className="mt-3">
          <Input
            placeholder="passenger name"
            value={passengerName}
            className="my-3"
            onChange={(e) => {
              setPassengerName(e.target.value || "");
            }}
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
      </div>
    </div>
  );
};

export default BookTicketDrawerNoModal;

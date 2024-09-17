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
import { Loader2, Plus, RefreshCcw } from "lucide-react";
import { useRef, useState } from "react";
import AddVehicleDrawer from "../../vehicle/drawers/AddVehicleDrawer";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useSocket } from "@/providers/socket-provider";
import { useSession } from "next-auth/react";
import CheckInTicket from "../tickets/CheckInTicket";
import { useReactToPrint } from "react-to-print";

const AddToQueueDialogue = ({
  routes,
  session: t,
}: {
  routes: Awaited<ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>>;
  session: any;
}) => {
  const { socket } = useSocket();
  const { data: session } = useSession();
  //@ts-ignore
  const stationId = session?.user?.image?.station?.id;
  const getRoutes = clientApi.route.getAll.useQuery(undefined, {
    initialData: routes,
    refetchOnWindowFocus: false,
  });
  const [addingError, setAddingError] = useState(0);
  const [queue, setQueue] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const ticketRef = useRef<any>();
  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    onAfterPrint: () => {
      setOpen(false);
      setQueue(null);
    },
  });

  const { toast } = useToast();
  const addToQueueMutation = clientApi.queue.add.useMutation({
    onSuccess: (data: any) => {
      if (!data.inSchedule) {
        toast({
          title: "Vehicle not in schedule",
          variant: "destructive",
          className: "my-3",
        });
      }
      setQueue(data.queue);
      toast({
        title: "Vehicle added to queue",
        variant: "default",
        style: {
          border: "3px solid green",
        },
      });
      socket?.emit("changeQueue", { stationId });
      setPlateNumber("");
      setRouteSelected(null);
      // setOpen(false);
    },
    onError: (e) => {
      if (e.message == "Vehicle doesn't exist") {
        setAddingError(1);
      } else {
        toast({
          title: "Couldn't add vehicle to queue.",
          variant: "destructive",
          description: e.message,
        });
      }
    },
  });

  const [plateNumber, setPlateNumber] = useState<string>("");
  const [routeSelected, setRouteSelected] = useState<number | null>();

  const addToQueue = async () => {
    if (!routeSelected) {
      return;
    }
    addToQueueMutation.mutate({
      route_id: routeSelected,
      vehicle_plate_number: plateNumber,
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
        setQueue(null);
      }}
    >
      <AlertDialogTrigger asChild>
        <div className="cursor-pointer rounded-md border shadow-md">
          <Plus className="w-9 h-9 p-1 rounded-md bg-white text-black" />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="h-[300px]">
        {!queue ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Are vehicle to queue</AlertDialogTitle>
              <AlertDialogDescription>
                Select the plate number and the destination
              </AlertDialogDescription>
              <div className="flex flex-col gap-5 my-8">
                <Select
                  onValueChange={(value) => {
                    setRouteSelected(Number(value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select the Destination." />
                  </SelectTrigger>
                  <SelectContent>
                    {(getRoutes.data || []).map((route: any) => (
                      <SelectItem value={route.id} key={route.id}>
                        {route.destination_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-5">
                  <Label className="flex items-center">Plate Number</Label>
                  <Input
                    className="flex-1"
                    value={plateNumber}
                    onChange={(e) => {
                      setPlateNumber(e.target.value);
                    }}
                  />
                  <Input
                    name="csrfToken"
                    type="hidden"
                    autoComplete="new-password"
                    defaultValue={"csrfToken"}
                  />
                </div>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {addingError == 1 ? (
                <div className="flex flex-col gap-3 w-full justify-center  items-center">
                  <p className="text-sm text-red-600 text-center">
                    Vehicle doesn't exist, register it:
                  </p>
                  <div>
                    <div className="flex gap-3">
                      <AddVehicleDrawer />
                      <div
                        className="rounded-md border shadow-md cursor-pointer"
                        onClick={() => {
                          setAddingError(0);
                        }}
                      >
                        <RefreshCcw className="w-9 h-9 p-1 rounded-md bg-white text-black" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    onClick={addToQueue}
                    disabled={
                      !plateNumber ||
                      !routeSelected ||
                      addToQueueMutation.isLoading
                    }
                  >
                    {addToQueueMutation.isLoading && (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    )}
                    Continue
                  </Button>
                </>
              )}
            </AlertDialogFooter>
          </>
        ) : (
          <div className="grid justify-center">
            <div>
              <CheckInTicket ref={ticketRef} queue={queue} />
            </div>
            <div className="w-[300px] grid grid-cols-2 gap-3">
              <div className="mt-24">
                <AlertDialogCancel className="w-full border bg-gray-400">
                  Cancel
                </AlertDialogCancel>
              </div>
              <Button className="mt-24" onClick={handlePrint}>
                Print
              </Button>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddToQueueDialogue;

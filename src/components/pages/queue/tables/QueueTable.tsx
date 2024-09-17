"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, SofaIcon, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DeleteFromQueueDialogue from "../dialogues/DeleteFromQueueDialogue";
import PayDriverDialog from "../dialogues/PayDriverDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PassengerHistoryDialog from "../dialogues/PassengerHistoryDialog";
import BookTicketDrawerNoModal from "../drawers/BookTicketDrawerNoModal";
import { useSocket } from "@/providers/socket-provider";

const QueueTable = ({
  initialData,
  routes,
  session,
  csrfToken,
}: {
  initialData: Awaited<
    ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>
  >;
  routes: Awaited<ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>>;
  session: any;
  csrfToken: string | undefined;
}) => {
  const { socket } = useSocket();
  const stationId = session?.user?.image?.station?.id;
  const [queueToPay, setQueueToPay] = useState<
    | Awaited<ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>>[0]
    | null
  >(null);
  const [payType, setPayType] = useState("pay");
  const getTodayQueue = clientApi.queue.getToday.useQuery(undefined, {
    initialData: initialData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // refetchInterval: 1000,
  });
  const utils = clientApi.useUtils();

  useEffect(() => {
    socket?.on("queueChanged", (data: any) => {
      if (data?.stationId == stationId) {
        utils.queue.getToday.invalidate();
      }
    });
  }, [socket]);

  const [rowForEnable, setRowForEnable] = useState<number | null>(null);
  const [vehicleCheckingOut, setVehicleCheckingOut] = useState<number | null>(
    null
  );

  const [queueSelected, setQueueSelected] = useState<
    | Awaited<ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>>[0]
    | null
  >(null);
  const [passengersForQueue, setPassengersForQueue] = useState<
    | Awaited<ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>>[0]
    | null
  >(null);

  const [ticketTypeSelected, setTicketTypeSelected] = useState<string>("");

  let queueData = getTodayQueue.data ? getTodayQueue.data : [];
  // Sort first by name (alphabetically)
  queueData.sort((a, b) => {
    const nameA = a.price.route.destination_name.toLowerCase();
    const nameB = b.price.route.destination_name.toLowerCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return a.id - b.id;
  });

  // Then, sort by id increasingly
  // Mutations
  const toggleEnableMutation = clientApi.queue.enable.useMutation({
    onSuccess: () => {
      socket?.emit("changeQueue", { stationId });

      setRowForEnable(null);
    },
    onError: (e) => {
      setRowForEnable(null);
    },
  });
  const checkOutMutation = clientApi.queue.checkout.useMutation({
    onSuccess: () => {
      socket?.emit("changeQueue", { stationId });
      setVehicleCheckingOut(null);
    },
    onError: (e) => {
      setVehicleCheckingOut(null);
    },
  });

  const toggleEnable = async (id: number) => {
    toggleEnableMutation.mutate({
      id,
    });
  };

  const checkOut = async (id: number) => {
    checkOutMutation.mutate({
      id,
    });
  };

  // Table columns
  const columns: ColumnDef<
    Awaited<ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>>[0]
  >[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value: any) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: any) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "plate_number",
        header: "Plate Number",
        accessorFn: (row) => row.vehicle.plate_number,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "destination",
        header: "Destination",
        accessorFn: (row) => row.price.route.destination_name,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "price",
        header: "Price",
        accessorFn: (row) => row.price.total_price,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "booked_seats",
        header: "Booked Seats",
        accessorFn: (row) =>
          `${row.booked_seat_count + "/" + row.vehicle.seat_capacity}`,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "booking",
        header: "Booking",
        cell: ({ row }) => {
          return (
            <div className="">
              {row.original.enabled ? (
                <CheckCircle2 className="text-green-400" />
              ) : (
                <XCircle className="text-red-500" />
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "passenger_history",
        header: "",
        cell: ({ row }) => {
          return (
            <>
              {
                <div
                  onClick={() => {
                    setPassengersForQueue(row.original);
                  }}
                  className="cursor-pointer w-[60px] h-[60px] hover:bg-muted flex items-center justify-center rounded-full border"
                >
                  <SofaIcon />
                </div>
              }
            </>
          );
        },
      },
      {
        accessorKey: "checked_out",
        header: "Checked Out",
        cell: ({ row }) => {
          return (
            <div className="">
              {row.original.checked_out ? (
                <CheckCircle2 className="text-green-400" />
              ) : (
                <XCircle className="text-red-500" />
              )}
            </div>
          );
        },
      },

      {
        accessorKey: "creator",
        header: "Creator",
        accessorFn: (row) =>
          `${row.creator?.first_name + " " + row.creator?.last_name}`,
        cell: (info) => info.getValue(),
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <div className="mr-3 flex gap-5 flex-wrap">
              {
                //@ts-ignore
                session?.user?.image?.role?.privileges?.includes(
                  "QueueUpdate"
                ) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRowForEnable(row.original.id);
                      toggleEnable(row.original.id);
                    }}
                    disabled={
                      toggleEnableMutation.isLoading &&
                      rowForEnable == row.original.id
                    }
                  >
                    {toggleEnableMutation.isLoading &&
                      rowForEnable == row.original.id && (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      )}
                    {row.original.enabled ? "Disable" : "Enable"}
                  </Button>
                )
              }
              {
                //@ts-ignore
                session?.user?.image?.role?.privileges?.includes(
                  "QueueDelete"
                ) && (
                  <DeleteFromQueueDialogue
                    queue={row.original}
                    session={session}
                  />
                )
              }
              {!row.original.checked_out &&
                row.original.enabled &&
                !(
                  row.original.booked_seat_count >=
                  //@ts-ignore
                  row.original.vehicle.seat_capacity
                ) &&
                //@ts-ignore
                session?.user?.image?.role?.privileges?.includes(
                  "TicketBook"
                ) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQueueSelected(row.original);
                      setTicketTypeSelected("Book");
                    }}
                  >
                    Book
                  </Button>
                )}

              <BookTicketDrawerNoModal
                queue={queueSelected}
                setQueue={setQueueSelected}
                type={ticketTypeSelected}
                session={session}
              />
              {row.original.booked_seat_count > 0 && (
                <>
                  {
                    //@ts-ignore
                    session?.user?.image?.role?.privileges?.includes(
                      "QueueUpdate"
                    ) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setVehicleCheckingOut(row.original.id);
                          checkOut(row.original.id);
                        }}
                        disabled={
                          checkOutMutation.isLoading &&
                          vehicleCheckingOut == row.original.id
                        }
                      >
                        {checkOutMutation.isLoading &&
                          vehicleCheckingOut == row.original.id && (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          )}{" "}
                        {!row.original.checked_out ? "Check Out" : "Check In"}
                      </Button>
                    )
                  }
                  {
                    //@ts-ignore
                    session?.user?.image?.role?.privileges?.includes(
                      "TicketReprint"
                    ) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQueueSelected(row.original);
                          setTicketTypeSelected("Reprint");
                        }}
                      >
                        Reprint
                      </Button>
                    )
                  }
                  {
                    //@ts-ignore
                    session?.user?.image?.role?.privileges?.includes(
                      "TicketExtraPrint"
                    ) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQueueSelected(row.original);
                          setTicketTypeSelected("Extra");
                        }}
                      >
                        Extra
                      </Button>
                    )
                  }
                </>
              )}
              {
                //@ts-ignore
                session?.user?.image?.role?.privileges?.includes(
                  "PayDriver"
                ) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQueueToPay(row.original);
                      setPayType("pay");
                    }}
                  >
                    Pay
                  </Button>
                )
              }
            </div>
          );
        },
      },
    ],
    [
      toggleEnableMutation.isLoading,
      checkOutMutation.isLoading,
      toggleEnableMutation.isSuccess,
      queueSelected,
      setQueueSelected,
      // toggleCheckoutMutation.isSuccess,
    ]
  );

  const payColumns: ColumnDef<
    Awaited<ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>>[0]
  >[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value: any) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: any) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "plate_number",
        header: "Plate Number",
        accessorFn: (row) => row.vehicle.plate_number,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "destination",
        header: "Destination",
        accessorFn: (row) => row.price.route.destination_name,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "price",
        header: "Price",
        accessorFn: (row) => row.price.total_price,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "booked_seats",
        header: "Booked Seats",
        accessorFn: (row) =>
          `${row.booked_seat_count + "/" + row.vehicle.seat_capacity}`,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "booking",
        header: "Booking",
        cell: ({ row }) => {
          return (
            <div className="">
              {row.original.enabled ? (
                <CheckCircle2 className="text-green-400" />
              ) : (
                <XCircle className="text-red-500" />
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "passenger_history",
        header: "",
        cell: ({ row }) => {
          return (
            <>
              {
                <div
                  onClick={() => {
                    setPassengersForQueue(row.original);
                  }}
                  className="cursor-pointer w-[60px] h-[60px] hover:bg-muted flex items-center justify-center rounded-full border"
                >
                  <SofaIcon />
                </div>
              }
            </>
          );
        },
      },
      {
        accessorKey: "checked_out",
        header: "Checked Out",
        cell: ({ row }) => {
          return (
            <div className="">
              {row.original.checked_out ? (
                <CheckCircle2 className="text-green-400" />
              ) : (
                <XCircle className="text-red-500" />
              )}
            </div>
          );
        },
      },

      {
        accessorKey: "creator",
        header: "Creator",
        accessorFn: (row) =>
          `${row.creator?.first_name + " " + row.creator?.last_name}`,
        cell: (info) => info.getValue(),
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <div className="mr-3 flex gap-5 flex-wrap">
              {
                //@ts-ignore
                session?.user?.image?.role?.privileges?.includes(
                  "PayDriver"
                ) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQueueToPay(row.original);
                      setPayType("reprint");
                    }}
                  >
                    Reprint
                  </Button>
                )
              }
            </div>
          );
        },
      },
    ],
    [
      toggleEnableMutation.isLoading,
      checkOutMutation.isLoading,
      toggleEnableMutation.isSuccess,
      queueSelected,
      setQueueSelected,
      // toggleCheckoutMutation.isSuccess,
    ]
  );

  return (
    <>
      {
        //@ts-ignore
        session?.user?.image?.role?.privileges?.includes("PayDriver") && (
          <PayDriverDialog
            type={payType}
            queue={queueToPay}
            stationId={stationId}
            setQueueToPay={setQueueToPay}
          />
        )
      }
      {
        <PassengerHistoryDialog
          queue={passengersForQueue}
          setPassengersForQueue={setPassengersForQueue}
        />
      }
      <Tabs defaultValue="all" className="">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="checkedOut">Checked Out</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DataTable
            filterColumn={"no"}
            columns={columns}
            data={
              queueData.filter(
                (q) => q.checked_out == false && q.paid == false
              ) || []
            }
            DrawerTrigger={{
              data: {
                trigger:
                  //@ts-ignore
                  session?.user?.image?.role?.privileges?.includes(
                    "QueueCreate"
                  )
                    ? "queue"
                    : "",
                routes: routes,
              },
            }}
          />
        </TabsContent>
        <TabsContent value="checkedOut">
          <DataTable
            filterColumn={"no"}
            columns={columns}
            data={
              queueData.filter(
                (q) => q.checked_out == true && q.paid == false
              ) || []
            }
            DrawerTrigger={{
              data: {
                trigger:
                  //@ts-ignore
                  session?.user?.image?.role?.privileges?.includes(
                    "QueueCreate"
                  )
                    ? "queue"
                    : "",
                routes: routes,
              },
            }}
          />
        </TabsContent>
        <TabsContent value="paid">
          <DataTable
            columns={payColumns}
            filterColumn="no"
            data={queueData.filter((q) => q.paid == true) || []}
            DrawerTrigger={{
              data: {
                trigger:
                  //@ts-ignore
                  session?.user?.image?.role?.privileges?.includes(
                    "QueueCreate"
                  )
                    ? "queue"
                    : "",
                routes: routes,
                session: session,
              },
            }}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default QueueTable;

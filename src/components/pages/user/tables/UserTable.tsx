"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import EditUserDrawer from "../drawers/EditUserDrawer";
import DeleteUserDialogue from "../dialogues/DeleteUserDialogue";

const UserTable = ({
  initialData,
  session,
}: {
  initialData: Awaited<
    ReturnType<(typeof serverApi)["user"]["getAll"]["query"]>
  >;
  session: any;
}) => {
  const getUsers = clientApi.user.getAll.useQuery(undefined, {
    initialData: initialData,
  });
  const columns: ColumnDef<any>[] =
    !session?.user?.image?.role?.privileges.includes("ViewRegionalAnalytics")
      ? [
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
            accessorKey: "email",
            header: "Email",
            accessorFn: (row) => row.email,
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: "first_name",
            header: "First Name",
            accessorFn: (row) => row.first_name,
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: "last_name",
            header: "Last Name",
            accessorFn: (row) => row.last_name,
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: "phone_number",
            header: "Phone Number",
            accessorFn: (row) => row.phone_number,
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: "role",
            header: "role",
            accessorFn: (row) => row.role.name,
            cell: (info) => info.getValue(),
          },
          // {
          //   accessorKey: "side_number",
          //   header: "Side number",
          //   cell: ({ row }) => (
          //     <div>
          //       {row.getValue("side_number") ? row.getValue("side_number") : "-"}
          //     </div>
          //   ),
          // },

          {
            id: "actions",
            header: "Actions",
            enableHiding: false,
            cell: ({ row }) => {
              return (
                <div className=" mr-3 flex gap-5">
                  <Button
                    size="sm"
                    // disabled={
                    //   cur.enabled == 0 || cur.onBook.toLowerCase() != "booking"
                    // }
                    className="p-0"
                  >
                    {/* <TicketDrawer queue={cur} /> */}
                  </Button>
                  <EditUserDrawer user={row.original} />
                  <DeleteUserDialogue user={row.original} />
                </div>
              );
            },
          },
        ]
      : [
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
            id: "user",
            header: "User",
            enableHiding: false,
            cell: ({ row }) => {
              return (
                <div className="w-[30px] flex items-center justify-center p-6 bg-primary text-lg h-[30px] rounded-full">
                  {row.original.email.substring(0, 2).toUpperCase()}
                </div>
              );
            },
          },
          {
            accessorKey: "email",
            header: "Email",
            accessorFn: (row) => row.email,
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: "first_name",
            header: "First Name",
            accessorFn: (row) => row.first_name,
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: "last_name",
            header: "Last Name",
            accessorFn: (row) => row.last_name,
            cell: (info) => info.getValue(),
          },
        ];
  return (
    <DataTable
      columns={columns}
      data={getUsers.data || []}
      DrawerTrigger={
        !session?.user?.image?.role?.privileges.includes(
          "ViewRegionalAnalytics"
        )
          ? "user"
          : ""
      }
    />
  );
};

export default UserTable;

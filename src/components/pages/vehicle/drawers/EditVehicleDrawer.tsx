import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import EditUserForm from "../forms/EditVehicleForm";
import { serverApi } from "@/app/_trpc/server";
import EditVehicleForm from "../forms/EditVehicleForm";
import { clientApi } from "@/app/_trpc/react";

const EditVehicleDrawer = ({
  vehicle,
}: {
  vehicle: Awaited<
    ReturnType<(typeof serverApi)["vehicle"]["getAll"]["query"]>
  >[0];
}) => {
  const getProviders = clientApi.provider.getAll.useQuery();
  const getVehicleLevels = clientApi.vehicleLevel.getAll.useQuery();

  return (
    <Sheet>
      <SheetTrigger className="rounded-lg px-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
        Edit
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription className="mb-3">
            Edit User's Information
          </SheetDescription>
          <Separator />
        </SheetHeader>
        <EditVehicleForm
          vehicle={vehicle}
          providers={getProviders.data || []}
          vehicleLevels={getVehicleLevels.data || []}
        />
      </SheetContent>
    </Sheet>
  );
};

export default EditVehicleDrawer;

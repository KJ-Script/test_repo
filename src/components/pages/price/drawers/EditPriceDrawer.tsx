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
import EditUserForm from "../forms/EditPriceForm";
import { serverApi } from "@/app/_trpc/server";
import EditVehicleForm from "../forms/EditPriceForm";
import EditPriceForm from "../forms/EditPriceForm";
import { clientApi } from "@/app/_trpc/react";

const EditPriceDrawer = ({
  price,
  session,
}: {
  price: Awaited<ReturnType<(typeof serverApi)["price"]["getAll"]["query"]>>[0];
  session: any;
}) => {
  const getRoutes = clientApi.route.getAll.useQuery();
  const getVehicleLevels = clientApi.vehicleLevel.getAll.useQuery();

  return (
    <Sheet>
      <SheetTrigger className="rounded-lg px-4 h-10 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
        Edit
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Price</SheetTitle>
          <SheetDescription className="mb-3">
            Edit Price's Information
          </SheetDescription>
          <Separator />
        </SheetHeader>
        <EditPriceForm
          price={price}
          routes={getRoutes.data || []}
          vehicleLevels={getVehicleLevels.data || []}
          session={session}
        />
      </SheetContent>
    </Sheet>
  );
};

export default EditPriceDrawer;

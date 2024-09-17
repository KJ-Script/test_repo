// import RegisterVehicles from "@/components/register/vehicles/RegisterVehicles";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import AddVehicleForm from "../forms/AddPriceForm";
import { serverApi } from "@/app/_trpc/server";
import AddPriceForm from "../forms/AddPriceForm";
import { clientApi } from "@/app/_trpc/react";

const AddPriceDrawer = () => {
  const getRoutes = clientApi.route.getAll.useQuery();
  const getVehicleLevels = clientApi.vehicleLevel.getAll.useQuery();

  return (
    <Sheet>
      <SheetTrigger className="w-full h-full ">
        <div className="rounded-md border shadow-md">
          <Plus className="w-9 h-9 p-1 rounded-md bg-white text-black" />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Register vehicles</SheetTitle>
          <SheetDescription className="mb-3">
            Register New Vehicles
          </SheetDescription>
          <Separator />
        </SheetHeader>
        <AddPriceForm
          routes={getRoutes.data || []}
          vehicleLevels={getVehicleLevels.data || []}
        />
      </SheetContent>
    </Sheet>
  );
};

export default AddPriceDrawer;

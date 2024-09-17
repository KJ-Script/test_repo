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
import AddProviderForm from "../forms/AddRouteForm";
import AddRouteForm from "../forms/AddRouteForm";

const AddRouteDrawer = () => {
  return (
    <Sheet>
      <SheetTrigger className="w-full h-full ">
        <div className="rounded-md border shadow-md">
          <Plus className="w-9 h-9 p-1 rounded-md bg-white text-black" />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Register route</SheetTitle>
          <SheetDescription className="mb-3">
            Register New route
          </SheetDescription>
          <Separator />
        </SheetHeader>
        <AddRouteForm />
      </SheetContent>
    </Sheet>
  );
};

export default AddRouteDrawer;

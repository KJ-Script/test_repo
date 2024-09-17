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
import AddUserForm from "../forms/AddStationForm";
import { Separator } from "@/components/ui/separator";
import AddStationForm from "../forms/AddStationForm";

const AddStationDrawer = () => {
  return (
    <Sheet>
      <SheetTrigger className="w-full h-full ">
        <div className="rounded-md border shadow-md">
          <Plus className="w-9 h-9 p-1 rounded-md bg-white text-black" />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Register users</SheetTitle>
          <SheetDescription className="mb-3">
            Register New Users
          </SheetDescription>
          <Separator />
        </SheetHeader>
        <AddStationForm />
      </SheetContent>
    </Sheet>
  );
};

export default AddStationDrawer;

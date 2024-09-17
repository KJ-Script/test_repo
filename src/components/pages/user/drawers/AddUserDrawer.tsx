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
import AddUserForm from "../forms/AddUserForm";
import { Separator } from "@/components/ui/separator";
import { clientApi } from "@/app/_trpc/react";

const AddUserDrawer = () => {
  const getRoles = clientApi.role.getAll.useQuery();
  const getStations = clientApi.station.getAll.useQuery();

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
        <AddUserForm
          roles={getRoles.data || []}
          stations={getStations.data || []}
        />
      </SheetContent>
    </Sheet>
  );
};

export default AddUserDrawer;

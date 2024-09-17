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
import { clientApi } from "@/app/_trpc/react";
import AddRoleForm from "../forms/AddRoleForm";

const AddRoleDrawer = () => {
  const getPrivileges = clientApi.role.getPrivileges.useQuery();

  return (
    <Sheet>
      <SheetTrigger className="w-full h-full ">
        <div className="rounded-md border shadow-md">
          <Plus className="w-9 h-9 p-1 rounded-md bg-white text-black" />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Register Roles</SheetTitle>
          <SheetDescription className="mb-3">
            Register New Role
          </SheetDescription>
          <Separator />
        </SheetHeader>
        <AddRoleForm privileges={getPrivileges.data || []} />
      </SheetContent>
    </Sheet>
  );
};

export default AddRoleDrawer;

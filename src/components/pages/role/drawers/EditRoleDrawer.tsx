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
import EditRoleForm from "../forms/EditRoleForm";
import { serverApi } from "@/app/_trpc/server";

const EditRoleDrawer = ({
  role,
}: {
  role: Awaited<ReturnType<(typeof serverApi)["role"]["getAll"]["query"]>>[0];
}) => {
  const getPrivileges = clientApi.role.getPrivileges.useQuery();

  return (
    <Sheet>
      <SheetTrigger className="rounded-lg px-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
        Edit
      </SheetTrigger>{" "}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Register Roles</SheetTitle>
          <SheetDescription className="mb-3">
            Register New Role
          </SheetDescription>
          <Separator />
        </SheetHeader>
        <EditRoleForm role={role} allPrivileges={getPrivileges.data || []} />
      </SheetContent>
    </Sheet>
  );
};

export default EditRoleDrawer;

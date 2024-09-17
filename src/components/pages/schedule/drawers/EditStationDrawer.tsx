import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { serverApi } from "@/app/_trpc/server";
import EditStationForm from "../forms/EditStationForm";

const EditStationDrawer = ({
  station,
}: {
  station: Awaited<
    ReturnType<(typeof serverApi)["station"]["getAll"]["query"]>
  >[0];
}) => {
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
        <EditStationForm station={station} />
      </SheetContent>
    </Sheet>
  );
};

export default EditStationDrawer;

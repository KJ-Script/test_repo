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
import EditStationForm from "../forms/EditProviderForm";

const EditProviderDrawer = ({
  provider,
}: {
  provider: Awaited<
    ReturnType<(typeof serverApi)["provider"]["getAll"]["query"]>
  >[0];
}) => {
  return (
    <Sheet>
      <SheetTrigger className="rounded-lg px-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
        Edit
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Provider</SheetTitle>
          <SheetDescription className="mb-3">
            Edit Provider's Information
          </SheetDescription>
          <Separator />
        </SheetHeader>
        <EditStationForm provider={provider} />
      </SheetContent>
    </Sheet>
  );
};

export default EditProviderDrawer;

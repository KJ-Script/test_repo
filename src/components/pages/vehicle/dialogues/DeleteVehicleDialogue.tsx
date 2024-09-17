import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const DeleteVehicleDialogue = ({
  vehicle,
}: {
  vehicle: Awaited<
    ReturnType<(typeof serverApi)["vehicle"]["getAll"]["query"]>
  >[0];
}) => {
  const deleteVehicle = clientApi.vehicle.delete.useMutation({
    onSettled: () => {
      clientApi.vehicle.getAll.useQuery().refetch();
    },
  });
  const deleteVehicleDialogue = async () => {
    deleteVehicle.mutate({
      id: vehicle.id,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            vehicle and remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteVehicleDialogue}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteVehicleDialogue;

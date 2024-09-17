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

const DeleteProviderDialogue = ({
  provider,
}: {
  provider: Awaited<
    ReturnType<(typeof serverApi)["provider"]["getAll"]["query"]>
  >[0];
}) => {
  const deleteProvider = clientApi.provider.delete.useMutation({
    onSettled: () => {
      clientApi.provider.getAll.useQuery().refetch();
    },
  });
  const deleteProviderTrigger = async () => {
    deleteProvider.mutate({
      id: provider.id,
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
            provider and remove the data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteProviderTrigger}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProviderDialogue;

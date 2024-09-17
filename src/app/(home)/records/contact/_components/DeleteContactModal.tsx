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
import { Loader2 } from "lucide-react";

const DeleteContactDialogue = ({
  contact,
  setContactToDelete,
}: {
  contact:
    | Awaited<ReturnType<(typeof serverApi)["contact"]["getAll"]["query"]>>[0]
    | null;
  setContactToDelete: any;
}) => {
  const utils = clientApi.useUtils();

  const deleteContact = clientApi.contact.delete.useMutation({
    onSettled: () => {
      utils.contact.getAll.invalidate();
      setContactToDelete(null);
    },
  });
  const deleteContactTrigger = async () => {
    if (!contact) {
      return;
    }
    deleteContact.mutate({
      id: contact.id,
    });
  };

  return (
    <AlertDialog
      open={contact !== null}
      onOpenChange={(o) => {
        setContactToDelete(o);
      }}
    >
      <AlertDialogTrigger asChild></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            contact and remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={deleteContactTrigger}>
            {deleteContact.isLoading && <Loader2 className="animate-spin" />}
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteContactDialogue;

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
import { useSocket } from "@/providers/socket-provider";
import { Trash, Trash2 } from "lucide-react";

const DeleteFromQueueDialogue = ({
  queue,
  session,
}: {
  queue: Awaited<
    ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>
  >[0];
  session: any;
}) => {
  const { socket } = useSocket();
  const stationId = session?.user?.image?.station?.id;

  const deleteQueueMutation = clientApi.queue.remove.useMutation({
    onSettled: () => {
      socket?.emit("changeQueue", { stationId });
    },
  });
  const deleteQueue = async () => {
    deleteQueueMutation.mutate({
      id: queue.id,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="rounded-md border cursor-pointer">
          <Trash2 className="w-9 h-9 p-1 rounded-md  text-red-600" />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove the
            vehicle from queue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteQueue}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteFromQueueDialogue;

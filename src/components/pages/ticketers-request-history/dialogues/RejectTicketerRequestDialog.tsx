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
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const RejectTicketerRequestDialogue = ({
  request,
}: {
  request: Awaited<
    ReturnType<
      (typeof serverApi)["transaction"]["ticketerToCashierRequestHistory"]["query"]
    >
  >[0];
}) => {
  const rejectRequestMutation =
    clientApi.transaction.rejectTicketerRequest.useMutation({
      onSuccess: () => {
        toast({
          title: "Ticketer Request Rejected.",
        });
      },
      onError: (e) => {
        toast({
          title: "Error Rejecting Ticketer Request",
          description: e.message,
        });
      },
    });
  const rejectTicketerRequest = async () => {
    rejectRequestMutation.mutate({
      id: request.id,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Reject</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={rejectTicketerRequest}
            disabled={rejectRequestMutation.isLoading}
          >
            {rejectRequestMutation.isLoading && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RejectTicketerRequestDialogue;

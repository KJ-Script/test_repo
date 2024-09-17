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

const AcceptTicketerRequestDialogue = ({
  request,
}: {
  request: Awaited<
    ReturnType<
      (typeof serverApi)["transaction"]["ticketerToCashierRequestHistory"]["query"]
    >
  >[0];
}) => {
  const acceptRequestMutation =
    clientApi.transaction.acceptTicketerRequest.useMutation({
      onSuccess: () => {
        toast({
          title: "Ticketer Request Accepted",
        });
      },
      onError: (e) => {
        toast({
          title: "Error Accepting Ticketer Request",
          description: e.message,
        });
      },
    });
  const acceptTicketerRequest = async () => {
    acceptRequestMutation.mutate({
      id: request.id,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Accept</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={acceptTicketerRequest}
            disabled={acceptRequestMutation.isLoading}
          >
            {acceptRequestMutation.isLoading && (
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
            )}
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AcceptTicketerRequestDialogue;

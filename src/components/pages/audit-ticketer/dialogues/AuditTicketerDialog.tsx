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

const AuditTicketerDialog = ({
  audit,
}: {
  audit: Awaited<
    ReturnType<
      (typeof serverApi)["transaction"]["auditTicketerDailyHistory"]["query"]
    >
  >[0];
}) => {
  const auditTicketerMutation = clientApi.transaction.auditTicketer.useMutation(
    {
      onSuccess: () => {
        toast({
          title: "Ticketer Audited",
        });
      },
      onError: (e) => {
        toast({
          title: "Error Auditing Ticketer",
          description: e.message,
        });
      },
    }
  );
  const acceptTicketerRequest = async () => {
    auditTicketerMutation.mutate({
      balance: audit.balance,
      ticketer_id: audit.ticketer.id,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Audit</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={acceptTicketerRequest}
            disabled={auditTicketerMutation.isLoading}
          >
            {auditTicketerMutation.isLoading && (
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
            )}
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AuditTicketerDialog;

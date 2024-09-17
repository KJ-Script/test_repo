import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const AuditCashierDialog = ({ audit }: { audit: any }) => {
  const auditCashierMutation = clientApi.transaction.auditCashier.useMutation({
    onSuccess: () => {
      toast({
        title: "Cashier Audited",
      });
    },
    onError: (e) => {
      toast({
        title: "Error Auditing Cashier",
        description: e.message,
      });
    },
  });
  const acceptCashierRequest = async () => {
    auditCashierMutation.mutate({
      balance: audit.balance,
      cashier_id: audit.cashier.id,
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
            onClick={acceptCashierRequest}
            disabled={auditCashierMutation.isLoading}
          >
            {auditCashierMutation.isLoading && (
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
            )}
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AuditCashierDialog;

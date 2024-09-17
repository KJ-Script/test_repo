import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";
import { PlusIcon } from "lucide-react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { clientApi } from "@/app/_trpc/react";
import { Contact } from "@prisma/client";
import { serverApi } from "@/app/_trpc/server";

const formSchema = z.object({
  phone_number: z.string().min(8, {
    message: "Phone number is required",
  }),
});

export function EditContactDrawer({
  contact,
  setCurrentContact,
}: {
  contact:
    | Awaited<ReturnType<(typeof serverApi)["contact"]["getAll"]["query"]>>[0]
    | null;
  setCurrentContact: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: contact?.phone_number,
    },
  });
  const utils = clientApi.useUtils();

  const updateContact = clientApi.contact.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Contact updated",
        duration: 1000,
      });
      // form.reset();
      utils.contact.getAll.invalidate();
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!contact) {
      return;
    }
    updateContact.mutate({
      id: contact.id,
      phone_number: values.phone_number,
    });
  }

  return (
    <Sheet
      open={contact !== null}
      onOpenChange={(o) => {
        setCurrentContact(o);
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Contact</SheetTitle>
          <SheetDescription>Add new contact</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <div className="gap-5 w-full">
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="09" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full">
              Edit
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

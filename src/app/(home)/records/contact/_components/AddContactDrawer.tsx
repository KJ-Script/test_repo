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

const formSchema = z.object({
  phone_number: z.string().min(8, {
    message: "Phone number is required",
  }),
});

export function AddContactDrawer() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: "",
    },
  });
  const utils = clientApi.useUtils();

  const addContact = clientApi.contact.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Contact added",
        duration: 1000,
      });
      form.reset();
      utils.contact.getAll.invalidate();
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addContact.mutate({
      phone_number: values.phone_number,
    });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <PlusIcon />
        </Button>
      </SheetTrigger>
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
              Add
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

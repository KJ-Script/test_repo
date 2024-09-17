import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, ChevronDown, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const ManagerRequestTableSkeleton = () => {
  const header = ["Station", "Manager", "Amount", "Date"];
  return (
    <ScrollArea className="max-w-[87vw] md:max-w-full md:w-full whitespace-nowrap rounded-md">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn("w-[240px] justify-start text-left font-normal")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />

            {
              //@ts-ignore
              format(new Date(), "PPP")
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={new Date()}
            //@ts-ignore
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="flex justify-between items-center py-4">
        <Input placeholder="Filter columns..." className="max-w-sm" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox aria-label="Select all" />
              </TableHead>
              {header.map((head) => (
                <TableHead>{head}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(7)
              .fill("")
              .map(() => (
                <TableRow>
                  <TableCell>
                    <Checkbox aria-label="Select all" />
                  </TableCell>
                  {Array(4)
                    .fill("")
                    .map(() => (
                      <TableCell>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 flex text-sm text-muted-foreground">
          <Skeleton className="w-4 h-4 mr-1" />
          of <Skeleton className="w-5 h-4 mx-1" /> row(s) selected.
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default ManagerRequestTableSkeleton;

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
import { ChevronDown, Plus } from "lucide-react";

const StationTableSkeleton = () => {
  const header = ["Station Name", "Region", "Creator", "Actions"];
  return (
    <ScrollArea className="max-w-[87vw] md:max-w-full md:w-full whitespace-nowrap rounded-md">
      <div className="flex justify-between items-center py-4">
        <Input placeholder="Filter columns..." className="max-w-sm" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <div className="rounded-md border shadow-md">
                <Plus className="w-9 h-9 p-1 rounded-md bg-white text-black" />
              </div>
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
                  {Array(6)
                    .fill("")
                    .map(() => (
                      <TableCell>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  <TableCell>
                    <div className=" mr-3 flex gap-5">
                      <Skeleton>
                        <Button variant="outline">Edit</Button>
                      </Skeleton>
                      <Skeleton>
                        <Button variant="destructive">Delete</Button>
                      </Skeleton>
                    </div>
                  </TableCell>
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

export default StationTableSkeleton;

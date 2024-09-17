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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { toast } from "@/components/ui/use-toast";

const AddScheduleDialogue = ({
  routes,
}: {
  routes: Awaited<ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>>;
}) => {
  let { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      maxFiles: 1,
      accept: {
        "text/csv": [".csv"],
      },
      maxSize: 1024 * 5000, // ~5MB
    });
  const [invalidFile, setInvalidFile] = useState(true);
  const [routeSelected, setRouteSelected] = useState<number | null>();
  const [acceptedFileItems, setAcceptedFileItems] = useState<ReactNode>();
  const [newScheduleData, setNewScheduleData] =
    useState<{ vehicle: string }[]>();
  const addScheduleMutation = clientApi.schedule.create.useMutation({
    onSuccess: () => {
      toast({
        title: "New schedule added.",
      });
      setRouteSelected(null);
      setAcceptedFileItems([]);
      setNewScheduleData([]);
    },
    onError: (e) => {
      toast({
        title: "Couldn't add schedule.",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (acceptedFiles.length) {
      setAcceptedFileItems(
        acceptedFiles.map((file: any) => (
          <li key={file.path}>
            {file.path} - {file.size} bytes
          </li>
        ))
      );
      parseCSVFile(acceptedFiles[0]);
    }
  }, [acceptedFiles]);

  const parseCSVFile = (file: File) => {
    Papa.parse(file, {
      header: true, // Assuming the first row contains headers
      complete: (results) => {
        const data = results.data; // Parsed CSV data
        // Do something with the parsed data
        // sendDataToBackend(data);

        let filteredData = data.map((data: any) => {
          return {
            vehicle: data.vehicle,
          };
        });

        const notTotallyInvalid = filteredData.filter(
          ({ vehicle }) => vehicle !== undefined
        );
        if (notTotallyInvalid.length) {
          setNewScheduleData([...filteredData]);
          return setInvalidFile(false);
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
      },
    });
  };

  //   if (acceptedFiles.length) {
  //     parseCSVFile(acceptedFiles[0]);
  //   }

  //   const fileRejectionItems = fileRejections.map(
  //     ({ file, errors }: { file: any; errors: any }) => (
  //       <li key={file.path}>
  //         {file.path} - {file.size} bytes
  //         <ul>
  //           {errors.map((e: any) => (
  //             <li key={e.code}>{e.message}</li>
  //           ))}
  //         </ul>
  //       </li>
  //     )
  //   );

  const addSchedule = async () => {
    const scheduleData = newScheduleData?.map(({ vehicle }) => {
      return {
        vehicle_plate_number: vehicle,
        route_id: Number(routeSelected),
      };
    });
    if (scheduleData?.length) {
      addScheduleMutation.mutate(scheduleData);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="rounded-md border shadow-md cursor-pointer">
          <Plus className="w-9 h-9 p-1 rounded-md bg-white text-black" />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add schedule</AlertDialogTitle>
          <AlertDialogDescription>
            Choose the route for your schedule and upload the schedule file
            (.csv file format)
          </AlertDialogDescription>
          <Select
            onValueChange={(value) => {
              setRouteSelected(Number(value));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select the Destination." />
            </SelectTrigger>
            <SelectContent>
              {routes.map((route: any) => (
                <SelectItem value={route.id} key={route.id}>
                  {route.destination_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div {...getRootProps({ className: "dropzone" })}>
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  .CSV file
                </p>
              </div>
              <input id="dropzone-file" {...getInputProps()} />
            </label>
          </div>
          <aside>
            <ul>{acceptedFileItems}</ul>
            {/* <ul>{fileRejectionItems}</ul> */}
          </aside>
          {invalidFile && <>Invalid file</>}
        </AlertDialogHeader>
        <AlertDialogFooter className="">
          <AlertDialogCancel
            onClick={() => {
              setAcceptedFileItems([]);
            }}
          >
            Cancel
          </AlertDialogCancel>
          {/* <AlertDialogAction>Continue</AlertDialogAction> */}
          <Button
            disabled={
              !routeSelected || invalidFile || addScheduleMutation.isLoading
            }
            onClick={addSchedule}
          >
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddScheduleDialogue;

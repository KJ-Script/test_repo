"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon } from "lucide-react";

const PassengersCount = ({
  dailyPassengersCount,
}: {
  dailyPassengersCount: Awaited<
    ReturnType<
      (typeof serverApi)["analytics"]["getTotalPassengersToday"]["query"]
    >
  > | null;
}) => {
  const getTotalPassengersToday =
    clientApi.analytics.getTotalPassengersToday.useQuery(undefined, {
      ...(dailyPassengersCount && { initialData: dailyPassengersCount }),
    });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <UserIcon />
          <div className="flex flex-col">
            <span className="font-bold">
              {getTotalPassengersToday?.data?._sum.ticket_count
                ? getTotalPassengersToday.data._sum.ticket_count
                : 0}
            </span>
            <span className="text-gray-500">Passengers</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PassengersCount;

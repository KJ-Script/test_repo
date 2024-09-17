import React, { useContext } from "react";
import { EthDateTime } from "ethiopian-calendar-date-converter";
import { serverApi } from "@/app/_trpc/server";
import Image from "next/image";
import { ticketDetailInLanguage } from "@/lib/utils";
import { useSession } from "next-auth/react";

export const addLeadingZero = (num: any) => {
  if (Number(num) < 10) {
    return "0" + num;
  }
  return num;
};
type PropTypes = {
  queue: Awaited<
    ReturnType<(typeof serverApi)["queue"]["getToday"]["query"]>
  >[0];
};
const CheckInTicket = React.forwardRef<HTMLDivElement, PropTypes>(
  ({ queue }, ref) => {
    const { data: session } = useSession();
    const today = EthDateTime.fromEuropeanDate(new Date());
    const formattedDate =
      addLeadingZero(today.date) +
      "-" +
      addLeadingZero(today.month) +
      "-" +
      addLeadingZero(today.year) +
      " " +
      addLeadingZero(Math.abs(Number(today.hour) - 6)) +
      ":" +
      addLeadingZero(today.minute);

    return (
      <div ref={ref} className="w-[300px] h-[100px] rounded-md border bg-white">
        <div className="text-black px-[3px] py-[0.5px] text-left border-y-[2px] border-y-black bg-white overflow-y-scroll">
          <div>
            <div className="flex justify-between items-center border-b border-dashed">
              <div>
                <h1 className="font-extrabold font-mono text-left text-lg">
                  {queue.station.name} Bus Station -{" "}
                  {
                    //@ts-ignore
                    ticketDetailInLanguage[queue.station.region]
                      .checkInTitleLabel
                  }
                </h1>
                <div className="flex justify-between gap-5 w-full">
                  <h1 className="font-extrabold font-mono">
                    [{queue.vehicle.plate_number}]
                  </h1>
                </div>
              </div>
              <Image
                src="/bitophiyaa-logo-dark.png"
                width={35}
                height={30}
                alt="bitophiyaa logo"
                className="mr-2"
              />
            </div>
          </div>
          <div>
            <table style={{ width: "90%" }}>
              <tr>
                <td className="font-mono text-xs font-bold">
                  {
                    //@ts-ignore
                    ticketDetailInLanguage[queue.station.region]
                      .destinationLabel
                  }{" "}
                </td>
                <td className="font-mono text-xs font-bold">
                  {queue.price.route.destination_name}
                </td>
              </tr>
              <tr>
                <td className="font-mono text-xs font-bold">
                  {
                    //@ts-ignore
                    ticketDetailInLanguage[queue.station.region].dateLabel
                  }{" "}
                </td>
                <td className="font-mono text-xs font-bold ">
                  {formattedDate.split(" ")[0]} {formattedDate.split(" ")[1]}
                </td>
              </tr>
              <tr>
                <td className="font-mono text-xs font-bold">
                  {
                    //@ts-ignore
                    ticketDetailInLanguage[queue.station.region].agentLabel
                  }{" "}
                </td>
                <td className="font-mono text-xs font-bold">
                  {session?.user.email}
                </td>
              </tr>
              <tr>
                <td className="font-mono text-xs font-bold">
                  {
                    //@ts-ignore
                    ticketDetailInLanguage[queue.station.region].levelLabel
                  }{" "}
                </td>
                <td className="font-mono text-xs font-bold">
                  {queue.vehicle.level.name}
                </td>
              </tr>
              <tr>
                <td className="font-mono text-xs font-bold">
                  {
                    //@ts-ignore
                    ticketDetailInLanguage[queue.station.region]
                      .seatCapacityLabel
                  }{" "}
                </td>
                <td className="font-mono text-xs font-bold">
                  {queue.vehicle.seat_capacity || 0}
                </td>
              </tr>
              <tr>
                <td className="font-mono text-xs font-bold">
                  {
                    //@ts-ignore
                    ticketDetailInLanguage[queue.station.region].orderLabel
                  }{" "}
                </td>
                <td className="font-mono text-xs font-bold">{queue.order}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    );
  }
);

export default CheckInTicket;

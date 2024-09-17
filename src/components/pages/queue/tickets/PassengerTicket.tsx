import React, { useContext } from "react";
import { EthDateTime } from "ethiopian-calendar-date-converter";
import { serverApi } from "@/app/_trpc/server";
import Image from "next/image";
import { ticketDetailInLanguage } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { clientApi } from "@/app/_trpc/react";

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
  seatCount: number;
  type: string;
  passengerName: string;
};
const PassengerTicket = React.forwardRef<HTMLDivElement, PropTypes>(
  ({ queue, seatCount, type, passengerName }, ref) => {
    const { data: session } = useSession();
    const contacts = clientApi.contact.getAll.useQuery();
    //@ts-ignore
    const today = queue?.ticket_date
      ? //@ts-ignore
        EthDateTime.fromEuropeanDate(new Date(queue?.ticket_date))
      : EthDateTime.fromEuropeanDate(new Date());
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
      <div ref={ref} className="w-[280px] rounded-md border bg-white">
        {Array(seatCount >= 0 ? seatCount : 0)
          .fill("")
          .map((seat, i) => (
            <div
              className="text-black px-[3px] py-[0.5px] text-left border-y-[2px] border-y-black bg-white"
              key={i}
            >
              <div>
                <div className="flex justify-between items-center border-b border-dashed">
                  <div>
                    <h1 className="font-extrabold font-mono text-left text-lg">
                      {queue.station.name} Bus Station
                    </h1>
                    <h1 className="font-extrabold font-mono">
                      {
                        //@ts-ignore
                        ticketDetailInLanguage[queue?.station?.region]
                          ?.plateNumberLabel
                      }{" "}
                      - {queue.vehicle.plate_number}
                    </h1>
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
                        ticketDetailInLanguage[queue?.station?.region]
                          ?.destinationLabel
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
                        ticketDetailInLanguage[queue?.station?.region]
                          ?.dateLabel
                      }{" "}
                    </td>
                    <td className="font-mono text-xs font-bold ">
                      {formattedDate.split(" ")[0]}{" "}
                      {formattedDate.split(" ")[1]}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono text-xs font-bold">
                      {
                        //@ts-ignore
                        ticketDetailInLanguage[queue?.station?.region]
                          ?.agentLabel
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
                        ticketDetailInLanguage[queue?.station?.region]
                          ?.levelLabel
                      }{" "}
                    </td>
                    <td className="font-mono text-xs font-bold">
                      {queue.vehicle.level.level}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono text-xs font-bold">
                      {
                        //@ts-ignore
                        ticketDetailInLanguage[queue?.station?.region]
                          ?.seatNumberLabel
                      }{" "}
                    </td>
                    <td className="font-mono text-xs font-bold">
                      {queue.booked_seat_count + i + 1}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono text-xs font-bold">Side Number</td>
                    <td className="font-mono text-xs font-bold">
                      {queue.vehicle.side_number}
                    </td>
                  </tr>
                  {passengerName && (
                    <tr>
                      <td className="font-mono text-xs font-bold">Name</td>
                      <td className="font-mono text-xs font-bold">
                        {passengerName}
                      </td>
                    </tr>
                  )}
                  {type !== "Book" && (
                    <p className="text-center font-bold">
                      [...{type.toUpperCase()}...]
                    </p>
                  )}
                  <tr>
                    <td className="font-mono text-xs font-bold">
                      {
                        //@ts-ignore
                        ticketDetailInLanguage[queue?.station?.region]
                          ?.travelPriceLabel
                      }{" "}
                    </td>
                    <td className="font-mono text-xs font-bold">
                      {queue.price.price}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono text-xs font-bold">
                      {
                        //@ts-ignore
                        ticketDetailInLanguage[queue?.station?.region]
                          ?.serviceChargeLabel
                      }{" "}
                    </td>
                    <td className="font-mono text-xs font-bold">
                      {queue.price.service_charge}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono text-xs font-bold">Vat</td>
                    <td className="font-mono text-xs font-bold">
                      {queue.price.vat}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono text-xs font-bold">
                      {
                        //@ts-ignore
                        ticketDetailInLanguage[queue?.station?.region]
                          ?.totalLabel
                      }{" "}
                    </td>
                    <td className="font-mono text-xs font-bold">
                      {queue.price.total_price}
                    </td>
                  </tr>
                  {queue.station.region.toLowerCase() == "oromia" ? (
                    <tr>
                      <td className="font-mono text-xs font-bold">
                        Sarara Bilbila Bilisaa
                      </td>
                      <td className="font-mono text-xs font-bold">8556</td>
                    </tr>
                  ) : (
                    ""
                  )}
                  {contacts?.data?.length ? (
                    <tr>
                      <td className="font-mono text-xs font-bold">
                        {
                          //@ts-ignore
                          ticketDetailInLanguage[queue?.station?.region]
                            ?.supportLabel
                        }{" "}
                      </td>
                      <div className="flex flex-col">
                        {contacts?.data.map((c) => (
                          <td className="font-mono text-xs font-bold">
                            {c.phone_number}
                          </td>
                        ))}
                      </div>
                    </tr>
                  ) : (
                    <></>
                  )}
                </table>
              </div>
            </div>
          ))}
      </div>
    );
  }
);

export default PassengerTicket;

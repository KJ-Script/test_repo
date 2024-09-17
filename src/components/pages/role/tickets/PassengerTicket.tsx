import React, { useContext } from "react";
import { EthDateTime } from "ethiopian-calendar-date-converter";
import { serverApi } from "@/app/_trpc/server";

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
};
const PassengerTicket = React.forwardRef<HTMLDivElement, PropTypes>(
  ({ queue, seatCount, type }, ref) => {
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
      <div ref={ref} className="w-[300px] h-[350px] rounded-md border bg-white">
        {Array(seatCount >= 0 ? seatCount : 0)
          .fill("")
          .map((seat, i) => (
            <div
              className="text-black px-[3px] py-[0.5px] text-left border-y-[2px] border-y-black bg-white overflow-y-scroll"
              key={i}
            >
              <div>
                <h1 className="font-extrabold font-mono text-center">
                  ------------ ETrip ------------
                </h1>
                <h1 className="font-extrabold font-mono border-b border-dashed">
                  Lakkofsaa Gabatee - {}
                </h1>
              </div>
              <div>
                <table style={{ width: "90%" }}>
                  <tr>
                    <td className="font-mono text-sm">Guyyaa</td>
                    <td className="font-mono text-sm">
                      {formattedDate.split(" ")[0]}{" "}
                      {formattedDate.split(" ")[1]}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono text-sm">Ga'umsa</td>
                    <td className="font-mono text-sm">{}</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-sm">Sadarkaa</td>
                    <td className="font-mono text-sm">{}</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-sm">Lakk. Tesso</td>
                    <td className="font-mono text-sm">
                      {queue.booked_seat_count + i + 1}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono text-sm">Lakkoofsa Cinaa</td>
                    <td className="font-mono text-sm">{}</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-sm">Gati imala</td>
                    <td className="font-mono text-sm">{}</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-sm">Kaffalti Tajaajila</td>
                    <td className="font-mono text-sm">{}</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-sm">Waligala</td>
                    <td className="font-mono text-sm">{}</td>
                  </tr>
                </table>
                {type && (
                  <p className="text-center font-bold">
                    [...{type.toUpperCase()}...]
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>
    );
  }
);

export default PassengerTicket;

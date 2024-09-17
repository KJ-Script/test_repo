"use client";
import { serverApi } from "@/app/_trpc/server";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { addLeadingZero } from "../../queue/tickets/PassengerTicket";
import { EthDateTime } from "ethiopian-calendar-date-converter";
import { getFormattedDate } from "@/lib/utils";

type PropTypes = {
  history: Awaited<
    ReturnType<(typeof serverApi)["queue"]["getHistory"]["query"]>
  >;
  startDate: string;
  endDate: string;
};

const QueueHistoryPDF = ({ history, startDate, endDate }: PropTypes) => {
  return (
    <Document>
      <Page style={styles.body}>
        <Text style={styles.title}>Journey History</Text>
        <Text style={styles.subtitle}>
          ({startDate.split("00:00:00")[0]} - {endDate.split("00:00:00")[0]})
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: "16.66%" }}>
              <Text style={styles.tableCellTitle}>Plate Number</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "16.66%" }}>
              <Text style={styles.tableCellTitle}>Station</Text>
            </View>
            <View style={{ ...styles.tableCol, width: "16.66%" }}>
              <Text style={styles.tableCellTitle}>Price</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "16.66%" }}>
              <Text style={styles.tableCellTitle}>Passengers</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "16.66%" }}>
              <Text style={styles.tableCellTitle}>Destination</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "16.66%" }}>
              <Text style={styles.tableCellTitle}>Checkout Time</Text>
            </View>{" "}
          </View>
          {history.map((queue) => (
            <View key={queue.id} style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: "16.66%" }}>
                <Text style={styles.tableCell}>
                  {queue.vehicle.plate_number}
                </Text>
              </View>
              <View style={{ ...styles.tableCol, width: "16.66%" }}>
                <Text style={styles.tableCell}>{queue.station.name}</Text>
              </View>
              <View style={{ ...styles.tableCol, width: "16.66%" }}>
                <Text style={styles.tableCell}>{queue.price.price}</Text>
              </View>
              <View style={{ ...styles.tableCol, width: "16.66%" }}>
                <Text style={styles.tableCell}>{queue.booked_seat_count}</Text>
              </View>
              <View style={{ ...styles.tableCol, width: "16.66%" }}>
                <Text style={styles.tableCell}>
                  {queue.price.route.destination_name}
                </Text>
              </View>

              <View style={{ ...styles.tableCol, width: "16.66%" }}>
                <Text style={styles.tableCell}>
                  {addLeadingZero(
                    EthDateTime.fromEuropeanDate(
                      queue?.paidTime
                        ? queue.paidTime?.created_at
                        : queue.created_at
                    ).date
                  ) +
                    "-" +
                    addLeadingZero(
                      EthDateTime.fromEuropeanDate(
                        queue?.paidTime
                          ? queue.paidTime?.created_at
                          : queue.created_at
                      ).month
                    ) +
                    "-" +
                    addLeadingZero(
                      EthDateTime.fromEuropeanDate(
                        queue?.paidTime
                          ? queue.paidTime?.created_at
                          : queue.created_at
                      ).year
                    ) +
                    " " +
                    addLeadingZero(
                      Number(
                        EthDateTime.fromEuropeanDate(
                          queue?.paidTime
                            ? queue.paidTime?.created_at
                            : queue.created_at
                        ).hour
                      ) -
                        6 ==
                        0
                        ? 12
                        : Number(
                            EthDateTime.fromEuropeanDate(
                              queue?.paidTime
                                ? queue.paidTime?.created_at
                                : queue.created_at
                            ).hour
                          ) -
                            6 <
                          0
                        ? Math.abs(
                            Number(
                              EthDateTime.fromEuropeanDate(
                                queue?.paidTime
                                  ? queue.paidTime?.created_at
                                  : queue.created_at
                              ).hour
                            ) -
                              6 +
                              12
                          )
                        : Math.abs(
                            Number(
                              EthDateTime.fromEuropeanDate(
                                queue?.paidTime
                                  ? queue.paidTime?.created_at
                                  : queue.created_at
                              ).hour
                            ) - 6
                          )
                    ) +
                    ":" +
                    addLeadingZero(
                      EthDateTime.fromEuropeanDate(
                        queue?.paidTime
                          ? queue.paidTime?.created_at
                          : queue.created_at
                      ).minute
                    ) +
                    `${
                      Number(
                        EthDateTime.fromEuropeanDate(
                          queue?.paidTime
                            ? queue.paidTime?.created_at
                            : queue.created_at
                        ).hour
                      ) -
                        6 <=
                      0
                        ? " Morning"
                        : ""
                    }`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  header: {
    fontSize: 12,
    textAlign: "left",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
    marginBottom: 20,
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
  },
  tableCellTitle: {
    margin: "auto",
    marginTop: 5,
    marginBottom: 5,
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default QueueHistoryPDF;

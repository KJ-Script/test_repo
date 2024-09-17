"use client";
import { serverApi } from "@/app/_trpc/server";
import { addLeadingZero } from "@/components/pages/queue/tickets/CheckInTicket";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { EthDateTime } from "ethiopian-calendar-date-converter";

type PropTypes = {
  history: Awaited<
    ReturnType<(typeof serverApi)["analytics"]["getPassengersHistory"]["query"]>
  >;
  date: any;
};

const PassengerHistoryPdf = ({ history, date }: PropTypes) => {
  return (
    <Document>
      <Page style={styles.body}>
        <Text style={styles.title}>Journey History</Text>
        <Text style={styles.subtitle}>({String(date)})</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: "12.5%" }}>
              <Text style={styles.tableCellTitle}>Plate Number</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "12.5%" }}>
              <Text style={styles.tableCellTitle}>Station</Text>
            </View>
            <View style={{ ...styles.tableCol, width: "12.5%" }}>
              <Text style={styles.tableCellTitle}>Ticketer</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "12.5%" }}>
              <Text style={styles.tableCellTitle}>Price</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "12.5%" }}>
              <Text style={styles.tableCellTitle}>Commission</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "12.5%" }}>
              <Text style={styles.tableCellTitle}>Destination</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "12.5%" }}>
              <Text style={styles.tableCellTitle}>Ticket Count</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "12.5%" }}>
              <Text style={styles.tableCellTitle}>Checkout Time</Text>
            </View>{" "}
          </View>
          {history.map((p) => (
            <View key={p.queue.id} style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: "12.5%" }}>
                <Text style={styles.tableCell}>
                  {p.queue.vehicle.plate_number}
                </Text>
              </View>
              <View style={{ ...styles.tableCol, width: "12.5%" }}>
                <Text style={styles.tableCell}>{p.queue.station.name}</Text>
              </View>

              <View style={{ ...styles.tableCol, width: "12.5%" }}>
                <Text style={styles.tableCell}>{p.creator.email}</Text>
              </View>
              <View style={{ ...styles.tableCol, width: "12.5%" }}>
                <Text style={styles.tableCell}>{p.queue.price.price}</Text>
              </View>

              <View style={{ ...styles.tableCol, width: "12.5%" }}>
                <Text style={styles.tableCell}>
                  {p.queue.price.service_charge}
                </Text>
              </View>
              <View style={{ ...styles.tableCol, width: "12.5%" }}>
                <Text style={styles.tableCell}>
                  {p.queue.price.route.destination_name}
                </Text>
              </View>
              <View style={{ ...styles.tableCol, width: "12.5%" }}>
                <Text style={styles.tableCell}>{p.ticket_count}</Text>
              </View>
              <View style={{ ...styles.tableCol, width: "12.5%" }}>
                <Text style={styles.tableCell}>
                  {addLeadingZero(
                    EthDateTime.fromEuropeanDate(p.queue.created_at).date
                  ) +
                    "-" +
                    addLeadingZero(
                      EthDateTime.fromEuropeanDate(p.queue.created_at).month
                    ) +
                    "-" +
                    addLeadingZero(
                      EthDateTime.fromEuropeanDate(p.queue.created_at).year
                    ) +
                    " " +
                    addLeadingZero(
                      Number(
                        EthDateTime.fromEuropeanDate(p.queue.created_at).hour
                      ) -
                        6 ==
                        0
                        ? 12
                        : Number(
                            EthDateTime.fromEuropeanDate(p.queue.created_at)
                              .hour
                          ) -
                            6 <
                          0
                        ? Math.abs(
                            Number(
                              EthDateTime.fromEuropeanDate(p.queue.created_at)
                                .hour
                            ) -
                              6 +
                              12
                          )
                        : Math.abs(
                            Number(
                              EthDateTime.fromEuropeanDate(p.queue.created_at)
                                .hour
                            ) - 6
                          )
                    ) +
                    ":" +
                    addLeadingZero(
                      EthDateTime.fromEuropeanDate(p.queue.created_at).minute
                    ) +
                    `${
                      Number(
                        EthDateTime.fromEuropeanDate(p.queue.created_at).hour
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
export default PassengerHistoryPdf;

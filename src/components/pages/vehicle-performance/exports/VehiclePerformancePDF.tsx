"use client";
import { serverApi } from "@/app/_trpc/server";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type PropTypes = {
  history: Awaited<
    ReturnType<(typeof serverApi)["queue"]["getVehiclePerformance"]["query"]>
  >;
  startDate: string;
  endDate: string;
};

const VehiclePerformancePDF = ({ history, startDate, endDate }: PropTypes) => {
  return (
    <Document>
      <Page style={styles.body}>
        <Text style={styles.title}>Journey History</Text>
        <Text style={styles.subtitle}>
          ({startDate.split("00:00:00")[0]} - {endDate.split("00:00:00")[0]})
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: "33.33%" }}>
              <Text style={styles.tableCellTitle}>Plate Number</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "33.33%" }}>
              <Text style={styles.tableCellTitle}>Checkout Count</Text>
            </View>
            <View style={{ ...styles.tableCol, width: "33.33%" }}>
              <Text style={styles.tableCellTitle}>Distance Covered</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "33.33%" }}>
              <Text style={styles.tableCellTitle}>Passengers</Text>
            </View>{" "}
          </View>
          {history.map((queue) => (
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: "33.33%" }}>
                <Text style={styles.tableCell}>{queue.plate_number}</Text>
              </View>
              <View style={{ ...styles.tableCol, width: "33.33%" }}>
                <Text style={styles.tableCell}>{queue.checkout_count}</Text>
              </View>
              <View style={{ ...styles.tableCol, width: "33.33%" }}>
                <Text style={styles.tableCell}>{queue.distance_covered}</Text>
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
    width: "33.33%",
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

export default VehiclePerformancePDF;

"use client";
import { serverApi } from "@/app/_trpc/server";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type PropTypes = {
  history: any;
  route: Awaited<ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>>[0];
  startDate: string;
  endDate: string;
};

const WarningHistoryPDF = ({
  history,
  startDate,
  endDate,
  route,
}: PropTypes) => {
  console.log(history);

  return (
    <Document>
      <Page style={styles.body}>
        <Text style={styles.title}>
          Vehicles In Warning [{route?.destination_name}]
        </Text>
        <Text style={styles.subtitle}>
          ({startDate.split("00:00:00")[0]} - {endDate.split("00:00:00")[0]})
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: "50%" }}>
              <Text style={styles.tableCellTitle}>Plate Number</Text>
            </View>{" "}
            <View style={{ ...styles.tableCol, width: "50%" }}>
              <Text style={styles.tableCellTitle}>Missed Days</Text>
            </View>
          </View>
          {history.map((vehicle: any) => (
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: "50%" }}>
                <Text style={styles.tableCell}>{vehicle.plate_number}</Text>
              </View>
              <View style={{ ...styles.tableCol, width: "50%" }}>
                <Text style={styles.tableCell}>{vehicle.count}</Text>
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

export default WarningHistoryPDF;

"use client";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type PropTypes = {
  history: any;
  startDate: string;
  endDate: string;
};

const PassengerHistoryForStationPDF = ({
  history,
  startDate,
  endDate,
}: PropTypes) => {
  return (
    <Document>
      <Page style={styles.body}>
        <Text style={styles.title}>
          {!history[0]?.vehicle_count
            ? "Passenger History"
            : "Passengers vs Vehicles History"}
        </Text>
        <Text style={styles.subtitle}>
          ({startDate.split("00:00:00")[0]} - {endDate.split("00:00:00")[0]})
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View
              style={{
                ...styles.tableCol,
                width: !history[0]?.vehicle_count ? "50%" : "33.3%",
              }}
            >
              <Text style={styles.tableCellTitle}>Date</Text>
            </View>
            <View
              style={{
                ...styles.tableCol,
                width: !history[0]?.vehicle_count ? "50%" : "33.3%",
              }}
            >
              <Text style={styles.tableCellTitle}>Passengers</Text>
            </View>{" "}
            {!history[0]?.vehicle_count ? (
              <></>
            ) : (
              <View
                style={{
                  ...styles.tableCol,
                  width: !history[0]?.vehicle_count ? "50%" : "33.3%",
                }}
              >
                <Text style={styles.tableCellTitle}>Vehicles</Text>
              </View>
            )}
          </View>
          {history.map((day: any) => (
            <View style={styles.tableRow}>
              <View
                style={{
                  ...styles.tableCol,
                  width: !history[0]?.vehicle_count ? "50%" : "33.3%",
                }}
              >
                <Text style={styles.tableCell}>{day.date}</Text>
              </View>
              <View
                style={{
                  ...styles.tableCol,
                  width: !history[0]?.vehicle_count ? "50%" : "33.3%",
                }}
              >
                <Text style={styles.tableCell}>
                  {!history[0]?.vehicle_count
                    ? day.ticket_count
                    : day.passengers}
                </Text>
              </View>
              {!history[0]?.vehicle_count ? (
                <></>
              ) : (
                <View style={{ ...styles.tableCol, width: "33.3%" }}>
                  <Text style={styles.tableCell}>{day.vehicle_count}</Text>
                </View>
              )}
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

export default PassengerHistoryForStationPDF;

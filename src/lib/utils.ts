import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { startOfToday, endOfToday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ /g, "-") // replaces all spaces with hyphens.
    .replace(/[^\w-]+/g, "") // remove all characters that are not letters, numbers, or hyphens.
    .replace(/--+/g, "-"); // collapses any consecutive hyphens into a single hyphen.
}

export function isMacOs() {
  if (typeof window === "undefined") return false;

  return window.navigator.userAgent.includes("Mac");
}

export async function saveOnlocalStorage(data: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("idSre", data.student.id);
    localStorage.setItem("phone_noSre", data.student.phone_number);
  }
}

export async function getFromLocalStorage() {
  let phoneNo = typeof window !== "undefined" ? localStorage.getItem("id") : "";
  return phoneNo;
}

export const regionsFull: { name: string; value: string }[] = [
  {
    name: "Oromia",
    value: "Oromia",
  },
  {
    name: "Amhara",
    value: "Amhara",
  },
  {
    name: "Tigray",
    value: "Tigray",
  },
  {
    name: "South Ethiopia",
    value: "South Ethiopia",
  },
  {
    name: "South West Ethiopia",
    value: "South West Ethiopia",
  },
  {
    name: "Somali",
    value: "Somali",
  },
  {
    name: "Afar",
    value: "Afar",
  },
  {
    name: "Sidama",
    value: "Sidama",
  },
  {
    name: "Harari",
    value: "Harari",
  },
  {
    name: "Gambela",
    value: "Gambela",
  },
  {
    name: "Benishangul-Gumuz",
    value: "Benishangul-Gumuz",
  },
  {
    name: "Addis Ababa",
    value: "Addis Ababa",
  },
  {
    name: "Dire Dawa",
    value: "Dire Dawa",
  },
];

type RegionLabels = {
  plateNumberLabel: string;
  agentLabel: string;
  dateLabel: string;
  destinationLabel: string;
  seatNumberLabel: string;
  levelLabel: string;
  travelPriceLabel: string;
  serviceChargeLabel: string;
  totalLabel: string;
  supportLabel: string;

  // Checkout
  checkoutTitleLabel: string;
  checkoutDateLabel: string;
  checkoutPassengerCountLabel: string;

  // Checkin
  checkInTitleLabel: string;
  checkInDateLabel: string;
  orderLabel: string;
  seatCapacityLabel: string;
};

type Regions = {
  Sidama: RegionLabels;
  Oromia: RegionLabels;
  "South Ethiopia": RegionLabels;
  Harari: RegionLabels;
};

export const ticketDetailInLanguage: Regions = {
  Sidama: {
    plateNumberLabel: "Targu Kirro",
    agentLabel: "Egente",
    dateLabel: "Barra",
    destinationLabel: "Gawalo",
    seatNumberLabel: "Barccimu kirro",
    levelLabel: "Deerra",
    travelPriceLabel: "Hodishu Baatoshe",
    serviceChargeLabel: "Service Charge",
    totalLabel: "Xaphooma",
    supportLabel: "Support",
    // Checkout
    checkoutTitleLabel: "Checkout Ticket",
    checkoutDateLabel: "Checkout time",
    checkoutPassengerCountLabel: "Passenger count",

    // Checkin
    checkInTitleLabel: "Checkin Ticket",
    checkInDateLabel: "Checkin time",
    orderLabel: "Order",
    seatCapacityLabel: "Seat capacity",
  },
  Oromia: {
    plateNumberLabel: "Lakk. Gabatee",
    agentLabel: "Agent",
    dateLabel: "Guyyaa",
    destinationLabel: "Ga'umsaa",
    seatNumberLabel: "Lakk. Tesso",
    levelLabel: "Sadarkaa",
    travelPriceLabel: "Gati imala",
    serviceChargeLabel: "Kaffalti Tajaajila	",
    totalLabel: "Waligala",
    supportLabel: "Support",

    // Checkout
    checkoutTitleLabel: "Checkout Ticket",
    checkoutDateLabel: "Checkout time",
    checkoutPassengerCountLabel: "Passenger count",

    // Checkin
    checkInTitleLabel: "Checkin Ticket",
    checkInDateLabel: "Checkin time",
    orderLabel: "Order",
    seatCapacityLabel: "Seat capacity",
  },
  "South Ethiopia": {
    plateNumberLabel: "Plate Number",
    agentLabel: "Agent",
    dateLabel: "Date",
    destinationLabel: "Destination",
    seatNumberLabel: "Seat Number",
    levelLabel: "Level",
    travelPriceLabel: "Original Price",
    serviceChargeLabel: "Service Charge",
    totalLabel: "Total",
    supportLabel: "For accusation",

    // Checkout
    checkoutTitleLabel: "Checkout Ticket",
    checkoutDateLabel: "Checkout time",
    checkoutPassengerCountLabel: "Passenger count",

    // Checkin
    checkInTitleLabel: "Checkin Ticket",
    checkInDateLabel: "Checkin time",
    orderLabel: "Order",
    seatCapacityLabel: "Seat capacity",
  },
  Harari: {
    plateNumberLabel: "Plate Number",
    agentLabel: "Agent",
    dateLabel: "Date",
    destinationLabel: "Destination",
    seatNumberLabel: "Seat Number",
    levelLabel: "Level",
    travelPriceLabel: "Original Price",
    serviceChargeLabel: "Service Charge",
    totalLabel: "Total",
    supportLabel: "For accusation",

    // Checkout
    checkoutTitleLabel: "Checkout Ticket",
    checkoutDateLabel: "Checkout time",
    checkoutPassengerCountLabel: "Passenger count",

    // Checkin
    checkInTitleLabel: "Checkin Ticket",
    checkInDateLabel: "Checkin time",
    orderLabel: "Order",
    seatCapacityLabel: "Seat capacity",
  },
};

export const regionsShortCode: { name: string; value: string }[] = [
  {
    name: "OR",
    value: "OR",
  },
  {
    name: "AM",
    value: "AM",
  },
  {
    name: "SD",
    value: "SD",
  },
  {
    name: "SH",
    value: "SH",
  },
  {
    name: "HR",
    value: "HR",
  },
  {
    name: "AA",
    value: "AA",
  },
  {
    name: "DR",
    value: "DR",
  },
  {
    name: "TG",
    value: "TG",
  },
];

export const getDate = () => {
  const today = new Date();

  //@ts-ignore
  const startOfDay = startOfToday();
  //@ts-ignore
  const endOfDay = endOfToday();

  return { today, startOfDay, endOfDay };
};

export const colors = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#4CAF50",
  "#FFC107",
  "#536DFE",
  "#FF4081",
  "#8BC34A",
  "#FFD740",
  "#009688",
  "#FF5722",
  "#E91E63",
  "#03A9F4",
  "#FF9800",
  "#8E24AA",
  "#CDDC39",
  "#FF5252",
  "#607D8B",
  "#9C27B0",
  "#FFEB3B",
  "#795548",
  "#00BCD4",
  "#FF6F00",
  "#FF1744",
  "#00E676",
  "#6200EA",
  "#FF6D00",
  "#03DAC6",
  "#F50057",
  "#536DFE",
  "#FFEA00",
];

export function getFormattedDate(d: any) {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 because January is month 0
  const day = date.getDate().toString().padStart(2, "0");
  const hr = date.getHours();
  const min = date.getMinutes();

  return `${year}-${month}-${day} ${hr}:${min}`;
}

export function getYYYYMMDD(timestamp: any) {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 because January is month 0
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const filterDateValues = {
  //@ts-ignore
  today: startOfToday(),
  "this-week": new Date(new Date().setDate(new Date().getDate() - 7)),
  "this-month": new Date(new Date().setDate(new Date().getDate() - 30)),
  "this-year": new Date(new Date().setDate(new Date().getDate() - 365)),
};

export const getRandomColor = (inputNumber: number) => {
  let seed = (inputNumber * 9301 + 49297) % 233280;
  let hexSeed = seed.toString(16).padStart(6, "0");

  // Create the color using the hex string
  let color = `#${hexSeed.slice(0, 6)}`;

  return color;
};

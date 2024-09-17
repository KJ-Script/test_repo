type navbarOptions = {
  title: string;
  subCategories: Array<{
    title: string;
    description: string;
  }>;
};

export const navbarOptions: navbarOptions[] = [
  {
    title: "Records",
    subCategories: [
      {
        title: "Station",
        description: "View, add and update station data.",
      },
      {
        title: "Provider",
        description: "View, add and update provider data.",
      },
      {
        title: "Vehicle",
        description: "View, add and update vehicle data.",
      },
      {
        title: "User",
        description: "View, add and update user data.",
      },
      {
        title: "Route",
        description: "View, add and update route data.",
      },
      {
        title: "Schedule",
        description: "View, add and update schedule data.",
      },
      {
        title: "Price",
        description: "View, add and update price data.",
      },
      {
        title: "Role",
        description: "View, add and update role data.",
      },
    ],
  },
  {
    title: "Analytics",
    subCategories: [
      {
        title: "Journey History",
        description: "",
      },
      {
        title: "Warning",
        description: "",
      },
      {
        title: "Vehicle Performance",
        description: "",
      },
      {
        title: "passenger history",
        description: "",
      },
      {
        title: "association report",
        description: "",
      },
      {
        title: "vehicle performance history",
        description: "",
      },
    ],
  },
  {
    title: "Finance",
    subCategories: [
      {
        title: "Requests to Cashier",
        description: "",
      },
      {
        title: "Ticketer requests",
        description: "",
      },
      {
        title: "Audit Ticketer",
        description: "",
      },
      {
        title: "Audit Cashiers",
        description: "",
      },
    ],
  },
];

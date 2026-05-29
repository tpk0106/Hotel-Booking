export const navbarData = [
  {
    routerLink: "general",
    icon: "../assets/order-management/Order-Management.png",
    label: "General",
    subMenus: [
      { routerLink: "branches", icon: null, label: "Branches" },
      { routerLink: "hall", icon: null, label: "Hall" },
      { routerLink: "halleventtype", icon: null, label: "Hall event Types" },
      { routerLink: "customer", icon: null, label: "Customer" },
    ],
    tag: "general",
  },
  {
    routerLink: "booking",
    icon: null,
    label: "Booking",
    subMenus: [{ routerLink: "bookings", icon: null, label: "Bookings" }],
    tag: "booking",
  },
  {
    routerLink: "reports",
    icon: null,
    label: "Reports",
    subMenus: [
      {
        routerLink: "confirmed-report-by-branch",
        icon: null,
        label: "Confirmed Bookings [by Branch]",
      },
      {
        routerLink: "pending-booking-report-by-branch",
        icon: null,
        label: "Pending Bookings [by Branch]",
      },

      {
        routerLink: "1",
        icon: null,
        label: "Booking List",
      },

      {
        routerLink: "cancelled-bookings",
        icon: null,
        label: "Cancelled Bookings",
      },
    ],
    tag: "booking",
  },

  // { routerLink: 'aboutus', icon: '', label: 'About Us', subMenus: null },
  // { routerLink: 'contactus', icon: '', label: 'Contact Us', subMenus: null },
  // {
  //   routerLink:'profile', icon:'', label:'Profile',
  //   subMenus:[
  //       { routerLink:'settings', icon:'', label:'Settings'},
  //       { routerLink:'logout', icon:'', label:'Logout'}
  //   ]
  // },
];

export const navbarData = [
  {
    routerLink: "general",
    icon: "../assets/order-management/Order-Management.png",
    label: "General",
    subMenus: [
      { routerLink: "branches", icon: null, label: "Branches", pinned: true },
      { routerLink: "hall", icon: null, label: "Hall", pinned: true },
      {
        routerLink: "halleventtype",
        icon: null,
        label: "Hall event Types",
        pinned: true,
      },
      { routerLink: "customer", icon: null, label: "Customer", pinned: true },
    ],
    tag: "general",
  },
  {
    routerLink: "booking",
    icon: null,
    label: "Booking",
    subMenus: [
      { routerLink: "bookings", icon: null, label: "Bookings", pinned: true },
    ],
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
        pinned: true,
      },
      {
        routerLink: "pending-booking-report-by-branch",
        icon: null,
        label: "Pending Bookings [by Branch]",
        pinned: false,
      },

      {
        routerLink: "1",
        icon: null,
        label: "Booking List",
        pinned: false,
      },

      {
        routerLink: "cancelled-bookings",
        icon: null,
        label: "Cancelled Bookings",
        pinned: false,
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

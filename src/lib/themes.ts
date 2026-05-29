import { createTheme } from "@mui/material";

const asideMenuTitleTypographyTheme = createTheme({
  // typography: {
  //   fontSize: 14,
  //   // fontWeightMedium: 600,
  //   h6: {
  //     fontWeight: 600,
  //   },

  //   // "letterSpacing": 0.32,
  // },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          letterSpacing: "0.7em",
          fontWeight: 600,
        },
      },
    },
  },
});

const formHeaderTitleTypographyTheme = createTheme({
  // typography: {
  //   fontSize: 14,
  //   // fontWeightMedium: 600,
  //   h6: {
  //     fontWeight: 600,
  //   },

  //   // "letterSpacing": 0.32,
  // },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          letterSpacing: "0.7em",
          fontWeight: 600,
          borderRadius: 5,
          // backgroundColor: "#fff",
          backgroundColor: "#DCDCDC",
        },
      },
    },
  },
});

const formErrorMessageDisplayTypographyTheme = createTheme({
  // typography: {
  //   fontSize: 14,
  //   // fontWeightMedium: 600,
  //   h6: {
  //     fontWeight: 600,
  //   },

  //   // "letterSpacing": 0.32,
  // },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 5,
          color: "#FF0000",
        },
      },
    },
  },
});

export const asideSubMenuTypographyTheme = createTheme({
  // typography: {
  //   fontSize: 14,
  //   // fontWeightMedium: 600,
  //   h6: {
  //     fontWeight: 600,
  //   },

  //   // "letterSpacing": 0.32,
  // },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          // variants: "h6",
          color: "#42a5f5",
          fontWeight: 600,
          textAlign: "center",
          margin: "auto",
          padding: "auto",
          // ":hover": { color: "#fff", fontWeight: "500" },
        },
      },
    },
  },
});

// const theme = createTheme({
//   components: {
//     // Name of the component
//     MuiButton: {
//       styleOverrides: {
//         // Name of the slot
//         root: {
//           // Some CSS
//           fontSize: "1rem",
//         },
//       },
//     },
//   },
// });

// const theme = createTheme({
//   palette: {
//     tomato: "#FF6347",
//     pink: {
//       deep: "#FF1493",
//       hot: "#FF69B4",
//     },
//   },
// });

export {
  asideMenuTitleTypographyTheme,
  formHeaderTitleTypographyTheme,
  formErrorMessageDisplayTypographyTheme,
};

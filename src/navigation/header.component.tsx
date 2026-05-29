import { useState } from "react";

import { ExpandMoreOutlined } from "@mui/icons-material";

import { createTheme } from "@mui/material";
import MenuIcon from "./menu-icon.component";

// import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import {
  Card,
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  List,
  ListItem,
  ThemeProvider,
  // Button,
} from "@mui/material";

//import logo from "../assets/logo/SmallLogo.jpg";
// import logoTransparent from "../assets/logo/Hotel-management-logo.jpg";
// import logoTransparentWebP from "/assets/logo/mt-lavinia-hotel-logo.png";
// import menuLogo from "/assets/logo/Logo8.png";

// import logo8 from "../assets/Logo8.png";
import verticalMenuLogo from "../assets/Hotel-management-logo-transparent.png";
// import verticalMenuLogo from "../assets/hotel-management-logo.jpg";
import hotelLogo from "../assets/mt-lavinia-hotel-logo.png";
import { navbarData } from "../data/nav-data";

import Menu from "./menu.component";
import { Link } from "react-router-dom";

const handleMouseEnter = () => {
  const ele = document.getElementById("show-mobileMenu");
  if (ele) {
    ele.style.left = "0px";
    ele.style.width = "20%";
  }
};

const handleMouseLeave = () => {
  const ele = document.getElementById("show-mobileMenu");
  if (ele) {
    ele.style.width = "150px";
    ele.style.left = "-140px";
  }
};

// const handleMouseEnter1 = () => {
//   const ele = document.getElementById("show-mobileMenu")!;

//   ele.style.left = "0px";
//   ele.style.width = "20%";
//   ele.style.transition = "width 1000ms ";
//   ele.style.animation = "linear";
// };

// const handleMouseLeave1 = () => {
//   const ele = document.getElementById("show-mobileMenu")!;

//   ele.style.width = "150px";
//   ele.style.left = "-140px";
//   ele.style.transition = "width 1000ms ";
//   ele.style.animation = "linear";
// };

const theme = createTheme({
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          background: "#9e9e9e",
          borderRadius: "10px",
          boxShadow:
            " 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); ",
        },
      },
    },
  },
});

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

const asideSubMenuTypographyTheme = createTheme({
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
          ":hover": { color: "#fff", fontWeight: "500" },
        },
      },
    },
  },
});

const Header = () => {
  const [open, setOpen] = useState(0);
  // const [rotation, setRotation] = useState(50);
  // const handleOpen = (value: number) => {
  //   setOpen(open === value ? 0 : value);
  // };

  let counter = 0;

  // const CUSTOM_ANIMATION = {
  //   mount: { scale: 1 },
  //   unmount: { scale: 0.2 },
  // };

  const handleChange = (event: React.SyntheticEvent) => {
    let passValue = 0;

    const textContent = (event.target as HTMLElement).textContent;
    switch (textContent) {
      case "General":
        passValue = 1;
        break;
      case "Booking":
        passValue = 2;
        break;
      case "Reports":
        passValue = 3;
        break;
    }
    if (open === passValue) {
      setOpen(0);
    } else {
      setOpen(passValue);
    }
  };

  return (
    <>
      <div className="flex w-full overflow-hidden h-full">
        <div className="flex w-full">
          <div className="container flex-wrap w-full flex 1 1 100% mx-5">
            <div className="w-full flex justify-around h1-[10%]">
              {/* header logo */}
              <div className="flex w-[80%] m-auto ">
                <Link to={"/"}>
                  <img
                    src={hotelLogo}
                    alt="Hotel Bookings Pro logo"
                    className="w-[17%] h1-auto m1-auto m1-5"
                  />
                </Link>
              </div>

              <div className="flex flex-col justify-around w-[20%] m-auto align-middle"></div>
            </div>

            {/* mobile width <= 767px
            tablet width >= 768px
            laptop width >= 1024px
            */}
            {/* https://www.joshwcomeau.com/animation/keyframe-animations/ */}

            {/* div with 150px then -left-[140px]  */}

            {/* vertical menu */}
            <div id="vertical-menu" className="w-0 h-0 z-50 relative">
              <nav className="flex flex-col flex-1">
                <div
                  // className="flex flex-col flex-1 items-center w-40 text-sm rounded-md bg-blue-400 font-semibold border-2 border-gray-500 p-2 -left-37.5 top-1 absolute h-full"
                  className="flex flex-col items-center w-40 
                             text-sm rounded-md bg-blue-400 font-semibold border-2 border-gray-500 p-2 
                             fixed top-2 bottom-2 -left-35 z-50 
                             transition-all duration-300 ease-in-out"
                  id="show-mobileMenu"
                  onMouseEnter={() => handleMouseEnter()}
                  onMouseLeave={() => handleMouseLeave()}
                >
                  <img
                    src={verticalMenuLogo}
                    alt="Hotel Management logo"
                    className="m-auto justify-center top-0 px-0.5 p-0.3 rounded-md w-28"

                    // style={{
                    //   transform: `rotate(${rotation}deg)`,
                    //   transition: "transform 0.5s ease",
                    // }}
                  />

                  <div className="w-full mr-0 px-2 py-3 overflow-hidden 1absolute">
                    <ThemeProvider theme={theme}>
                      <Card
                        className="m-auto h-[calc(100vh-2rem)] w-full p-4 shadow-xl shadow-blue-gray-900 border border-blue-gray-900 overflow-hidden"
                        id="main-menu"
                      >
                        <div className="text-center ">
                          <ThemeProvider theme={asideMenuTitleTypographyTheme}>
                            <Typography
                              // variant="h6"
                              color="black"
                            >
                              Hotel Book Pro
                            </Typography>
                          </ThemeProvider>
                        </div>

                        <Box
                          sx={{
                            margin: 0,
                            padding: 0,
                          }}
                        >
                          <List className="flex1 flex-col m-auto justify-around bg-[#9e9e9e] mt-0 mb-0">
                            {navbarData.map((menu) => {
                              counter++;

                              return (
                                <Accordion
                                  expanded={open === counter}
                                  onChange={(event) => handleChange(event)}
                                  key={menu.label}
                                  style={{
                                    backgroundColor: "#9e9e9e",
                                    margin: "0px",
                                    paddingLeft: "3px",
                                    paddingRight: "3px",
                                    paddingTop: "3px",
                                    paddingBottom: "3px",
                                    boxShadow:
                                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(128, 128,128, 0.08)",
                                    border: "4x solid #000",
                                  }}
                                >
                                  <ListItem
                                    className="p-0 duration-150 transition-[400ms] border-2 border-gray-600 flex justify-around"
                                    id={counter.toString()}
                                    style={{
                                      backgroundColor: "black",
                                      margin: 0,
                                      borderRadius: "8px",
                                      height: "40px",
                                      marginBottom: "2px",
                                      padding: "0",
                                    }}
                                  >
                                    {
                                      // <Button
                                      //   onClick={(event) => {
                                      //     console.log("clicked");
                                      //     handleChange(event);
                                      //   }}
                                      // >
                                      <MenuIcon
                                        name={menu.label}

                                        // onClick={(
                                        //   event: React.MouseEvent<HTMLDivElement>,
                                        // ) => handleChange(event)}
                                      />
                                      // </Button>
                                    }
                                    {/* <AddCircleOutline className="text-blue-400" /> */}

                                    <AccordionSummary
                                      expandIcon={
                                        <ExpandMoreOutlined
                                          htmlColor="#9e9e9e"
                                          style={{
                                            margin: "0px",
                                            height: "16px",
                                            width: "16px",
                                          }}
                                          className="w-full"
                                        />
                                      }
                                    >
                                      <ThemeProvider
                                        theme={asideSubMenuTypographyTheme}
                                      >
                                        <Typography>{menu.label}</Typography>
                                      </ThemeProvider>
                                    </AccordionSummary>
                                  </ListItem>

                                  <AccordionDetails className="rounded-md shadow-xl drop-shadow1-gray-300 border1-4 border1-red-400">
                                    <List className="p-0">
                                      {menu.subMenus &&
                                        menu.subMenus.map((subMenu) => {
                                          return (
                                            <ListItem
                                              className="m-0 h1-[3em] h-auto w-auto rounded-md my-2 w1-full border1-amber-500 border1-3"
                                              key={subMenu.label}
                                            >
                                              <ul className="h-full w-full m-0 p-0">
                                                <Menu
                                                  subMenus={null}
                                                  label={subMenu.label}
                                                  icon=""
                                                  routerLink={
                                                    subMenu.routerLink
                                                  }
                                                />
                                              </ul>
                                            </ListItem>
                                          );
                                        })}
                                    </List>
                                  </AccordionDetails>
                                </Accordion>
                              );
                            })}
                          </List>
                        </Box>
                      </Card>
                    </ThemeProvider>
                  </div>

                  <div className="pb1-10 text-sm font-bold text-center py1-2">
                    Pioneering in Hotel industry
                  </div>
                </div>
              </nav>
            </div>
            {/* end of vertical menu  */}

            {/* <div className="flex w-[100%] mt-3 border-4 border-blue-600 h-[80%]">
              <Outlet />
            </div> */}
            {/* <div className="flex flex-col w-[100%] max1-h-[14%] h-[12%] mt-2 bg1-[#f9f9] b1-3 border1-red-800 justify-center mb-0 ">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sed nam
              nostrum, non quisquam maxime optio laborum delectus voluptate eos
              maiores rerum consectetur, laboriosam et. Quo recusandae
              voluptatem consequatur quam maiores!
              <Footer />
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;

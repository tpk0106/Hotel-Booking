import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HashRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";

const blueTheme = createTheme({
  palette: {
    primary: {
      main: "#42a5f5",
      light: "#808080",
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: "#42a5f5",
      light: "#F5EBFF",
      // dark: will be calculated from palette.secondary.main,
      contrastText: "#47008F",
    },
    text: {
      primary: "#173A5E",
      secondary: "#46505A",
    },
    background: {
      paper: "#fff",
    },
    action: {
      active: "#001E3C",
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={blueTheme}>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  </StrictMode>,
);

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: "none" as const,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined" as const,
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
  },
  palette: {
    background: {
      default: "#FAFAF7",
      paper: "#FFFFFF",
    },
    error: {
      main: "#C62828",
    },
    primary: {
      dark: "#345740",
      light: "#E8F0EA",
      main: "#4A7C59",
    },
    secondary: {
      main: "#C8A96E",
    },
    success: {
      main: "#2E7D32",
    },
    text: {
      primary: "#2D2D2D",
      secondary: "#6B6B6B",
    },
  },
  typography: {
    body1: {
      fontFamily: "'Inter', sans-serif",
    },
    body2: {
      fontFamily: "'Inter', sans-serif",
    },
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontFamily: "'Lora', serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'Lora', serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'Lora', serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "'Lora', serif",
      fontWeight: 500,
    },
    h5: {
      fontFamily: "'Lora', serif",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "'Lora', serif",
      fontWeight: 500,
    },
  },
});

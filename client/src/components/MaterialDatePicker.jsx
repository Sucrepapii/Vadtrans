import React from "react";
import { LocalizationProvider, DatePicker, MultiSectionDigitalTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";

// Matches the app's brand red (#E31E24) + premium mission control aesthetic
const appTheme = createTheme({
  palette: {
    primary: { main: "#E31E24", light: "#FF3339", dark: "#C11A1F" },
    text: { primary: "#1A1A1A", secondary: "#4B5563" },
  },
  typography: {
    fontFamily: "'Poppins', 'Raleway', sans-serif",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          border: "1px solid #E5E7EB",
          marginTop: "4px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          fontSize: "0.875rem",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "#F9FAFB",
          },
          "&.Mui-focused": {
            boxShadow: "0 0 0 4px rgba(227, 30, 36, 0.05)",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E5E7EB",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D1D5DB",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E31E24",
            borderWidth: "1.5px",
          },
        },
        input: {
          padding: "10px 14px",
          fontWeight: 500,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#4B5563",
          textTransform: "uppercase",
          letterSpacing: "0.025em",
          "&.Mui-focused": {
            color: "#E31E24",
          },
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 500,
          "&.Mui-selected": {
            backgroundColor: "#E31E24",
            "&:hover": {
              backgroundColor: "#C11A1F",
            },
          },
          "&:hover": {
            backgroundColor: "rgba(227, 30, 36, 0.08)",
          },
        },
        today: {
          borderColor: "#E31E24 !important",
          borderWidth: "1.5px !important",
          color: "#E31E24",
        },
      },
    },
    MuiMultiSectionDigitalTimePicker: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          margin: "2px 6px",
          fontSize: "0.875rem",
          fontWeight: 500,
          "&.Mui-selected": {
            backgroundColor: "rgba(227, 30, 36, 0.08) !important",
            color: "#E31E24",
            fontWeight: 600,
          },
          "&:hover": {
            backgroundColor: "#F3F4F6",
          },
        },
      },
    },
  },
});

const MaterialDatePicker = ({
  label = "Select Date",
  value,
  onChange,
  minDate,
  className = "",
  fullWidth = true,
}) => {
  const dateValue = value ? dayjs(value) : null;

  const handleChange = (newValue) => {
    if (newValue) {
      onChange(newValue.toDate());
    } else {
      onChange(null);
    }
  };

  return (
    <ThemeProvider theme={appTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className={`w-full ${className}`}>
          <DatePicker
            label={label}
            value={dateValue}
            onChange={handleChange}
            minDate={minDate ? dayjs(minDate) : undefined}
            slotProps={{
              textField: {
                fullWidth: fullWidth,
                variant: "outlined",
                size: "small",
              },
            }}
          />
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export const MaterialTimePicker = ({
  label = "Select Time",
  value,
  onChange,
  className = "",
  fullWidth = true,
}) => {
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    if (timeStr.includes("AM") || timeStr.includes("PM")) {
      return dayjs(timeStr, "hh:mm A");
    }
    const [hours, minutes] = timeStr.split(":");
    return dayjs().hour(parseInt(hours)).minute(parseInt(minutes));
  };

  const timeValue = value ? parseTime(value) : null;

  const handleChange = (newValue) => {
    if (newValue) {
      onChange(newValue.format("hh:mm A"));
    } else {
      onChange("");
    }
  };

  return (
    <ThemeProvider theme={appTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className={`w-full ${className}`}>
          <MultiSectionDigitalTimePicker
            label={label}
            value={timeValue}
            onChange={handleChange}
            ampm={true}
            slotProps={{
              textField: {
                fullWidth: fullWidth,
                variant: "outlined",
                size: "small",
              },
            }}
          />
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default MaterialDatePicker;

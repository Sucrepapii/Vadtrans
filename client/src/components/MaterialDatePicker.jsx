import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";

// Matches the app's primary purple + the new form card aesthetic:
// rounded-xl (12px), neutral-200 border, xs semibold labels, white bg
const appTheme = createTheme({
  palette: {
    primary: { main: "#8e24aa" },
  },
  typography: {
    fontFamily: "'Inter', 'Outfit', sans-serif",
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "0.75rem",        // rounded-xl
          backgroundColor: "#ffffff",
          fontSize: "0.875rem",           // text-sm
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#d1d5db",       // neutral-300 on hover
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#8e24aa",
            borderWidth: "2px",
          },
        },
        notchedOutline: {
          borderColor: "#e5e7eb",         // neutral-200
        },
        input: {
          padding: "10px 14px",           // py-2.5 equivalent
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem",            // text-xs
          fontWeight: 600,
          color: "#525252",               // neutral-600
          "&.Mui-focused": {
            color: "#8e24aa",
          },
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem",
          "&.Mui-selected": {
            backgroundColor: "#8e24aa",
          },
        },
      },
    },
    MuiClock: {
      styleOverrides: {
        pin: { backgroundColor: "#8e24aa" },
      },
    },
    MuiClockPointer: {
      styleOverrides: {
        root: { backgroundColor: "#8e24aa" },
        thumb: {
          backgroundColor: "#8e24aa",
          borderColor: "#8e24aa",
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
          <TimePicker
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

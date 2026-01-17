import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";

// Custom theme to match the user's "Purple" request
// The color from the screenshot resembles deep purple.
const purpleTheme = createTheme({
  palette: {
    primary: {
      main: "#8e24aa", // Deep Purple similar to the screenshot
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          width: "100%",
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
  // Convert string/Date to dayjs object if necessary
  const dateValue = value ? dayjs(value) : null;

  const handleChange = (newValue) => {
    // Return standard Javascript Date object or ISO string to parent
    // to maintain compatibility with existing app logic
    if (newValue) {
      onChange(newValue.toDate());
    } else {
      onChange(null);
    }
  };

  return (
    <ThemeProvider theme={purpleTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className={className}>
          <DatePicker
            label={label}
            value={dateValue}
            onChange={handleChange}
            minDate={minDate ? dayjs(minDate) : undefined}
            slotProps={{
              textField: {
                fullWidth: fullWidth,
                variant: "outlined",
                sx: {
                  // Custom styles to blend with existing inputs
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "0.5rem", // Tailwind rounded-lg
                    backgroundColor: "white",
                  },
                },
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
  // Helpers to parse "HH:MM" string to dayjs object
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":");
    return dayjs().hour(hours).minute(minutes);
  };

  const timeValue = value ? parseTime(value) : null;

  const handleChange = (newValue) => {
    if (newValue) {
      // Format back to "HH:MM" string
      onChange(newValue.format("HH:mm"));
    } else {
      onChange("");
    }
  };

  return (
    <ThemeProvider theme={purpleTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className={className}>
          <TimePicker
            label={label}
            value={timeValue}
            onChange={handleChange}
            slotProps={{
              textField: {
                fullWidth: fullWidth,
                variant: "outlined",
                sx: {
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "0.5rem",
                    backgroundColor: "white",
                  },
                },
              },
            }}
          />
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default MaterialDatePicker;

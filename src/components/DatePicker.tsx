import { StaticDatePicker } from "@mui/x-date-pickers";
import { state } from "../data/state";
import { useCallback } from "react";

export function DatePicker() {
  // sets formatted dat and month in state
  const handleDateChange = useCallback(
    (date: { $D: number; $M: number; $L: string } | null) => {
      if (!date) {
        return;
      }
      const DD = date.$D.toString().padStart(2, "0");
      const MM = (date.$M + 1).toString().padStart(2, "0");
      state.monthAndDay = { DD, MM };
    },
    [state]
  );

  return (
    <StaticDatePicker
      onChange={handleDateChange}
      orientation="landscape"
      slotProps={{
        // The actions will be the same between desktop and mobile
        actionBar: {
          actions: undefined,
        },
      }}
    />
  );
}

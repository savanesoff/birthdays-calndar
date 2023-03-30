import { useCallback } from "react";
import "./App.css";
import { useBirthdays } from "./data/useBirthdays";
import { StaticDatePicker } from "@mui/x-date-pickers";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { Alert } from "@mui/material";
import { FavoritesList } from "./components/FavoritesList";
import { BirthdayList } from "./components/BirthdaysList";
import { Footer } from "./components/Footer";

function App() {
  const { setDates, error, loading, birthdays } = useBirthdays();

  const handleDateChange = useCallback(
    (date: { $D: number; $M: number; $L: string } | null) => {
      if (!date) {
        return;
      }
      const DD = date.$D.toString().padStart(2, "0");
      const MM = (date.$M + 1).toString().padStart(2, "0");
      setDates({
        MM,
        DD,
      });
    },
    []
  );

  return (
    <div className="App">
      <h1>Celebrity birthday finder</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "stretch",
          height: "80vh",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "stretch",
            width: "50vw",
          }}
        >
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
          <BirthdayList />
        </div>

        <FavoritesList />
      </div>

      {error && <Alert severity="error">{error}</Alert>}
      <Footer />
      {/* MUI tooltip does not play nice with scrollable lists, so using react-tooltip */}
      <Tooltip
        id={"tooltip"}
        delayShow={700}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          // padding: 10,
          padding: 10,
          // paddingRight: 120,
          color: "black",
          // fontWeight: "bold",
          fontSize: "0.9rem",
          maxWidth: 500,
          textAlign: "left",
        }}
      />
    </div>
  );
}

export default App;

import "./App.css";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { Alert } from "@mui/material";
import { FavoritesList } from "./components/FavoritesList";
import { BirthdayList } from "./components/BirthdaysList";
import { Footer } from "./components/Footer";
import { DatePicker } from "./components/DatePicker";
import { useSnapshot } from "valtio";
import { state } from "./data/state";

function App() {
  const { error } = useSnapshot(state);

  return (
    <div className="App">
      <h1>Birthdays calendar</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "stretch",
          height: "80vh",
          width: "100%",
          gap: "2rem",
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
          <DatePicker />
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

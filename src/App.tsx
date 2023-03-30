import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { BirthType, useBirthdays } from "./data/useBirthdays";
import { StaticDatePicker } from "@mui/x-date-pickers";
import { Header } from "./Header";
import defaultAvatar from "./assets/default_avatar.png";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { Alert, CircularProgress } from "@mui/material";

function App() {
  const {
    setDates,
    error,
    loading,
    birthdays,
    toggleFavorite,
    favorites,
    month,
    day,
    favoritesMap,
  } = useBirthdays();

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
      <Header />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
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
        <Favorites />
      </div>
      {error && <Alert severity="error">{error}</Alert>}
      {!error && loading && <CircularProgress color="secondary" />}
      {!loading && !error && birthdays?.births && <ListBirthdays />}

      <Tooltip
        id={"person-tooltip"}
        delayShow={1000}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          // padding: 10,
          padding: 20,
          // paddingRight: 120,
          color: "black",
          // fontWeight: "bold",
          fontSize: "0.7rem",
          maxWidth: 500,
          textAlign: "left",
        }}
      />
    </div>
  );
}

function getLocalizedDate(date: string) {
  // in formate {DD}{MM}, use regex
  const data = date.match(/\{DD:(\d+)\}\{MM:(\d+)\}/);
  if (!data) {
    return date;
  }
  const dateObj = new Date();
  dateObj.setMonth(parseInt(data[2]) - 1);
  dateObj.setDate(parseInt(data[1]));

  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

function Favorites() {
  const { favoritesMap, clearFavorites } = useBirthdays();
  return (
    <>
      {favoritesMap && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
            flexGrow: 1,
            width: "500px",
            maxHeight: "30vh",
            overflow: "auto",
          }}
        >
          <p>Favorites</p>
          {Array.from(favoritesMap.entries()).map(([key, value]) => (
            <div key={key}>
              <p> {getLocalizedDate(key)} </p>
              {value.map((v, i) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <img
                    src={v.imageUrl || defaultAvatar}
                    alt={v.title}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "gray",
                    }}
                  />
                  <p key={i}> {v.title} </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <button onClick={clearFavorites}>Clear</button>
    </>
  );
}

function ListBirthdays() {
  const {
    setDates,
    error,
    loading,
    birthdays,
    toggleFavorite,
    favorites,
    month,
    day,
  } = useBirthdays();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        flexGrow: 1,
        width: "500px",
        maxHeight: "30vh",
        overflow: "auto",
      }}
    >
      <p>
        Celebs born on: MM:{month}, DD: {day}
      </p>
      {birthdays?.births.map((birth, i) => (
        <ItemListBirthday data={birth} key={i} />
      ))}
    </div>
  );
}

function ItemListBirthday({ data }: { data: BirthType }): JSX.Element {
  const {
    setDates,
    error,
    loading,
    birthdays,
    toggleFavorite,
    getFormattedItemValue,
    favorites,
    month,
    day,
  } = useBirthdays();

  return (
    <div
      data-tooltip-content={data.pages[0].extract}
      data-tooltip-id={"person-tooltip"}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // width: "100%",
        background:
          "linear-gradient(0deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 100%)",
        padding: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          flexGrow: 1,
          gap: 20,
          flexFlow: "row nowrap",
        }}
        onClick={() => window.open(data.pages[0].content_urls.desktop.page)}
      >
        <a href={data.pages[0].content_urls.desktop.page} target="_blank">
          <img
            src={
              (data.pages[0]?.thumbnail || data.pages[0]?.originalimage)
                ?.source || defaultAvatar
            }
            alt={data.text}
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              borderRadius: "50%",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "gray",
            }}
          />
        </a>
        <p>{data.pages[0].titles.normalized}</p>
      </div>
      <div
        style={{
          widows: 50,
          height: 50,
          padding: 10,
        }}
      >
        <Star
          onClick={() => toggleFavorite(data)}
          checked={favorites?.has(getFormattedItemValue(data))}
        />
      </div>
    </div>
  );
}

function Star({
  onClick,
  checked,
}: {
  onClick?: () => void;
  checked?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      onClick={onClick}
      style={{
        cursor: "pointer",
        color: "red",
        fill: checked ? "red" : "rgba(255, 255, 255, 0.2)",
        stroke: "white",
      }}
    >
      <polygon
        points="50 0, 64 36, 100 36, 70 58, 82 100, 50 78, 18 100, 30 58, 0 36, 36 36"
        // stroke="black"
        strokeWidth="2"
      />
    </svg>
  );
}

export default App;

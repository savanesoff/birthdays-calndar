import { proxy } from "valtio";
import { proxyMap, subscribeKey } from "valtio/utils";
import { BirthType } from "./types";

const API =
  "https://api.wikimedia.org/feed/v1/wikipedia/{LANGUAGE}/onthisday/births/{MM}/{DD}";

export type StateType = {
  favorites: Map<string, Map<string, BirthType>>;
  date: string;
  monthAndDay: {
    MM: string;
    DD: string;
  };
  // where key is date and value is array of birthdays
  cache: Map<string, BirthType[]>;
  birthdays: BirthType[];
  loading: boolean;
  locale: string;
  error: string | null;
};

// initial state
export const state: StateType = proxy<StateType>({
  favorites: proxyMap(),
  date: "",
  monthAndDay: {
    MM: "",
    DD: "",
  },
  cache: proxyMap(),
  birthdays: [],
  loading: false,
  locale: "en",
  error: null,
});

// reducer is triggered on every monthAndDay change and fetches data if it's not cached
// if data is not cached, it fetches it and caches it
subscribeKey(state, "monthAndDay", () => {
  state.date = getLocalizeDate(state.monthAndDay);
  // if data is not cached, fetch it
  if (!state.cache.has(state.date)) {
    state.loading = true;
    // reset current data
    state.birthdays = [];
    fetchData(state.monthAndDay)
      .then((data) => {
        // cache data
        state.cache.set(state.date, data || []);
        state.birthdays = state.cache.get(state.date) || [];
      })
      .catch((error) => {
        state.error = error.message;
      })
      .finally(() => {
        state.loading = false;
      });
  } else {
    // if data is cached, use it
    state.birthdays = state.cache.get(state.date) || [];
  }
});

// utils
const getLocalizeDate = ({ MM, DD }: { MM: string; DD: string }) => {
  const dateObj = new Date();
  dateObj.setMonth(parseInt(MM) - 1);
  dateObj.setDate(parseInt(DD));

  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
};

const fetchData = async ({
  MM,
  DD,
}: {
  MM: string;
  DD: string;
}): Promise<BirthType[]> => {
  // extrapolate url from API  by replacing {LANGUAGE}, {MM}, {DD} with state.locale, MM, DD
  const url = API.replace("{LANGUAGE}", state.locale)
    .replace("{MM}", MM)
    .replace("{DD}", DD);

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data.births as BirthType[];
    } else {
      const error = await response.json();
      throw new Error(
        `Error: ${error.title} ${error.detail ? `(${error.detail})` : ""}`
      );
    }
  } catch (error: unknown) {
    // @ts-ignore
    throw new Error(error?.message || error);
  }
};

/**
 * Toggles birthday in favorites
 * if it's already in favorites, it deletes it
 * if it's not in favorites, it adds it
 */
export const toggleFavorite = (data: BirthType) => {
  const date = state.date;
  // initialize date map if it doesn't exist
  if (!state.favorites.has(date)) {
    state.favorites.set(date, proxyMap());
  }
  const dateMap = state.favorites.get(date) as Map<string, BirthType>;
  if (dateMap.has(data.text)) {
    deleteFavorite({ date, data });
  } else {
    dateMap.set(data.text, data);
  }
};

/**
 * Deletes birthday from favorites
 */
export const deleteFavorite = ({
  date,
  data,
}: {
  /** as localized date string */
  date: string;
  data: BirthType;
}): void => {
  const dateMap = state.favorites.get(date) as Map<string, BirthType>;
  dateMap.delete(data.text);
  // delete date map if it's empty
  if (dateMap.size === 0) {
    state.favorites.delete(date);
  }
};

// test
export const hasCurrentDateFavorite = (data: BirthType) => {
  const date = state.date;
  return state.favorites.get(date)?.has(data.text);
};

// restore state from localStorage on page load
function restoreState() {
  const dates =
    JSON.parse(localStorage.getItem("favorites-dates") || "null") || [];

  dates.forEach((date: string) => {
    const birthdays = JSON.parse(localStorage.getItem(date) || "null") || [];
    state.favorites.set(date, proxyMap());
    birthdays.forEach((birthday: BirthType) => {
      state.favorites.get(date)?.set(birthday.text, birthday);
    });
  });
}
// save state to localStorage on page unload
function saveState() {
  const dates = Array.from(state.favorites.keys());
  localStorage.setItem("favorites-dates", JSON.stringify(dates));
  dates.forEach((date) => {
    const birthdays = Array.from(state.favorites.get(date)?.values() || []);
    localStorage.setItem(date, JSON.stringify(birthdays));
  });
}
// add event listeners
window.addEventListener("DOMContentLoaded", restoreState);
window.addEventListener("beforeunload", saveState);

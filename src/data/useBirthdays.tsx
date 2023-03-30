import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type PageType = {
  type: string;
  title: string;
  displaytitle: string;
  namespace: { id: number; text: string };
  wikibase_item: string;
  titles: {
    canonical: string;
    normalized: string;
    display: string;
  };
  pageid: number;
  thumbnail: {
    source: string;
    width: number;
    height: number;
  };
  originalimage: {
    source: string;
    width: number;
    height: number;
  };
  lang: string;
  dir: string;
  revision: string;
  tid: string;
  timestamp: string;
  description: string;
  description_source: string;
  content_urls: {
    desktop: {
      page: string;
      revisions: string;
      edit: string;
      talk: string;
    };
    mobile: {
      page: string;
      revisions: string;
      edit: string;
      talk: string;
    };
  };
  extract: string;
  extract_html: string;
  normalizedtitle: string;
};
export type BirthType = {
  text: string;
  year: number;
  pages: PageType[];
};
export type DataType = {
  births: BirthType[];
};

type FavoritesMapType = Map<string, { title: string; imageUrl: string }[]>;

const API =
  "https://api.wikimedia.org/feed/v1/wikipedia/{LANGUAGE}/onthisday/births/{MM}/{DD}";
const LOCAL_STORAGE_KEY = "favorites";
const LOCAL_STORAGE_DELIMITER = "^$^";
const dataCache = new Map<string, DataType>();

type BirthdaysContextType = {
  loading: boolean;
  error: string | null;
  birthdays: DataType | null;
  toggleFavorite: (data: BirthType) => void;
  favorites: Set<string> | null;
  setDates: ({ MM, DD }: { MM: string; DD: string }) => void;
  month: string | null;
  day: string | null;
  language: string;
  setLanguage: (language: string) => void;
  favoritesMap: Map<string, { title: string; imageUrl: string }[]>;
  clearFavorites: () => void;
  getFormattedItemValue: (item: BirthType) => string;
};

const BirthdayContext = createContext<BirthdaysContextType>({
  loading: false,
  error: null,
  birthdays: null,
  toggleFavorite: () => {},
  favorites: null,
  setDates: () => {},
  month: null,
  day: null,
  language: "en",
  setLanguage: () => {},
  favoritesMap: new Map(),
  clearFavorites: () => {},
  getFormattedItemValue: () => "",
});

export function BirthdaysProvider({
  locale,
  children,
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [birthdays, setBirthdays] = useState<DataType | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(
      (localStorage.getItem(LOCAL_STORAGE_KEY) || "").split(
        LOCAL_STORAGE_DELIMITER
      )
    )
  );
  const [language, setLanguage] = useState(locale || "en");
  const [month, setMonth] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [favoritesMap, setFavoritesMap] = useState<FavoritesMapType>(new Map());

  const setDates = useCallback(({ MM, DD }: { MM: string; DD: string }) => {
    setMonth(MM);
    setDay(DD);
  }, []);

  // change of language or month or day will trigger the fetch
  useEffect(() => {
    if (month && day) {
      fetchData({ mm: month, dd: day });
    }
  }, [month, day]);

  // change of favorites will trigger the map creation of favorites
  useEffect(() => {
    if (!favorites) {
      return;
    }
    //create a map of favorites with key as {DD:dd}{MM:mm} and value as text
    const favoritesMap = new Map<
      string,
      { title: string; imageUrl: string }[]
    >();
    favorites.forEach((favorite) => {
      // use reges to get the text and date
      //   const text = favorite.match(/\{DD:(\d+)\}\{MM:(\d+)\}\{TITLE:(.*)\}/);
      const data = favorite.match(
        /\{DD:(\d+)\}\{MM:(\d+)\}\{TITLE:(.*)\}\{IMG:(.*)\}/
      );
      if (data) {
        const key = `{DD:${data[1]}}{MM:${data[2]}}`;
        const value = {
          title: data[3],
          imageUrl: data[4] === "undefined" ? "" : data[4],
        };

        if (favoritesMap.has(key)) {
          favoritesMap.set(key, [
            ...(favoritesMap.get(key) as { title: string; imageUrl: string }[]),
            value,
          ]);
        } else {
          favoritesMap.set(key, [value]);
        }
      }
    });
    setFavoritesMap(favoritesMap);
  }, [favorites]);

  const getFormattedItemValue = useCallback(
    (data: BirthType) => {
      const imageURL = (
        data.pages[0]?.thumbnail || data.pages[0]?.originalimage
      )?.source;
      return `{DD:${day}}{MM:${month}}{TITLE:${data.text}}{IMG:${imageURL}}`;
    },
    [day, month]
  );

  const toggleFavorite = useCallback(
    (data: BirthType) => {
      const value = getFormattedItemValue(data);
      const favorites = new Set(
        (localStorage.getItem(LOCAL_STORAGE_KEY) || "").split(
          LOCAL_STORAGE_DELIMITER
        )
      );
      if (favorites.has(value)) {
        favorites.delete(value);
      } else {
        favorites.add(value);
      }
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        Array.from(favorites).join(LOCAL_STORAGE_DELIMITER)
      );
      setFavorites(favorites);
    },
    [day, month, favorites]
  );

  const clearFavorites = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setFavorites(new Set());
  }, []);

  const fetchData = useCallback(
    async ({
      mm,
      dd,
    }: {
      mm: string;
      dd: string;
    }): Promise<DataType | void> => {
      setLoading(true);

      setBirthdays(null);
      const url = API.replace("{LANGUAGE}", language)
        .replace("{MM}", mm)
        .replace("{DD}", dd);

      if (dataCache.has(url)) {
        setBirthdays(dataCache.get(url) as DataType);
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(url);
        if (response.ok) {
          setLoading(false);
          const data = await response.json();
          setBirthdays(data);
          dataCache.set(url, data);
        } else {
          const error = await response.json();
          setError(
            `Error: ${error.title} ${error.detail ? `(${error.detail})` : ""}`
          );
        }
      } catch (error: unknown) {
        // @ts-ignore
        setError(error?.message);
      }
      setLoading(false);
    },
    []
  );

  return (
    <BirthdayContext.Provider
      value={{
        setDates,
        loading,
        error,
        birthdays,
        toggleFavorite,
        favorites,
        language,
        setLanguage,
        month,
        day,
        favoritesMap,
        clearFavorites,
        getFormattedItemValue,
      }}
    >
      {children}
    </BirthdayContext.Provider>
  );
}

export function useBirthdays() {
  return useContext(BirthdayContext);
}

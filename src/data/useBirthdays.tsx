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
  favoritesMap: Map<string, string[]>;
  clearFavorites: () => void;
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
  const [favoritesMap, setFavoritesMap] = useState<Map<string, string[]>>(
    new Map()
  );

  const setDates = useCallback(({ MM, DD }: { MM: string; DD: string }) => {
    setMonth(MM);
    setDay(DD);
  }, []);

  useEffect(() => {
    if (month && day) {
      fetchData({ mm: month, dd: day });
    }
  }, [month, day]);

  useEffect(() => {
    if (!favorites) {
      return;
    }
    //create a map of favorites with key as {DD:dd}{MM:mm} and value as text
    const favoritesMap = new Map<string, string[]>();
    favorites.forEach((favorite) => {
      // use reges to get the text and date
      const text = favorite.match(/\{DD:(\d+)\}\{MM:(\d+)\}(.*)/);
      if (text) {
        const key = `{DD:${text[1]}}{MM:${text[2]}}`;
        const value = text[3];
        if (favoritesMap.has(key)) {
          favoritesMap.set(key, [
            ...(favoritesMap.get(key) as string[]),
            value,
          ]);
        } else {
          favoritesMap.set(key, [value]);
        }
      }
    });
    setFavoritesMap(favoritesMap);
  }, [favorites]);

  const toggleFavorite = useCallback(
    (data: BirthType) => {
      const value = `{DD:${day}}{MM:${month}}${data.text}`;
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
      }}
    >
      {children}
    </BirthdayContext.Provider>
  );
}

export function useBirthdays() {
  return useContext(BirthdayContext);
}

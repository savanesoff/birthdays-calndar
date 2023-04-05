import { BirthType } from "../data/types";
import defaultAvatar from "../assets/default_avatar.png";
import {
  Alert,
  Avatar,
  CircularProgress,
  Divider,
  Input,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import { useSnapshot } from "valtio";
import { hasCurrentDateFavorite, state, toggleFavorite } from "../data/state";
import { FixedSizeList } from "react-window";

const TEST_ID = "birthday-list";
export const IDS = {
  component: TEST_ID,
  title: `${TEST_ID}-title`,
  list: `${TEST_ID}-list`,
  item: `${TEST_ID}-item`,
  avatar: `${TEST_ID}-avatar`,
  text: `${TEST_ID}-text`,
  favorite: `${TEST_ID}-favorite`,
  input: `${TEST_ID}-input`,
  alert: `${TEST_ID}-alert`,
  loading: `${TEST_ID}-loading`,
};

const DEBOUNCE_DELAY = 700;
/**
 * List of birthdays for the selected date
 * No need to pass any props, as the data is fetched from the context
 */
export function BirthdayList(): JSX.Element {
  const { birthdays, loading, date } = useSnapshot(state);
  // filtered data, which is the data that is displayed
  const [filtered, setFiltered] = useState<BirthType[]>(
    birthdays as BirthType[]
  );
  // filter string
  const [filter, setFilter] = useState("");
  // delay for debounce
  const [filterDelay, setFilterDelay] = useState<NodeJS.Timeout | undefined>();

  // filters the data based on the filter string
  // presumably by name, but also includes the text
  const filterData = useCallback(
    (filter: string) => {
      if (filter) {
        const filtered = birthdays.filter((data) => {
          const regex = new RegExp(filter, "i");
          return regex.test(data.text);
        }) as BirthType[];
        setFiltered(filtered);
      } else {
        // if no filter, then just show all the data
        setFiltered(birthdays as BirthType[]);
      }
    },
    [birthdays]
  );

  // memoized handler
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(e.target.value);
    },
    []
  );

  // initial filter
  useEffect(() => {
    filterData(filter);
  }, [birthdays]);

  // debounce filter
  // this is to prevent the filter from being called on every keystroke
  // and instead only call it after the user has stopped typing
  useEffect(() => {
    clearTimeout(filterDelay);
    const delay = setTimeout(() => {
      filterData(filter.trim());
    }, DEBOUNCE_DELAY);
    setFilterDelay(delay);
    return () => {
      clearTimeout(delay);
    };
  }, [filter]);

  /**
   * Memoized list of birthdays based on the filtered data
   */
  const ListMemo = useMemo(() => {
    if (!filtered) return null;
    return (
      <FixedSizeList
        height={366}
        width={"100%"}
        itemSize={56}
        itemCount={filtered.length}
        overscanCount={6}
      >
        {({ index, style }) => {
          const data = filtered[index];
          return (
            <ItemListBirthday
              data={data}
              style={style}
              key={index}
              index={index}
            />
          );
        }}
      </FixedSizeList>
    );
  }, [filtered]);

  return (
    <div
      data-testid={IDS.component}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        height: "50vh",
      }}
    >
      {/* Display title for the selected date */}
      {date && (
        <Typography variant="h6" data-testid={IDS.title}>
          Famous people born on: {date}
        </Typography>
      )}
      {/* Display message prompting user to select a date */}
      {!date && (
        <Alert severity="info" data-testid={IDS.alert}>
          Please select date to load birthdays
        </Alert>
      )}
      {/* This is the filter input */}
      <Input
        data-testid={IDS.input}
        placeholder="Filter by name"
        onChange={onInputChange}
      />
      {/* Display loading state */}
      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "300px",
          }}
        >
          <CircularProgress color="secondary" data-testid={IDS.loading} />
        </div>
      )}
      {!loading && ListMemo}
    </div>
  );
}

/**
 * Birthday list item, displays the avatar, name, and a star icon
 * Additionally, clicking on the item will open the WIKI page in a new tab
 * Clicking on the star icon will add/remove the person to/from favorites
 * Hovering over the star icon will display a tooltip
 * Hovering over the item will display a tooltip with the WIKI extract
 */
function ItemListBirthday({
  data,
  style,
  index,
}: {
  data: BirthType;
  style: React.CSSProperties;
  index: number;
}): JSX.Element {
  const { favorites } = useSnapshot(state);
  const avatar = data.pages[0].thumbnail?.source || defaultAvatar;
  const name = data.text;
  const alt = data.text;
  const url = data.pages[0].content_urls.desktop.page;
  // open WIKI page in new tab of current peron
  const openWiki = useCallback(() => window.open(url, "_blank"), [url]);
  const toggle = useCallback(() => toggleFavorite(data), [data]);
  // check if the current person is a favorite
  const checkedMemo = useMemo(
    () => hasCurrentDateFavorite(data),
    [favorites, data]
  );

  const Icon = useMemo(() => {
    return (
      <StarIcon
        fontSize="large"
        data-tooltip-content={
          checkedMemo ? "Remove from favorites" : "Add to favorites"
        }
        data-tooltip-id={"tooltip"}
        data-testid={`${IDS.favorite}-${index}`}
        // call valtio action to toggle favorite
        // which will be contextual to the current date
        onClick={toggle}
        style={{
          cursor: "pointer",
          fill: checkedMemo ? "#1dbbff" : "rgba(255, 255, 255, 0.1)",
          stroke: checkedMemo ? "#a1ddf7" : "rgba(255, 255, 255, 0.1)",
        }}
      />
    );
  }, [checkedMemo, data]);

  return (
    <div>
      <ListItem
        data-tooltip-content={data?.pages[0]?.extract}
        data-tooltip-id={"tooltip"}
        data-testid="birthdays-list-item"
        secondaryAction={Icon}
        disablePadding
        style={style}
      >
        <ListItemButton onClick={openWiki}>
          <ListItemAvatar>
            <Avatar alt={alt} src={avatar} />
          </ListItemAvatar>
          <ListItemText primary={name} />
        </ListItemButton>
      </ListItem>
      <Divider variant="inset" component="div" />
    </div>
  );
}

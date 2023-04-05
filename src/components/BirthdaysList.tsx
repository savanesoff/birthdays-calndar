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
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import { useSnapshot } from "valtio";
import { hasCurrentDateFavorite, state, toggleFavorite } from "../data/state";

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
      <List
        data-testid="birthdays-list"
        sx={{
          bgcolor: "background.paper",
          overflow: "auto",
        }}
      >
        {filtered.map((data) => (
          <div key={data.text}>
            <ItemListBirthday data={data} />
            <Divider variant="inset" component="div" />
          </div>
        ))}
      </List>
    );
  }, [filtered]);

  return (
    <div
      data-testid="birthdays-list-container"
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
        <h3 data-testid="birthdays-list-title">Famous people born on {date}</h3>
      )}
      {/* Display message prompting user to select a date */}
      {!date && (
        <Alert severity="info">Please select date to load birthdays</Alert>
      )}
      {/* This is the filter input */}
      <Input
        placeholder="Filter by name"
        onChange={(event) => setFilter(event.target.value)}
      />
      {/* Display loading state */}
      {loading && (
        <div
          data-testid="birthdays-list-loading"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "300px",
          }}
        >
          <CircularProgress color="secondary" data-testid="loader" />
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
function ItemListBirthday({ data }: { data: BirthType }): JSX.Element {
  const { favorites } = useSnapshot(state);
  const avatar = data.pages[0].thumbnail?.source || defaultAvatar;
  const name = data.text;
  const alt = data.text;
  const url = data.pages[0].content_urls.desktop.page;

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
        // call valtio action to toggle favorite
        // which will be contextual to the current date
        onClick={() => toggleFavorite(data)}
        style={{
          cursor: "pointer",
          fill: checkedMemo ? "#1dbbff" : "rgba(255, 255, 255, 0.1)",
          stroke: checkedMemo ? "#a1ddf7" : "rgba(255, 255, 255, 0.1)",
        }}
      />
    );
  }, [checkedMemo, data]);

  return (
    <ListItem
      data-tooltip-content={data.pages[0].extract}
      data-tooltip-id={"tooltip"}
      data-testid="birthdays-list-item"
      secondaryAction={Icon}
      disablePadding
    >
      <ListItemButton
        // open WIKI page in new tab of current peron
        onClick={() => window.open(url)}
      >
        <ListItemAvatar>
          <Avatar alt={alt} src={avatar} />
        </ListItemAvatar>
        <ListItemText primary={name} />
      </ListItemButton>
    </ListItem>
  );
}

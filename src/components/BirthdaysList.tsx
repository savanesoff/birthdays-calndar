import { BirthType, DataType, useBirthdays } from "../data/useBirthdays";
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
import { getLocalizedDate } from "../utils/date";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * List of birthdays for the selected date
 * No need to pass any props, as the data is fetched from the context
 */
export function BirthdayList(): JSX.Element {
  const { birthdays, month, day, loading } = useBirthdays();
  const [filtered, setFiltered] = useState<BirthType[]>(
    birthdays?.births || []
  );
  const [filter, setFilter] = useState("");
  const [filterDelay, setFilterDelay] = useState<NodeJS.Timeout | undefined>();

  const filterData = useCallback(
    (filter: string) => {
      // setFiltered(birthdays?.births || []);
      if (filter) {
        const filtered = birthdays?.births.filter((birth) => {
          return birth.text.toLowerCase().includes(filter.toLowerCase());
        }) as BirthType[];
        setFiltered(filtered);
      } else {
        setFiltered(birthdays?.births || []);
      }
    },
    [birthdays]
  );

  useEffect(() => {
    filterData(filter);
  }, [birthdays]);

  useEffect(() => {
    clearTimeout(filterDelay);
    const delay = setTimeout(() => {
      filterData(filter);
    }, 700);
    setFilterDelay(delay);
    return () => {
      clearTimeout(delay);
    };
  }, [filter]);

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
        {filtered.map((birth, i) => (
          <div key={birth.text}>
            <ItemListBirthday data={birth} />
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
      {day && month && (
        <h3 data-testid="birthdays-list-title">
          Famous people born on {getLocalizedDate(`{DD:${day}}{MM:${month}}`)}
        </h3>
      )}
      {!day && !month && (
        <Alert severity="info">Please select date to load data</Alert>
      )}
      <Input
        placeholder="Filter by name"
        onChange={(event) => setFilter(event.target.value)}
      />
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

function ItemListBirthday({ data }: { data: BirthType }): JSX.Element {
  const { toggleFavorite, getFormattedItemValue, favorites } = useBirthdays();
  const avatar = data.pages[0].thumbnail?.source || defaultAvatar;
  const name = data.text; // data.pages[0].normalizedtitle;
  const alt = data.text;
  return (
    <ListItem
      data-tooltip-content={data.pages[0].extract}
      data-tooltip-id={"tooltip"}
      data-testid="birthdays-list-item"
      secondaryAction={
        <Star
          onClick={() => toggleFavorite(data)}
          checked={favorites?.has(getFormattedItemValue(data))}
        />
      }
      disablePadding
    >
      <ListItemButton
        onClick={() => window.open(data.pages[0].content_urls.desktop.page)}
      >
        <ListItemAvatar>
          <Avatar alt={alt} src={avatar} />
        </ListItemAvatar>
        <ListItemText primary={name} />
      </ListItemButton>
    </ListItem>
  );
}

// favorite icon
function Star({
  onClick,
  checked,
}: {
  onClick?: () => void;
  checked?: boolean;
}): JSX.Element {
  return (
    <div
      style={{
        width: "30px",
        height: "30px",
      }}
      data-tooltip-content={
        checked ? "Remove from favorites" : "Add to favorites"
      }
      data-tooltip-id={"tooltip"}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        onClick={onClick}
        style={{
          cursor: "pointer",
          fill: checked ? "#1dbbff" : "rgba(255, 255, 255, 0.1)",
          stroke: checked ? "#00415d" : "rgba(255, 255, 255, 0.1)",
        }}
      >
        <polygon
          points="50 0, 64 36, 100 36, 70 58, 82 100, 50 78, 18 100, 30 58, 0 36, 36 36"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
}

import { BirthType, useBirthdays } from "../data/useBirthdays";
import defaultAvatar from "../assets/default_avatar.png";
import {
  Alert,
  Avatar,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { getLocalizedDate } from "../utils/date";

/**
 * List of birthdays for the selected date
 * No need to pass any props, as the data is fetched from the context
 */
export function BirthdayList(): JSX.Element {
  const { birthdays, month, day, loading } = useBirthdays();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        width: "500px",
        maxHeight: "30vh",
      }}
    >
      {day && month && (
        <h3>
          Famous people born on {getLocalizedDate(`{DD:${day}}{MM:${month}}`)}
        </h3>
      )}
      {!day && !month && (
        <Alert severity="info">Please select date to load data</Alert>
      )}
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
          <CircularProgress color="secondary" />
        </div>
      )}
      {!loading && birthdays?.births && (
        <List
          sx={{
            bgcolor: "background.paper",
            overflow: "auto",
          }}
        >
          {birthdays?.births.map((birth, i) => (
            <>
              <ItemListBirthday data={birth} key={i} />
              <Divider variant="inset" component="div" />
            </>
          ))}
        </List>
      )}
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

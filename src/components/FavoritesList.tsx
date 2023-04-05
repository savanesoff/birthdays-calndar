import { BirthType } from "./../data/types";
import defaultAvatar from "./../assets/default_avatar.png";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useSnapshot } from "valtio";
import { deleteFavorite, state } from "../data/state";
import { useCallback, useMemo } from "react";

/**
 * FavoritesList component to show the list of favorites
 * no props required for this component as it uses the context
 */
export function FavoritesList(): JSX.Element {
  const { favorites } = useSnapshot(state);
  // memoize the list of favorites
  const list = useMemo(
    () =>
      Array.from(favorites.entries()).map(([key, value], i) => (
        <FavoriteList key={i} date={key} favorites={value} />
      )),
    [favorites]
  );

  const onDelete = useCallback(() => state.favorites.clear(), []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        flexGrow: 1,
        width: "40vw",
        maxHeight: "80vh",
      }}
    >
      <h3>Favorites</h3>
      {favorites.size === 0 && (
        <Alert severity="info">
          No favorites added, click "star" icon to add/remove items
        </Alert>
      )}
      {favorites && (
        <List
          sx={{
            bgcolor: "background.paper",
            overflow: "auto",
          }}
        >
          {/* We'll traverse the date key map and for every date, render list of birthdays */}
          {list}
        </List>
      )}
      {/* Display clear button that deletes all favorites */}
      {favorites.size !== 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
          }}
        >
          <Button
            variant="outlined"
            onClick={onDelete}
            startIcon={<DeleteIcon />}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * FavoriteList component to show the list of favorites for a particular date
 */
function FavoriteList({
  date,
  favorites,
}: {
  date: string;
  favorites: Map<string, BirthType>;
}): JSX.Element {
  // memoize the list of items
  const list = useMemo(
    () =>
      Array.from(favorites.entries()).map(([_, value], i) => (
        <Item key={i} date={date} data={value} />
      )),
    [favorites, date]
  );
  return (
    <div>
      <Divider variant="middle" textAlign="right">
        {date}
      </Divider>
      <List
        sx={{
          bgcolor: "background.paper",
          flex: 1,
          overflow: "auto",
        }}
      >
        {list}
      </List>
    </div>
  );
}

function Item({ date, data }: { date: string; data: BirthType }) {
  const title = data.pages[0]?.title;
  const url = data.pages[0].content_urls.desktop.page;
  const avatarURL =
    data.pages[0]?.thumbnail?.source ||
    data.pages[0]?.originalimage?.source ||
    defaultAvatar;
  const tooltipText = data.pages[0].extract;

  // deleteFavorite is a function that takes a date and a data object
  const onDelete = useCallback(
    () => deleteFavorite({ date, data }),
    [date, data]
  );

  const openWiki = useCallback(() => window.open(url), [url]);
  return (
    <ListItem
      secondaryAction={
        <DeleteIcon
          style={{
            cursor: "pointer",
            fill: "#2d0f0f",
            stroke: "#9f4747",
          }}
          onClick={onDelete}
        />
      }
      data-tooltip-content={tooltipText}
      data-tooltip-id={"tooltip"}
      data-testid="birthdays-list-item"
    >
      <ListItemButton onClick={openWiki}>
        <ListItemAvatar>
          <Avatar alt={title} src={avatarURL} />
        </ListItemAvatar>
        <ListItemText
          primary={title}
          primaryTypographyProps={{ fontSize: "0.8rem" }}
        />
      </ListItemButton>
    </ListItem>
  );
}

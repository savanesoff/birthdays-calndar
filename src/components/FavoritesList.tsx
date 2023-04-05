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

/**
 * FavoritesList component to show the list of favorites
 * no props required for this component as it uses the context
 */
export function FavoritesList(): JSX.Element {
  const { favorites } = useSnapshot(state);
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
          {Array.from(favorites.entries()).map(([key, value], i) => (
            <div key={i}>
              {/* Set date within divider */}
              <Divider variant="middle" textAlign="right">
                {key}
              </Divider>
              <FavoriteGroup date={key} favorites={value} />
            </div>
          ))}
        </List>
      )}
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
            onClick={() => {
              state.favorites.clear();
            }}
            startIcon={<DeleteIcon />}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

function FavoriteGroup({
  date,
  favorites,
}: {
  date: string;
  favorites: Map<string, BirthType>;
}): JSX.Element {
  return (
    <ListItem>
      <List
        sx={{
          bgcolor: "background.paper",
          flex: 1,
          overflow: "auto",
        }}
      >
        {Array.from(favorites.entries()).map(([key, value], i) => {
          const title = value.pages[0]?.title;
          const url = value.pages[0].content_urls.desktop.page;
          const avatarURL =
            value.pages[0]?.thumbnail?.source ||
            value.pages[0]?.originalimage?.source ||
            defaultAvatar;
          const tooltipText = value.pages[0].extract;
          return (
            <ListItem
              key={i}
              secondaryAction={
                <DeleteIcon
                  style={{
                    cursor: "pointer",
                    fill: "#2d0f0f",
                    stroke: "#9f4747",
                  }}
                  onClick={() => deleteFavorite({ date, data: value })}
                />
              }
              data-tooltip-content={tooltipText}
              data-tooltip-id={"tooltip"}
              data-testid="birthdays-list-item"
            >
              <ListItemButton onClick={() => window.open(url)}>
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
        })}
      </List>
    </ListItem>
  );
}

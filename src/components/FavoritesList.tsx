import { useBirthdays } from "./../data/useBirthdays";
import defaultAvatar from "./../assets/default_avatar.png";
import { getLocalizedDate } from "./../utils/date";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Avatar,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from "@mui/material";

/**
 * FavoritesList component to show the list of favorites
 * no props required for this component as it uses the context
 */
export function FavoritesList(): JSX.Element {
  const { favoritesMap, clearFavorites } = useBirthdays();
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
      {favoritesMap.size === 0 && (
        <Alert severity="info">
          No favorites added, click "star" icon to add/remove items
        </Alert>
      )}
      {favoritesMap && (
        <List
          sx={{
            bgcolor: "background.paper",
            overflow: "auto",
          }}
        >
          {Array.from(favoritesMap.entries()).map(([key, value], i) => (
            <div key={i}>
              <FavoriteGroup date={key} data={value} />
              <Divider variant="inset" />
            </div>
          ))}
        </List>
      )}
      {favoritesMap.size !== 0 && (
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
            onClick={clearFavorites}
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
  data,
}: {
  date: string;
  data: { title: string; imageUrl: string }[];
}): JSX.Element {
  return (
    <ListItem>
      <List
        sx={{
          bgcolor: "background.paper",
          overflow: "auto",
        }}
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            {getLocalizedDate(date)}
          </ListSubheader>
        }
      >
        {data.map((v, i) => (
          <ListItem key={i}>
            <ListItemButton>
              <ListItemAvatar>
                <Avatar alt={v.title} src={v.imageUrl || defaultAvatar} />
              </ListItemAvatar>
              <ListItemText
                primary={v.title}
                primaryTypographyProps={{ fontSize: "0.8rem" }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </ListItem>
  );
}

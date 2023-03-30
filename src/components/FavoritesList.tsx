import { useBirthdays } from "./../data/useBirthdays";
import defaultAvatar from "./../assets/default_avatar.png";
import { getLocalizedDate } from "./../utils/date";

export function FavoritesList() {
  const { favoritesMap, clearFavorites } = useBirthdays();
  return (
    <>
      {favoritesMap && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
            flexGrow: 1,
            width: "500px",
            maxHeight: "30vh",
            overflow: "auto",
          }}
        >
          <p>Favorites</p>
          {Array.from(favoritesMap.entries()).map(([key, value]) => (
            <div key={key}>
              <p> {getLocalizedDate(key)} </p>
              {value.map((v, i) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <img
                    src={v.imageUrl || defaultAvatar}
                    alt={v.title}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "gray",
                    }}
                  />
                  <p key={i}> {v.title} </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <button onClick={clearFavorites}>Clear</button>
    </>
  );
}

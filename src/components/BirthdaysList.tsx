import { BirthType, useBirthdays } from "../data/useBirthdays";
import defaultAvatar from "../assets/default_avatar.png";

export function BirthdayList() {
  const { birthdays, month, day } = useBirthdays();
  return (
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
      <p>
        Celebs born on: MM:{month}, DD: {day}
      </p>
      {birthdays?.births.map((birth, i) => (
        <ItemListBirthday data={birth} key={i} />
      ))}
    </div>
  );
}

function ItemListBirthday({ data }: { data: BirthType }): JSX.Element {
  const { toggleFavorite, getFormattedItemValue, favorites } = useBirthdays();

  return (
    <div
      data-tooltip-content={data.pages[0].extract}
      data-tooltip-id={"person-tooltip"}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // width: "100%",
        background:
          "linear-gradient(0deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 100%)",
        padding: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          flexGrow: 1,
          gap: 20,
          flexFlow: "row nowrap",
        }}
        onClick={() => window.open(data.pages[0].content_urls.desktop.page)}
      >
        <a href={data.pages[0].content_urls.desktop.page} target="_blank">
          <img
            src={
              (data.pages[0]?.thumbnail || data.pages[0]?.originalimage)
                ?.source || defaultAvatar
            }
            alt={data.text}
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
        </a>
        <p>{data.pages[0].titles.normalized}</p>
      </div>
      <div
        style={{
          widows: 50,
          height: 50,
          padding: 10,
        }}
      >
        <Star
          onClick={() => toggleFavorite(data)}
          checked={favorites?.has(getFormattedItemValue(data))}
        />
      </div>
    </div>
  );
}

function Star({
  onClick,
  checked,
}: {
  onClick?: () => void;
  checked?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      onClick={onClick}
      style={{
        cursor: "pointer",
        color: "red",
        fill: checked ? "red" : "rgba(255, 255, 255, 0.2)",
        stroke: "white",
      }}
    >
      <polygon
        points="50 0, 64 36, 100 36, 70 58, 82 100, 50 78, 18 100, 30 58, 0 36, 36 36"
        // stroke="black"
        strokeWidth="2"
      />
    </svg>
  );
}

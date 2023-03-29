import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import kinaxisLogo from "./assets/kinaxis.png";
export function Header() {
  return (
    <header
      style={{
        fontSize: "0.8rem",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1>Celebrity birthday finder</h1>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://kinaxis.com" target="_blank">
          <img src={kinaxisLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h4>Vite + React + SWC </h4>
    </header>
  );
}

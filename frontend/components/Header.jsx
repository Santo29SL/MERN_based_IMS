import ProfileMenu from "./ProfileMenu.jsx";

function Header() {
  return (
    <div
      style={{
        height: "100%",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid #ddd"
      }}
    >
      <div style={{ width: "100px" }} />

      <h1>
        <span style={{ color: "#2196f3" }}>SLS</span>
        <span style={{ color: "black" }}>_IMS</span>
      </h1>

      <ProfileMenu />
    </div>
  );
}

export default Header;
function ProfileMenu() {
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="header-profile">
      <span>👤 <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{role}</span></span>
      <button
        onClick={logout}
        className="btn-secondary"
        style={{
          padding: "6px 14px",
          fontSize: "0.8rem",
          borderRadius: "20px",
          cursor: "pointer",
          border: "none",
          fontWeight: 600,
          background: "#e2e8f0",
          transition: "all 0.2s"
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default ProfileMenu;
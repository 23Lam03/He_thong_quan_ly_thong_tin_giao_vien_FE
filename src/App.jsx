import { useState } from "react";
import { Button, Drawer, Grid } from "antd";
import {
  ApartmentOutlined,
  BookOutlined,
  MenuOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import TeacherList from "./pages/TeacherList";
import TeacherPositionList from "./pages/TeacherPositionList";

const NAV_GROUPS = [
  {
    label: "Danh mục",
    items: [
      { key: "teachers", icon: <TeamOutlined />, label: "Giáo viên" },
      { key: "positions", icon: <ApartmentOutlined />, label: "Vị trí công tác" },
    ],
  },
];

const PAGE_META = {
  teachers: { section: "Danh mục", title: "Giáo viên" },
  positions: { section: "Danh mục", title: "Vị trí công tác" },
};

/**
 * Layout chính: Sidebar cố định trên desktop, trượt vào từ trái trên mobile.
 * Toàn bộ nội dung do các page tự render — không thay đổi logic nghiệp vụ.
 */
function App() {
  const [page, setPage] = useState("teachers");
  const [navOpen, setNavOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  const handleSelect = (key) => {
    setPage(key);
    setNavOpen(false);
  };

  const meta = PAGE_META[page] || PAGE_META.teachers;

  const brand = (
    <div className="brand">
      <div className="brand-mark">HV</div>
      <div className="brand-text">
        <div className="brand-name">Học viện</div>
        <div className="brand-sub">Quản lý giáo viên</div>
      </div>
    </div>
  );

  const nav = (
    <nav className="sider-nav">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="nav-group-label">{group.label}</div>
          {group.items.map((item) => (
            <div
              key={item.key}
              className={`nav-item${page === item.key ? " is-active" : ""}`}
              onClick={() => handleSelect(item.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(item.key);
                }
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      ))}
    </nav>
  );

  const account = (
    <div className="sider-account">
      <div className="account-card">
        <div className="account-avatar">AD</div>
        <div className="account-meta">
          <div className="account-name">Quản trị viên</div>
          <div className="account-role">Học viện</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      {!isMobile && (
        <aside className="app-sider">
          {brand}
          {nav}
          {account}
        </aside>
      )}

      <div className="app-main">
        <header className="app-topbar">
          {isMobile && (
            <>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setNavOpen(true)}
                aria-label="Mở menu"
                style={{ color: "#252A26" }}
              />
              <div className="brand-mark" style={{ width: 32, height: 32, flex: "0 0 32px", fontSize: 15 }}>
                HV
              </div>
            </>
          )}

          <div className="crumbs">
            <BookOutlined />
            <span>{meta.section}</span>
            <span className="sep">/</span>
            <b>{meta.title}</b>
          </div>
        </header>

        <main className="app-canvas">
          {page === "teachers" ? <TeacherList /> : <TeacherPositionList />}
        </main>
      </div>

      {isMobile && (
        <Drawer
          title={null}
          placement="left"
          size={isMobile ? 278 : 320}
          open={navOpen}
          onClose={() => setNavOpen(false)}
          styles={{ body: { padding: 0 }, header: { display: "none" } }}
          closable={false}
        >
          <div className="app-sider" style={{ display: "flex", position: "static", height: "100vh" }}>
            {brand}
            {nav}
            {account}
          </div>
        </Drawer>
      )}
    </div>
  );
}

export default App;

import { useState } from "react";
import { Button, Drawer, Grid, Layout, Menu, Space, Typography } from "antd";
import {
  ApartmentOutlined,
  MenuOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import TeacherList from "./pages/TeacherList";
import TeacherPositionList from "./pages/TeacherPositionList";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  { key: "teachers", icon: <TeamOutlined />, label: "Danh sách giáo viên" },
  { key: "positions", icon: <ApartmentOutlined />, label: "Vị trí công tác" },
];

/**
 * Layout chính: header cố định, menu điều hướng tự ẩn thành Drawer
 * trên màn hình nhỏ để nội dung không bị bó hẹp.
 */
function App() {
  const [page, setPage] = useState("teachers");
  const [navOpen, setNavOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  const handleSelect = ({ key }) => {
    setPage(key);
    setNavOpen(false);
  };

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={[page]}
      onClick={handleSelect}
      style={{ borderInlineEnd: "none" }}
      items={NAV_ITEMS}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingInline: isMobile ? 12 : 24,
        }}
      >
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: "#fff" }} />}
            onClick={() => setNavOpen(true)}
            aria-label="Mở menu"
          />
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: isMobile ? 15 : 18,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Hệ thống quản lý thông tin giáo viên
          </span>
        </div>
      </Header>

      <Layout>
        {!isMobile && (
          <Sider
            theme="light"
            width={230}
            style={{
              borderRight: "1px solid #f0f0f0",
              position: "sticky",
              top: 64,
              height: "calc(100vh - 64px)",
              overflow: "auto",
            }}
          >
            {menu}
          </Sider>
        )}

        {isMobile && (
          <Drawer
            title="Điều hướng"
            placement="left"
            size={260}
            open={navOpen}
            onClose={() => setNavOpen(false)}
            styles={{ body: { padding: 0 } }}
          >
            {menu}
          </Drawer>
        )}

        <Content
          style={{
            margin: isMobile ? 12 : 24,
            minWidth: 0,
          }}
        >
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            {page === "teachers" ? <TeacherList /> : <TeacherPositionList />}
          </Space>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;

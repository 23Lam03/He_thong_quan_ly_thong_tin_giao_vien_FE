import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App as AntApp, ConfigProvider } from "antd";
import vi from "antd/locale/vi_VN";
import "antd/dist/reset.css";
import "./styles.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider
      locale={vi}
      theme={{
        token: {
          colorPrimary: "#1668dc",
          colorInfo: "#1668dc",
          colorSuccess: "#52c41a",
          colorWarning: "#faad14",
          colorError: "#ff4d4f",
          colorTextBase: "#0f172a",
          colorBgLayout: "#f4f6fa",
          borderRadius: 8,
          borderRadiusLG: 12,
          controlHeight: 38,
          fontSize: 14,
          colorBgContainer: "#ffffff",
        },
        components: {
          Layout: {
            headerHeight: 64,
            headerPadding: "0 24px",
            headerBg: "#0f2547",
            bodyBg: "#f4f6fa",
            siderBg: "#ffffff",
          },
          Card: {
            headerBg: "transparent",
            headerFontSize: 16,
            paddingLG: 20,
          },
          Menu: {
            itemHeight: 42,
            itemBorderRadius: 8,
            itemMarginInline: 8,
          },
          Drawer: {
            paddingLG: 20,
          },
          Table: {
            headerBg: "#f8fafc",
            headerColor: "#334155",
            headerSplitColor: "transparent",
            cellPaddingBlock: 12,
            cellPaddingBlockSM: 10,
            rowHoverBg: "#f6f9ff",
          },
          Form: {
            itemMarginBottom: 20,
            verticalLabelPadding: "0 0 6px",
            labelColor: "#334155",
            labelFontSize: 13,
          },
          Descriptions: {
            titleMarginBottom: 12,
          },
          DescriptionsItem: {
            labelBg: "#f8fafc",
          },
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </StrictMode>
);

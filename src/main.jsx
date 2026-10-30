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
          /* Hệ màu Contemporary Academic Luxury */
          colorPrimary: "#294C3A",
          colorInfo: "#294C3A",
          colorSuccess: "#3A6350",
          colorWarning: "#9A6F22",
          colorError: "#9E3B32",

          colorTextBase: "#1B211C",
          colorText: "#1B211C",
          colorTextSecondary: "#6C766E",
          colorTextTertiary: "#97A099",
          colorTextQuaternary: "#B4BCB6",

          colorBgLayout: "#F5F3EC",
          colorBgContainer: "#FFFFFF",
          colorBgElevated: "#FFFFFF",
          colorBgSpotlight: "#172820",

          colorBorder: "rgba(23, 40, 32, 0.12)",
          colorBorderSecondary: "rgba(23, 40, 32, 0.06)",

          /* Bo góc có chủ đích */
          borderRadius: 4,
          borderRadiusLG: 10,
          borderRadiusSM: 4,
          borderRadiusXS: 2,

          controlHeight: 38,
          controlHeightSM: 32,
          controlHeightLG: 44,

          fontSize: 14,
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontFamilyCode: '"SFMono-Regular", Menlo, Consolas, monospace',

          wireframe: false,
          motionDurationMid: "0.24s",
          motionDurationSlow: "0.42s",
          motionEaseInOut: "cubic-bezier(0.22, 0.61, 0.36, 1)",
          motionEaseOut: "cubic-bezier(0.16, 1, 0.3, 1)",
        },
        components: {
          Button: {
            fontWeight: 500,
            primaryShadow: "none",
            defaultShadow: "none",
            defaultBg: "#FFFFFF",
            defaultBorderColor: "rgba(23, 40, 32, 0.14)",
            defaultColor: "#414A43",
            paddingInline: 15,
          },
          Card: {
            headerBg: "transparent",
            headerFontSize: 15,
            paddingLG: 0,
          },
          Layout: {
            headerHeight: 64,
            headerPadding: "0 34px",
            headerBg: "rgba(245, 243, 236, 0.85)",
            bodyBg: "#F5F3EC",
            siderBg: "#172820",
          },
          Menu: {
            itemHeight: 44,
            itemBorderRadius: 4,
            itemMarginInline: 0,
            darkItemBg: "transparent",
            darkSubMenuItemBg: "transparent",
            darkItemColor: "#C9D3C7",
            darkItemHoverColor: "#FFFFFF",
            darkItemHoverBg: "rgba(255,255,255,0.045)",
            darkItemSelectedBg: "#294C3A",
            darkItemSelectedColor: "#FFFFFF",
          },
          Drawer: {
            paddingLG: 0,
          },
          Table: {
            headerBg: "transparent",
            headerColor: "#97A099",
            headerSplitColor: "transparent",
            bodySortBg: "#FBFAF6",
            cellPaddingBlock: 15,
            cellPaddingBlockSM: 11,
            cellPaddingInline: 16,
            rowHoverBg: "#F0F3EE",
            borderColor: "rgba(23, 40, 32, 0.06)",
            footerBg: "#FBFAF6",
          },
          Form: {
            itemMarginBottom: 20,
            verticalLabelPadding: "0 0 6px",
            labelColor: "#6C766E",
            labelFontSize: 11,
            labelHeight: 24,
            verticalLabelHeight: 24,
          },
          Input: {
            paddingBlock: 7,
            activeShadow: "0 0 0 3px rgba(58, 99, 80, 0.10)",
          },
          InputNumber: {
            activeShadow: "0 0 0 3px rgba(58, 99, 80, 0.10)",
          },
          Select: {
            optionSelectedBg: "#F0F3EE",
            optionSelectedFontWeight: 500,
            activeOutlineColor: "rgba(58, 99, 80, 0.10)",
            activeBorderColor: "#3A6350",
          },
          DatePicker: {
            activeBorderColor: "#3A6350",
            activeShadow: "0 0 0 3px rgba(58, 99, 80, 0.10)",
          },
          Pagination: {
            itemActiveBg: "#294C3A",
            itemActiveColor: "#FFFFFF",
            itemBorderRadius: 4,
            itemSize: 32,
            itemSizeSM: 24,
            colorPrimary: "#294C3A",
          },
          Modal: {
            titleFontSize: 19,
            borderRadiusLG: 10,
            contentBg: "#FFFFFF",
            headerBg: "#FBFAF6",
            footerBg: "#FBFAF6",
          },
          Tag: {
            defaultBg: "#F0F3EE",
            defaultColor: "#294C3A",
          },
          Tooltip: {
            colorBgSpotlight: "#172820",
            borderRadius: 4,
          },
          Message: {
            contentBg: "#FFFFFF",
            contentPadding: "10px 16px",
          },
          Switch: {
            colorPrimary: "#294C3A",
            colorPrimaryHover: "#3A6350",
          },
          Segmented: {
            itemSelectedBg: "#FFFFFF",
          },
          Empty: {
            colorTextDescription: "#97A099",
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

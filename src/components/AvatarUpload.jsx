import { useEffect, useRef, useState } from "react";
import { App as AntApp, Avatar, Button, Tooltip, Upload, message } from "antd";
import { CameraOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { getAvatarUrl } from "../api";

/**
 * Ô tải ảnh đại diện: bấm vào ảnh để chọn tệp, kèm nút tải lên / xóa.
 *
 * - `onChange(file, { removeExisting })`:
 *   + `file` = tệp vừa chọn, hoặc `null` khi bỏ ảnh.
 *   + `removeExisting` = true nghĩa là cần xóa luôn ảnh đang lưu trên server.
 */
function AvatarUpload({ onChange, avatarUrl }) {
  const { modal } = AntApp.useApp();
  const [preview, setPreview] = useState(null);
  // Đánh dấu ảnh đã lưu trên server bị xóa (khác với mới chỉ bỏ ảnh vừa chọn)
  const [removed, setRemoved] = useState(false);
  // Giữ lại object URL hiện tại để giải phóng đúng lúc
  const previewRef = useRef(null);

  // Giải phóng object URL khi component bị unmount
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const savedUrl = avatarUrl ? getAvatarUrl(avatarUrl) : "";
  // Nếu ảnh đã lưu bị xóa thì không hiển thị gì cả, kể cả khi preview rỗng
  const currentSrc = removed ? null : preview || savedUrl;

  const handleBeforeUpload = (file) => {
    if (!file.type.startsWith("image/")) {
      message.error("Chỉ chọn tệp hình ảnh");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 5) {
      message.error("Kích thước ảnh không được vượt quá 5MB");
      return Upload.LIST_IGNORE;
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const objectUrl = URL.createObjectURL(file);
    previewRef.current = objectUrl;
    setPreview(objectUrl);
    setRemoved(false);
    onChange?.(file, { removeExisting: false });
    return false;
  };

  const handleRemove = async (e) => {
    e?.stopPropagation();

    const confirmed = await new Promise((resolve) => {
      modal.confirm({
        title: "Xác nhận xóa ảnh",
        content: savedUrl
          ? "Ảnh đại diện hiện tại sẽ bị xóa khỏi hệ thống khi bạn lưu. Bạn có chắc không?"
          : "Ảnh vừa chọn sẽ bị bỏ. Bạn có chắc không?",
        okText: "Xóa ảnh",
        cancelText: "Hủy",
        okButtonProps: { danger: true },
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
        afterClose: () => resolve(false),
      });
    });

    if (!confirmed) return;

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setPreview(null);
    // Nếu đang có ảnh đã lưu trên server thì cần báo lên để xóa cả file đó
    const removeExisting = Boolean(savedUrl);
    setRemoved(removeExisting);
    onChange?.(null, { removeExisting });
  };

  // Chuyển sang giáo viên khác: ảnh đã xóa và preview cũ được đặt lại
  // bằng cách remount component (xem `key` ở TeacherForm).

  return (
    <div className="avatar-upload">
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
        maxCount={1}
      >
        <Tooltip title="Bấm để chọn ảnh">
          <span className="avatar-dropzone">
            <Avatar
              size={132}
              src={currentSrc || undefined}
              icon={<CameraOutlined style={{ fontSize: 34, color: "#94a3b8" }} />}
              style={{
                backgroundColor: "#f8fafc",
                border: "1px dashed #cbd5e1",
                color: "#94a3b8",
              }}
            />
          </span>
        </Tooltip>
      </Upload>

      <div style={{ width: "100%", maxWidth: 180 }}>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleBeforeUpload}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />} block>
            {currentSrc ? "Thay đổi ảnh" : "Tải ảnh lên"}
          </Button>
        </Upload>

        {currentSrc ? (
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleRemove}
            style={{ marginTop: 6 }}
          >
            Xóa ảnh
          </Button>
        ) : (
          <div className="avatar-hint" style={{ marginTop: 8 }}>
            JPG, PNG, WEBP · tối đa 5MB
          </div>
        )}
      </div>
    </div>
  );
}

export default AvatarUpload;

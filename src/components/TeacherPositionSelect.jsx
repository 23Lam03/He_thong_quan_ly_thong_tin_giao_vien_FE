import { useMemo, useState } from "react";
import {
  App as AntApp,
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Switch,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { createTeacherPosition } from "../api";
import PositionNameCodeFields from "./PositionNameCodeFields";

/**
 * Ô chọn vị trí công tác, cho phép tạo mới vị trí ngay trong dropdown
 * mà không cần rời khỏi form giáo viên.
 */
function TeacherPositionSelect({ value, onChange, positions, onRefresh }) {
  const { message, modal } = AntApp.useApp();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Các vị trí vừa tạo, giữ lại để hiển thị ngay trong danh sách chọn
  const [created, setCreated] = useState([]);

  const options = useMemo(() => {
    const map = new Map();
    [...(positions || []), ...created].forEach((p) => {
      if (p?._id) map.set(p._id, p);
    });
    return Array.from(map.values()).map((p) => ({
      value: p._id,
      label: `${p.name} (${p.code})`,
    }));
  }, [positions, created]);

  const handleCreate = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    // Hỏi lại người dùng trước khi tạo mới
    const confirmed = await new Promise((resolve) => {
      modal.confirm({
        title: "Xác nhận tạo mới vị trí công tác",
        content: `Bạn có chắc muốn tạo vị trí công tác "${values.name}" không?`,
        okText: "Tạo mới",
        cancelText: "Hủy",
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
        afterClose: () => resolve(false),
      });
    });

    if (!confirmed) return;

    setSubmitting(true);
    try {
      const res = await createTeacherPosition(values);
      const newPosition = res.data;

      setCreated((prev) => [...prev, newPosition]);
      setModalOpen(false);
      form.resetFields();
      message.success("Tạo mới vị trí công tác thành công");

      // Đồng bộ danh sách vị trí ở trang cha
      onRefresh?.();

      // Tự động chọn vị trí vừa tạo
      const current = Array.isArray(value) ? value : [];
      if (!current.includes(newPosition._id)) {
        onChange?.([...current, newPosition._id]);
      }
    } catch (error) {
      const msg = error?.message || "Tạo mới vị trí công tác thất bại";
      // Lỗi trùng mã: báo tại đúng trường để người dùng biết cần đổi mã
      if (/mã vị trí/i.test(msg)) {
        form.setFields([
          {
            name: "code",
            errors: [
              "Mã vị trí này đã được dùng (kể cả vị trí đã ẩn). Vui lòng chọn mã khác.",
            ],
          },
        ]);
        return;
      }
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Select
        mode="multiple"
        value={value}
        onChange={onChange}
        placeholder="Chọn vị trí công tác"
        options={options}
        popupRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: "4px 0" }} />
            <div style={{ padding: "0 8px 4px" }}>
              <Button
                type="text"
                size="small"
                block
                icon={<PlusOutlined />}
                // Giữ dropdown không bị đóng khi bấm nút
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setModalOpen(true)}
              >
                Thêm vị trí công tác mới
              </Button>
            </div>
          </>
        )}
      />

      <Modal
        title="Thêm mới vị trí công tác"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleCreate}
        confirmLoading={submitting}
        okText="Tạo mới"
        cancelText="Hủy"
        destroyOnHidden
        width={480}
      >
        <Form
          form={form}
          name="newPosition"
          layout="vertical"
          requiredMark="optional"
          preserve={false}
        >
          <PositionNameCodeFields
            positions={[...(positions || []), ...created]}
          />

          <Form.Item
            name="des"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả vị trí công tác" }]}
          >
            <Input.TextArea rows={3} placeholder="Mô tả về vị trí công tác" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trạng thái hoạt động"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng hoạt động" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default TeacherPositionSelect;

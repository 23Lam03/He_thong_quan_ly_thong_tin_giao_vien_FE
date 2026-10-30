import { useCallback, useEffect, useState } from "react";
import {
  App as AntApp,
  Button,
  Drawer,
  Empty,
  Form,
  Grid,
  Input,
  Switch,
  Tooltip,
} from "antd";
import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  createTeacherPosition,
  deleteTeacherPosition,
  getTeacherPositions,
  updateTeacherPosition,
} from "../api";
import PositionNameCodeFields from "../components/PositionNameCodeFields";
import PageHeader from "../components/PageHeader";

function TeacherPositionList() {
  const { message, modal } = AntApp.useApp();
  const [form] = Form.useForm();
  const screens = Grid.useBreakpoint();
  // Drawer 520px cần nhiều không gian hơn: dưới 768px thì chiếm toàn màn hình
  const isWide = !screens.sm;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTeacherPositions();
      setData(res.data || []);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const handleOpenCreate = () => {
    setEditing(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      des: record.des,
      isActive: record.isActive,
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async (values) => {
    const confirmed = await new Promise((resolve) => {
      modal.confirm({
        title: editing
          ? "Xác nhận cập nhật vị trí công tác"
          : "Xác nhận tạo mới vị trí công tác",
        content: editing
          ? `Bạn có chắc muốn cập nhật vị trí công tác "${editing.name}" không?`
          : "Bạn có chắc muốn tạo mới vị trí công tác với các thông tin đã nhập không?",
        okText: editing ? "Cập nhật" : "Tạo mới",
        cancelText: "Hủy",
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
        afterClose: () => resolve(false),
      });
    });

    if (!confirmed) return;

    setSubmitting(true);
    try {
      if (editing) {
        await updateTeacherPosition(editing._id, values);
        message.success("Cập nhật vị trí công tác thành công");
      } else {
        await createTeacherPosition(values);
        message.success("Tạo mới vị trí công tác thành công");
      }
      setDrawerOpen(false);
      form.resetFields();
      fetchPositions();
    } catch (error) {
      // Lỗi trùng mã do server kiểm tra: hiển thị tại đúng trường để người dùng biết cần đổi mã
      if (/mã vị trí/i.test(error.message || "")) {
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
      message.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record) => {
    const confirmed = await new Promise((resolve) => {
      modal.confirm({
        title: "Xác nhận xóa vị trí công tác",
        content: `Bạn có chắc muốn xóa vị trí công tác "${record.name}" không?`,
        okText: "Xóa",
        cancelText: "Hủy",
        okButtonProps: { danger: true },
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
        afterClose: () => resolve(false),
      });
    });

    if (!confirmed) return;

    try {
      await deleteTeacherPosition(record._id);
      message.success("Xóa vị trí công tác thành công");
      fetchPositions();
    } catch (error) {
      message.error(error.message);
    }
  };

  const activeCount = data.filter((p) => p.isActive).length;

  return (
    <div>
      <PageHeader
        eyebrow="Cơ cấu tổ chức"
        title="Vị trí công tác"
        lede="Danh mục các chức danh công tác trong đơn vị. Mã vị trí được dùng để phân công nhiệm vụ cho từng giáo viên."
        meta={[
          { label: "Tổng vị trí", value: data.length },
          { label: "Đang áp dụng", value: activeCount },
        ]}
      />

      <div className="toolbar">
        <div className="toolbar-actions" style={{ marginLeft: 0, width: "100%" }}>
          <Button icon={<ReloadOutlined />} onClick={fetchPositions}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Thêm vị trí
          </Button>
        </div>
      </div>

      <div className="surface">
        <div className="surface-head">
          <h3>Danh mục chức danh</h3>
          <span className="rule" />
          <span className="cell-sub num">{data.length} vị trí</span>
        </div>

        {loading ? (
          <div className="pos-grid">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="pos-card"
                style={{ minHeight: 178, opacity: 0.55 }}
              >
                <div className="pos-card-top">
                  <div className="pos-seal" style={{ background: "var(--sage-100)" }} />
                  <div style={{ flex: 1 }}>
                    <div className="pos-code">••••</div>
                    <div className="pos-name">Đang tải…</div>
                  </div>
                </div>
                <p className="pos-des">Đang tải dữ liệu</p>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="pos-empty">
            <Empty
              image={null}
              description={
                <div>
                  <div className="empty-mark">
                    <ApartmentOutlined />
                  </div>
                  <div className="empty-title">Chưa có vị trí công tác</div>
                  <div className="empty-text">
                    Thêm vị trí đầu tiên để bắt đầu phân công nhiệm vụ.
                  </div>
                </div>
              }
            />
          </div>
        ) : (
          <div className="pos-grid">
            {data.map((record) => (
              <article className="pos-card" key={record._id}>
                <div className="pos-card-top">
                  <div className="pos-seal">
                    {String(record.code || "?").slice(0, 2)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="pos-code">{record.code}</div>
                    <h4 className="pos-name">{record.name}</h4>
                  </div>
                  <span
                    className={`status-pill ${
                      record.isActive ? "is-active" : "is-inactive"
                    }`}
                    style={{ flex: "0 0 auto" }}
                  >
                    <i className="dot" />
                    {record.isActive ? "Active" : "Tạm ẩn"}
                  </span>
                </div>

                <p className="pos-des">{record.des || "Chưa có mô tả"}</p>

                <div className="pos-foot">
                  <span className="cell-sub">
                    {record.isActive ? "Đang áp dụng" : "Ngừng hiệu lực"}
                  </span>

                  <span className="row-actions">
                    <Tooltip title="Cập nhật">
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEdit(record)}
                        aria-label="Cập nhật"
                      >
                        <span className="action-label">Sửa</span>
                      </Button>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                        aria-label="Xóa"
                      >
                        <span className="action-label">Xóa</span>
                      </Button>
                    </Tooltip>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Drawer
        className="app-drawer"
        title={null}
        size={isWide ? "100%" : 520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnHidden
        footer={
          <div className="drawer-foot">
            <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={() => form.submit()}
            >
              {editing ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        }
      >
        <div className="drawer-head">
          <div className="drawer-title">
            {editing ? "Cập nhật vị trí công tác" : "Thêm vị trí công tác"}
          </div>
          
        </div>

        <div className="drawer-body">
          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark>
            <PositionNameCodeFields
              positions={data}
              codeDisabled={Boolean(editing)}
              excludeId={editing?._id || null}
            />

            <Form.Item
              name="des"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả vị trí công tác" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Mô tả về vị trí công tác"
                showCount
                maxLength={300}
              />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Trạng thái hoạt động"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Đang hoạt động"
                unCheckedChildren="Ngừng hoạt động"
              />
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </div>
  );
}

export default TeacherPositionList;

import { useCallback, useEffect, useState } from "react";
import {
  App as AntApp,
  Button,
  Card,
  Drawer,
  Form,
  Grid,
  Input,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  createTeacherPosition,
  deleteTeacherPosition,
  getTeacherPositions,
  updateTeacherPosition,
} from "../api";
import PositionNameCodeFields from "../components/PositionNameCodeFields";

const { Title, Text } = Typography;

function TeacherPositionList() {
  const { message, modal } = AntApp.useApp();
  const [form] = Form.useForm();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
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
        title: editing ? "Xác nhận cập nhật vị trí công tác" : "Xác nhận tạo mới vị trí công tác",
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

  const columns = [
    {
      title: "Mã vị trí",
      dataIndex: "code",
      key: "code",
      width: 160,
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: "Tên vị trí",
      dataIndex: "name",
      key: "name",
      width: 240,
      render: (value) => value || "-",
    },
    {
      title: "Mô tả",
      dataIndex: "des",
      key: "des",
      ellipsis: true,
      render: (value) => value || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 150,
      render: (value) =>
        value ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Ngừng hoạt động</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 130,
      render: (_, record) => (
        <Space size={0}>
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
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        className="app-card"
        title={
          <Space size={8} wrap>
            <Title level={4} style={{ margin: 0 }}>
              Danh sách vị trí công tác
            </Title>
            <Text type="secondary">Tổng: {data.length}</Text>
          </Space>
        }
        extra={
          <Space wrap size={8}>
            <Button icon={<ReloadOutlined />} onClick={fetchPositions}>
              Làm mới
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              Thêm vị trí
            </Button>
          </Space>
        }
      >
        <Table
          className="app-table"
          rowKey="_id"
          columns={columns}
          dataSource={data}
          loading={loading}
          size={isMobile ? "small" : "middle"}
          scroll={{ x: 680 }}
          pagination={{ pageSize: 10, showSizeChanger: false, responsive: true }}
        />
      </Card>

      <Drawer
        className="app-drawer"
        title={editing ? "Cập nhật vị trí công tác" : "Thêm mới vị trí công tác"}
        size={isMobile ? "100%" : 520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" loading={submitting} onClick={() => form.submit()}>
              {editing ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Space>
        }
      >
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
            <Input.TextArea rows={4} placeholder="Mô tả về vị trí công tác" showCount maxLength={300} />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked">
            <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng hoạt động" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}

export default TeacherPositionList;

import { useCallback, useEffect, useState } from "react";
import {
  App as AntApp,
  Avatar,
  Button,
  Card,
  Drawer,
  Form,
  Grid,
  Input,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  createTeacher,
  deleteTeacher,
  getAvatarUrl,
  getTeacherPositions,
  getTeachers,
  updateTeacher,
} from "../api";
import TeacherForm from "../components/TeacherForm";
import { DEGREE_TYPES, getDegreeLabel } from "../constants/degreeTypes";

const { Title, Text } = Typography;

function TeacherList() {
  const { message, modal } = AntApp.useApp();
  const [form] = Form.useForm();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [keyword, setKeyword] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [positions, setPositions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTeachers = useCallback(async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    try {
      const res = await getTeachers({ page, limit, keyword: search || undefined });
      setData(res.data || []);
      setPagination(res.pagination || { page, limit, total: 0, totalPages: 0 });
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [message]);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await getTeacherPositions();
      setPositions(res.data || []);
    } catch (error) {
      message.error(error.message);
    }
  }, [message]);

  useEffect(() => {
    fetchTeachers(1, pagination.limit, keyword);
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const handleSearch = () => {
    fetchTeachers(1, pagination.limit, keyword);
  };

  const handleReset = () => {
    setKeyword("");
    fetchTeachers(1, pagination.limit, "");
  };

  const handleOpenCreate = () => {
    setEditing(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phoneNumber: record.phoneNumber,
      address: record.address,
      identity: record.identity,
      dob: record.dob ? dayjs(record.dob) : null,
      isActive: record.isActive,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
      teacherPositions: (record.teacherPositions || []).map((p) => p._id),
      degrees: (record.degrees || []).map((d) => ({
        ...d,
        year: d.year ?? undefined,
      })),
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async (values) => {
    const { avatarFile, removeAvatar, ...rest } = values;
    const payload = {
      ...rest,
      dob: rest.dob ? rest.dob.format("YYYY-MM-DD") : null,
      startDate: rest.startDate ? rest.startDate.format("YYYY-MM-DD") : null,
      endDate: rest.endDate ? rest.endDate.format("YYYY-MM-DD") : null,
    };
    if (avatarFile) payload.avatar = avatarFile;
    // Yêu cầu xóa ảnh đã lưu trên server (chỉ có ý nghĩa khi đang cập nhật)
    if (removeAvatar) payload.removeAvatar = "1";

    // Hỏi lại người dùng trước khi thực hiện
    const confirmed = await new Promise((resolve) => {
      modal.confirm({
        title: editing ? "Xác nhận cập nhật giáo viên" : "Xác nhận tạo mới giáo viên",
        content: editing
          ? `Bạn có chắc muốn cập nhật thông tin của giáo viên "${editing.name}" không?`
          : "Bạn có chắc muốn tạo mới giáo viên với các thông tin đã nhập không?",
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
        await updateTeacher(editing._id, payload);
        message.success("Cập nhật thông tin giáo viên thành công");
      } else {
        await createTeacher(payload);
        message.success("Tạo mới giáo viên thành công");
      }

      setDrawerOpen(false);
      form.resetFields();
      fetchTeachers(pagination.page, pagination.limit, keyword);
    } catch (error) {
      message.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record) => {
    const confirmed = await new Promise((resolve) => {
      modal.confirm({
        title: "Xác nhận xóa giáo viên",
        content: `Bạn có chắc muốn xóa giáo viên "${record.name}" không? Thông tin sẽ bị ẩn khỏi danh sách.`,
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
      await deleteTeacher(record._id);
      message.success("Xóa giáo viên thành công");
      const newTotal = pagination.total - 1;
      const maxPage = Math.max(Math.ceil(newTotal / pagination.limit), 1);
      const nextPage = Math.min(pagination.page, maxPage);
      fetchTeachers(nextPage, pagination.limit, keyword);
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "avatar",
      key: "avatar",
      width: 64,
      render: (value, record) => (
        <Avatar
          size={40}
          src={getAvatarUrl(value) || undefined}
          icon={<UserOutlined />}
          style={{ backgroundColor: "#f0f0f0", color: "#8c8c8c" }}
        >
          {record.name?.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: "Mã GV",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (value) => value || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      ellipsis: true,
      render: (value) => value || "-",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 140,
      render: (value) => value || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 130,
      render: (value) =>
        value ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Ngừng hoạt động</Tag>,
    },
    {
      title: "Vị trí công tác",
      dataIndex: "teacherPositions",
      key: "teacherPositions",
      width: 220,
      render: (list) =>
        list && list.length ? (
          <Space size={4} wrap>
            {list.map((p) => (
              <Tag key={p._id} color="blue">
                {p.name}
              </Tag>
            ))}
          </Space>
        ) : (
          "-"
        ),
    },
    {
      title: "Học vấn",
      dataIndex: "degrees",
      key: "degrees",
      width: 260,
      render: (list) =>
        list && list.length ? (
          <div>
            {list.map((d, index) => (
              <div className="degree-list-item" key={d._id || index}>
                <Space size={4} wrap>
                  <Tag color="purple">{getDegreeLabel(d.type)}</Tag>
                  <Text ellipsis style={{ maxWidth: 170 }}>
                    {d.school}
                  </Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {d.major} · Năm {d.year} · {d.isGraduated ? "Đã tốt nghiệp" : "Đang học"}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          "-"
        ),
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
              Danh sách giáo viên
            </Title>
            <Text type="secondary">Tổng: {pagination.total}</Text>
          </Space>
        }
        extra={
          <Space wrap size={8}>
            <Input.Search
              placeholder="Tìm theo tên, email, số điện thoại"
              allowClear
              value={keyword}
              style={{ width: isMobile ? "100%" : 280 }}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
            />
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Đặt lại
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              Thêm giáo viên
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
          scroll={{ x: 1464 }}
          size={isMobile ? "small" : "middle"}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: !isMobile,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} giáo viên`,
            responsive: true,
            onChange: (page, limit) => {
              fetchTeachers(page, limit, keyword);
            },
          }}
        />
      </Card>

      <Drawer
        className="app-drawer"
        title={editing ? "Cập nhật thông tin giáo viên" : "Thêm mới giáo viên"}
        size={isMobile ? "100%" : 880}
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
        <TeacherForm
          form={form}
          positions={positions}
          degreeTypes={DEGREE_TYPES}
          avatarUrl={editing?.avatar || ""}
          avatarKey={editing?._id || "new"}
          onFinish={handleSubmit}
          onPositionsChange={fetchPositions}
          isCreate={!editing}
        />
      </Drawer>
    </div>
  );
}

export default TeacherList;

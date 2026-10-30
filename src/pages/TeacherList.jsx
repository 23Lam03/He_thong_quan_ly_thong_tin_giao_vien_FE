import { useCallback, useEffect, useState } from "react";
import {
  App as AntApp,
  Button,
  Drawer,
  Empty,
  Form,
  Grid,
  Input,
  Table,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PhoneOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
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
import PageHeader from "../components/PageHeader";
import { DEGREE_TYPES, getDegreeLabel } from "../constants/degreeTypes";

function TeacherList() {
  const { message, modal } = AntApp.useApp();
  const [form] = Form.useForm();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  // Drawer rộng cần nhiều không gian hơn: dưới 992px thì chiếm toàn màn hình
  const isWide = !screens.lg;
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

  const fetchTeachers = useCallback(
    async (page = 1, limit = 10, search = "") => {
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
    },
    [message]
  );

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
      width: 78,
      align: "center",
      className: "cell-avatar-cell",
      render: (value) => {
        const url = getAvatarUrl(value);
        return (
          <span className="cell-avatar">
            {url ? (
              <img src={url} alt="" />
            ) : (
              <UserOutlined style={{ color: "#829681" }} />
            )}
          </span>
        );
      },
    },
    {
      title: "Mã giáo viên",
      dataIndex: "code",
      key: "code",
      width: 138,
      render: (value) => <span className="cell-code">{value}</span>,
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (value) => <span className="cell-name">{value || "-"}</span>,
    },
    {
      title: "Liên hệ",
      dataIndex: "email",
      key: "email",
      width: 250,
      render: (value, record) => (
        <div>
          <div className="cell-email">{value || "-"}</div>
          <div className="cell-sub num">
            {record.phoneNumber ? (
              <>
                <PhoneOutlined
                  style={{ marginRight: 5, fontSize: 10, opacity: 0.7 }}
                />
                {record.phoneNumber}
              </>
            ) : (
              "—"
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 148,
      render: (value) => (
        <span className={`status-pill ${value ? "is-active" : "is-inactive"}`}>
          <i className="dot" />
          {value ? "Đang hoạt động" : "Ngừng hoạt động"}
        </span>
      ),
    },
    {
      title: "Vị trí công tác",
      dataIndex: "teacherPositions",
      key: "teacherPositions",
      width: 220,
      render: (list) =>
        list && list.length ? (
          <div className="chip-set">
            {list.map((p) => (
              <span className="chip" key={p._id}>
                <span className="chip-name">{p.name}</span>
                {p.code && <code className="chip-code">{p.code}</code>}
              </span>
            ))}
          </div>
        ) : (
          <span className="cell-sub">Chưa phân công</span>
        ),
    },
    {
      title: "Học vấn",
      dataIndex: "degrees",
      key: "degrees",
      width: 290,
      render: (list) =>
        list && list.length ? (
          <div className="deg-list">
            {list.map((d, index) => (
              <div className="deg-item" key={d._id || index}>
                <div className="deg-main">
                  <div className="deg-level">
                    {getDegreeLabel(d.type)}
                    <span className="sep">·</span>
                    <span className="num">{d.year}</span>
                  </div>
                  <div className="deg-school" title={d.school}>
                    {d.school}
                  </div>
                  <div className="deg-major" title={d.major}>
                    {d.major}
                  </div>
                </div>
                <span
                  className={`deg-flag${d.isGraduated ? " is-done" : ""}`}
                >
                  {d.isGraduated ? "Đã tốt nghiệp" : "Đang học"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="cell-sub">Chưa cập nhật</span>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 132,
      align: "center",
      render: (_, record) => (
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
      ),
    },
  ];

  const activeCount = data.filter((t) => t.isActive).length;

  return (
    <div>
      <PageHeader
        eyebrow="Hồ sơ giáo viên"
        title="Giáo viên"
        lede="Tra cứu, cập nhật và quản lý hồ sơ giáo viên bao gồm thông tin cá nhân, vị trí công tác và trình độ học vấn."
        meta={[
          { label: "Tổng hồ sơ", value: pagination.total },
          { label: "Đang hoạt động", value: activeCount },
          { label: "Vị trí công tác", value: positions.length },
        ]}
      />

      <div className="toolbar">
        <div className="toolbar-search">
          <Input.Search
            placeholder="Tìm theo tên, email, số điện thoại"
            allowClear
            value={keyword}
            prefix={<SearchOutlined />}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
          />
        </div>

        <div className="toolbar-actions">
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Đặt lại
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Thêm giáo viên
          </Button>
        </div>
      </div>

      <div className="surface">
        <div className="surface-head">
          <h3>Danh sách hồ sơ</h3>
          <span className="rule" />
          <span className="cell-sub num">
            {pagination.total > 0
              ? `Hiển thị ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )} / ${pagination.total}`
              : "Chưa có dữ liệu"}
          </span>
        </div>

        <Table
          className="app-table"
          rowKey="_id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1474, y: "100%" }}
          size={isMobile ? "small" : "middle"}
          locale={{
            emptyText: (
              <Empty
                image={null}
                description={
                  <div className="empty-state">
                    <div className="empty-mark">
                      <UserOutlined />
                    </div>
                    <div className="empty-title">Chưa có giáo viên nào</div>
                    <div className="empty-text">
                      {keyword
                        ? "Không tìm thấy kết quả phù hợp với từ khóa."
                        : "Bắt đầu bằng việc thêm giáo viên mới vào danh sách."}
                    </div>
                  </div>
                }
              />
            ),
          }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: !isMobile,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} giáo viên`,
            responsive: true,
            onChange: (page, limit) => {
              fetchTeachers(page, limit, keyword);
            },
          }}
        />
      </div>

      <Drawer
        className="app-drawer"
        title={null}
        size={isWide ? "100%" : 880}
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
          <div className="drawer-eyebrow">
            {editing ? "Cập nhật hồ sơ" : "Hồ sơ mới"}
          </div>
          <div className="drawer-title">
            {editing ? `Chỉnh sửa thông tin giáo viên` : "Thêm mới giáo viên"}
          </div>
          <div className="drawer-sub">
            {editing
              ? `Mã giáo viên ${editing.code} · Cập nhật thông tin bên dưới rồi lưu lại.`
              : "Điền đầy đủ thông tin để tạo hồ sơ giáo viên mới."}
          </div>
        </div>

        <div className="drawer-body">
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
        </div>
      </Drawer>
    </div>
  );
}

export default TeacherList;

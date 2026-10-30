import { useState } from "react";
import {
  App as AntApp,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  Typography,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import AvatarUpload from "./AvatarUpload";
import TeacherPositionSelect from "./TeacherPositionSelect";

const { Text } = Typography;

/**
 * Form nhập thông tin giáo viên, dùng chung cho Drawer tạo mới và cập nhật.
 *
 * Bố cục:
 *  - Cột trái: ảnh đại diện (khối dán nhãn riêng).
 *  - Cột phải: các nhóm thông tin cá nhân / công tác / học vấn.
 *
 * `isCreate`: khi tạo mới thì mọi mục (trừ ảnh đại diện) đều bắt buộc.
 * Khi cập nhật, "Ngày kết thúc công tác" vẫn để trống được vì dữ liệu
 * giáo viên đang có đều chưa nhập trường này.
 */
function TeacherForm({
  form,
  positions,
  degreeTypes,
  onFinish,
  avatarUrl,
  avatarKey = "new",
  onPositionsChange,
  isCreate = false,
}) {
  const [avatarFile, setAvatarFile] = useState(null);
  // true khi người dùng bấm "Xóa ảnh" để xóa luôn ảnh đã lưu trên server
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const { modal } = AntApp.useApp();

  const handleAvatarChange = (file, info) => {
    setAvatarFile(file instanceof File ? file : null);
    setRemoveAvatar(Boolean(info?.removeExisting));
  };

  // Hỏi lại trước khi xóa một trình độ học vấn khỏi form
  const handleRemoveDegree = async (remove, name, index) => {
    const confirmed = await new Promise((resolve) => {
      modal.confirm({
        title: "Xác nhận xóa trình độ học vấn",
        content: `Bạn có chắc muốn xóa trình độ học vấn #${index + 1} không?`,
        okText: "Xóa",
        cancelText: "Hủy",
        okButtonProps: { danger: true },
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
        afterClose: () => resolve(false),
      });
    });

    if (confirmed) remove(name);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => onFinish({ ...values, avatarFile, removeAvatar })}
      requiredMark
      scrollToFirstError={{ behavior: "smooth", block: "center" }}
    >
      <Row gutter={[28, 0]}>
        {/* Cột trái: ảnh đại diện */}
        <Col xs={24} lg={7} xl={6}>
          <div className="avatar-panel">
            <Form.Item
              label="Ảnh đại diện"
              style={{ marginBottom: 0 }}
            >
              <div className="avatar-block">
                <AvatarUpload
                  key={avatarKey}
                  onChange={handleAvatarChange}
                  avatarUrl={avatarUrl}
                />
              </div>
            </Form.Item>
          </div>
        </Col>

        {/* Cột phải: thông tin cá nhân + công tác */}
        <Col xs={24} lg={17} xl={18}>
          {/* --- I. Thông tin cá nhân --- */}
          <section className="form-section">
            <div className="form-section-head">
              <span className="form-section-index">I</span>
              <h4 className="form-section-title">Thông tin cá nhân</h4>
             
            </div>

            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                  <Input placeholder="Nguyễn Văn A" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input placeholder="email@school.edu.vn" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phoneNumber"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                  ]}
                >
                  <Input placeholder="0912345678" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="identity"
                  label="Số CCCD/CMND"
                  rules={[
                    { required: true, message: "Vui lòng nhập số CCCD/CMND" },
                  ]}
                >
                  <Input placeholder="001234567890" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="dob"
                  label="Ngày sinh"
                  rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="dd/mm/yyyy"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="address"
                  label="Địa chỉ"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                >
                  <Input placeholder="Phường, Xã, Tỉnh/Thành phố" allowClear />
                </Form.Item>
              </Col>
            </Row>
          </section>

          {/* --- II. Thông tin công tác --- */}
          <section className="form-section">
            <div className="form-section-head">
              <span className="form-section-index">II</span>
              <h4 className="form-section-title">Thông tin công tác</h4>
            
            </div>

            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12} xl={8}>
                <Form.Item
                  name="startDate"
                  label="Ngày bắt đầu công tác"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày bắt đầu công tác" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="dd/mm/yyyy"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} xl={8}>
                <Form.Item
                  name="endDate"
                  label="Ngày kết thúc công tác"
                  rules={
                    isCreate
                      ? [
                          {
                            required: true,
                            message: "Vui lòng chọn ngày kết thúc công tác",
                          },
                        ]
                      : []
                  }
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="dd/mm/yyyy"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} xl={8}>
                <Form.Item
                  name="isActive"
                  label="Trạng thái hoạt động"
                  valuePropName="checked"
                  initialValue
                  rules={[
                    { required: true, message: "Vui lòng chọn trạng thái hoạt động" },
                  ]}
                >
                  <Switch
                    checkedChildren="Đang hoạt động"
                    unCheckedChildren="Ngừng hoạt động"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="teacherPositions"
                  label="Vị trí công tác"
                  rules={[
                    { required: true, message: "Vui lòng chọn ít nhất một vị trí" },
                  ]}
                >
                  <TeacherPositionSelect
                    positions={positions}
                    onRefresh={onPositionsChange}
                  />
                </Form.Item>
              </Col>
            </Row>
          </section>

          {/* --- III. Trình độ học vấn --- */}
          <section className="form-section">
            <div className="form-section-head">
              <span className="form-section-index">III</span>
              <h4 className="form-section-title">Trình độ học vấn</h4>
            </div>

            <Form.List
              name="degrees"
              rules={[
                {
                  validator: async (_, list) => {
                    if (isCreate && (!list || list.length === 0)) {
                      throw new Error(
                        "Vui lòng thêm ít nhất một trình độ học vấn"
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors: listErrors }) => (
                <>
                  {listErrors.length > 0 && (
                    <div className="form-list-error">{listErrors[0]}</div>
                  )}

                  {fields.map(({ key, name, ...restField }, index) => (
                    <div className="degree-card" key={key}>
                      <div className="degree-card-header">
                        <span className="degree-card-index">{index + 1}</span>
                        <span className="degree-card-title">
                          Trình độ #{index + 1}
                        </span>

                        <div className="degree-card-tools">
                          <div className="inline-field">
                            <Text type="secondary">Đã tốt nghiệp:</Text>
                            <Form.Item
                              {...restField}
                              name={[name, "isGraduated"]}
                              valuePropName="checked"
                              noStyle
                            >
                              <Switch checkedChildren="Rồi" unCheckedChildren="Chưa" />
                            </Form.Item>
                          </div>
                          <Button
                            danger
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveDegree(remove, name, index)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>

                      {/* 2 ô mỗi hàng: đủ rộng để nhãn 1 dòng, ô nhập thẳng hàng */}
                      <Row gutter={[16, 0]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "type"]}
                            label="Trình độ"
                            rules={[
                              { required: true, message: "Vui lòng chọn trình độ" },
                            ]}
                          >
                            <Select options={degreeTypes} placeholder="Chọn trình độ" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "school"]}
                            label="Trường đào tạo"
                            rules={[
                              { required: true, message: "Vui lòng nhập trường đào tạo" },
                            ]}
                          >
                            <Input placeholder="Đại học X" allowClear />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "major"]}
                            label="Chuyên ngành"
                            rules={[
                              { required: true, message: "Vui lòng nhập chuyên ngành" },
                            ]}
                          >
                            <Input placeholder="Công nghệ thông tin" allowClear />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "year"]}
                            label="Năm tốt nghiệp"
                            rules={[
                              { required: true, message: "Vui lòng nhập năm tốt nghiệp" },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={1900}
                              max={2100}
                              placeholder="2020"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ))}

                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add({ isGraduated: false })}
                    style={{ marginTop: 4 }}
                  >
                    Thêm trình độ
                  </Button>
                </>
              )}
            </Form.List>
          </section>
        </Col>
      </Row>
    </Form>
  );
}

export default TeacherForm;

import { useMemo } from "react";
import { AutoComplete, Form } from "antd";

/**
 * Hai trường "Tên vị trí" và "Mã vị trí" dùng AutoComplete để:
 *  - vẫn gõ tay được (tạo vị trí mới hoàn toàn)
 *  - xổ ra danh sách vị trí đã có để chọn nhanh
 *  - chọn tên thì tự điền mã tương ứng và ngược lại
 */
function PositionNameCodeFields({
  positions,
  nameField = "name",
  codeField = "code",
  codeDisabled = false,
  excludeId = null,
}) {
  const form = Form.useFormInstance();

  // Bỏ vị trí đang sửa ra khỏi danh sách để không báo trùng mã với chính nó
  const list = useMemo(
    () => (positions || []).filter((p) => p?._id !== excludeId),
    [positions, excludeId]
  );

  const nameOptions = useMemo(
    () =>
      list.map((p) => ({
        value: p.name,
        label: p.name,
        positionCode: p.code,
      })),
    [list]
  );

  const codeOptions = useMemo(
    () =>
      list.map((p) => ({
        value: p.code,
        label: p.code,
        positionName: p.name,
      })),
    [list]
  );

  /**
   * Chọn tên -> tự điền mã tương ứng.
   */
  const handleSelectName = (value) => {
    const found = list.find(
      (p) => p.name?.trim().toLowerCase() === String(value).trim().toLowerCase()
    );
    if (found?.code) {
      form.setFieldValue(codeField, found.code);
    }
  };

  /**
   * Chọn mã -> tự điền tên tương ứng.
   */
  const handleSelectCode = (value) => {
    const found = list.find(
      (p) => p.code?.trim().toLowerCase() === String(value).trim().toLowerCase()
    );
    if (found?.name) {
      form.setFieldValue(nameField, found.name);
    }
  };

  /**
   * Lọc theo cả tên và mã (không phân biệt hoa thường).
   */
  const filterOption = (input, option) => {
    const keyword = String(input || "").trim().toLowerCase();
    if (!keyword) return true;
    return [option?.positionName, option?.positionCode, option?.label, option?.value]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(keyword));
  };

  return (
    <>
      <Form.Item
        name={nameField}
        label="Tên vị trí"
        rules={[{ required: true, message: "Vui lòng nhập tên vị trí" }]}
      >
        <AutoComplete
          options={nameOptions}
          filterOption={filterOption}
          onSelect={handleSelectName}
          placeholder="Nhập hoặc chọn tên vị trí"
          allowClear
        />
      </Form.Item>

      <Form.Item
        name={codeField}
        label="Mã vị trí"
        rules={[
          { required: true, message: "Vui lòng nhập mã vị trí" },
          { max: 20, message: "Mã tối đa 20 ký tự" },
          {
            validator: (_, val) => {
              if (!val) return Promise.resolve();
              const duplicated = list.some(
                (p) => p.code?.toLowerCase() === String(val).trim().toLowerCase()
              );
              return duplicated
                ? Promise.reject(new Error("Mã vị trí công tác đã tồn tại"))
                : Promise.resolve();
            },
          },
        ]}
      >
        <AutoComplete
          options={codeOptions}
          filterOption={filterOption}
          onSelect={handleSelectCode}
          placeholder="Nhập hoặc chọn mã vị trí"
          disabled={codeDisabled}
          allowClear
        />
      </Form.Item>
    </>
  );
}

export default PositionNameCodeFields;

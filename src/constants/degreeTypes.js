export const DEGREE_TYPES = [
  { value: "Bachelor", label: "Cử nhân" },
  { value: "Master", label: "Thạc sĩ" },
  { value: "Doctorate", label: "Tiến sĩ" },
  { value: "Engineer", label: "Kỹ sư" },
  { value: "Other", label: "Khác" },
];

const DEGREE_LABEL_MAP = DEGREE_TYPES.reduce(
  (acc, item) => ({ ...acc, [item.value]: item.label }),
  {}
);
export function getDegreeLabel(value) {
  if (!value) return "-";
  return DEGREE_LABEL_MAP[value] || value;
}

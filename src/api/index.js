import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Có lỗi xảy ra, vui lòng thử lại";
    return Promise.reject(new Error(message));
  }
);

const toFormData = (payload) => {
  const formData = new FormData();

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};

export const getTeachers = async ({ page = 1, limit = 10, keyword } = {}) => {
  const { data } = await api.get("/teachers", { params: { page, limit, keyword } });
  return data;
};

export const createTeacher = async (payload) => {
  const { data } = await api.post("/teachers", toFormData(payload));
  return data;
};

export const updateTeacher = async (id, payload) => {
  const { data } = await api.put(`/teachers/${id}`, toFormData(payload));
  return data;
};

export const deleteTeacher = async (id) => {
  const { data } = await api.delete(`/teachers/${id}`);
  return data;
};

export const getTeacherPositions = async () => {
  const { data } = await api.get("/teacher-positions");
  return data;
};

export const createTeacherPosition = async (payload) => {
  const { data } = await api.post("/teacher-positions", payload);
  return data;
};

export const updateTeacherPosition = async (id, payload) => {
  const { data } = await api.put(`/teacher-positions/${id}`, payload);
  return data;
};

export const deleteTeacherPosition = async (id) => {
  const { data } = await api.delete(`/teacher-positions/${id}`);
  return data;
};

/**
 * Tạo đường dẫn hiển thị ảnh đại diện đầy đủ.
 */
export const getAvatarUrl = (avatar) => {
  if (!avatar) return "";
  if (avatar.startsWith("http")) return avatar;
  return `${API_URL}${avatar}`;
};

export default api;

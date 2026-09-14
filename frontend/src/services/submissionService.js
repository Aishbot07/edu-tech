import api from "./api";
import { MOCK_SUBMISSIONS } from "./mockData";

export const submissionService = {
  getSubmissions: async () => {
    try {
      const response = await api.get("/submissions");
      return response.data;
    } catch {
      return MOCK_SUBMISSIONS;
    }
  },
  createSubmission: async (data) => {
    try {
      const response = await api.post("/submissions", data);
      return response.data;
    } catch {
      return { id: `sub_${Date.now()}`, ...data, status: "Submitted", date: new Date().toISOString().split("T")[0] };
    }
  },
};

export default submissionService;

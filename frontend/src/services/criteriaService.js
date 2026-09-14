import api from "./api";
import { MOCK_CRITERIA } from "./mockData";

export const criteriaService = {
  getCriteria: async () => {
    try {
      const response = await api.get("/criteria");
      return response.data;
    } catch {
      return MOCK_CRITERIA;
    }
  },
};

export default criteriaService;

// import api from "./api";
// import { MOCK_CRITERIA } from "./mockData";

// export const criteriaService = {
//   getCriteria: async () => {
//     try {
//       const response = await api.get("/criteria");
//       return response.data;
//     } catch {
//       return MOCK_CRITERIA;
//     }
//   },
// };

// export default criteriaService;


import api from "./api";
import { MOCK_CRITERIA } from "./mockData";

export const criteriaService = {
  // Get all NAAC criteria
  getCriteria: async () => {
    try {
      const response = await api.get("/criteria");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch criteria:", error);
      return MOCK_CRITERIA;
    }
  },

  // Get all sections
  getSections: async (criterionId) => {
    try {
      const response = await api.get("/sections", {
        params: {
          criterion_id: criterionId,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      return [];
    }
  },

  // Get all NAAC metrics
  getMetrics: async () => {
    try {
      const response = await api.get("/metrics");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
      return [];
    }
  },
};

getEvidenceRequirements: async () => {
  try {
    const response = await api.get("/evidence-requirements");
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch evidence requirements:",
      error
    );
    return [];
  }
};

export default criteriaService;
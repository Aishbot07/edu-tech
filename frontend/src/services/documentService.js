import api from "./api";
import { MOCK_DOCUMENTS } from "./mockData";

export const documentService = {
  getDocuments: async () => {
    try {
      const response = await api.get("/documents");
      return response.data;
    } catch {
      return MOCK_DOCUMENTS;
    }
  },
  uploadDocument: async (docData) => {
    try {
      const response = await api.post("/documents", docData);
      return response.data;
    } catch {
      return { id: `doc_${Date.now()}`, ...docData, status: "Submitted", date: new Date().toISOString().split("T")[0] };
    }
  },
};

export default documentService;

import api from "./api";

export const documentService = {
  // ============================================================
  // GET ALL DOCUMENTS
  // ============================================================

  getDocuments: async () => {
    try {
      const response = await api.get("/documents");

      console.log(
        "GET DOCUMENTS RESPONSE:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(
        "GET DOCUMENTS ERROR:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  // ============================================================
  // EXISTING DOCUMENT RECORD CREATION
  // ============================================================

  uploadDocument: async (docData) => {
    try {
      const response = await api.post(
        "/documents",
        docData
      );

      return response.data;
    } catch (error) {
      console.error(
        "UPLOAD DOCUMENT ERROR:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  // ============================================================
  // REAL EVIDENCE FILE UPLOAD
  // ============================================================

  uploadEvidence: async (
    file,
    submissionId,
    title,
    onUploadProgress
  ) => {
    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "submission_id",
      String(submissionId)
    );

    if (title) {
      formData.append(
        "title",
        title
      );
    }

    try {
      const response = await api.post(
        "/documents/upload",
        formData,
        {
          onUploadProgress,
        }
      );

      console.log(
        "UPLOAD EVIDENCE RESPONSE:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(
        "UPLOAD EVIDENCE ERROR:",
        error?.response?.data || error
      );

      throw error;
    }
  },
};

export default documentService;
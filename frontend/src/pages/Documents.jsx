import React, { useState, useEffect } from "react";
import { UploadCloud } from "lucide-react";
import documentService from "../services/documentService";
import DataTable from "../components/common/DataTable";
import PageHeader from "../components/common/PageHeader";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../config/permissions";

export const Documents = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    documentService.getDocuments().then((data) => {
      if (Array.isArray(data)) {
        const formatted = data.map((doc) => ({
          id: doc.id,
          title: doc.title || "Evidence Document",
          criterion: doc.criterion || (doc.file_type ? `Type: ${doc.file_type}` : "Criterion Evidence"),
          department: doc.department || (doc.institution_id ? `Institution #${doc.institution_id}` : "Department"),
          uploadedBy: doc.uploadedBy || (doc.uploaded_by ? `User #${doc.uploaded_by}` : "Coordinator"),
          date: doc.date || (doc.created_at ? doc.created_at.split("T")[0] : new Date().toISOString().split("T")[0]),
          status: doc.status || "Uploaded",
        }));
        setDocuments(formatted);
      } else {
        setDocuments([]);
      }
    }).catch(() => setDocuments([]));
  }, []);

  const handleUpload = () => {
    const newDoc = {
      title: `Uploaded Audit Proof ${Date.now().toString().slice(-4)}`,
      criterion: "Criterion Evidence",
      department: "CSE",
      uploadedBy: "Coordinator",
    };
    documentService.uploadDocument(newDoc).then((res) => {
      const formattedRes = {
        id: res?.id || `doc_${Date.now()}`,
        title: res?.title || newDoc.title,
        criterion: "Criterion Evidence",
        department: "CSE",
        uploadedBy: "Coordinator",
        date: new Date().toISOString().split("T")[0],
        status: res?.status || "Uploaded",
      };
      setDocuments((prev) => [formattedRes, ...prev]);
    });
  };

  const columns = [
    { title: "Document Title", dataIndex: "title" },
    { title: "Criterion", dataIndex: "criterion" },
    { title: "Department", dataIndex: "department" },
    { title: "Uploaded By", dataIndex: "uploadedBy" },
    { title: "Date", dataIndex: "date" },
    { title: "Status", dataIndex: "status", isStatus: true },
    {
      title: "Actions",
      dataIndex: "id",
      render: () => (
        <PermissionGuard permission={PERMISSIONS.DOCUMENTS_MANAGE}>
          <button style={{ padding: "4px 8px", background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#334155", borderRadius: "4px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
            View File
          </button>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div style={{ color: "#1e293b" }}>
      <PageHeader
        eyebrow="EVIDENCE DOSSIER"
        title="Documents & Evidence Repository"
        description="Centralized repository of verified files, proofs, and quantitative spreadsheets."
        primaryAction={{
          label: "Upload Evidence File",
          icon: UploadCloud,
          onClick: handleUpload,
        }}
      />
      <div className="panel" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
        <DataTable columns={columns} data={documents} keyField="id" emptyMessage="No evidence documents uploaded." />
      </div>
    </div>
  );
};

export default Documents;

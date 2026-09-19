import React, { useEffect, useState } from "react";
import {
  FileText,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import documentService from "../services/documentService";
import DataTable from "../components/common/DataTable";
import PageHeader from "../components/common/PageHeader";

export const Documents = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD EVIDENCE DOCUMENTS
  // ============================================================

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await documentService.getDocuments();

      console.log("EVIDENCE DOCUMENTS:", data);

      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error(
        "LOAD EVIDENCE ERROR:",
        err?.response?.data || err
      );

      setDocuments([]);

      setError(
        err?.response?.data?.detail ||
          "Unable to load evidence documents."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadDocuments();
  }, []);

  // ============================================================
  // OPEN UPLOAD SCREEN
  // ============================================================

  const handleUpload = () => {
    navigate("/documents/upload");
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    try {
      return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  // ============================================================
  // FORMAT FILE SIZE
  // ============================================================

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "-";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ============================================================
  // FILE TYPE
  // ============================================================

  const getFileType = (doc) => {
    if (!doc?.file_type) {
      return "-";
    }

    return doc.file_type
      .replace("application/", "")
      .replace("image/", "")
      .replace("text/", "")
      .toUpperCase();
  };

  // ============================================================
  // SUBMISSION
  // ============================================================

  const getSubmission = (doc) => {
    if (!doc?.submission_id) {
      return "General Evidence";
    }

    return `Submission #${doc.submission_id}`;
  };

  // ============================================================
  // STATUS
  // ============================================================

  const getStatus = (doc) => {
    return doc?.status || "Uploaded";
  };

  // ============================================================
  // TABLE COLUMNS
  // ============================================================

  const columns = [
    {
      title: "Evidence",
      dataIndex: "title",
      render: (value) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText
              size={17}
              color="#2563eb"
            />
          </div>

          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: "#1e293b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "300px",
              }}
              title={value || "Evidence Document"}
            >
              {value || "Evidence Document"}
            </div>
          </div>
        </div>
      ),
    },

    {
      title: "Type",
      dataIndex: "file_type",
      render: (_, row) => (
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#475569",
            background: "#f1f5f9",
            padding: "5px 8px",
            borderRadius: "6px",
          }}
        >
          {getFileType(row)}
        </span>
      ),
    },

    {
      title: "Size",
      dataIndex: "file_size",
      render: (_, row) =>
        formatFileSize(row?.file_size),
    },

    {
      title: "Submission",
      dataIndex: "submission_id",
      render: (_, row) =>
        getSubmission(row),
    },

    {
      title: "Uploaded By",
      dataIndex: "uploaded_by",
      render: (_, row) =>
        row?.uploaded_by
          ? `User #${row.uploaded_by}`
          : "-",
    },

    {
      title: "Uploaded On",
      dataIndex: "created_at",
      render: (_, row) =>
        formatDate(row?.created_at),
    },

    {
      title: "Status",
      dataIndex: "status",
      isStatus: true,
      render: (_, row) => {
        const status = getStatus(row);

        return (
          <span
            style={{
              display: "inline-block",
              padding: "5px 9px",
              borderRadius: "999px",
              background:
                status === "Uploaded"
                  ? "#dcfce7"
                  : "#f1f5f9",
              color:
                status === "Uploaded"
                  ? "#166534"
                  : "#475569",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {status}
          </span>
        );
      },
    },
  ];

  // ============================================================
  // SUMMARY VALUES
  // ============================================================

  const totalEvidence = documents.length;

  const uploadedCount = documents.filter(
    (doc) =>
      (doc?.status || "Uploaded") ===
      "Uploaded"
  ).length;

  const linkedSubmissionCount = new Set(
    documents
      .filter((doc) => doc?.submission_id)
      .map((doc) => doc.submission_id)
  ).size;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div style={{ color: "#1e293b" }}>
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <PageHeader
        eyebrow="EVIDENCE DOSSIER"
        title="Documents & Evidence Repository"
        description="Centralized repository of evidence files, supporting documents, and accreditation proofs."
        primaryAction={{
          label: "Upload Evidence File",
          icon: UploadCloud,
          onClick: handleUpload,
        }}
      />

      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#991b1b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <span>{error}</span>

          <button
            onClick={loadDocuments}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 10px",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              background: "#ffffff",
              color: "#991b1b",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* TOTAL */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "18px",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: "13px",
              marginBottom: "6px",
            }}
          >
            Total Evidence
          </div>

          <div
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            {totalEvidence}
          </div>
        </div>

        {/* UPLOADED */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "18px",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: "13px",
              marginBottom: "6px",
            }}
          >
            Uploaded
          </div>

          <div
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#166534",
            }}
          >
            {uploadedCount}
          </div>
        </div>

        {/* LINKED SUBMISSIONS */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "18px",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: "13px",
              marginBottom: "6px",
            }}
          >
            Linked Submissions
          </div>

          <div
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#2563eb",
            }}
          >
            {linkedSubmissionCount}
          </div>
        </div>
      </div>

      {/* ======================================================
          EVIDENCE TABLE
      ====================================================== */}

      <div
        className="panel"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        {/* TABLE HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
              }}
            >
              Evidence Files
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Real evidence files stored in the
              EduVerse backend.
            </p>
          </div>

          {/* REFRESH */}

          <button
            onClick={loadDocuments}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "7px",
              background: "#ffffff",
              color: "#334155",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: 600,
            }}
          >
            <RefreshCw
              size={15}
              style={{
                animation: loading
                  ? "spin 1s linear infinite"
                  : "none",
              }}
            />

            Refresh
          </button>
        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading evidence files...
          </div>
        ) : (
          /* ==================================================
             TABLE
          ================================================== */

          <DataTable
            columns={columns}
            data={documents}
            keyField="id"
            emptyMessage="No evidence documents uploaded yet."
          />
        )}
      </div>
    </div>
  );
};

export default Documents;
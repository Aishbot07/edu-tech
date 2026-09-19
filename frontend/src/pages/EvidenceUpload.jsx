import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle,
  FileText,
  UploadCloud,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import criteriaService from "../services/criteriaService";
import submissionService from "../services/submissionService";
import documentService from "../services/documentService";

// ============================================================
// CONSTANTS
// ============================================================

const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "jpg",
  "jpeg",
  "png",
];

const EvidenceUpload = () => {
  const navigate = useNavigate();

  // ==========================================================
  // MASTER DATA
  // ==========================================================

  const [criteria, setCriteria] = useState([]);
  const [sections, setSections] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [evidenceRequirements, setEvidenceRequirements] =
    useState([]);

  const [submissions, setSubmissions] =
    useState([]);

  const [documents, setDocuments] =
    useState([]);

  // ==========================================================
  // SELECTIONS
  // ==========================================================

  const [selectedCriterionId, setSelectedCriterionId] =
    useState("");

  const [selectedMetricId, setSelectedMetricId] =
    useState("");

  const [selectedSubmissionId, setSelectedSubmissionId] =
    useState("");

  // ==========================================================
  // FILE
  // ==========================================================

  const [file, setFile] =
    useState(null);

  const [dragActive, setDragActive] =
    useState(false);

  // ==========================================================
  // STATE
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [loadingMetrics, setLoadingMetrics] =
    useState(false);

  const [refreshingDocuments, setRefreshingDocuments] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [uploadedDocument, setUploadedDocument] =
    useState(null);

  // ==========================================================
  // LOAD INITIAL DATA
  // ==========================================================

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          criteriaData,
          metricsData,
          evidenceData,
          submissionsData,
          documentsData,
        ] = await Promise.all([
          criteriaService.getCriteria(),
          criteriaService.getMetrics(),
          criteriaService.getEvidenceRequirements(),
          submissionService.getSubmissions(),
          documentService.getDocuments(),
        ]);

        setCriteria(
          Array.isArray(criteriaData)
            ? criteriaData
            : []
        );

        setMetrics(
          Array.isArray(metricsData)
            ? metricsData
            : []
        );

        setEvidenceRequirements(
          Array.isArray(evidenceData)
            ? evidenceData
            : []
        );

        setSubmissions(
          Array.isArray(submissionsData)
            ? submissionsData
            : []
        );

        setDocuments(
          Array.isArray(documentsData)
            ? documentsData
            : []
        );
      } catch (err) {
        console.error(
          "LOAD EVIDENCE UPLOAD DATA ERROR:",
          err?.response?.data || err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to load evidence upload data."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // ==========================================================
  // LOAD SECTIONS WHEN CRITERION CHANGES
  // ==========================================================

  useEffect(() => {
    const loadSections = async () => {
      if (!selectedCriterionId) {
        setSections([]);
        setSelectedMetricId("");
        setSelectedSubmissionId("");
        return;
      }

      try {
        setLoadingMetrics(true);
        setError("");

        const data =
          await criteriaService.getSections(
            Number(selectedCriterionId)
          );

        setSections(
          Array.isArray(data)
            ? data
            : []
        );

        setSelectedMetricId("");
        setSelectedSubmissionId("");
        setFile(null);
        setUploadedDocument(null);
      } catch (err) {
        console.error(
          "LOAD SECTIONS ERROR:",
          err?.response?.data || err
        );

        setSections([]);

        setError(
          getErrorMessage(
            err,
            "Unable to load sections."
          )
        );
      } finally {
        setLoadingMetrics(false);
      }
    };

    loadSections();
  }, [selectedCriterionId]);

  // ==========================================================
  // FILTER METRICS FOR SELECTED CRITERION
  // ==========================================================

  const availableMetrics = useMemo(() => {
    if (!selectedCriterionId) {
      return [];
    }

    const sectionIds = new Set(
      sections.map(
        (section) => section.id
      )
    );

    return metrics.filter(
      (metric) =>
        sectionIds.has(
          metric.section_id
        )
    );
  }, [
    selectedCriterionId,
    sections,
    metrics,
  ]);

  // ==========================================================
  // SELECTED METRIC
  // ==========================================================

  const selectedMetric = useMemo(() => {
    return metrics.find(
      (metric) =>
        String(metric.id) ===
        String(selectedMetricId)
    );
  }, [
    metrics,
    selectedMetricId,
  ]);

  // ==========================================================
  // SELECTED EVIDENCE REQUIREMENT
  // ==========================================================

  const selectedEvidenceRequirement =
    useMemo(() => {
      if (!selectedMetricId) {
        return null;
      }

      return (
        evidenceRequirements.find(
          (evidence) =>
            String(evidence.metric_id) ===
            String(selectedMetricId)
        ) || null
      );
    }, [
      evidenceRequirements,
      selectedMetricId,
    ]);

  // ==========================================================
  // EDITABLE SUBMISSIONS FOR SELECTED METRIC
  // ==========================================================

  const editableSubmissions =
    useMemo(() => {
      if (!selectedMetric) {
        return [];
      }

      return submissions.filter(
        (submission) => {
          const sameMetric =
            String(
              submission.metric_code
            ) ===
            String(
              selectedMetric.code
            );

          const editableStatus = [
            "Draft",
            "Changes Requested",
            "Resubmitted",
          ].includes(
            submission.status
          );

          return (
            sameMetric &&
            editableStatus
          );
        }
      );
    }, [
      submissions,
      selectedMetric,
    ]);

  // ==========================================================
  // SELECTED SUBMISSION
  // ==========================================================

  const selectedSubmission =
    useMemo(() => {
      return submissions.find(
        (submission) =>
          String(submission.id) ===
          String(selectedSubmissionId)
      );
    }, [
      submissions,
      selectedSubmissionId,
    ]);

  // ==========================================================
  // EXISTING FILE COUNT
  // ==========================================================

  const existingFileCount = useMemo(() => {
    if (!selectedSubmissionId) {
      return 0;
    }

    return documents.filter(
      (document) =>
        String(
          document.submission_id
        ) ===
        String(
          selectedSubmissionId
        )
    ).length;
  }, [
    documents,
    selectedSubmissionId,
  ]);

  // ==========================================================
  // FILE TYPES
  // ==========================================================

  const allowedExtensions =
    useMemo(() => {
      if (
        !selectedEvidenceRequirement ||
        !selectedEvidenceRequirement.allowed_file_types
      ) {
        return ALLOWED_EXTENSIONS;
      }

      return String(
        selectedEvidenceRequirement
          .allowed_file_types
      )
        .split(",")
        .map((item) =>
          item
            .trim()
            .toLowerCase()
            .replace(".", "")
        )
        .filter(Boolean);
    }, [
      selectedEvidenceRequirement,
    ]);

  // ==========================================================
  // ACCEPT ATTRIBUTE
  // ==========================================================

  const acceptAttribute =
    allowedExtensions
      .map(
        (extension) =>
          `.${extension}`
      )
      .join(",");

  // ==========================================================
  // SELECT CRITERION
  // ==========================================================

  const handleCriterionChange = (
    event
  ) => {
    const value =
      event.target.value;

    setSelectedCriterionId(value);
    setSelectedMetricId("");
    setSelectedSubmissionId("");
    setFile(null);
    setError("");
    setMessage("");
    setUploadedDocument(null);
    setUploadProgress(0);
  };

  // ==========================================================
  // SELECT METRIC
  // ==========================================================

  const handleMetricChange = (
    event
  ) => {
    setSelectedMetricId(
      event.target.value
    );

    setSelectedSubmissionId("");
    setFile(null);
    setError("");
    setMessage("");
    setUploadedDocument(null);
    setUploadProgress(0);
  };

  // ==========================================================
  // SELECT SUBMISSION
  // ==========================================================

  const handleSubmissionChange = (
    event
  ) => {
    setSelectedSubmissionId(
      event.target.value
    );

    setFile(null);
    setError("");
    setMessage("");
    setUploadedDocument(null);
    setUploadProgress(0);
  };

  // ==========================================================
  // VALIDATE FILE
  // ==========================================================

  const validateFile = (
    selectedFile
  ) => {
    if (!selectedFile) {
      return "Please select a file.";
    }

    const extension =
      selectedFile.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      !extension ||
      !allowedExtensions.includes(
        extension
      )
    ) {
      return (
        `File type '.${extension || ""}' ` +
        "is not allowed for this evidence requirement."
      );
    }

    const maxFiles =
      selectedEvidenceRequirement
        ?.max_files || 5;

    if (
      existingFileCount >=
      maxFiles
    ) {
      return (
        `Maximum of ${maxFiles} ` +
        "evidence files are already uploaded."
      );
    }

    return "";
  };

  // ==========================================================
  // FILE SELECT
  // ==========================================================

  const handleFileSelect = (
    selectedFile
  ) => {
    setError("");
    setMessage("");
    setUploadedDocument(null);
    setUploadProgress(0);

    const validationError =
      validateFile(
        selectedFile
      );

    if (validationError) {
      setFile(null);
      setError(
        validationError
      );
      return;
    }

    setFile(
      selectedFile
    );
  };

  // ==========================================================
  // FILE INPUT CHANGE
  // ==========================================================

  const handleFileInputChange = (
    event
  ) => {
    const selectedFile =
      event.target.files?.[0];

    handleFileSelect(
      selectedFile
    );

    // Allows selecting the same file again
    event.target.value = "";
  };

  // ==========================================================
  // DRAG OVER
  // ==========================================================

  const handleDragOver = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!uploading) {
      setDragActive(true);
    }
  };

  // ==========================================================
  // DRAG LEAVE
  // ==========================================================

  const handleDragLeave = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  };

  // ==========================================================
  // DROP
  // ==========================================================

  const handleDrop = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    if (uploading) {
      return;
    }

    const droppedFile =
      event.dataTransfer
        .files?.[0];

    handleFileSelect(
      droppedFile
    );
  };

  // ==========================================================
  // REFRESH DOCUMENTS FROM BACKEND
  // ==========================================================

  const refreshDocuments = async () => {
    try {
      setRefreshingDocuments(true);

      const data =
        await documentService.getDocuments();

      setDocuments(
        Array.isArray(data)
          ? data
          : []
      );

      return data;
    } catch (err) {
      console.error(
        "REFRESH DOCUMENTS ERROR:",
        err?.response?.data || err
      );

      return null;
    } finally {
      setRefreshingDocuments(false);
    }
  };

  // ==========================================================
  // UPLOAD
  // ==========================================================

  const handleUpload = async () => {
    setError("");
    setMessage("");
    setUploadedDocument(null);

    // --------------------------------------------------------
    // REQUIRED VALIDATION
    // --------------------------------------------------------

    if (!selectedCriterionId) {
      setError(
        "Please select a criterion."
      );
      return;
    }

    if (!selectedMetricId) {
      setError(
        "Please select a metric."
      );
      return;
    }

    if (!selectedEvidenceRequirement) {
      setError(
        "No evidence requirement is configured for this metric."
      );
      return;
    }

    if (!selectedSubmissionId) {
      setError(
        "Please select an editable submission."
      );
      return;
    }

    if (!selectedSubmission) {
      setError(
        "Selected submission could not be found."
      );
      return;
    }

    if (!file) {
      setError(
        "Please select an evidence file."
      );
      return;
    }

    // --------------------------------------------------------
    // FILE VALIDATION
    // --------------------------------------------------------

    const validationError =
      validateFile(file);

    if (validationError) {
      setError(
        validationError
      );
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const title =
        `${selectedMetric.code} - ${file.name}`;

      const result =
        await documentService.uploadEvidence(
          file,
          selectedSubmission.id,
          title,
          (progressEvent) => {
            if (
              progressEvent.total
            ) {
              const percentage =
                Math.round(
                  (
                    progressEvent.loaded /
                    progressEvent.total
                  ) * 100
                );

              setUploadProgress(
                Math.min(
                  percentage,
                  100
                )
              );
            }
          }
        );

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      setUploadedDocument(
        result
      );

      setMessage(
        "Evidence uploaded successfully."
      );

      setFile(null);
      setUploadProgress(100);

      // ------------------------------------------------------
      // REFRESH FROM DATABASE
      // ------------------------------------------------------

      await refreshDocuments();
    } catch (err) {
      console.error(
        "EVIDENCE UPLOAD ERROR:",
        err?.response?.data || err
      );

      setUploadProgress(0);

      setError(
        getErrorMessage(
          err,
          "Unable to upload evidence."
        )
      );
    } finally {
      setUploading(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          color: "#1e293b",
        }}
      >
        Loading evidence upload...
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div
      style={{
        maxWidth: "1000px",
        color: "#1e293b",
      }}
    >
      {/* ======================================================
          BACK
      ====================================================== */}

      <button
        onClick={() =>
          navigate(
            "/documents"
          )
        }
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          border: "none",
          background: "transparent",
          color: "#2563eb",
          cursor: "pointer",
          fontWeight: 600,
          marginBottom: "18px",
        }}
      >
        <ArrowLeft size={17} />
        Back to Evidence Repository
      </button>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          background:
            "linear-gradient(135deg, #173b72, #214d8f)",
          borderRadius: "14px",
          padding: "26px 28px",
          color: "#ffffff",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "1.5px",
            fontWeight: 700,
            opacity: 0.8,
            marginBottom: "7px",
          }}
        >
          EVIDENCE DOSSIER
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "25px",
          }}
        >
          Upload Evidence
        </h1>

        <p
          style={{
            margin:
              "8px 0 0",
            opacity: 0.85,
            fontSize: "14px",
          }}
        >
          Link a real supporting document to
          an NAAC metric submission.
        </p>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "13px 15px",
            marginBottom: "16px",
            border:
              "1px solid #fecaca",
            background: "#fef2f2",
            color: "#991b1b",
            borderRadius: "9px",
          }}
        >
          <XCircle
            size={18}
            style={{
              flexShrink: 0,
              marginTop: "1px",
            }}
          />

          <span>
            {error}
          </span>
        </div>
      )}

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {message && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "13px 15px",
            marginBottom: "16px",
            border:
              "1px solid #bbf7d0",
            background: "#f0fdf4",
            color: "#166534",
            borderRadius: "9px",
          }}
        >
          <CheckCircle
            size={18}
          />

          <span>
            {message}
          </span>
        </div>
      )}

      {/* ======================================================
          1. SELECT CRITERION
      ====================================================== */}

      <div
        style={cardStyle}
      >
        <SectionHeading
          number="1"
          title="Select Criterion"
          description="Choose the NAAC criterion containing the metric."
        />

        <select
          value={
            selectedCriterionId
          }
          onChange={
            handleCriterionChange
          }
          disabled={uploading}
          style={inputStyle}
        >
          <option value="">
            Select Criterion
          </option>

          {criteria.map(
            (criterion) => (
              <option
                key={criterion.id}
                value={criterion.id}
              >
                {criterion.number} -{" "}
                {criterion.title}
              </option>
            )
          )}
        </select>
      </div>

      {/* ======================================================
          2. SELECT METRIC
      ====================================================== */}

      <div
        style={cardStyle}
      >
        <SectionHeading
          number="2"
          title="Select Metric"
          description="Select the metric for which this evidence is being uploaded."
        />

        <select
          value={
            selectedMetricId
          }
          onChange={
            handleMetricChange
          }
          disabled={
            !selectedCriterionId ||
            loadingMetrics ||
            uploading
          }
          style={{
            ...inputStyle,
            background:
              !selectedCriterionId
                ? "#f8fafc"
                : "#ffffff",
          }}
        >
          <option value="">
            {loadingMetrics
              ? "Loading metrics..."
              : !selectedCriterionId
              ? "Select a criterion first"
              : availableMetrics.length ===
                0
              ? "No metrics available"
              : "Select Metric"}
          </option>

          {availableMetrics.map(
            (metric) => (
              <option
                key={metric.id}
                value={metric.id}
              >
                {metric.code} -{" "}
                {metric.title}
              </option>
            )
          )}
        </select>

        {selectedMetric && (
          <div
            style={{
              marginTop: "14px",
              padding: "14px",
              background: "#f8fafc",
              borderRadius: "9px",
              border:
                "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                marginBottom: "5px",
              }}
            >
              {selectedMetric.code}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              {selectedMetric.description ||
                selectedMetric.title}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          3. EVIDENCE REQUIREMENT
      ====================================================== */}

      {selectedMetric && (
        <div
          style={cardStyle}
        >
          <SectionHeading
            number="3"
            title="Evidence Requirement"
            description="These rules come directly from the configured NAAC evidence requirement."
          />

          {selectedEvidenceRequirement ? (
            <div
              style={{
                border:
                  "1px solid #dbeafe",
                background: "#eff6ff",
                borderRadius: "10px",
                padding: "17px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "15px",
                  alignItems:
                    "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "16px",
                    }}
                  >
                    {
                      selectedEvidenceRequirement.title
                    }
                  </div>

                  {selectedEvidenceRequirement.description && (
                    <div
                      style={{
                        color: "#475569",
                        fontSize: "13px",
                        lineHeight: 1.5,
                        marginTop: "7px",
                      }}
                    >
                      {
                        selectedEvidenceRequirement.description
                      }
                    </div>
                  )}
                </div>

                {selectedEvidenceRequirement.required && (
                  <span
                    style={{
                      padding:
                        "5px 10px",
                      borderRadius:
                        "999px",
                      background:
                        "#fee2e2",
                      color:
                        "#b91c1c",
                      fontSize:
                        "11px",
                      fontWeight: 700,
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    REQUIRED
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  flexWrap: "wrap",
                  marginTop: "14px",
                  color: "#475569",
                  fontSize: "13px",
                }}
              >
                <span>
                  <strong>
                    Allowed:
                  </strong>{" "}
                  {allowedExtensions
                    .map(
                      (item) =>
                        item.toUpperCase()
                    )
                    .join(", ")}
                </span>

                <span>
                  <strong>
                    Maximum files:
                  </strong>{" "}
                  {
                    selectedEvidenceRequirement.max_files
                  }
                </span>

                <span>
                  <strong>
                    Existing:
                  </strong>{" "}
                  {existingFileCount}
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "16px",
                background: "#fffbeb",
                border:
                  "1px solid #fde68a",
                borderRadius: "9px",
                color: "#92400e",
              }}
            >
              No evidence requirement is
              configured for this metric.
            </div>
          )}
        </div>
      )}

      {/* ======================================================
          4. SELECT SUBMISSION
      ====================================================== */}

      {selectedMetric && (
        <div
          style={cardStyle}
        >
          <SectionHeading
            number="4"
            title="Select Submission"
            description="Evidence can only be uploaded to an editable submission."
          />

          <select
            value={
              selectedSubmissionId
            }
            onChange={
              handleSubmissionChange
            }
            disabled={uploading}
            style={inputStyle}
          >
            <option value="">
              Select Editable Submission
            </option>

            {editableSubmissions.map(
              (submission) => (
                <option
                  key={submission.id}
                  value={submission.id}
                >
                  Submission #
                  {submission.id} —{" "}
                  {submission.status} —{" "}
                  {submission.title}
                </option>
              )
            )}
          </select>

          {editableSubmissions.length ===
            0 && (
            <div
              style={{
                marginTop: "12px",
                padding: "13px",
                background: "#f8fafc",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "8px",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              No editable submission exists
              for this metric. Create a draft
              submission first from the metric
              page.
            </div>
          )}

          {selectedSubmission && (
            <div
              style={{
                marginTop: "14px",
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: "10px",
              }}
            >
              <MiniInfo
                label="Submission"
                value={`#${selectedSubmission.id}`}
              />

              <MiniInfo
                label="Status"
                value={
                  selectedSubmission.status
                }
              />

              <MiniInfo
                label="Files"
                value={existingFileCount}
              />
            </div>
          )}
        </div>
      )}

      {/* ======================================================
          5. FILE UPLOAD
      ====================================================== */}

      {selectedSubmission && (
        <div
          style={cardStyle}
        >
          <SectionHeading
            number="5"
            title="Upload File"
            description="Choose the real evidence document you want to attach."
          />

          <div
            onDragOver={
              handleDragOver
            }
            onDragLeave={
              handleDragLeave
            }
            onDrop={
              handleDrop
            }
            style={{
              border:
                dragActive
                  ? "2px solid #2563eb"
                  : "2px dashed #cbd5e1",
              borderRadius: "12px",
              padding: "34px 20px",
              textAlign: "center",
              background:
                dragActive
                  ? "#eff6ff"
                  : "#f8fafc",
              transition:
                "all 0.2s ease",
              opacity:
                uploading
                  ? 0.7
                  : 1,
            }}
          >
            <UploadCloud
              size={38}
              color="#2563eb"
              style={{
                marginBottom: "10px",
              }}
            />

            <div
              style={{
                fontWeight: 700,
                fontSize: "16px",
              }}
            >
              Drag & drop your evidence
              file here
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
                margin:
                  "7px 0 16px",
              }}
            >
              or choose a file from your
              computer
            </div>

            <label
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: "7px",
                padding:
                  "10px 16px",
                borderRadius:
                  "8px",
                background:
                  uploading
                    ? "#94a3b8"
                    : "#2563eb",
                color:
                  "#ffffff",
                fontWeight:
                  600,
                cursor:
                  uploading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <FileText
                size={16}
              />

              Choose File

              <input
                type="file"
                accept={
                  acceptAttribute
                }
                disabled={
                  uploading
                }
                onChange={
                  handleFileInputChange
                }
                style={{
                  display: "none",
                }}
              />
            </label>

            <div
              style={{
                marginTop: "14px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Allowed formats:{" "}
              {allowedExtensions
                .map(
                  (item) =>
                    item.toUpperCase()
                )
                .join(", ")}
            </div>
          </div>

          {/* ==================================================
              SELECTED FILE
          ================================================== */}

          {file && (
            <div
              style={{
                marginTop: "15px",
                padding: "14px",
                border:
                  "1px solid #dbeafe",
                background: "#eff6ff",
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "15px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  minWidth: 0,
                }}
              >
                <FileText
                  size={20}
                  color="#2563eb"
                />

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {file.name}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "3px",
                    }}
                  >
                    {formatBytes(
                      file.size
                    )}
                  </div>
                </div>
              </div>

              {!uploading && (
                <button
                  onClick={() => {
                    setFile(null);
                    setError("");
                    setUploadProgress(0);
                  }}
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color:
                      "#64748b",
                    cursor:
                      "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          )}

          {/* ==================================================
              PROGRESS
          ================================================== */}

          {uploading && (
            <div
              style={{
                marginTop: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom:
                    "7px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <span>
                  Uploading evidence...
                </span>

                <span>
                  {uploadProgress}%
                </span>
              </div>

              <div
                style={{
                  height: "9px",
                  background:
                    "#e2e8f0",
                  borderRadius:
                    "999px",
                  overflow:
                    "hidden",
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: "100%",
                    background:
                      "#2563eb",
                    borderRadius:
                      "999px",
                    transition:
                      "width 0.2s ease",
                  }}
                />
              </div>
            </div>
          )}

          {/* ==================================================
              UPLOAD BUTTON
          ================================================== */}

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent:
                "flex-end",
            }}
          >
            <button
              onClick={
                handleUpload
              }
              disabled={
                uploading ||
                !file ||
                !selectedSubmission ||
                !selectedEvidenceRequirement
              }
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "8px",
                padding:
                  "11px 19px",
                border: "none",
                borderRadius:
                  "8px",
                background:
                  uploading ||
                  !file ||
                  !selectedSubmission ||
                  !selectedEvidenceRequirement
                    ? "#cbd5e1"
                    : "#0f766e",
                color:
                  "#ffffff",
                cursor:
                  uploading ||
                  !file ||
                  !selectedSubmission ||
                  !selectedEvidenceRequirement
                    ? "not-allowed"
                    : "pointer",
                fontWeight:
                  700,
              }}
            >
              <UploadCloud
                size={17}
              />

              {uploading
                ? "Uploading..."
                : "Upload Evidence"}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          SUCCESS CARD
      ====================================================== */}

      {uploadedDocument && (
        <div
          style={{
            marginTop: "20px",
            padding: "18px",
            background: "#f0fdf4",
            border:
              "1px solid #bbf7d0",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              color: "#166534",
              fontWeight: 700,
            }}
          >
            <CheckCircle
              size={19}
            />

            Evidence uploaded
            successfully
          </div>

          <div
            style={{
              marginTop: "8px",
              color: "#475569",
              fontSize: "13px",
            }}
          >
            {uploadedDocument.title}
          </div>

          <div
            style={{
              marginTop: "6px",
              color: "#64748b",
              fontSize: "12px",
            }}
          >
            Document ID: #
            {uploadedDocument.id}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "13px",
            }}
          >
            <button
              onClick={() =>
                navigate(
                  "/documents"
                )
              }
              style={{
                padding:
                  "8px 13px",
                border:
                  "1px solid #bbf7d0",
                borderRadius:
                  "7px",
                background:
                  "#ffffff",
                color:
                  "#166534",
                cursor:
                  "pointer",
                fontWeight:
                  600,
              }}
            >
              View Evidence Repository
            </button>

            <button
              onClick={() => {
                setUploadedDocument(
                  null
                );
                setMessage("");
                setUploadProgress(0);
              }}
              style={{
                padding:
                  "8px 13px",
                border:
                  "1px solid #cbd5e1",
                borderRadius:
                  "7px",
                background:
                  "#ffffff",
                color:
                  "#475569",
                cursor:
                  "pointer",
                fontWeight:
                  600,
              }}
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          REFRESH STATUS
      ====================================================== */}

      {refreshingDocuments && (
        <div
          style={{
            marginTop: "12px",
            color: "#64748b",
            fontSize: "12px",
            textAlign: "right",
          }}
        >
          Refreshing evidence repository...
        </div>
      )}
    </div>
  );
};

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

const SectionHeading = ({
  number,
  title,
  description,
}) => (
  <div
    style={{
      display: "flex",
      gap: "12px",
      marginBottom: "17px",
    }}
  >
    <div
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        background: "#eff6ff",
        color: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "13px",
        flexShrink: 0,
      }}
    >
      {number}
    </div>

    <div>
      <h2
        style={{
          margin: 0,
          fontSize: "18px",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin:
            "4px 0 0",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        {description}
      </p>
    </div>
  </div>
);

const MiniInfo = ({
  label,
  value,
}) => (
  <div
    style={{
      background: "#f8fafc",
      borderRadius: "8px",
      padding: "11px",
    }}
  >
    <div
      style={{
        color: "#64748b",
        fontSize: "11px",
        marginBottom: "3px",
      }}
    >
      {label}
    </div>

    <strong
      style={{
        fontSize: "14px",
      }}
    >
      {value}
    </strong>
  </div>
);

// ============================================================
// ERROR MESSAGE HELPER
// ============================================================

const getErrorMessage = (
  error,
  fallback
) => {
  const detail =
    error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (
    Array.isArray(detail)
  ) {
    return detail
      .map(
        (item) =>
          item?.msg ||
          String(item)
      )
      .join(", ");
  }

  if (
    error?.message &&
    typeof error.message ===
      "string"
  ) {
    return error.message;
  }

  return fallback;
};

// ============================================================
// FORMAT FILE SIZE
// ============================================================

const formatBytes = (
  bytes
) => {
  if (!bytes) {
    return "0 B";
  }

  if (
    bytes <
    1024
  ) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  if (
    bytes <
    1024 * 1024 * 1024
  ) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
};

// ============================================================
// STYLES
// ============================================================

const cardStyle = {
  background: "#ffffff",
  border:
    "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "22px",
  marginBottom: "18px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  border:
    "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#1e293b",
  fontSize: "14px",
  outline: "none",
};

export default EvidenceUpload;
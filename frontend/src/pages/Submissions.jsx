import React, { useState, useEffect } from "react";
import {
  Plus,
  Send,
  Eye,
  CheckCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";

import submissionService from "../services/submissionService";
import DataTable from "../components/common/DataTable";
import PageHeader from "../components/common/PageHeader";

export const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // =========================
  // CURRENT USER
  // =========================

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const role = user?.role;

  // =========================
  // ROLE DEFINITIONS
  // =========================

  const allowedSubmissionRoles = [
    "NAAC Coordinator",
    "Dept. Coordinator",
    "Committee Member",
    "Reviewer",
    "Data Approver",
    "Principal / Director",
  ];

  const isSubmissionAuthorized =
    allowedSubmissionRoles.includes(role);

  const isDataEntryRole = [
    "NAAC Coordinator",
    "Dept. Coordinator",
    "Committee Member",
  ].includes(role);

  const isReviewer =
    role === "Reviewer";

  const isDataApprover =
    role === "Data Approver";

  const isPrincipal =
    role === "Principal / Director";

  // =========================
  // LOAD SUBMISSIONS
  // =========================

  const loadSubmissions = async () => {
    /*
     * IMPORTANT:
     * Admin is NOT authorized to access
     * the NAAC submission workflow.
     *
     * Therefore we do not even call:
     * GET /submissions
     *
     * This prevents the 403 error.
     */

    if (!isSubmissionAuthorized) {
      console.log(
        `SUBMISSIONS ACCESS SKIPPED FOR ROLE: ${role}`
      );

      setSubmissions([]);
      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      const data =
        await submissionService.getSubmissions();

      console.log(
        "SUBMISSIONS DATA:",
        data
      );

      if (Array.isArray(data)) {
        const formatted = data.map((sub) => ({
          id: sub.id,

          title:
            sub.title ||
            "Criteria Submission",

          criterion:
            sub.criterion ||
            (sub.metric_code
              ? `Metric ${sub.metric_code}`
              : sub.criterion_id
              ? `Criterion #${sub.criterion_id}`
              : "Criterion Submission"),

          department:
            sub.department ||
            (sub.department_name
              ? sub.department_name
              : sub.department_id
              ? `Department #${sub.department_id}`
              : "Academic Department"),

          submittedBy:
            sub.submittedBy ||
            sub.user_name ||
            (sub.user_id
              ? `User #${sub.user_id}`
              : "Unknown User"),

          date:
            sub.date ||
            (sub.created_at
              ? sub.created_at.split("T")[0]
              : "-"),

          status:
            sub.status ||
            "Draft",

          original: sub,
        }));

        setSubmissions(formatted);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error(
        "SUBMISSIONS LOAD ERROR:",
        error?.response?.data || error
      );

      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [role]);

  // =========================
  // CREATE SUBMISSION
  // =========================

  const handleCreate = async () => {
    if (!isDataEntryRole) {
      alert(
        "You are not authorized to create submissions."
      );
      return;
    }

    try {
      setActionLoading("create");

      const item = {
        title: `Draft Criterion Submission ${Date.now()
          .toString()
          .slice(-4)}`,

        metric_code: "1.1.1",

        data_json: {
          test: true,
        },
      };

      console.log(
        "CREATE SUBMISSION PAYLOAD:",
        item
      );

      const response =
        await submissionService.createSubmission(
          item
        );

      console.log(
        "CREATE SUBMISSION RESPONSE:",
        response
      );

      await loadSubmissions();
    } catch (error) {
      console.error(
        "CREATE SUBMISSION ERROR:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to create submission."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // SUBMIT DRAFT
  // DRAFT → SUBMITTED
  // =========================

  const handleSubmit = async (id) => {
    try {
      setActionLoading(id);

      await submissionService.submitSubmission(
        id
      );

      await loadSubmissions();
    } catch (error) {
      console.error(
        "SUBMIT ERROR:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to submit the submission."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // RESUBMIT
  // CHANGES REQUESTED → SUBMITTED
  // =========================

  const handleResubmit = async (id) => {
    try {
      setActionLoading(id);

      await submissionService.resubmitSubmission(
        id
      );

      await loadSubmissions();
    } catch (error) {
      console.error(
        "RESUBMIT ERROR:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to resubmit."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // START REVIEW
  // SUBMITTED → UNDER REVIEW
  // =========================

  const handleStartReview = async (id) => {
    try {
      setActionLoading(id);

      await submissionService.startReview(id);

      await loadSubmissions();
    } catch (error) {
      console.error(
        "START REVIEW ERROR:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to start review."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // REVIEW APPROVE
  // =========================

  const handleReviewApprove = async (id) => {
    try {
      setActionLoading(id);

      await submissionService.reviewSubmission(
        id,
        {
          status: "Approved",
          comments:
            "Submission reviewed and approved.",
        }
      );

      await loadSubmissions();
    } catch (error) {
      console.error(
        "REVIEW APPROVE ERROR:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to approve submission."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // REVIEW REQUEST CHANGES
  // =========================

  const handleReviewChanges = async (id) => {
    const comments = window.prompt(
      "Enter reason for requesting changes:"
    );

    if (!comments) {
      return;
    }

    try {
      setActionLoading(id);

      await submissionService.reviewSubmission(
        id,
        {
          status: "Changes Requested",
          comments,
        }
      );

      await loadSubmissions();
    } catch (error) {
      console.error(
        "REQUEST CHANGES ERROR:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to request changes."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // REJECT
  // =========================

  const handleReject = async (id) => {
    const reason = window.prompt(
      "Enter rejection reason:"
    );

    if (!reason) {
      return;
    }

    try {
      setActionLoading(id);

      await submissionService.rejectSubmission(
        id,
        {
          reason,
        }
      );

      await loadSubmissions();
    } catch (error) {
      console.error(
        "REJECT ERROR:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to reject submission."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // DATA APPROVAL
  // APPROVED → DATA APPROVED
  // =========================

  const handleDataApprove = async (id) => {
    try {
      setActionLoading(id);

      await submissionService.approveSubmission(
        id,
        {
          comments:
            "Data verified and approved.",
        }
      );

      await loadSubmissions();
    } catch (error) {
      console.error(
        "DATA APPROVAL ERROR:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to approve data."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // DATA REQUEST CHANGES
  // =========================

  const handleDataRequestChanges = async (
    id
  ) => {
    const reason = window.prompt(
      "Enter reason for requesting changes:"
    );

    if (!reason) {
      return;
    }

    try {
      setActionLoading(id);

      await submissionService.requestChanges(
        id,
        {
          reason,
        }
      );

      await loadSubmissions();
    } catch (error) {
      console.error(
        "DATA REQUEST CHANGES ERROR:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to request changes."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // PRINCIPAL FINAL APPROVAL
  // =========================

  const handleFinalApprove = async (id) => {
    try {
      setActionLoading(id);

      await submissionService.finalApprove(
        id,
        {
          comments:
            "Final approval granted by Principal / Director.",
        }
      );

      await loadSubmissions();
    } catch (error) {
      console.error(
        "FINAL APPROVAL ERROR:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to give final approval."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // FINAL NAAC SUBMISSION
  // =========================

  const handleFinalSubmit = async (id) => {
    try {
      setActionLoading(id);

      console.log(
        "FINAL NAAC SUBMISSION:",
        id
      );

      const response =
        await submissionService.finalSubmit(
          id
        );

      console.log(
        "FINAL SUBMISSION RESPONSE:",
        response
      );

      await loadSubmissions();
    } catch (error) {
      console.error(
        "FINAL SUBMISSION ERROR:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Unable to submit final NAAC submission."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // ACTION BUTTONS
  // =========================

  const renderActions = (row) => {
    const status = row.status;

    const isLoading =
      actionLoading === row.id;

    // =========================
    // DATA ENTRY ROLES
    // =========================

    if (isDataEntryRole) {
      if (status === "Draft") {
        return (
          <button
            onClick={() =>
              handleSubmit(row.id)
            }
            disabled={isLoading}
            title="Submit"
            style={actionButtonStyle}
          >
            <Send size={16} />
          </button>
        );
      }

      if (status === "Changes Requested") {
        return (
          <button
            onClick={() =>
              handleResubmit(row.id)
            }
            disabled={isLoading}
            title="Resubmit"
            style={actionButtonStyle}
          >
            <RotateCcw size={16} />
          </button>
        );
      }

      return (
        <button
          title="View"
          style={actionButtonStyle}
        >
          <Eye size={16} />
        </button>
      );
    }

    // =========================
    // REVIEWER
    // =========================

    if (isReviewer) {
      if (status === "Submitted") {
        return (
          <button
            onClick={() =>
              handleStartReview(row.id)
            }
            disabled={isLoading}
            title="Start Review"
            style={actionButtonStyle}
          >
            <Eye size={16} />
          </button>
        );
      }

      if (status === "Under Review") {
        return (
          <div
            style={{
              display: "flex",
              gap: "6px",
            }}
          >
            <button
              onClick={() =>
                handleReviewApprove(
                  row.id
                )
              }
              disabled={isLoading}
              title="Approve"
              style={actionButtonStyle}
            >
              <CheckCircle size={16} />
            </button>

            <button
              onClick={() =>
                handleReviewChanges(
                  row.id
                )
              }
              disabled={isLoading}
              title="Request Changes"
              style={actionButtonStyle}
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() =>
                handleReject(row.id)
              }
              disabled={isLoading}
              title="Reject"
              style={actionButtonStyle}
            >
              <XCircle size={16} />
            </button>
          </div>
        );
      }
    }

    // =========================
    // DATA APPROVER
    // =========================

    if (isDataApprover) {
      if (status === "Approved") {
        return (
          <div
            style={{
              display: "flex",
              gap: "6px",
            }}
          >
            <button
              onClick={() =>
                handleDataApprove(
                  row.id
                )
              }
              disabled={isLoading}
              title="Approve Data"
              style={actionButtonStyle}
            >
              <CheckCircle size={16} />
            </button>

            <button
              onClick={() =>
                handleDataRequestChanges(
                  row.id
                )
              }
              disabled={isLoading}
              title="Request Changes"
              style={actionButtonStyle}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        );
      }
    }

    // =========================
    // PRINCIPAL / DIRECTOR
    // =========================

    if (isPrincipal) {
      /*
       * Final approval happens after
       * Data Approver approval.
       */

      if (status === "Approved") {
        return (
          <button
            onClick={() =>
              handleFinalApprove(
                row.id
              )
            }
            disabled={isLoading}
            title="Final Approval"
            style={actionButtonStyle}
          >
            <CheckCircle size={16} />
          </button>
        );
      }

      /*
       * Backend/UI may return either:
       *
       * Final Approved
       * Final Approval
       *
       * Support both.
       */

      if (
        status === "Final Approved" ||
        status === "Final Approval"
      ) {
        return (
          <button
            onClick={() =>
              handleFinalSubmit(
                row.id
              )
            }
            disabled={isLoading}
            title="Final NAAC Submission"
            style={actionButtonStyle}
          >
            <Send size={16} />
          </button>
        );
      }
    }

    // =========================
    // DEFAULT VIEW
    // =========================

    return (
      <button
        title="View"
        style={actionButtonStyle}
      >
        <Eye size={16} />
      </button>
    );
  };

  // =========================
  // TABLE COLUMNS
  // =========================

  const columns = [
    {
      title: "Submission Title",
      dataIndex: "title",
    },

    {
      title: "Criterion",
      dataIndex: "criterion",
    },

    {
      title: "Department",
      dataIndex: "department",
    },

    {
      title: "Submitted By",
      dataIndex: "submittedBy",
    },

    {
      title: "Date",
      dataIndex: "date",
    },

    {
      title: "Status",
      dataIndex: "status",
      isStatus: true,
    },

    {
      title: "Actions",
      dataIndex: "id",
      render: (_, row) =>
        renderActions(row),
    },
  ];

  // =========================
  // UI
  // =========================

  /*
   * Admin should not use the Submission module.
   *
   * If Admin somehow reaches this route directly,
   * show an access message instead of attempting
   * GET /submissions.
   */

  if (!isSubmissionAuthorized) {
    return (
      <div
        style={{
          color: "#1e293b",
        }}
      >
        <PageHeader
          eyebrow="ACCREDITATION DOSSIER"
          title="Submissions Management"
          description="Track SSR and AQAR submissions across academic units."
        />

        <div
          className="panel"
          style={{
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 16px",
              borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <XCircle
              size={28}
              color="#64748b"
            />
          </div>

          <h3
            style={{
              margin: "0 0 8px",
              color: "#1e293b",
            }}
          >
            Access Restricted
          </h3>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            The {role || "current"} role is not
            authorized to access the NAAC
            submission workflow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        color: "#1e293b",
      }}
    >
      <PageHeader
        eyebrow="ACCREDITATION DOSSIER"
        title="Submissions Management"
        description="Track SSR and AQAR submissions across academic units."
        primaryAction={
          isDataEntryRole
            ? {
                label: "New Submission",
                icon: Plus,
                onClick: handleCreate,
              }
            : undefined
        }
      />

      <div
        className="panel"
        style={{
          background: "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading submissions...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={submissions}
            keyField="id"
            emptyMessage="No criteria submissions found."
          />
        )}
      </div>
    </div>
  );
};

// =========================
// ACTION BUTTON STYLE
// =========================

const actionButtonStyle = {
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  borderRadius: "7px",
  padding: "6px 8px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

export default Submissions;
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import submissionService from "../services/submissionService";
import DataTable from "../components/common/DataTable";
import PageHeader from "../components/common/PageHeader";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../config/permissions";

export const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    submissionService.getSubmissions().then((data) => {
      if (Array.isArray(data)) {
        const formatted = data.map((sub) => ({
          id: sub.id,
          title: sub.title || "Criteria Submission",
          criterion: sub.criterion || (sub.metric_code ? `Metric ${sub.metric_code}` : "Criterion 1"),
          department: sub.department || (sub.department_id ? `Dept #${sub.department_id}` : "Academic Dept"),
          submittedBy: sub.submittedBy || (sub.user_id ? `User #${sub.user_id}` : "Dept Coordinator"),
          date: sub.date || (sub.created_at ? sub.created_at.split("T")[0] : new Date().toISOString().split("T")[0]),
          status: sub.status || "Draft",
        }));
        setSubmissions(formatted);
      } else {
        setSubmissions([]);
      }
    }).catch(() => setSubmissions([]));
  }, []);

  const handleCreate = () => {
    const item = {
      title: `Draft Criterion Submission ${Date.now().toString().slice(-4)}`,
      metric_code: "1.1.1",
      data_json: '{"test": true}',
    };
    submissionService.createSubmission(item).then((res) => {
      const formattedRes = {
        id: res?.id || `sub_${Date.now()}`,
        title: res?.title || item.title,
        criterion: "Metric 1.1.1",
        department: "CSE",
        submittedBy: "Dept Coordinator",
        date: new Date().toISOString().split("T")[0],
        status: res?.status || "Draft",
      };
      setSubmissions((prev) => [formattedRes, ...prev]);
    });
  };

  const columns = [
    { title: "Submission Title", dataIndex: "title" },
    { title: "Criterion", dataIndex: "criterion" },
    { title: "Department", dataIndex: "department" },
    { title: "Submitted By", dataIndex: "submittedBy" },
    { title: "Date", dataIndex: "date" },
    { title: "Status", dataIndex: "status", isStatus: true },
  ];

  return (
    <div style={{ color: "#1e293b" }}>
      <PageHeader
        eyebrow="ACCREDITATION DOSSIER"
        title="Submissions Management"
        description="Track SSR and AQAR submissions across academic units."
        primaryAction={{
          label: "New Submission",
          icon: Plus,
          onClick: handleCreate,
        }}
      />
      <div className="panel" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
        <DataTable columns={columns} data={submissions} keyField="id" emptyMessage="No criteria submissions found." />
      </div>
    </div>
  );
};

export default Submissions;

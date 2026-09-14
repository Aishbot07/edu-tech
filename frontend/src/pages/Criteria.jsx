import React, { useState, useEffect } from "react";
import criteriaService from "../services/criteriaService";
import DataTable from "../components/common/DataTable";
import PageHeader from "../components/common/PageHeader";

export const Criteria = () => {
  const [criteria, setCriteria] = useState([]);

  useEffect(() => {
    criteriaService.getCriteria().then((data) => {
      if (Array.isArray(data)) {
        const formatted = data.map((c) => ({
          id: c.id,
          number: c.number || `C${c.id}`,
          title: c.title || "NAAC Criterion",
          score: c.weightage || c.score || 100,
          maxScore: 100,
          status: c.completion_percentage >= 80 ? "Approved" : c.completion_percentage >= 50 ? "Under Review" : "Draft",
          weighted: Math.round(c.completion_percentage || 0),
        }));
        setCriteria(formatted);
      } else {
        setCriteria([]);
      }
    }).catch(() => setCriteria([]));
  }, []);

  const columns = [
    { title: "Criterion", dataIndex: "number" },
    { title: "Title", dataIndex: "title" },
    { title: "Score Points", dataIndex: "score", render: (val, row) => `${val} / ${row.maxScore || 100}` },
    { title: "Status", dataIndex: "status", isStatus: true },
    {
      title: "Weighted Health",
      dataIndex: "weighted",
      render: (val) => {
        const pct = val ?? 0;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="criterion-bar" style={{ width: "100px" }}>
              <div className="criterion-fill" style={{ width: `${pct}%` }} />
            </div>
            <strong style={{ color: "#0f172a" }}>{pct}%</strong>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ color: "#1e293b" }}>
      <PageHeader eyebrow="NAAC RAF STANDARDS" title="NAAC Criteria Overview" description="Manage and track metrics across Criteria 1 through 7." />
      <div className="panel" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
        <DataTable columns={columns} data={criteria} keyField="id" emptyMessage="No criteria criteria defined." />
      </div>
    </div>
  );
};

export default Criteria;

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import institutionService from "../../services/institutionService";
import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";

export const InstitutionManagement = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await institutionService.getInstitutions();
      setInstitutions(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load institutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    const newInst = {
      name: `EduVerse Campus ${Date.now().toString().slice(-3)}`,
      code: `EVC-${Math.floor(100 + Math.random() * 900)}`,
      city: "Bengaluru",
      state: "Karnataka",
      institution_type: "Constituent College",
    };
    institutionService.createInstitution(newInst).then(() => {
      loadData();
    });
  };

  const columns = [
    { title: "Institution Name", dataIndex: "name" },
    { title: "Code", dataIndex: "code" },
    { title: "City", dataIndex: "city" },
    { title: "State", dataIndex: "state" },
    { title: "Type", dataIndex: "institution_type" },
    { title: "Status", dataIndex: "status", isStatus: true },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="ADMINISTRATION"
        title="Institution Management"
        description="Manage registered institutions, campus codes, and statutory accreditation parameters."
        primaryAction={{
          label: "Add Institution",
          icon: Plus,
          onClick: handleCreate,
        }}
      />

      {error && (
        <div style={{ padding: "12px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", marginBottom: "15px" }}>
          {error}
        </div>
      )}

      <div className="panel">
        <DataTable columns={columns} data={institutions} keyField="id" emptyMessage="No institutions registered." />
      </div>
    </div>
  );
};

export default InstitutionManagement;

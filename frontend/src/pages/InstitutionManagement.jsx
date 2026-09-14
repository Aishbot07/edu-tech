import React, { useEffect, useState } from "react";
import api from "../services/api";

function InstitutionManagement() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/institutions");

      setInstitutions(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Failed to load institutions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Institution Management</h1>

      <p>
        Manage institutions registered in EduVerse NAAC.
      </p>

      {loading && <p>Loading institutions...</p>}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <div>
          {institutions.length === 0 ? (
            <p>No institutions found.</p>
          ) : (
            institutions.map((institution) => (
              <div
                key={institution.id}
                style={{
                  background: "#ffffff",
                  padding: "20px",
                  marginTop: "15px",
                  borderRadius: "12px",
                  boxShadow:
                    "0 4px 15px rgba(0,0,0,0.08)",
                }}
              >
                <h2>{institution.name}</h2>

                <p>
                  <strong>Code:</strong>{" "}
                  {institution.code}
                </p>

                <p>
                  <strong>City:</strong>{" "}
                  {institution.city}
                </p>

                <p>
                  <strong>State:</strong>{" "}
                  {institution.state}
                </p>

                <p>
                  <strong>Type:</strong>{" "}
                  {institution.institution_type}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default InstitutionManagement;
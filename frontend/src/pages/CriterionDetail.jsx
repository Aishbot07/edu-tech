import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import criteriaService from "../services/criteriaService";

const CriterionDetail = () => {
  const { criterionId } = useParams();
  const navigate = useNavigate();

  const [criterion, setCriterion] = useState(null);
  const [sections, setSections] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // ----------------------------------
        // 1. Get selected criterion
        // ----------------------------------

        const criteriaData =
          await criteriaService.getCriteria();

        const selectedCriterion = criteriaData.find(
          (c) =>
            String(c.id) === String(criterionId)
        );

        if (!selectedCriterion) {
          setError("Criterion not found.");
          return;
        }

        setCriterion(selectedCriterion);

        // ----------------------------------
        // 2. Get sections for this criterion
        // ----------------------------------

        const sectionsData =
          await criteriaService.getSections(
            criterionId
          );

        const sortedSections = Array.isArray(
          sectionsData
        )
          ? [...sectionsData].sort(
              (a, b) =>
                (a.display_order || 0) -
                (b.display_order || 0)
            )
          : [];

        setSections(sortedSections);

        // ----------------------------------
        // 3. Get all metrics
        // ----------------------------------

        const metricsData =
          await criteriaService.getMetrics();

        // ----------------------------------
        // 4. Keep only metrics belonging
        //    to sections of this criterion
        // ----------------------------------

        const sectionIds = new Set(
          sortedSections.map((section) =>
            String(section.id)
          )
        );



        const criterionMetrics =
          Array.isArray(metricsData)
            ? metricsData.filter((metric) =>
                sectionIds.has(
                  String(metric.section_id)
                )
              )
            : [];

        // Sort metrics
        criterionMetrics.sort(
          (a, b) =>
            (a.display_order || 0) -
            (b.display_order || 0)
        );

        setMetrics(criterionMetrics);

        console.log(
          "CRITERION:",
          selectedCriterion
        );

        console.log(
          "SECTIONS:",
          sortedSections
        );

        console.log(
          "METRICS:",
          criterionMetrics
        );
      } catch (err) {
        console.error(
          "Failed to load criterion data:",
          err
        );

        setError(
          "Failed to load criterion data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [criterionId]);

  // ----------------------------------
  // Loading
  // ----------------------------------

  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
          color: "#1e293b",
        }}
      >
        Loading criterion...
      </div>
    );
  }

  // ----------------------------------
  // Error
  // ----------------------------------

  if (error) {
    return (
      <div
        style={{
          padding: "30px",
          color: "#1e293b",
        }}
      >
        <button
          onClick={() => navigate("/criteria")}
          style={{
            border: "none",
            background: "transparent",
            color: "#2563eb",
            cursor: "pointer",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          ← Back to Criteria
        </button>

        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div style={{ color: "#1e293b" }}>

      {/* -------------------------------- */}
      {/* Back */}
      {/* -------------------------------- */}

      <button
        onClick={() => navigate("/criteria")}
        style={{
          border: "none",
          background: "transparent",
          color: "#2563eb",
          cursor: "pointer",
          fontWeight: 600,
          marginBottom: "20px",
        }}
      >
        ← Back to Criteria
      </button>

      {/* -------------------------------- */}
      {/* Criterion Header */}
      {/* -------------------------------- */}

      <div style={{ marginBottom: "24px" }}>
        <p
          style={{
            color: "#64748b",
            fontSize: "14px",
            marginBottom: "6px",
          }}
        >
          CRITERION {criterion.number}
        </p>

        <h1 style={{ margin: 0 }}>
          {criterion.title}
        </h1>

        <p
          style={{
            color: "#64748b",
            marginTop: "8px",
          }}
        >
          {criterion.description}
        </p>
      </div>

      {/* -------------------------------- */}
      {/* Criterion Summary */}
      {/* -------------------------------- */}

      <div
        className="panel"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >

          <div>
            <p
              style={{
                color: "#64748b",
                margin: 0,
                fontSize: "14px",
              }}
            >
              Weightage
            </p>

            <h3 style={{ margin: "6px 0 0" }}>
              {criterion.weightage}
            </h3>
          </div>

          <div>
            <p
              style={{
                color: "#64748b",
                margin: 0,
                fontSize: "14px",
              }}
            >
              Completion
            </p>

            <h3 style={{ margin: "6px 0 0" }}>
              {criterion.completion_percentage ?? 0}%
            </h3>
          </div>

          <div>
            <p
              style={{
                color: "#64748b",
                margin: 0,
                fontSize: "14px",
              }}
            >
              Sections
            </p>

            <h3 style={{ margin: "6px 0 0" }}>
              {sections.length}
            </h3>
          </div>

          <div>
            <p
              style={{
                color: "#64748b",
                margin: 0,
                fontSize: "14px",
              }}
            >
              Metrics
            </p>

            <h3 style={{ margin: "6px 0 0" }}>
              {metrics.length}
            </h3>
          </div>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Criterion Progress */}
      {/* -------------------------------- */}

      <div
        className="panel"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <strong>
            Criterion Progress
          </strong>

          <strong>
            {criterion.completion_percentage ?? 0}%
          </strong>
        </div>

        <div
          style={{
            width: "100%",
            height: "10px",
            background: "#e2e8f0",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${
                criterion.completion_percentage ?? 0
              }%`,
              height: "100%",
              background: "#2563eb",
            }}
          />
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Sections + Metrics */}
      {/* -------------------------------- */}

      <div
        className="panel"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
        }}
      >

        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ margin: 0 }}>
            Sections & Metrics
          </h2>

          <p
            style={{
              color: "#64748b",
              marginTop: "6px",
            }}
          >
            Metrics organized according to
            their respective NAAC sections.
          </p>
        </div>

        {sections.length === 0 && (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            No sections found for this criterion.
          </div>
        )}

        {/* -------------------------------- */}
        {/* Section Loop */}
        {/* -------------------------------- */}

        {sections.map((section) => {

          const sectionMetrics =
            metrics.filter(
              (metric) =>
                String(metric.section_id) ===
                String(section.id)
            );

          return (
            <div
              key={section.id}
              style={{
                marginBottom: "28px",
              }}
            >

              {/* Section Header */}
              <div
                style={{
                  padding: "16px 18px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >

                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          background: "#2563eb",
                          color: "#ffffff",
                          padding: "5px 9px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        {section.code}
                      </span>

                      <h3
                        style={{
                          margin: 0,
                        }}
                      >
                        {section.title}
                      </h3>
                    </div>

                    {section.description && (
                      <p
                        style={{
                          color: "#64748b",
                          margin:
                            "8px 0 0 0",
                        }}
                      >
                        {section.description}
                      </p>
                    )}
                  </div>

                  <span
                    style={{
                      background: "#eff6ff",
                      color: "#2563eb",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sectionMetrics.length}{" "}
                    Metrics
                  </span>
                </div>
              </div>

              {/* -------------------------------- */}
              {/* Metrics inside Section */}
              {/* -------------------------------- */}

              {sectionMetrics.length === 0 ? (
                <div
                  style={{
                    padding: "18px",
                    color: "#64748b",
                    border:
                      "1px dashed #cbd5e1",
                    borderRadius: "8px",
                  }}
                >
                  No metrics available
                  for this section.
                </div>
              ) : (
                sectionMetrics.map(
                  (metric) => (
                    <div
                      key={metric.id}
                      style={{
                        border:
                          "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "18px",
                        marginBottom: "10px",
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: "20px",
                      }}
                    >

                      {/* Metric Information */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: "10px",
                          }}
                        >
                          <span
                            style={{
                              background:
                                "#f1f5f9",
                              padding:
                                "5px 9px",
                              borderRadius:
                                "6px",
                              fontWeight: 700,
                              fontSize:
                                "13px",
                            }}
                          >
                            {metric.code}
                          </span>

                          <strong>
                            {metric.title}
                          </strong>
                        </div>

                        {metric.description && (
                          <p
                            style={{
                              margin:
                                "8px 0",
                              color:
                                "#64748b",
                            }}
                          >
                            {
                              metric.description
                            }
                          </p>
                        )}

                        <div
                          style={{
                            display:
                              "flex",
                            gap: "15px",
                            flexWrap:
                              "wrap",
                            fontSize:
                              "13px",
                            color:
                              "#64748b",
                          }}
                        >
                          <span>
                            Type:{" "}
                            {
                              metric.metric_type
                            }
                          </span>

                          <span>
                            Weightage:{" "}
                            {
                              metric.weightage
                            }
                          </span>

                          <span>
                            Max Score:{" "}
                            {
                              metric.max_score
                            }
                          </span>

                          <span>
                            Evidence:{" "}
                            {metric.requires_evidence
                              ? "Required"
                              : "Not Required"}
                          </span>
                        </div>
                      </div>

                      {/* View Metric */}
                      <button
                        onClick={() =>
                          navigate(
                            `/criteria/${criterionId}/metrics/${metric.id}`
                          )
                        }
                        style={{
                          border: "none",
                          background:
                            "#eff6ff",
                          color:
                            "#2563eb",
                          padding:
                            "10px 15px",
                          borderRadius:
                            "8px",
                          cursor:
                            "pointer",
                          fontWeight: 600,
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        View Metric →
                      </button>
                    </div>
                  )
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CriterionDetail;

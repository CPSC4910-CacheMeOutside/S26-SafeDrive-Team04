import { useState } from "react";

const mockApplications = [
  {
    id: 1,
    name: "Taylor Swift",
    email: "twsift@gmail.com",
    phone: "123-456-7890",
    licenseNumber: "DL-112233",
    licenseState: "PA",
    licenseExpiry: "2026-08-15",
    sponsorName: "SafeDrive Co.",
    submittedDate: "2026-01-10",
    status: "pending",
  },
  {
    id: 2,
    name: "Harry Styles",
    email: "hstyles@gmail.com",
    phone: "321-456-7890",
    licenseNumber: "DL-445566",
    licenseState: "WI",
    licenseExpiry: "2027-03-22",
    sponsorName: "SafeDrive Co.",
    submittedDate: "2026-01-15",
    status: "pending",
  },
  {
    id: 3,
    name: "Lionel Messi",
    email: "lionel@gmail.com",
    phone: "555-555-5555",
    licenseNumber: "DL-778899",
    licenseState: "AR",
    licenseExpiry: "2026-11-01",
    sponsorName: "SafeDrive Co.",
    submittedDate: "2026-02-03",
    status: "pending",
  },
];

export default function SponsorApplicationsPage() {
  const [applications, setApplications] = useState(mockApplications);
  const [filterDate, setFilterDate] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  function handleAccept(id) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "accepted" } : a))
    );
    if (selectedApp?.id === id) setSelectedApp((a) => ({ ...a, status: "accepted" }));
  }

  function handleDeny(id) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "denied" } : a))
    );
    if (selectedApp?.id === id) setSelectedApp((a) => ({ ...a, status: "denied" }));
  }

  const filtered = applications.filter((a) => {
    const dateMatch = filterDate ? a.submittedDate >= filterDate : true;
    const statusMatch = statusFilter === "all" ? true : a.status === statusFilter;
    return dateMatch && statusMatch;
  });

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 4 }}>Driver Applications</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>Review and manage incoming driver applications</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 4 }}>
            Filter by submitted date (from)
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 4 }}>
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="denied">Denied</option>
          </select>
        </div>

        {filterDate && (
          <button
            onClick={() => setFilterDate("")}
            style={{ marginTop: 18, padding: "6px 12px", background: "#eee", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
          >
            Clear filter
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {filtered.length === 0 && (
            <p style={{ color: "#999" }}>No applications match the current filter.</p>
          )}
          {filtered.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              style={{
                border: selectedApp?.id === app.id ? "2px solid #007bff" : "1px solid #ddd",
                borderRadius: 6,
                padding: 16,
                marginBottom: 12,
                cursor: "pointer",
                background: selectedApp?.id === app.id ? "#f0f7ff" : "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 15 }}>{app.name}</strong>
                <StatusBadge status={app.status} />
              </div>
              <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>{app.email}</div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                Submitted: {app.submittedDate}
              </div>

              {app.status === "pending" && (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAccept(app.id); }}
                    style={{ ...btnBase, background: "#28a745", color: "#fff" }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeny(app.id); }}
                    style={{ ...btnBase, background: "#dc3545", color: "#fff" }}
                  >
                    Deny
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ width: 320, flexShrink: 0 }}>
          {selectedApp ? (
            <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: 20, position: "sticky", top: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>{selectedApp.name}</h3>
                <StatusBadge status={selectedApp.status} />
              </div>

              <DetailRow label="Email" value={selectedApp.email} />
              <DetailRow label="Phone" value={selectedApp.phone} />
              <DetailRow label="License #" value={selectedApp.licenseNumber} />
              <DetailRow label="License State" value={selectedApp.licenseState} />
              <DetailRow label="License Expiry" value={selectedApp.licenseExpiry} />
              <DetailRow label="Applying to" value={selectedApp.sponsorName} />
              <DetailRow label="Submitted" value={selectedApp.submittedDate} />

              {selectedApp.status === "pending" && (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => handleAccept(selectedApp.id)}
                    style={{ ...btnBase, flex: 1, background: "#28a745", color: "#fff" }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeny(selectedApp.id)}
                    style={{ ...btnBase, flex: 1, background: "#dc3545", color: "#fff" }}
                  >
                    Deny
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ border: "1px dashed #ccc", borderRadius: 6, padding: 20, color: "#999", textAlign: "center" }}>
              Select an application to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: { background: "#fff3cd", color: "#856404" },
    accepted: { background: "#d4edda", color: "#155724" },
    denied: { background: "#f8d7da", color: "#721c24" },
  };
  return (
    <span style={{ ...colors[status], padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: "bold" }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: "bold", color: "#999", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 14, color: "#333" }}>{value}</div>
    </div>
  );
}

const btnBase = {
  padding: "7px 14px",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: "bold",
};
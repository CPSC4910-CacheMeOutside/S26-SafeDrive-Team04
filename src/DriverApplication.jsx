import { useState } from "react";
import { useParams } from "react-router-dom";

const fields = [
  { id: "firstName", label: "First Name", type: "text", required: true, placeholder: "John" },
  { id: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Doe" },
  { id: "email", label: "Email", type: "email", required: true, placeholder: "john@email.com" },
  { id: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "555-123-4567" },
  { id: "licenseNumber", label: "License Number", type: "text", required: true, placeholder: "DL-000000" },
  { id: "licenseState", label: "License State", type: "text", required: true, placeholder: "CA" },
  { id: "licenseExpiry", label: "License Expiry Date", type: "date", required: true },
  { id: "sponsorName", label: "Company/Sponsor Name", type: "text", required: true, placeholder: "Name of the company you want to join" },
];

function getError(field, value) {
  if (field.required && !value.trim()) {
    return field.label + " is required";
  }

  if (!value.trim()) return null; 

  if (field.id === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Invalid email address";
    }
  }

  if (field.id === "phone") {
    if (!/^\+?[\d\s\-().]{7,}$/.test(value)) {
      return "Phone number looks wrong";
    }
  }

  if (field.id === "licenseNumber") {
    if (value.length < 4) return "License number too short";
  }

  if (field.id === "licenseState") {
    if (!/^[A-Za-z]{2}$/.test(value.trim())) {
      return "Use 2-letter state code (ex: CA)";
    }
  }

  if (field.id === "licenseExpiry") {
    if (new Date(value) <= new Date()) {
      return "License is expired!";
    }
  }


  return null;
}

const mockSubmittedApplications = [
  {
    id: 101,
    sponsorName: "SafeDrive Co.",
    submittedDate: "2026-01-10",
    status: "pending",
    rejectionReason: null,
    driverAction: null,
  },
  {
    id: 102,
    sponsorName: "FastFleet Inc.",
    submittedDate: "2026-01-20",
    status: "accepted",
    rejectionReason: null,
    driverAction: null,
  },
  {
    id: 103,
    sponsorName: "RoadReady LLC",
    submittedDate: "2026-02-01",
    status: "denied",
    rejectionReason: "Your license state is not currently supported in our operating region.",
    driverAction: null,
  },
];

export default function DriverApplicationForm() {

  const {appliedSponsor} = useParams();

  const [values, setValues] = useState(
    fields.reduce((acc, f) => ({ ...acc, [f.id]: "" }), {})
  );
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const [view, setView] = useState("form");
  const [myApplications, setMyApplications] = useState(mockSubmittedApplications);

  const errors = {};
  for (const f of fields) {
    errors[f.id] = getError(f, values[f.id] || "");
  }

  const hasErrors = Object.values(errors).some((e) => e !== null);

  function handleChange(id, val) {
    setValues({ ...values, [id]: val });
    setTouched({ ...touched, [id]: true });
  }

  function handleBlur(id) {
    setTouched({ ...touched, [id]: true });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const allTouched = fields.reduce((acc, f) => ({ ...acc, [f.id]: true }), {});
    setTouched(allTouched);
    setSubmitted(true);

    if (!hasErrors) {
      setDone(true);
    }
  }

  function handleDriverAction(appId, action) {
    setMyApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, driverAction: action } : a))
    );
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ color: "green" }}>Application Submitted!</h2>
        <p>We got your application, someone will review it soon.</p>
        <button
          onClick={() => {
            setDone(false);
            setSubmitted(false);
            setTouched({});
            setValues(fields.reduce((acc, f) => ({ ...acc, [f.id]: "" }), {}));
          }}
          style={btnStyle}
        >
          Submit Another One
        </button>
      </div>
    );
  }

  if (view === "myApplications") {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => setView("form")} style={{ ...btnStyle, background: "#6c757d", padding: "6px 14px", fontSize: 13 }}>
            ← Back
          </button>
          <h2 style={{ margin: 0 }}>My Applications</h2>
        </div>

        {myApplications.map((app) => (
          <div key={app.id} style={{ border: "1px solid #ddd", borderRadius: 4, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <strong>{app.sponsorName}</strong>
              <StatusBadge status={app.driverAction ? (app.driverAction === "accepted" ? "offer_accepted" : "offer_declined") : app.status} />
            </div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>Submitted: {app.submittedDate}</div>

            <ApplicationStatusMessage
              status={app.status}
              rejectionReason={app.rejectionReason}
              driverAction={app.driverAction}
            />

            {app.status === "accepted" && app.driverAction === null && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 13, fontWeight: "bold", marginBottom: 8 }}>
                  Would you like to accept their offer?
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleDriverAction(app.id, "accepted")}
                    style={{ ...btnStyle, background: "#28a745", padding: "7px 18px", fontSize: 13 }}
                  >
                    Accept Offer
                  </button>
                  <button
                    onClick={() => handleDriverAction(app.id, "rejected")}
                    style={{ ...btnStyle, background: "#dc3545", padding: "7px 18px", fontSize: 13 }}
                  >
                    Decline Offer
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>

      <h1 style={{ textAlign: "center" }}>Driver Application for {appliedSponsor}</h1>
      <p style={{ textAlign: "center", color: "#555" }}>
        Fields marked with <span style={{ color: "red" }}>*</span> are required
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <h3 style={sectionTitleStyle}>Personal Info</h3>
        <div style={gridStyle}>
          {fields.slice(0, 4).map((field) => (
            <FormField
              key={field.id}
              field={field}
              value={values[field.id]}
              error={errors[field.id]}
              showError={(touched[field.id] || submitted) && !!errors[field.id]}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          ))}
        </div>

        <h3 style={sectionTitleStyle}>License Info</h3>
        <div style={gridStyle}>
          {fields.slice(4, 7).map((field) => (
            <FormField
              key={field.id}
              field={field}
              value={values[field.id]}
              error={errors[field.id]}
              showError={(touched[field.id] || submitted) && !!errors[field.id]}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          ))}
        </div>

        <h3 style={sectionTitleStyle}>Application Details</h3>
        <div>
          {fields.slice(7, 8).map((field) => (
            <FormField
              key={field.id}
              field={field}
              value={values[field.id]}
              error={errors[field.id]}
              showError={(touched[field.id] || submitted) && !!errors[field.id]}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          ))}
        </div>

        <button type="submit" style={{ ...btnStyle, width: "100%", marginTop: 16 }}>
          Submit Application
        </button>

        {submitted && hasErrors && (
          <p style={{ color: "red", textAlign: "center", marginTop: 8 }}>
            Please fix the errors above before submitting
          </p>
        )}
      </form>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button onClick={() => setView("myApplications")} style={{ ...btnStyle, background: "#6c757d", fontSize: 13 }}>
          View My Applications
        </button>
      </div>
    </div>
  );
}

function ApplicationStatusMessage({ status, rejectionReason, driverAction }) {
  if (driverAction === "accepted") {
    return (
      <div style={{ background: "#d4edda", border: "1px solid #c3e6cb", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#155724" }}>
        You accepted this sponsorship offer. Welcome aboard!
      </div>
    );
  }
  if (driverAction === "rejected") {
    return (
      <div style={{ background: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#721c24" }}>
        You declined this offer. You're free to look for other opportunities.
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div style={{ background: "#fff3cd", border: "1px solid #ffeeba", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#856404" }}>
        Your application is under review.
      </div>
    );
  }
  if (status === "accepted") {
    return (
      <div style={{ background: "#d4edda", border: "1px solid #c3e6cb", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#155724" }}>
        This sponsor has accepted your application! Please respond to their offer below.
      </div>
    );
  }
  if (status === "denied") {
    return (
      <div style={{ background: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#721c24" }}>
        <strong>Application Not Accepted</strong>
        {rejectionReason ? (
          <p style={{ margin: "6px 0 0" }}><strong>Reason:</strong> {rejectionReason}</p>
        ) : (
          <p style={{ margin: "6px 0 0" }}>No reason was provided.</p>
        )}
      </div>
    );
  }
  return null;
}

function FormField({ field, value, error, showError, onChange, onBlur }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", marginBottom: 4, fontWeight: "bold", fontSize: 14 }}>
        {field.label}
        {field.required && <span style={{ color: "red", marginLeft: 2 }}>*</span>}
      </label>
      <input
        type={field.type}
        value={value}
        placeholder={field.placeholder || ""}
        onChange={(e) => onChange(field.id, e.target.value)}
        onBlur={() => onBlur(field.id)}
        style={{
          width: "100%",
          padding: "8px 10px",
          fontSize: 14,
          border: showError ? "1px solid red" : value.trim() && !error ? "1px solid green" : "1px solid #ccc",
          borderRadius: 4,
          boxSizing: "border-box",
        }}
      />
      <span style={{ color: "red", fontSize: 12, minHeight: 18, display: "block" }}>
        {showError ? `${error}` : ""}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: { background: "#fff3cd", color: "#856404" },
    accepted: { background: "#d4edda", color: "#155724" },
    denied: { background: "#f8d7da", color: "#721c24" },
    offer_accepted: { background: "#d4edda", color: "#155724" },
    offer_declined: { background: "#e2e3e5", color: "#383d41" },
  };
  const s = colors[status] || colors.pending;
  const label = {
    pending: "Pending",
    accepted: "Offer Received",
    denied: "Not Accepted",
    offer_accepted: "Offer Accepted",
    offer_declined: "Offer Declined",
  }[status] || status;
  return (
    <span style={{ ...s, padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: "bold" }}>
      {label}
    </span>
  );
}

const btnStyle = {
  padding: "10px 20px",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 15,
};


const sectionTitleStyle = {
  color: "#333",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};
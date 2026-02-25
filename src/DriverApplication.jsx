import { useState } from "react";

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

export default function DriverApplicationForm() {
  const [values, setValues] = useState(
    fields.reduce((acc, f) => ({ ...acc, [f.id]: "" }), {})
  );
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

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

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>

      <h1 style={{ textAlign: "center" }}>Driver Application</h1>
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
    </div>
  );
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
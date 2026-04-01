import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCurrentUser } from 'aws-amplify/auth';
import { useLanguage } from './LanguageContext';

const fieldDefs = [
  { id: "firstName", labelKey: "driverApp.fieldFirstName", type: "text", required: true, placeholder: "John" },
  { id: "lastName", labelKey: "driverApp.fieldLastName", type: "text", required: true, placeholder: "Doe" },
  { id: "email", labelKey: "driverApp.fieldEmail", type: "email", required: true, placeholder: "john@email.com" },
  { id: "phone", labelKey: "driverApp.fieldPhone", type: "tel", required: true, placeholder: "555-123-4567" },
  { id: "licenseNumber", labelKey: "driverApp.fieldLicenseNumber", type: "text", required: true, placeholder: "DL-000000" },
  { id: "licenseState", labelKey: "driverApp.fieldLicenseState", type: "text", required: true, placeholder: "CA" },
  { id: "licenseExpiry", labelKey: "driverApp.fieldLicenseExpiry", type: "date", required: true },
  { id: "sponsorName", labelKey: "driverApp.fieldSponsorName", type: "text", required: true, placeholder: "Name of the company you want to join" },
];

function getError(field, value, t) {
  if (field.required && !value.trim()) {
    return t(field.labelKey) + " " + t('driverApp.errorRequired');
  }

  if (!value.trim()) return null;

  if (field.id === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return t('driverApp.errorEmail');
    }
  }

  if (field.id === "phone") {
    if (!/^\+?[\d\s\-().]{7,}$/.test(value)) {
      return t('driverApp.errorPhone');
    }
  }

  if (field.id === "licenseNumber") {
    if (value.length < 4) return t('driverApp.errorLicenseTooShort');
  }

  if (field.id === "licenseState") {
    if (!/^[A-Za-z]{2}$/.test(value.trim())) {
      return t('driverApp.errorState');
    }
  }

  if (field.id === "licenseExpiry") {
    if (new Date(value) <= new Date()) {
      return t('driverApp.errorExpired');
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
  const { t } = useLanguage();

  const fields = fieldDefs.map(f => ({ ...f, label: t(f.labelKey) }));

  const [values, setValues] = useState(
    fieldDefs.reduce((acc, f) => ({ ...acc, [f.id]: "" }), {})
  );
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const [view, setView] = useState("form");
  const [myApplications, setMyApplications] = useState(mockSubmittedApplications);
  const [driverId, setDriverId] = useState(null);

  useEffect(() => {
    async function getUser() {
      const { userId } = await getCurrentUser();
      const { data: drivers } = await client.models.Driver.list({
        filter: { userId: { eq: userId }}
      });
      const driver = drivers[0];
      setDriverId(driver.driverId);
    }
    getUser();

    async function fetchApplications() {
      const { data } = await client.models.Application.list();
      setMyApplications(data);
    }
    fetchApplications();
  }, []);

  const errors = {};
  for (const f of fieldDefs) {
    errors[f.id] = getError(f, values[f.id] || "", t);
  }

  const hasErrors = Object.values(errors).some((e) => e !== null);

  function handleChange(id, val) {
    setValues({ ...values, [id]: val });
    setTouched({ ...touched, [id]: true });
  }

  function handleBlur(id) {
    setTouched({ ...touched, [id]: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const allTouched = fieldDefs.reduce((acc, f) => ({ ...acc, [f.id]: true }), {});
    setTouched(allTouched);
    setSubmitted(true);

    if (!hasErrors) {
      await client.models.Application.create({
        first: values.firstName,
        last: values.lastName,
        email: values.email,
        phone: values.phone,
        licenseNo: values.licenseNumber,
        state: values.licenseState,
        expDate: values.licenseExpiry,
        driverId: driverId,
        sponsorId: "TBD",
        status: 0,
      });
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
        <h2 style={{ color: "green" }}>{t('driverApp.submittedTitle')}</h2>
        <p>{t('driverApp.submittedMessage')}</p>
        <button
          onClick={() => {
            setDone(false);
            setSubmitted(false);
            setTouched({});
            setValues(fieldDefs.reduce((acc, f) => ({ ...acc, [f.id]: "" }), {}));
          }}
          style={btnStyle}
        >
          {t('driverApp.submitAnother')}
        </button>
      </div>
    );
  }

  if (view === "myApplications") {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => setView("form")} style={{ ...btnStyle, background: "#6c757d", padding: "6px 14px", fontSize: 13 }}>
            {t('driverApp.back')}
          </button>
          <h2 style={{ margin: 0 }}>{t('driverApp.myApplications')}</h2>
        </div>

        {myApplications.map((app) => (
          <div key={app.id} style={{ border: "1px solid #ddd", borderRadius: 4, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <strong>{app.sponsorName}</strong>
              <StatusBadge status={app.driverAction ? (app.driverAction === "accepted" ? "offer_accepted" : "offer_declined") : app.status} t={t} />
            </div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>{t('driverApp.submittedDate')} {app.submittedDate}</div>

            <ApplicationStatusMessage
              status={app.status}
              rejectionReason={app.rejectionReason}
              driverAction={app.driverAction}
              t={t}
            />

            {app.status === "accepted" && app.driverAction === null && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 13, fontWeight: "bold", marginBottom: 8 }}>
                  {t('driverApp.wouldYouAccept')}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleDriverAction(app.id, "accepted")}
                    style={{ ...btnStyle, background: "#28a745", padding: "7px 18px", fontSize: 13 }}
                  >
                    {t('driverApp.acceptOffer')}
                  </button>
                  <button
                    onClick={() => handleDriverAction(app.id, "rejected")}
                    style={{ ...btnStyle, background: "#dc3545", padding: "7px 18px", fontSize: 13 }}
                  >
                    {t('driverApp.declineOffer')}
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

      <h1 style={{ textAlign: "center" }}>{t('driverApp.title')} {appliedSponsor}</h1>
      <p style={{ textAlign: "center", color: "#555" }}>
        {t('driverApp.requiredNote')}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <h3 style={sectionTitleStyle}>{t('driverApp.personalInfo')}</h3>
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

        <h3 style={sectionTitleStyle}>{t('driverApp.licenseInfo')}</h3>
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

        <h3 style={sectionTitleStyle}>{t('driverApp.applicationDetails')}</h3>
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
          {t('driverApp.submitApplication')}
        </button>

        {submitted && hasErrors && (
          <p style={{ color: "red", textAlign: "center", marginTop: 8 }}>
            {t('driverApp.fixErrors')}
          </p>
        )}
      </form>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button onClick={() => setView("myApplications")} style={{ ...btnStyle, background: "#6c757d", fontSize: 13 }}>
          {t('driverApp.viewMyApplications')}
        </button>
      </div>
    </div>
  );
}

function ApplicationStatusMessage({ status, rejectionReason, driverAction, t }) {
  if (driverAction === "accepted") {
    return (
      <div style={{ background: "#d4edda", border: "1px solid #c3e6cb", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#155724" }}>
        {t('driverApp.acceptedAction')}
      </div>
    );
  }
  if (driverAction === "rejected") {
    return (
      <div style={{ background: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#721c24" }}>
        {t('driverApp.rejectedAction')}
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div style={{ background: "#fff3cd", border: "1px solid #ffeeba", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#856404" }}>
        {t('driverApp.pendingStatus')}
      </div>
    );
  }
  if (status === "accepted") {
    return (
      <div style={{ background: "#d4edda", border: "1px solid #c3e6cb", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#155724" }}>
        {t('driverApp.acceptedStatus')}
      </div>
    );
  }
  if (status === "denied") {
    return (
      <div style={{ background: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#721c24" }}>
        <strong>{t('driverApp.deniedStatus')}</strong>
        {rejectionReason ? (
          <p style={{ margin: "6px 0 0" }}><strong>{t('sponsorApp.reason')}</strong> {rejectionReason}</p>
        ) : (
          <p style={{ margin: "6px 0 0" }}>{t('driverApp.noReason')}</p>
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

function StatusBadge({ status, t }) {
  const colors = {
    pending: { background: "#fff3cd", color: "#856404" },
    accepted: { background: "#d4edda", color: "#155724" },
    denied: { background: "#f8d7da", color: "#721c24" },
    offer_accepted: { background: "#d4edda", color: "#155724" },
    offer_declined: { background: "#e2e3e5", color: "#383d41" },
  };
  const s = colors[status] || colors.pending;
  const label = {
    pending: t('driverApp.statusPending'),
    accepted: t('driverApp.statusAccepted'),
    denied: t('driverApp.statusDenied'),
    offer_accepted: t('driverApp.statusOfferAccepted'),
    offer_declined: t('driverApp.statusOfferDeclined'),
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
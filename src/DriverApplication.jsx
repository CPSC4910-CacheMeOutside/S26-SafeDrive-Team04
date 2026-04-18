import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { useLanguage } from './LanguageContext';

const STATUS_MAP = { 0: "pending", 1: "accepted", 2: "denied" };

const fieldDefs = [
  { id: "firstName",    labelKey: "driverApp.fieldFirstName",    type: "text",  required: true,  placeholder: "John" },
  { id: "lastName",     labelKey: "driverApp.fieldLastName",     type: "text",  required: true,  placeholder: "Doe" },
  { id: "email",        labelKey: "driverApp.fieldEmail",        type: "email", required: true,  placeholder: "john@email.com" },
  { id: "phone",        labelKey: "driverApp.fieldPhone",        type: "tel",   required: true,  placeholder: "555-123-4567" },
  { id: "licenseNumber",labelKey: "driverApp.fieldLicenseNumber",type: "text",  required: true,  placeholder: "DL-000000" },
  { id: "licenseState", labelKey: "driverApp.fieldLicenseState", type: "text",  required: true,  placeholder: "CA" },
  { id: "licenseExpiry",labelKey: "driverApp.fieldLicenseExpiry",type: "date",  required: true },
];

function getError(field, value, t) {
  if (field.required && !value.trim()) {
    return t(field.labelKey) + " " + t('driverApp.errorRequired');
  }
  if (!value.trim()) return null;
  if (field.id === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('driverApp.errorEmail');
  }
  if (field.id === "phone") {
    if (!/^\+?[\d\s\-().]{7,}$/.test(value)) return t('driverApp.errorPhone');
  }
  if (field.id === "licenseNumber") {
    if (value.length < 4) return t('driverApp.errorLicenseTooShort');
  }
  if (field.id === "licenseState") {
    if (!/^[A-Za-z]{2}$/.test(value.trim())) return t('driverApp.errorState');
  }
  if (field.id === "licenseExpiry") {
    if (new Date(value) <= new Date()) return t('driverApp.errorExpired');
  }
  return null;
}

export default function DriverApplicationForm() {
  const { appliedSponsor: rawSponsorId } = useParams();
  const sponsorId = rawSponsorId ? decodeURIComponent(rawSponsorId) : "";
  const { t } = useLanguage();

  const fields = fieldDefs.map(f => ({ ...f, label: t(f.labelKey) }));

  const [values, setValues] = useState(
    fieldDefs.reduce((acc, f) => ({ ...acc, [f.id]: "" }), {})
  );
  const [touched, setTouched]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone]           = useState(false);
  const [view, setView]           = useState("form");

  const [sponsorAffiliation, setSponsorAffiliation] = useState("");
  const [sponsorDescription, setSponsorDescription] = useState("");
  const [sponsorLoading, setSponsorLoading]         = useState(true);

  const [myApplications, setMyApplications] = useState([]);
  const [myAppLoading, setMyAppLoading]     = useState(false);
  const [myAppError, setMyAppError]         = useState(null);

  const [submitError, setSubmitError]   = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!sponsorId) {
      setSponsorLoading(false);
      return;
    }
    async function resolveSponsor() {
      try {
        const client = generateClient();
        const result = await client.models.Sponsor.get({ sponsorId });
        setSponsorAffiliation(result?.data?.affiliation || sponsorId);
        setSponsorDescription(result?.data?.description || "");
      } catch (err) {
        console.error("Could not resolve sponsor:", err);
        setSponsorAffiliation(sponsorId);
      } finally {
        setSponsorLoading(false);
      }
    }
    resolveSponsor();
  }, [sponsorId]);

  async function loadMyApplications() {
    setMyAppLoading(true);
    setMyAppError(null);
    try {
      const client = generateClient();
      const currentUser = await getCurrentUser();
      const currentDriverId = currentUser.userId;

      const { data: allApps } = await client.models.Application.list();
      const myApps = (allApps ?? [])
        .filter(a => a.driverId === currentDriverId)
        .map(a => ({
          ...a,
          status: STATUS_MAP[a.status] ?? "pending",
          submittedDate: a.createdAt?.slice(0, 10) ?? "",
          sponsorName: a.sponsorId ?? "",
          denialReason: a.notes ?? "",
          driverAction: a.driverAction ?? null,
        }));

      const client2 = generateClient();
      const resolved = await Promise.all(
        myApps.map(async app => {
          try {
            const sRes = await client2.models.Sponsor.get({ sponsorId: app.sponsorId });
            return { ...app, sponsorName: sRes?.data?.affiliation || app.sponsorId };
          } catch (_) {
            return app;
          }
        })
      );

      setMyApplications(resolved);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setMyAppError("Failed to load your applications. Please try again.");
    } finally {
      setMyAppLoading(false);
    }
  }

  const errors = {};
  for (const f of fieldDefs) {
    errors[f.id] = getError(f, values[f.id] || "", t);
  }
  const hasErrors = Object.values(errors).some(e => e !== null);

  function handleChange(id, val) {
    setValues({ ...values, [id]: val });
    setTouched({ ...touched, [id]: true });
  }

  function handleBlur(id) {
    setTouched({ ...touched, [id]: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    const allTouched = fieldDefs.reduce((acc, f) => ({ ...acc, [f.id]: true }), {});
    setTouched(allTouched);
    setSubmitted(true);

    if (hasErrors) return;

    if (!sponsorId) {
      setSubmitError("No sponsor selected. Please go back and choose a sponsor to apply to.");
      return;
    }

    setIsSubmitting(true);
    try {
      const client = generateClient();

      let currentDriverId = "unlinked";
      try {
        const currentUser = await getCurrentUser();
        currentDriverId = currentUser.userId;
      } catch (authErr) {
        console.warn("Could not get current user:", authErr);
      }

      const payload = {
        appId:     crypto.randomUUID(),
        first:     values.firstName,
        last:      values.lastName,
        email:     values.email,
        phone:     values.phone,
        licenseNo: values.licenseNumber,
        state:     values.licenseState,
        expDate:   values.licenseExpiry,
        driverId:  currentDriverId,
        sponsorId: sponsorId,
        status:    0,
      };

      const result = await client.models.Application.create(payload);
      if (result.errors) {
        console.error("Create errors:", result.errors);
        setSubmitError("Something went wrong submitting your application. Please try again.");
        return;
      }

      setDone(true);
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitError("Something went wrong submitting your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDriverAction(appId, action) {
    try {
      const client = generateClient();
      await client.models.Application.update({ appId, driverAction: action });
      setMyApplications(prev =>
        prev.map(a => (a.appId === appId ? { ...a, driverAction: action } : a))
      );
    } catch (err) {
      console.error("Failed to save driver action:", err);
      alert("Something went wrong. Please try again.");
    }
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
            setSubmitError(null);
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

        {myAppLoading && <p style={{ color: "#555" }}>Loading your applications...</p>}
        {myAppError   && <p style={{ color: "red" }}>{myAppError}</p>}
        {!myAppLoading && !myAppError && myApplications.length === 0 && (
          <p style={{ color: "#999" }}>You haven't submitted any applications yet.</p>
        )}

        {myApplications.map(app => (
          <div key={app.appId} style={{ border: "1px solid #ddd", borderRadius: 4, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <strong style={{ fontSize: 15 }}>{app.sponsorName}</strong>
              <StatusBadge
                status={app.driverAction ? (app.driverAction === "accepted" ? "offer_accepted" : "offer_declined") : app.status}
                t={t}
              />
            </div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>{t('driverApp.submittedDate')} {app.submittedDate}</div>

            <ApplicationStatusMessage
              status={app.status}
              rejectionReason={app.denialReason}
              driverAction={app.driverAction}
              t={t}
            />

            {app.status === "accepted" && app.driverAction === null && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 13, fontWeight: "bold", marginBottom: 8 }}>
                  {t('driverApp.wouldYouAccept')}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleDriverAction(app.appId, "accepted")} style={{ ...btnStyle, background: "#28a745", padding: "7px 18px", fontSize: 13 }}>
                    {t('driverApp.acceptOffer')}
                  </button>
                  <button onClick={() => handleDriverAction(app.appId, "rejected")} style={{ ...btnStyle, background: "#dc3545", padding: "7px 18px", fontSize: 13 }}>
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
      <h1 style={{ textAlign: "center" }}>
        {t('driverApp.title')}{" "}
        {sponsorLoading ? "…" : sponsorAffiliation}
      </h1>

      {!sponsorLoading && sponsorDescription && (
        <div style={{
          background: "#f8f9fa",
          border: "1px solid #e0e0e0",
          borderRadius: 6,
          padding: "14px 18px",
          marginBottom: 20,
          fontSize: 14,
          color: "#444",
          lineHeight: 1.6,
        }}>
          <strong style={{ display: "block", marginBottom: 4, fontSize: 13, textTransform: "uppercase", color: "#888", letterSpacing: "0.05em" }}>
            About this sponsor
          </strong>
          {sponsorDescription}
        </div>
      )}

      <p style={{ textAlign: "center", color: "#555" }}>
        {t('driverApp.requiredNote')}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <h3 style={sectionTitleStyle}>{t('driverApp.personalInfo')}</h3>
        <div style={gridStyle}>
          {fields.slice(0, 4).map(field => (
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
          {fields.slice(4, 7).map(field => (
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

        {submitError && (
          <p style={{ color: "red", textAlign: "center", marginTop: 8 }}>{submitError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || sponsorLoading || !sponsorId}
          style={{ ...btnStyle, width: "100%", marginTop: 16, opacity: (isSubmitting || !sponsorId) ? 0.7 : 1 }}
        >
          {isSubmitting ? "Submitting..." : t('driverApp.submitApplication')}
        </button>

        {submitted && hasErrors && (
          <p style={{ color: "red", textAlign: "center", marginTop: 8 }}>
            {t('driverApp.fixErrors')}
          </p>
        )}
      </form>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button
          onClick={() => { setView("myApplications"); loadMyApplications(); }}
          style={{ ...btnStyle, background: "#6c757d", fontSize: 13 }}
        >
          {t('driverApp.viewMyApplications')}
        </button>
      </div>
    </div>
  );
}

function ApplicationStatusMessage({ status, rejectionReason, driverAction, t }) {
  if (driverAction === "accepted") {
    return <div style={{ background: "#d4edda", border: "1px solid #c3e6cb", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#155724" }}>{t('driverApp.acceptedAction')}</div>;
  }
  if (driverAction === "rejected") {
    return <div style={{ background: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#721c24" }}>{t('driverApp.rejectedAction')}</div>;
  }
  if (status === "pending") {
    return <div style={{ background: "#fff3cd", border: "1px solid #ffeeba", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#856404" }}>{t('driverApp.pendingStatus')}</div>;
  }
  if (status === "accepted") {
    return <div style={{ background: "#d4edda", border: "1px solid #c3e6cb", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#155724" }}>{t('driverApp.acceptedStatus')}</div>;
  }
  if (status === "denied") {
    return (
      <div style={{ background: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#721c24" }}>
        <strong>{t('driverApp.deniedStatus')}</strong>
        {rejectionReason
          ? <p style={{ margin: "6px 0 0" }}><strong>{t('sponsorApp.reason')}</strong> {rejectionReason}</p>
          : <p style={{ margin: "6px 0 0" }}>{t('driverApp.noReason')}</p>
        }
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
        onChange={e => onChange(field.id, e.target.value)}
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
    pending:       { background: "#fff3cd", color: "#856404" },
    accepted:      { background: "#d4edda", color: "#155724" },
    denied:        { background: "#f8d7da", color: "#721c24" },
    offer_accepted:{ background: "#d4edda", color: "#155724" },
    offer_declined:{ background: "#e2e3e5", color: "#383d41" },
  };
  const s = colors[status] || colors.pending;
  const label = {
    pending:        t('driverApp.statusPending'),
    accepted:       t('driverApp.statusAccepted'),
    denied:         t('driverApp.statusDenied'),
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

const sectionTitleStyle = { color: "#333" };

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};
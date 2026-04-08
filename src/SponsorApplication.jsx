import { useState, useMemo } from "react";
import { useLanguage } from './LanguageContext';

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
    denialReason: "",
    driverAction: null,
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
    denialReason: "",
    driverAction: null,
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
    denialReason: "",
    driverAction: null,
  },
  {
    id: 4,
    name: "Beyoncé Knowles",
    email: "bey@gmail.com",
    phone: "444-555-6666",
    licenseNumber: "DL-001122",
    licenseState: "TX",
    licenseExpiry: "2027-06-30",
    sponsorName: "SafeDrive Co.",
    submittedDate: "2026-02-14",
    status: "accepted",
    denialReason: "",
    driverAction: "accepted",
  },
  {
    id: 5,
    name: "Cristiano Ronaldo",
    email: "cr7@gmail.com",
    phone: "777-888-9999",
    licenseNumber: "DL-334455",
    licenseState: "FL",
    licenseExpiry: "2025-12-01",
    sponsorName: "SafeDrive Co.",
    submittedDate: "2026-01-05",
    status: "denied",
    denialReason: "License state not supported.",
    driverAction: null,
  },
];

const PAGE_SIZE_OPTIONS = [3, 5, 10, 25];

export default function SponsorApplicationsPage() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState(mockApplications);
  const [filterDate, setFilterDate] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [denyTargetId, setDenyTargetId] = useState(null);
  const [denialReasonDraft, setDenialReasonDraft] = useState("");

  function handleAccept(id) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "accepted" } : a))
    );
    if (selectedApp?.id === id) setSelectedApp((a) => ({ ...a, status: "accepted" }));
  }

  function openDenyModal(id) {
    setDenyTargetId(id);
    setDenialReasonDraft("");
  }

  function confirmDeny() {
    setApplications((prev) =>
      prev.map((a) => (a.id === denyTargetId ? { ...a, status: "denied", denialReason: denialReasonDraft } : a))
    );
    if (selectedApp?.id === denyTargetId) setSelectedApp((a) => ({ ...a, status: "denied", denialReason: denialReasonDraft }));
    setDenyTargetId(null);
    setDenialReasonDraft("");
  }

  function handleDeleteSelected() {
    setApplications((prev) => prev.filter((a) => !selectedIds.has(a.id)));
    if (selectedApp && selectedIds.has(selectedApp.id)) setSelectedApp(null);
    setSelectedIds(new Set());
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleSelectAll(visibleIds) {
    const allSelected = visibleIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const n = new Set(prev);
      visibleIds.forEach((id) => allSelected ? n.delete(id) : n.add(id));
      return n;
    });
  }

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const dateMatch = filterDate ? a.submittedDate >= filterDate : true;
      const statusMatch = statusFilter === "all" ? true
        : statusFilter === "completed" ? (a.driverAction === "accepted" || a.driverAction === "rejected")
        : a.status === statusFilter;
      const searchMatch = searchQuery.trim()
        ? a.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
        : true;
      return dateMatch && statusMatch && searchMatch;
    });
  }, [applications, filterDate, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleIds = paginated.map((a) => a.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  function goToPage(p) {
    setCurrentPage(Math.max(1, Math.min(totalPages, p)));
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 4 }}>{t('sponsorApp.title')}</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>{t('sponsorApp.subtitle')}</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>

        <div>
          <label style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 4 }}>
            {t('sponsorApp.searchByName')}
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder={t('sponsorApp.searchPlaceholder')}
            style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 4 }}>
            {t('sponsorApp.filterByDate')}
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
            style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 4 }}>
            {t('sponsorApp.status')}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }}
          >
            <option value="all">{t('sponsorApp.statusAll')}</option>
            <option value="pending">{t('sponsorApp.statusPending')}</option>
            <option value="accepted">{t('sponsorApp.statusAccepted')}</option>
            <option value="denied">{t('sponsorApp.statusDenied')}</option>
            <option value="completed">{t('sponsorApp.statusCompleted')}</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 4 }}>
            {t('sponsorApp.perPage')}
          </label>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {filterDate && (
          <button
            onClick={() => setFilterDate("")}
            style={{ marginTop: 18, padding: "6px 12px", background: "#eee", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
          >
            {t('sponsorApp.clearFilter')}
          </button>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 4, padding: "10px 16px", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: "bold" }}>{selectedIds.size} {t('sponsorApp.selected')}</span>
          <button onClick={handleDeleteSelected} style={{ ...btnBase, background: "#dc3545", color: "#fff" }}>
            {t('sponsorApp.deleteSelected')}
          </button>
          <button onClick={() => setSelectedIds(new Set())} style={{ ...btnBase, background: "#6c757d", color: "#fff" }}>
            {t('sponsorApp.deselectAll')}
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {paginated.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={() => toggleSelectAll(visibleIds)}
                style={{ cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "#555" }}>{t('sponsorApp.selectAllOnPage')}</span>
            </div>
          )}

          {paginated.length === 0 && (
            <p style={{ color: "#999" }}>{t('sponsorApp.noApplications')}</p>
          )}

          {paginated.map((app) => (
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
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(app.id)}
                onChange={(e) => { e.stopPropagation(); toggleSelect(app.id); }}
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: "pointer", marginTop: 2, flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 15 }}>{app.name}</strong>
                  <StatusBadge status={app.status} />
                </div>
                <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>{app.email}</div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  {t('sponsorApp.submitted')} {app.submittedDate}
                </div>

                {app.status === "denied" && app.denialReason && (
                  <div style={{ fontSize: 12, color: "#721c24", background: "#f8d7da", padding: "4px 8px", borderRadius: 4, marginTop: 6 }}>
                    {t('sponsorApp.reason')} {app.denialReason}
                  </div>
                )}

                {app.status === "pending" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAccept(app.id); }}
                      style={{ ...btnBase, background: "#28a745", color: "#fff" }}
                    >
                      {t('sponsorApp.accept')}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openDenyModal(app.id); }}
                      style={{ ...btnBase, background: "#dc3545", color: "#fff" }}
                    >
                      {t('sponsorApp.deny')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 16 }}>
              <button onClick={() => goToPage(safePage - 1)} disabled={safePage === 1} style={pageBtnStyle(safePage === 1)}>{t('sponsorApp.prev')}</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => goToPage(p)} style={pageBtnStyle(false, p === safePage)}>{p}</button>
              ))}
              <button onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages} style={pageBtnStyle(safePage === totalPages)}>{t('sponsorApp.next')}</button>
            </div>
          )}
          <div style={{ textAlign: "center", color: "#999", fontSize: 12, marginTop: 6 }}>
            {t('sponsorApp.page')} {safePage} {t('sponsorApp.of')} {totalPages} — {filtered.length} {filtered.length !== 1 ? t('sponsorApp.results') : t('sponsorApp.result')}
          </div>
        </div>

        <div style={{ width: 320, flexShrink: 0 }}>
          {selectedApp ? (
            <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: 20, position: "sticky", top: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>{selectedApp.name}</h3>
                <StatusBadge status={selectedApp.status} />
              </div>

              <DetailRow label={t('sponsorApp.email')} value={selectedApp.email} />
              <DetailRow label={t('sponsorApp.phone')} value={selectedApp.phone} />
              <DetailRow label={t('sponsorApp.licenseNum')} value={selectedApp.licenseNumber} />
              <DetailRow label={t('sponsorApp.licenseState')} value={selectedApp.licenseState} />
              <DetailRow label={t('sponsorApp.licenseExpiry')} value={selectedApp.licenseExpiry} />
              <DetailRow label={t('sponsorApp.applyingTo')} value={selectedApp.sponsorName} />
              <DetailRow label={t('sponsorApp.submittedLabel')} value={selectedApp.submittedDate} />

              {selectedApp.status === "denied" && selectedApp.denialReason && (
                <div style={{ background: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: 4, padding: "8px 12px", fontSize: 13, color: "#721c24", marginTop: 8 }}>
                  <strong>{t('sponsorApp.denialReason')}:</strong> {selectedApp.denialReason}
                </div>
              )}

              {selectedApp.driverAction && (
                <div style={{ background: selectedApp.driverAction === "accepted" ? "#d4edda" : "#e2e3e5", border: "1px solid #c3e6cb", borderRadius: 4, padding: "8px 12px", fontSize: 13, color: selectedApp.driverAction === "accepted" ? "#155724" : "#383d41", marginTop: 8 }}>
                  <strong>{t('sponsorApp.driverResponse')}:</strong> {selectedApp.driverAction === "accepted" ? t('sponsorApp.acceptedOffer') : t('sponsorApp.declinedOffer')}
                </div>
              )}

              {selectedApp.status === "pending" && (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => handleAccept(selectedApp.id)}
                    style={{ ...btnBase, flex: 1, background: "#28a745", color: "#fff" }}
                  >
                    {t('sponsorApp.accept')}
                  </button>
                  <button
                    onClick={() => openDenyModal(selectedApp.id)}
                    style={{ ...btnBase, flex: 1, background: "#dc3545", color: "#fff" }}
                  >
                    {t('sponsorApp.deny')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ border: "1px dashed #ccc", borderRadius: 6, padding: 20, color: "#999", textAlign: "center" }}>
              {t('sponsorApp.selectAppToView')}
            </div>
          )}
        </div>
      </div>

      {denyTargetId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 6, padding: 28, maxWidth: 420, width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            <h3 style={{ marginTop: 0, color: "#dc3545" }}>{t('sponsorApp.denyApplication')}</h3>
            <p style={{ fontSize: 14, color: "#555" }}>
              {t('sponsorApp.denyMessage')}
            </p>
            <textarea
              value={denialReasonDraft}
              onChange={(e) => setDenialReasonDraft(e.target.value)}
              placeholder={t('sponsorApp.denyPlaceholder')}
              rows={3}
              style={{ width: "100%", padding: 10, fontSize: 14, border: "1px solid #ccc", borderRadius: 4, boxSizing: "border-box", resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={confirmDeny} style={{ ...btnBase, flex: 1, background: "#dc3545", color: "#fff" }}>
                {t('sponsorApp.confirmDeny')}
              </button>
              <button onClick={() => setDenyTargetId(null)} style={{ ...btnBase, flex: 1, background: "#6c757d", color: "#fff" }}>
                {t('sponsorApp.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
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

function pageBtnStyle(disabled, active = false) {
  return {
    padding: "5px 10px",
    border: "1px solid #ccc",
    borderRadius: 4,
    cursor: disabled ? "not-allowed" : "pointer",
    background: active ? "#007bff" : disabled ? "#f8f9fa" : "#fff",
    color: active ? "#fff" : disabled ? "#aaa" : "#333",
    fontSize: 13,
    fontWeight: active ? "bold" : "normal",
  };
}
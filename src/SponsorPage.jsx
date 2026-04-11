import { useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "./LanguageContext";
import useAmplifyAuth from "./UseAmplifyAuth";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

const client = generateClient();

function SponsorPage() {
  const navigate = useNavigate();
  const auth = useAmplifyAuth();
  const { t } = useLanguage();

  const [relations, setRelations] = useState([]);
  const [selectedDriverSponsorId, setSelectedDriverSponsorId] = useState("");
  const [amount, setAmount] = useState(10);
  const [sortMode, setSortMode] = useState("name");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // find the logged in sponsor
  const sponsorUserId =
    auth?.profile?.sub ||
    auth?.profile?.username ||
    auth?.profile?.email ||
    "";

  useEffect(() => {
    loadData();
  }, [sponsorUserId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setPageError("");

      if (!sponsorUserId) {
        setRelations([]);
        setSelectedDriverSponsorId("");
        return;
      }

      // Pull all DriverSponsor rows for this sponsor
      const dsResult = await client.models.DriverSponsor.list({
        filter: { sponsorId: { eq: sponsorUserId } },
      });

      if (dsResult.errors) {
        console.error("DriverSponsor load error:", dsResult.errors);
        setPageError("Failed to load sponsor-driver relationships.");
        return;
      }

      const relationRows = dsResult.data || [];

      const loadedRelations = relationRows.map((rel) => ({
        driverSponsorId: rel.driverSponsorId ?? `${rel.driverId}-${rel.sponsorId}`,
        sponsorId: rel.sponsorId,
        driverId: rel.driverId,
        points: rel.points ?? 0,
        note: rel.note ?? "",
        driverName: rel.driverId,
        driverEmail: "",
        raw: rel,
      }));

      setRelations(loadedRelations);

      setSelectedDriverSponsorId((prev) => {
        if (prev && loadedRelations.some((r) => r.driverSponsorId === prev)) return prev;
        return loadedRelations[0]?.driverSponsorId ?? "";
      });
    } catch (err) {
      console.error("ERROR LOADING SPONSOR PAGE:", err);
      setPageError("Something went wrong while loading sponsor data.");
    } finally {
      setLoading(false);
    }
  };

  const selectedRelation = useMemo(
    () => relations.find((r) => r.driverSponsorId === selectedDriverSponsorId) ?? null,
    [relations, selectedDriverSponsorId]
  );

  const sortedRelations = useMemo(() => {
    const copy = [...relations];

    copy.sort((a, b) => {
      if (sortMode === "points") return b.points - a.points;
      if (sortMode === "name") return a.driverName.localeCompare(b.driverName);
      return 0;
    });

    return copy;
  }, [relations, sortMode]);

  const filteredRelations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedRelations;

    return sortedRelations.filter((r) => {
      return (
        r.driverName.toLowerCase().includes(q) ||
        r.driverEmail.toLowerCase().includes(q) ||
        String(r.driverId).toLowerCase().includes(q)
      );
    });
  }, [sortedRelations, search]);

  const pointAdjust = async (deltaValue) => {
    if (!selectedRelation) return;

    const delta = Number(deltaValue);
    if (!Number.isFinite(delta)) return;

    const newPoints = (selectedRelation.points ?? 0) + delta;
    if (newPoints < 0) {
      alert(t("sponsor.cannotGoNegative"));
      return;
    }

    try {
      const updatePayload = {
        driverSponsorId: selectedRelation.raw.driverSponsorId,
        points: newPoints,
        note: description.trim() || selectedRelation.raw.note || "",
      };

      const updateResult = await client.models.DriverSponsor.update(updatePayload);

      if (updateResult.errors) {
        console.error("DriverSponsor update error:", updateResult.errors);
        alert(t("sponsor.updateFailed"));
        return;
      }

      setDescription("");
      await loadData();
    } catch (err) {
      console.error("POINT ADJUST ERROR:", err);
      alert(t("sponsor.somethingWentWrong"));
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <h3>{t("sponsor.loading")}</h3>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
        <h1>
          <strong>{t("sponsor.title")}</strong>
        </h1>

        {pageError && <div className="alert alert-danger">{pageError}</div>}

        <Tabs defaultActiveKey="manage" className="mb-4">
          <Tab eventKey="manage" title={t("sponsor.manageDrivers")}>
            <Row>
              <Col md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title>{t("sponsor.drivers")}</Card.Title>

                    <div className="mb-3 d-flex gap-2">
                      <Button
                        size="sm"
                        variant={sortMode === "name" ? "primary" : "outline-primary"}
                        onClick={() => setSortMode("name")}
                      >
                        Sort by Name
                      </Button>

                      <Button
                        size="sm"
                        variant={sortMode === "points" ? "primary" : "outline-primary"}
                        onClick={() => setSortMode("points")}
                      >
                        {t("sponsor.sortByPoints")}
                      </Button>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder={t("sponsor.searchDriversPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </Form.Group>

                    {!filteredRelations.length ? (
                      <div className="text-muted">No assigned drivers found.</div>
                    ) : (
                      <ListGroup>
                        {filteredRelations.map((rel) => (
                          <ListGroup.Item
                            key={rel.driverSponsorId}
                            action
                            active={rel.driverSponsorId === selectedDriverSponsorId}
                            onClick={() => setSelectedDriverSponsorId(rel.driverSponsorId)}
                          >
                            <div className="d-flex justify-content-between">
                              <div>
                                <div className="fw-semibold">{rel.driverName}</div>
                                <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                  {rel.driverEmail || rel.driverId}
                                </div>
                              </div>
                              <span className="text-muted">{rel.points}</span>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={8}>
                <Card>
                  <Card.Body>
                    <Card.Title>{t("sponsor.adjustPoints")}</Card.Title>

                    {!selectedRelation ? (
                      <div className="text-muted">{t("sponsor.noDriverSelected")}</div>
                    ) : (
                      <>
                        <p>
                          {t("sponsor.driverLabel")}: <strong>{selectedRelation.driverName}</strong>
                          <br />
                          {t("sponsor.currentPoints")}: <strong>{selectedRelation.points}</strong>
                        </p>

                        <Form.Group className="mb-3">
                          <Form.Label>{t("sponsor.amount")}</Form.Label>
                          <Form.Control
                            type="number"
                            value={amount}
                            min={1}
                            onChange={(e) => setAmount(Number(e.target.value))}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>{t("sponsor.reasonForAdjustment")}</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("sponsor.descriptionPlaceholder")}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </Form.Group>

                        <div className="d-flex gap-2">
                          <Button variant="success" onClick={() => pointAdjust(amount)}>
                            {t("sponsor.addPoints")}
                          </Button>
                          <Button variant="danger" onClick={() => pointAdjust(-amount)}>
                            {t("sponsor.subtractPoints")}
                          </Button>
                        </div>
                      </>
                    )}
                  </Card.Body>
                </Card>

                <Card className="mt-4">
                  <Card.Body>
                    <Card.Title>Driver Account</Card.Title>
                    {!selectedRelation ? (
                      <div className="text-muted">Select a driver to view details.</div>
                    ) : (
                      <>
                        <p className="mb-3">
                          Selected driver: <strong>{selectedRelation.driverName}</strong>
                        </p>
                        <Button
                          variant="secondary"
                          onClick={() => navigate(`/admin/drivers/${selectedRelation.driverId}/edit`)}
                        >
                          Manage Account
                        </Button>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="settings" title={t("sponsor.settings")}>
            <Card>
              <Card.Body>{t("sponsor.settingsComingSoon")}</Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
}

export default SponsorPage;
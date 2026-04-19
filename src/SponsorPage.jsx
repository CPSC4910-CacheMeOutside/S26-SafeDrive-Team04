import { useNavigate } from "react-router-dom";
import useAmplifyAuth from "./UseAmplifyAuth";
import { fetchUserAttributes, updateUserAttributes, fetchAuthSession } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "./LanguageContext";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { get } from "aws-amplify/api";

import { sendNotification } from "./notification-api";
import { fetchCurrentSponsorAssignments } from "./sponsorPage-api";

const client = generateClient();

function SponsorPage({
  setProfilePic,
  adminView = false,
  targetSponsorId = null,
}) {
  const auth = useAmplifyAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    authName: "",
    authNickname: "",
    authPhoneNum: "",
    authEmail: "",
  });

  const [authRole, setAuthRole] = useState([]);
  const [relations, setRelations] = useState([]);
  const [selectedDriverSponsorId, setSelectedDriverSponsorId] = useState("");
  const [amount, setAmount] = useState(10);
  const [sortMode, setSortMode] = useState("name");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const [sponsor, setSponsor] = useState({
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    groups: [],
    points: 0,
    sponsors: [],
    applications: [],
    drivers: [],
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (auth.isLoading) return;
      if (!auth.isAuthenticated) return;
      if (adminView && !targetSponsorId) return;

      if (!adminView) {
        try {
          const attrs = await fetchUserAttributes();

          setFormData({
            authName: attrs.name || "",
            authNickname: attrs.nickname || "",
            authPhoneNum: attrs.phone_number || "",
            authEmail: attrs.email || "",
          });

          setAuthRole(auth.groups || []);

          if (attrs.picture && setProfilePic) {
            setProfilePic(attrs.picture);
          }
        } catch (error) {
          console.error("Failed to load sponsor profile:", error);
          setPageError("Failed to load sponsor profile.");
        }

        return;
      }

      try {
        setLoading(true);
        setPageError("");

        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        if (!idToken) {
          throw new Error("Missing id token");
        }

        const restOperation = get({
          apiName: "SafeDriveAPI",
          path: `/admin/sponsors/${encodeURIComponent(targetSponsorId)}`,
          options: {
            headers: {
              Authorization: idToken,
            },
          },
        });

        const response = await restOperation.response;
        const data = await response.body.json();

        setFormData({
          authName: data.name || "",
          authNickname: data.nickname || "",
          authPhoneNum: data.phone_number || "",
          authEmail: data.email || "",
        });

        setAuthRole(data.groups || ["Sponsor"]);

        if (data.picture && setProfilePic) {
          setProfilePic(data.picture);
        }
      } catch (error) {
        console.error("Failed to load admin sponsor profile:", error);
        setPageError("Failed to load sponsor profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [
    auth.isLoading,
    auth.isAuthenticated,
    auth.profile,
    auth.groups,
    adminView,
    targetSponsorId,
    setProfilePic,
  ]);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setPageError("");

        let assignmentData = null;
        let resolvedGroups = [];

        if (!adminView) {
          const attrs = await fetchUserAttributes();

          setFormData({
            authName: attrs.name || "",
            authNickname: attrs.nickname || "",
            authPhoneNum: attrs.phone_number || "",
            authEmail: attrs.email || "",
          });

          assignmentData = await fetchCurrentSponsorAssignments();

          const session = await fetchAuthSession();
          const idPayload = session.tokens?.idToken?.payload ?? {};
          const accessPayload = session.tokens?.accessToken?.payload ?? {};

          resolvedGroups =
            idPayload["cognito:groups"] ||
            accessPayload["cognito:groups"] ||
            [];
        } else {
          if (!targetSponsorId) return;

          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken?.toString();

          if (!idToken) {
            throw new Error("Missing id token");
          }

          const restOperation = get({
            apiName: "SafeDriveAPI",
            path: `/admin/sponsors/${encodeURIComponent(targetSponsorId)}/dashboard`,
            options: {
              headers: {
                Authorization: idToken,
              },
            },
          });

          const response = await restOperation.response;
          assignmentData = await response.body.json();
          resolvedGroups = assignmentData.groups || ["Sponsor"];
        }

        const drivers = Array.isArray(assignmentData?.drivers)
          ? assignmentData.drivers
          : [];

        setRelations(drivers);

        if (drivers.length > 0) {
          setSelectedDriverSponsorId(drivers[0].driverSponsorId);
        } else {
          setSelectedDriverSponsorId("");
        }

        setSponsor((prev) => ({
          ...prev,
          username: assignmentData?.sponsorId || "",
          fullName: assignmentData?.fullName || "",
          email: assignmentData?.email || "",
          phoneNumber: assignmentData?.phoneNumber || "",
          groups: Array.isArray(resolvedGroups) ? resolvedGroups : [],
          points: assignmentData?.totalPoints || 0,
          drivers,
        }));
      } catch (error) {
        console.error("Failed to load sponsor page data:", error);
        setPageError("Failed to load sponsor page data.");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [adminView, targetSponsorId]);

  const getDriverLabel = (rel) => {
    return (
      rel.driverNickname ||
      rel.driverName ||
      rel.driverEmail ||
      rel.driverId
    );
  };

  const filteredRelations = useMemo(() => {
    let list = [...relations];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        getDriverLabel(r).toLowerCase().includes(q)
      );
    }

    if (sortMode === "points") {
      list.sort((a, b) => (b.points || 0) - (a.points || 0));
    } else {
      list.sort((a, b) =>
        getDriverLabel(a).localeCompare(getDriverLabel(b))
      );
    }

    return list;
  }, [relations, search, sortMode]);

  const selectedRelation = useMemo(() => {
    return relations.find(
      (r) => r.driverSponsorId === selectedDriverSponsorId
    );
  }, [relations, selectedDriverSponsorId]);

  const pointAdjust = async (delta) => {
    if (!selectedRelation) return;

    try {
      const currentPoints = selectedRelation.points || 0;
      const changeAmount = Math.abs(delta);
      const newPoints = Math.max(0, currentPoints + delta);
      const action = delta > 0 ? "ADD" : "SUB";
      const reason = description.trim() || "No reason provided";

      await client.models.DriverSponsor.update({
        driverId: selectedRelation.driverId,
        sponsorId: selectedRelation.sponsorId,
        points: newPoints,
      });

      await sendNotification({
        senderId: selectedRelation.sponsorId,
        recipientId: selectedRelation.driverId,
        content: `POINTS:${action}:${changeAmount}:${newPoints}:${reason}`,
      });

      setRelations((prev) =>
        prev.map((r) =>
          r.driverSponsorId === selectedRelation.driverSponsorId
            ? { ...r, points: newPoints }
            : r
        )
      );

      setDescription("");
    } catch (err) {
      console.error("Failed to update points:", err);
      setPageError("Failed to update points.");
    }
  };

  const handleViewDriverDashboard = () => {
    if (!selectedRelation) return;

    const sponsorDriverViewSession = {
      driverId: selectedRelation.driverId,
      driverSponsorId: selectedRelation.driverSponsorId,
      driverName: selectedRelation.driverName || selectedRelation.driverNickname || "",
      driverEmail: selectedRelation.driverEmail || "",
      driverPhone: selectedRelation.driverPhone || "",
      sponsorId: selectedRelation.sponsorId,
      sponsorName: sponsor.fullName || sponsor.username || "",
      createdAt: Date.now(),
      viewerRole: "Sponsor",
    };

    localStorage.setItem(
      "sponsorDriverViewSession",
      JSON.stringify(sponsorDriverViewSession)
    );

    navigate("/DriverPage?sponsorView=1");
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
                            onClick={() =>
                              setSelectedDriverSponsorId(rel.driverSponsorId)
                            }
                          >
                            <div className="d-flex justify-content-between">
                              <div>
                                <div className="fw-semibold">
                                  {getDriverLabel(rel)}
                                </div>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "0.9rem" }}
                                >
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
                      <div className="text-muted">
                        {t("sponsor.noDriverSelected")}
                      </div>
                    ) : (
                      <>
                        <p>
                          {t("sponsor.driverLabel")}:{" "}
                          <strong>{getDriverLabel(selectedRelation)}</strong>
                          <br />
                          {t("sponsor.currentPoints")}:{" "}
                          <strong>{selectedRelation.points}</strong>
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

                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="success"
                            onClick={() => pointAdjust(amount)}
                          >
                            {t("sponsor.addPoints")}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => pointAdjust(-amount)}
                          >
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
                      <div className="text-muted">
                        Select a driver to view details.
                      </div>
                    ) : (
                      <>
                        <p className="mb-3">
                          Selected driver:{" "}
                          <strong>{getDriverLabel(selectedRelation)}</strong>
                        </p>

                        <div className="d-flex justify-content-center">
                          <Button
                            variant="primary"
                            onClick={handleViewDriverDashboard}
                          >
                            View Driver Dashboard
                          </Button>

                          {adminView ? (
                            <Button
                              variant="secondary"
                              onClick={() =>
                                navigate(`/admin/drivers/${selectedRelation.driverId}/edit`)
                              }
                            >
                              Manage Account
                            </Button>
                          ) : null}
                        </div>
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
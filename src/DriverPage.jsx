import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { useLanguage } from "./LanguageContext";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import { fetchCurrentDriverAssignments } from "./driverPage-api";
import { fetchNotificationsForUser } from "./notification-api";
import { getCurrentDriverView, stopDriverView } from "./adminDriverView-api";
import { useNotifications } from "./NotificationContext";
import { useNavigate, useLocation } from "react-router-dom";

const client = generateClient();

function DriverPage() {
  const { addNotification, notifications, closeNotification } = useNotifications();
  const activeNotifications = notifications.filter((n) => !n.closed);

  const navigate = useNavigate();
  const location = useLocation();

  const [adminView, setAdminView] = useState(false);
  const [sponsorView, setSponsorView] = useState(false);
  const [viewedDriver, setViewedDriver] = useState(null);

  const { t } = useLanguage();
  const [driver, setDriver] = useState({
    id: "",
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    groups: [],
    points: 0,
    sponsors: [],
    applications: [],
  });
  const [sponsorsLoading, setSponsorsLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      const queryParams = new URLSearchParams(location.search);
      const isSponsorView = queryParams.get("sponsorView") === "1";

      const rawAdminSession = localStorage.getItem("driverViewSession");
      const rawSponsorSession = localStorage.getItem("sponsorDriverViewSession");

      // 1. Admin driver-view session takes priority
      if (rawAdminSession) {
        const stored = JSON.parse(rawAdminSession);

        try {
          const sessionData = await getCurrentDriverView(stored.sessionId);
          const driverId = sessionData.driverUsername;

          const driverResult = await client.models.Driver.get({ driverId });

          const relationshipResult = await client.models.DriverSponsor.list({
            filter: { driverId: { eq: driverId } },
          });

          const relationships = Array.isArray(relationshipResult?.data)
            ? relationshipResult.data
            : [];

          const sponsors = await Promise.all(
            relationships.map(async (rel) => {
              let sponsorName = rel.sponsorId;

              try {
                const sponsorResult = await client.models.Sponsor.get({
                  sponsorId: rel.sponsorId,
                });

                sponsorName =
                  sponsorResult?.data?.affiliation ||
                  sponsorResult?.data?.name ||
                  rel.sponsorId;
              } catch (error) {
                console.error("Failed to load sponsor", rel.sponsorId, error);
              }

              return {
                id: rel.sponsorId,
                name: sponsorName,
                points: rel.points ?? 0,
                status: "active",
              };
            })
          );

          setAdminView(true);
          setSponsorView(false);
          setViewedDriver({
            driverSub: sessionData.driverUsername,
            driverName: stored.driverName || sessionData.driverName || "",
            viewerRole: "Admin",
          });

          setDriver({
            username: driverId || "",
            fullName:
              driverResult?.data?.fullName ||
              stored.driverName ||
              sessionData.driverName ||
              "",
            email: stored.driverEmail || driverResult?.data?.email || "",
            phoneNumber:
              stored.driverPhone || driverResult?.data?.phoneNumber || "",
            groups: ["Driver"],
            points: driverResult?.data?.points ?? 0,
            sponsors,
            applications: [],
          });

          return;
        } catch (error) {
          console.error("Admin driver view failed:", error);
          setAdminView(true);
          setSponsorView(false);
          setViewedDriver({
            driverSub: stored.driverUsername,
            driverName: stored.driverName || "",
            viewerRole: "Admin",
          });
          return;
        }
      }

      // 2. Sponsor driver-view session
      if (isSponsorView && rawSponsorSession) {
        const stored = JSON.parse(rawSponsorSession);

        try {
          const driverId = stored.driverId;

          const driverResult = await client.models.Driver.get({ driverId });

          const relationshipResult = await client.models.DriverSponsor.list({
            filter: { driverId: { eq: driverId } },
          });

          const relationships = Array.isArray(relationshipResult?.data)
            ? relationshipResult.data
            : [];

          const sponsors = await Promise.all(
            relationships.map(async (rel) => {
              let sponsorName = rel.sponsorId;

              try {
                const sponsorResult = await client.models.Sponsor.get({
                  sponsorId: rel.sponsorId,
                });

                sponsorName =
                  sponsorResult?.data?.affiliation ||
                  sponsorResult?.data?.name ||
                  rel.sponsorId;
              } catch (error) {
                console.error("Failed to load sponsor", rel.sponsorId, error);
              }

              return {
                id: rel.sponsorId,
                name: sponsorName,
                points: rel.points ?? 0,
                status: "active",
              };
            })
          );

          const fullName =
            driverResult?.data?.fullName ||
            stored.driverName ||
            stored.driverEmail ||
            driverId;

          setAdminView(false);
          setSponsorView(true);
          setViewedDriver({
            driverSub: driverId,
            driverName: fullName,
            sponsorName: stored.sponsorName || "",
            viewerRole: "Sponsor",
          });

          setDriver({
            username: driverId || "",
            fullName,
            email: stored.driverEmail || driverResult?.data?.email || "",
            phoneNumber:
              stored.driverPhone || driverResult?.data?.phoneNumber || "",
            groups: ["Driver"],
            points: driverResult?.data?.points ?? 0,
            sponsors,
            applications: [],
          });

          return;
        } catch (error) {
          console.error("Sponsor driver view failed:", error);
          setSponsorView(true);
          setAdminView(false);
          setViewedDriver({
            driverSub: stored.driverId,
            driverName: stored.driverName || "",
            sponsorName: stored.sponsorName || "",
            viewerRole: "Sponsor",
          });
          return;
        }
      }

      // 3. Normal logged-in driver view
      try {
        const [session, assignmentData, attributes] = await Promise.all([
          fetchAuthSession(),
          fetchCurrentDriverAssignments(),
          fetchUserAttributes(),
        ]);

        const idPayload = session.tokens?.idToken?.payload ?? {};
        const accessPayload = session.tokens?.accessToken?.payload ?? {};

        const fullName =
          attributes.name ||
          [attributes.given_name, attributes.family_name].filter(Boolean).join(" ") ||
          "";

        const groups =
          idPayload["cognito:groups"] ||
          accessPayload["cognito:groups"] ||
          [];

        const backendNotifications = await fetchNotificationsForUser(
          assignmentData.driverId
        );

        backendNotifications.forEach((n) => {
          addNotification({
            id: n.nId,
            description: n.content,
            timestamp: Date.now(),
          });
        });

        setAdminView(false);
        setSponsorView(false);
        setViewedDriver(null);

        const driverId = assignmentData.driverId;

        setDriver({
          username: driverId || "",
          fullName: assignmentData.fullName || fullName || "",
          email: assignmentData.email || attributes.email || "",
          phoneNumber: assignmentData.phoneNumber || attributes.phone_number || "",
          groups: Array.isArray(groups) ? groups : [],
          points: assignmentData.totalPoints || 0,
          sponsors: Array.isArray(assignmentData.sponsors)
            ? assignmentData.sponsors
            : [],
          applications: [],
        });

        setAppsLoading(true);
        try {
          const appsResult = await client.models.Application.list({
            filter: { driverId: { eq: driverId } }
          });
          const appRows = appsResult.data ?? [];

          const STATUS_MAP = { 0: "pending", 1: "accepted", 2: "denied" };

          const appList = await Promise.all(
            appRows.map(async (app) => {
              let sponsorName = app.sponsorId;
              try {
                const sponsorResult = await client.models.Sponsor.get({ sponsorId: app.sponsorId });
                sponsorName =
                  sponsorResult?.data?.affiliation ||
                  sponsorResult?.data?.name ||
                  app.sponsorId;
              } catch (_) {}
              return {
                id: app.appId,
                sponsorId: app.sponsorId,
                sponsorName,
                status: STATUS_MAP[app.status] ?? "pending",
                submittedAt: app.createdAt?.slice(0, 10) ?? ""
              };
            })
          );

          setDriver((prev) => ({ ...prev, applications: appList }));
        } catch (err) {
          console.error("Failed to load applications:", err);
        } finally {
          setAppsLoading(false);
        }

      } catch (error) {
        console.error("Failed to load driver page:", error);
      }
    }

    loadPage();
  }, [location.search, addNotification]);

  const applicationsByStatus = useMemo(() => {
    return {
      pending:  driver.applications.filter((app) => app.status === "pending"),
      accepted: driver.applications.filter((app) => app.status === "accepted"),
    };
  }, [driver.applications]);

  const getBadgeVariant = (status) => {
    switch (status) {
      case "active":
      case "accepted":
        return "success";
      case "pending":
        return "warning";
      case "denied":
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  function parseNotification(content) {
    if (!content) return "";

    const parts = content.split(":");

    if (parts[0] === "POINTS") {
      const action = parts[1];
      const amount = parts[2];
      const total = parts[3];
      const reason = parts.slice(4).join(":");

      return action === "ADD"
        ? `+${amount} points added. New total: ${total}. Reason: ${reason}`
        : `-${amount} points deducted. New total: ${total}. Reason: ${reason}`;
    }

    if (parts[0] === "MESSAGE") {
      return parts.slice(1).join(":");
    }

    return content;
  }

  const handleExitDriverView = async () => {
    try {
      const raw = localStorage.getItem("driverViewSession");
      if (raw) {
        const stored = JSON.parse(raw);
        await stopDriverView(stored.sessionId);
      }
    } catch (error) {
      console.error("Failed to stop driver view", error);
    }

    localStorage.removeItem("driverViewSession");
    navigate("/AdminPage");
  };

  const handleExitSponsorDriverView = () => {
    localStorage.removeItem("sponsorDriverViewSession");
    navigate("/SponsorPage");
  };

  return (
    <Container className="mt-4">
      <div style={{ minHeight: "100vh", padding: "40px" }}>
        <h1><strong>{t('driver.dashboard')}</strong></h1>

        <Row className="mb-4">
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>{t('driver.myProfile')}</Card.Title>
                <p className="mb-2"><strong>{t('driver.name')}</strong> {driver.fullName || t('driver.unknownUser')}</p>
                <p className="mb-2"><strong>{t('driver.email')}</strong> {driver.email || t('driver.noEmail')}</p>
                <p className="mb-2"><strong>{t('driver.phone')}</strong> {driver.phoneNumber || t('driver.noPhone')}</p>
                <p className="mb-2"><strong>{t('driver.groups')}</strong> {driver.groups.join(", ") || t('driver.none')}</p>
                <p className="mb-0"><strong>{t('driver.points')}</strong> {driver.points}</p>
              </Card.Body>
            </Card>
          </Col>

              <Col md={8}>
                <Card>
                  <Card.Body>
                    <Card.Title className="mb-4">
                      <strong>Overview</strong>
                    </Card.Title>
                    <Row>
                      <Col sm={4}>
                        <Card className="text-center">
                          <Card.Body>
                            <h4>{driver.sponsors.length}</h4>
                            <div className="text-muted">Sponsors</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={4}>
                        <Card className="text-center">
                          <Card.Body>
                            <h4>{applicationsByStatus.pending.length}</h4>
                            <div className="text-muted">Pending Apps</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={4}>
                        <Card className="text-center">
                          <Card.Body>
                            <h4>{driver.applications.length}</h4>
                            <div className="text-muted">Total Applications</div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Tabs defaultActiveKey="sponsors" className="mb-4">
              <Tab eventKey="sponsors" title="My Sponsors">
                <Card className="mt-3">
                  <Card.Body>
                    <Card.Title>
                      <strong>Associated Sponsors</strong>
                    </Card.Title>
                    {!driver.sponsors.length ? (
                      <div className="text-muted">No sponsors associated yet.</div>
                    ) : (
                      <ListGroup>
                        {driver.sponsors.map((sponsor) => (
                          <ListGroup.Item key={sponsor.id}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{sponsor.name}</strong>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  Sponsor ID: {sponsor.id}
                                </div>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  Points: {sponsor.points ?? 0}
                                </div>
                              </div>
                              <Badge bg={getBadgeVariant(sponsor.status)}>
                                {sponsor.status}
                              </Badge>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="applications" title="Applications">
                <Card className="mt-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Card.Title className="mb-0">
                        <strong>My Applications</strong>
                      </Card.Title>
                      <Button variant="primary" size="sm" onClick={() => navigate("/sponsor-list")}>
                        Browse Sponsors
                      </Button>
                    </div>

                    {!driver.applications.length ? (
                      <div className="text-muted">No applications submitted yet.</div>
                    ) : (
                      <ListGroup>
                        {driver.applications.map((app) => (
                          <ListGroup.Item key={app.id}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{app.sponsorName}</strong>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  Submitted: {app.submittedAt}
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-2">
                                <Badge bg={getBadgeVariant(app.status)}>
                                  {app.status}
                                </Badge>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="notifications" title="Notifications">
                <Card className="mt-3">
                  <Card.Body>
                    <Card.Title>Notifications</Card.Title>

                    {activeNotifications.length === 0 ? (
                      <div className="text-muted">No notifications</div>
                    ) : (
                      <ListGroup>
                        {activeNotifications.map((n) => (
                          <ListGroup.Item key={n.id}>
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{parseNotification(n.description)}</span>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => closeNotification(n.id)}
                              >
                                ✕
                              </Button>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>

            {adminView && (
              <Button
                style={{ width: "160px", height: "50px", marginTop: "20px" }}
                variant="secondary"
                className="me-2"
                onClick={handleExitDriverView}
              >
                Exit
              </Button>
            )}

            {sponsorView && (
              <Button
                style={{ width: "200px", height: "50px", marginTop: "20px" }}
                variant="secondary"
                className="me-2"
                onClick={handleExitSponsorDriverView}
              >
                Exit
              </Button>
            )}
          </div>
    </Container>
  );
}

export default DriverPage;
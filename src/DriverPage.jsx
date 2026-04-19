import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

const client = generateClient();

function DriverPage() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState({
    id: "",
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    groups: [],
    points: 0,
    sponsors: [],
    applications: []
  });
  const [sponsorsLoading, setSponsorsLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const [session, currentUser, attributes] = await Promise.all([
          fetchAuthSession(),
          getCurrentUser(),
          fetchUserAttributes()
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

        const driverId = currentUser.username;

        setDriver((prev) => ({
          ...prev,
          id: driverId,
          username: currentUser.username ?? "",
          fullName,
          email: attributes.email ?? "",
          phoneNumber: attributes.phone_number ?? "",
          groups
        }));

        setSponsorsLoading(true);
        try {
          const dsResult = await client.models.DriverSponsor.list({
            filter: { driverId: { eq: driverId } }
          });
          const dsRows = dsResult.data ?? [];

          const sponsorList = await Promise.all(
            dsRows.map(async (ds) => {
              let affiliation = ds.sponsorId;
              try {
                const sponsorResult = await client.models.Sponsor.get({ sponsorId: ds.sponsorId });
                affiliation = sponsorResult?.data?.affiliation || ds.sponsorId;
              } catch (_) {}
              return {
                id: ds.sponsorId,
                name: affiliation,
                points: ds.points ?? 0,
                status: "active",
                joinedDate: ds.createdAt?.slice(0, 10) ?? ""
              };
            })
          );

          setDriver((prev) => ({ ...prev, sponsors: sponsorList }));
        } catch (err) {
          console.error("Failed to load sponsors:", err);
        } finally {
          setSponsorsLoading(false);
        }

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
                sponsorName = sponsorResult?.data?.affiliation || app.sponsorId;
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

          setDriver((prev) => ({
            ...prev,
            applications: appList,
            points: appList
              .filter(a => a.status === "accepted")
              .length > 0
              ? prev.points
              : prev.points
          }));
        } catch (err) {
          console.error("Failed to load applications:", err);
        } finally {
          setAppsLoading(false);
        }

      } catch (error) {
        console.error("Failed to load Cognito user info:", error);
        setSponsorsLoading(false);
        setAppsLoading(false);
      }
    }

    loadUser();
  }, []);

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

  return (
    <Container className="mt-4">
      <div style={{ minHeight: "100vh", padding: "40px" }}>
        <h1><strong>Driver Dashboard</strong></h1>

        <Row className="mb-4">
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>My Profile</Card.Title>
                <p className="mb-2"><strong>Name:</strong> {driver.fullName || "Unknown User"}</p>
                <p className="mb-2"><strong>Email:</strong> {driver.email || "No email found"}</p>
                <p className="mb-2"><strong>Phone:</strong> {driver.phoneNumber || "No phone found"}</p>
                <p className="mb-2"><strong>Groups:</strong> {driver.groups.join(", ") || "None"}</p>
                <p className="mb-0"><strong>Total Points:</strong> {driver.sponsors.reduce((sum, s) => sum + (s.points || 0), 0)}</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8}>
            <Card>
              <Card.Body>
                <Card.Title>Overview</Card.Title>
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
          <Tab eventKey="sponsors" title={`My Sponsors${driver.sponsors.length ? ` (${driver.sponsors.length})` : ""}`}>
            <Card className="mt-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0">My Sponsors</Card.Title>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={sponsorsLoading}
                    onClick={async () => {
                      setSponsorsLoading(true);
                      try {
                        const dsResult = await client.models.DriverSponsor.list({
                          filter: { driverId: { eq: driver.id } }
                        });
                        const dsRows = dsResult.data ?? [];
                        const sponsorList = await Promise.all(
                          dsRows.map(async (ds) => {
                            let affiliation = ds.sponsorId;
                            try {
                              const sponsorResult = await client.models.Sponsor.get({ sponsorId: ds.sponsorId });
                              affiliation = sponsorResult?.data?.affiliation || ds.sponsorId;
                            } catch (_) {}
                            return {
                              id: ds.sponsorId,
                              name: affiliation,
                              points: ds.points ?? 0,
                              status: "active",
                              joinedDate: ds.createdAt?.slice(0, 10) ?? ""
                            };
                          })
                        );
                        setDriver((prev) => ({ ...prev, sponsors: sponsorList }));
                      } catch (err) {
                        console.error("Failed to refresh sponsors:", err);
                      } finally {
                        setSponsorsLoading(false);
                      }
                    }}
                  >
                    {sponsorsLoading ? "Refreshing…" : "↻ Refresh"}
                  </Button>
                </div>

                {sponsorsLoading ? (
                  <div className="text-muted">Loading sponsors...</div>
                ) : !driver.sponsors.length ? (
                  <div className="text-center py-4">
                    <div className="text-muted mb-2">No sponsors associated yet.</div>
                    <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                      Apply to a sponsor — once your application is accepted, they will appear here.
                    </div>
                    <Button variant="primary" size="sm" className="mt-3" onClick={() => navigate("/sponsor-list")}>
                      Browse Sponsors
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-muted mb-3" style={{ fontSize: "0.875rem" }}>
                      You are associated with <strong>{driver.sponsors.length}</strong> sponsor{driver.sponsors.length !== 1 ? "s" : ""}.
                    </div>
                    <ListGroup>
                      {driver.sponsors.map((sponsor) => (
                        <ListGroup.Item key={sponsor.id}>
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong style={{ fontSize: "1rem" }}>{sponsor.name}</strong>
                              <div className="text-muted" style={{ fontSize: "0.85rem", marginTop: "2px" }}>
                                Member since: {sponsor.joinedDate || "N/A"}
                              </div>
                            </div>
                            <Badge bg={getBadgeVariant(sponsor.status)} style={{ flexShrink: 0, marginTop: "2px" }}>
                              {sponsor.status}
                            </Badge>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </>
                )}
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="applications" title="Applications">
            <Card className="mt-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0">My Applications</Card.Title>
                  <Button variant="primary" size="sm" onClick={() => navigate("/sponsor-list")}>
                    Browse Sponsors
                  </Button>
                </div>

                {appsLoading ? (
                  <div className="text-muted">Loading applications...</div>
                ) : !driver.applications.length ? (
                  <div className="text-muted">No applications submitted yet.</div>
                ) : (
                  <ListGroup>
                    {driver.applications.map((app) => (
                      <ListGroup.Item key={app.id}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{app.sponsorName}</strong>
                            <div className="text-muted" style={{ fontSize: "0.9rem" }}>
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
        </Tabs>
      </div>
    </Container>
  );
}

export default DriverPage;
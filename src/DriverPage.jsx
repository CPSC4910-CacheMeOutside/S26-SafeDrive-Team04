import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import { getCurrentDriverView, getDriverViewDashboard } from './adminDriverView-api';
import { useNavigate } from 'react-router-dom';
import { stopDriverView } from './adminDriverView-api';

function DriverPage() {
  const navigate = useNavigate();
  const [adminView, setAdminView] = useState(false);
  const [viewedDriver, setViewedDriver] = useState(null);

  const [driver, setDriver] = useState({
    id: 1,
    subId: "",
    username: "",
    name: "",
    email: "",
    phoneNumber: "",
    groups: [],
    points: 200,
    sponsors: [
      {
        id: "SPUser1",
        name: "East Bound and Down",
        status: "active",
        joinedDate: "2026-03-31"
      },
      {
        id: "SPUser3",
        name: "DriversCo",
        status: "active",
        joinedDate: "2026-03-20"
      }
    ],
    applications: [
      {
        id: "APP1",
        sponsorId: "SPUser2",
        sponsorName: "Get Your Kicks on Rt 66",
        status: "rejected",
        submittedAt: "2026-03-30"
      },
      {
        id: "APP2",
        sponsorId: "SPUser4",
        sponsorName: "Convoy Boys",
        status: "pending",
        submittedAt: "2026-03-25"
      }
    ]
  });

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

        setDriver((prev) => ({
          ...prev,
          username: currentUser.username ?? "",
          fullName,
          email: attributes.email ?? "",
          phoneNumber: attributes.phone_number ?? "",
          groups
        }));
      } catch (error) {
        console.error("Failed to load Cognito user info:", error);
      }
    }

    loadUser();
  }, []);

  const applicationsByStatus = useMemo(() => {
    return {
      pending: driver.applications.filter((app) => app.status === "pending"),
      approved: driver.applications.filter((app) => app.status === "approved"),
    };
  }, [driver.applications]);

  const getBadgeVariant = (status) => {
    switch (status) {
      case "active":
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  useEffect(() => {
    const loadAdminView = async () => {
      const raw = localStorage.getItem('driverViewSession');
      if (!raw) return;
      try {
        const stored = JSON.parse(raw);
        const sessionData = await getCurrentDriverView(stored.sessionId);
        const dashboardData = await getDriverViewDashboard(stored.sessionId);
        setAdminView(true);
        setViewedDriver(sessionData);
        setDriver(dashboardData);
      } catch (error) {
        console.error(error);
        localStorage.removeItem('driverViewSession');
      }
    };
    loadAdminView();
  }, []);

  const handleExitDriverView = async () => {
    try {
      const raw = localStorage.getItem('driverViewSession');
      if (raw) {
        const stored = JSON.parse(raw);
        await stopDriverView(stored.sessionId);
      }
    } catch (error) {
      console.error('Failed to stop driver view', error);
    }
    localStorage.removeItem('driverViewSession');
    navigate('/AdminPage');
  };

  return (
    <Container className="mt-4">
        <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
          <h1 style={{ fontSize: "60px", fontWeight: "bold" }}>Driver Dashboard</h1>
        
          <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>

        {adminView && viewedDriver && (
          <div style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px',}}>
            <strong>*** You're viewing driver account:</strong> {viewedDriver.driverSub}<strong>{" ***"}</strong>
          </div>
        )}
        <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>

        <Row className="mb-4">
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title className="mb-4"><strong>My Profile</strong></Card.Title>
                  <div className="text-start">
                    <p className="mb-2 text-nowrap"><strong>Name:</strong> {driver.fullName || "Unknown User"}</p>
                    <p className="mb-2 text-nowrap"><strong>Email:</strong> {driver.email || "No email found"}</p>
                    <p className="mb-2 text-nowrap"><strong>Phone:</strong> {driver.phoneNumber || "No phone found"}</p>
                    <p className="mb-2 text-nowrap"><strong>Groups:</strong> {driver.groups.join(", ") || "None"}</p>
                    <p className="mb-0 text-nowrap"><strong>Points:</strong> {driver.points}</p>
                  </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8}>
            <Card>
              <Card.Body>
                <Card.Title className="mb-4"><strong>Overview</strong></Card.Title>
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
                <Card.Title><strong>Associated Sponsors</strong></Card.Title>
                {!driver.sponsors.length ? (
                  <div className="text-muted">No sponsors associated yet.</div>
                ) : (
                  <ListGroup>
                    {driver.sponsors.map((sponsor) => (
                      <ListGroup.Item key={sponsor.id}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{sponsor.name}</strong>
                            <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                              Joined: {sponsor.joinedDate}
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
                  <Card.Title className="mb-0"><strong>My Applications</strong></Card.Title>
                  <Button variant="primary" size="sm">
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
        {adminView && (<Button style={{ width: "160px", height: "50px", marginTop: "20px" }} variant="secondary" className="me-2" onClick={handleExitDriverView}>Exit</Button>)}
        </div>
        </div>
      </div>
    </Container>
  );
}

export default DriverPage;

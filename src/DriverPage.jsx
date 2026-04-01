import { useMemo, useState, useEffect} from "react";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

function DriverPage() {
  const [driver, setDriver] = useState({
    id: 1,
    name: "Gabe Hillesheim",
    email: "gabehillesheim@outlook.com",
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
        status: "pending",
        joinedDate: "2026-03-20"
      }
    ],
    applications: [
      {
        id: "APP1",
        sponsorId: "SPUser4",
        sponsorName: "Acme Trucking",
        status: "pending",
        submittedAt: "2026-03-30"
      },
      {
        id: "APP2",
        sponsorId: "SPUser5",
        sponsorName: "Blue Ridge Haul",
        status: "approved",
        submittedAt: "2026-03-25"
      }
    ]
  });

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

  const withdrawApplication = (applicationId) => {
    setDriver((prev) => ({
      ...prev,
      applications: prev.applications.filter((app) => app.id !== applicationId)
    }));
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
                <p className="mb-2"><strong>Name:</strong> {driver.name}</p>
                <p className="mb-2"><strong>Email:</strong> {driver.email}</p>
                <p className="mb-0"><strong>Points:</strong> {driver.points}</p>
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
          <Tab eventKey="sponsors" title="My Sponsors">
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>Associated Sponsors</Card.Title>

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
                  <Card.Title className="mb-0">My Applications</Card.Title>
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

                            {app.status === "pending" && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => withdrawApplication(app.id)}
                              >
                                Withdraw
                              </Button>
                            )}
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
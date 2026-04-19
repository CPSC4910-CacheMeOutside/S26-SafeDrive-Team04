import { useLocation, useNavigate, useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

function AdminSponsorViewPage() {
  const { sponsorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const sponsorUser = location.state?.sponsorUser || null;
  const relationships = Array.isArray(location.state?.relationships)
    ? location.state.relationships
    : [];

  const sponsorDisplayName =
    sponsorUser?.affiliation ||
    sponsorUser?.name ||
    sponsorUser?.preferred_username ||
    sponsorUser?.username ||
    sponsorId;

  const getDriverLabel = (rel) => {
    return (
      rel?.driverName ||
      rel?.driverNickname ||
      rel?.driverEmail ||
      "Unknown Driver"
    );
  };

  const totalPoints = relationships.reduce(
    (sum, rel) => sum + (Number(rel?.points) || 0),
    0
  );

  return (
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
        <h1 className="text-center mb-4">
          <strong>Sponsor Dashboard</strong>
        </h1>

        <div
          className="text-center text-white fw-semibold mb-5"
          style={{
            backgroundColor: "#10b981",
            borderRadius: "8px",
            padding: "12px 16px",
            maxWidth: "1080px",
            margin: "0 auto",
          }}
        >
          *** You're viewing sponsor account: {sponsorUser?.username || sponsorId} ***
        </div>

        <Row className="g-4 mb-4 justify-content-center">
          <Col md={4}>
            <Card style={{ minHeight: "285px" }}>
              <Card.Body className="d-flex flex-column justify-content-center">
                <Card.Title className="text-center mb-4">
                  <strong>My Profile</strong>
                </Card.Title>

                <div className="text-start mb-2">
                  <strong>Name:</strong> {sponsorDisplayName}
                </div>

                <div className="text-start mb-2">
                  <strong>Email:</strong> {sponsorUser?.email || "N/A"}
                </div>

                <div className="text-start mb-2">
                  <strong>Phone:</strong>{" "}
                  {sponsorUser?.phone_number || sponsorUser?.phone || "N/A"}
                </div>

                <div className="text-start mb-2">
                  <strong>Group:</strong> Sponsor
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8}>
            <Card style={{ minHeight: "285px" }}>
              <Card.Body>
                <Card.Title className="text-center mb-4">
                  <strong>Overview</strong>
                </Card.Title>

                <Row className="justify-content-center g-4">
                  <Col md={4}>
                    <Card className="text-center h-100">
                      <Card.Body className="d-flex flex-column justify-content-center">
                        <h2>{relationships.length}</h2>
                        <div>Driver Count</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className="text-center h-100">
                      <Card.Body className="d-flex flex-column justify-content-center">
                        <h2>{totalPoints}</h2>
                        <div>Points Awarded</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className="text-center h-100">
                      <Card.Body className="d-flex flex-column justify-content-center">
                        <h2>0</h2>
                        <div>Pending Items</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <Tabs defaultActiveKey="drivers" className="mb-4">
            <Tab eventKey="drivers" title="My Drivers">
              <Card>
                <Card.Body>
                  <Card.Title className="text-center mb-4">
                    <strong>My Drivers</strong>
                  </Card.Title>

                  {!relationships.length ? (
                    <div className="text-muted text-center">
                      No assigned drivers found.
                    </div>
                  ) : (
                    <ListGroup>
                      {relationships.map((rel, index) => (
                        <ListGroup.Item
                          key={rel.driverSponsorId || `${rel.driverId}-${index}`}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <div className="fw-semibold">
                                {getDriverLabel(rel)}
                              </div>
                              <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                Driver ID: {rel.driverEmail || rel.driverId || "No email"}
                              </div>
                              <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                Points: {rel.points ?? 0}
                              </div>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="actions" title="Actions">
              <Card>
                <Card.Body className="text-center">
                  <Card.Title className="mb-4">
                    <strong>Account Actions</strong>
                  </Card.Title>

                  <div className="d-flex justify-content-center gap-3">
                    <Button
                      variant="primary"
                      onClick={() =>
                        navigate(
                          `/admin/sponsors/${sponsorUser?.username || sponsorId}/edit`
                        )
                      }
                    >
                      Edit Sponsor Account
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
          <Button style={{ width: "160px", height: "50px", marginTop: "20px" }} variant="secondary" className="me-2" onClick={() => navigate("/AdminPage")}>Exit</Button>
        </div>
      </div>
    </Container>
  );
}

export default AdminSponsorViewPage;
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

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

  const getDriverLabel = (rel) =>
    rel?.driverNickname ||
    rel?.driverName ||
    rel?.driverEmail ||
    rel?.driverId ||
    "Unknown Driver";

  return (
    <Container className="mt-4">
      <div style={{ minHeight: "100vh", padding: "40px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <strong>Sponsor Dashboard</strong>
          </h1>
          <Button variant="outline-secondary" onClick={() => navigate("/AdminPage")}>
            Back
          </Button>
        </div>

        <Row className="g-4">
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>
                  <strong>Sponsor Info</strong>
                </Card.Title>

                <div className="mb-2">
                  <strong>Name:</strong> {sponsorDisplayName}
                </div>

                <div className="mb-2">
                  <strong>Email:</strong> {sponsorUser?.email || "N/A"}
                </div>

                <div className="mb-2">
                  <strong>Phone:</strong>{" "}
                  {sponsorUser?.phone_number || sponsorUser?.phone || "N/A"}
                </div>

                <div className="mb-2">
                  <strong>Sub ID:</strong> {sponsorUser?.username || sponsorId}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8}>
            <Card>
              <Card.Body>
                <Card.Title>
                  <strong>Assigned Drivers</strong>
                </Card.Title>

                {!relationships.length ? (
                  <div className="text-muted">No assigned drivers found.</div>
                ) : (
                  <ListGroup>
                    {relationships.map((rel, index) => (
                      <ListGroup.Item
                        key={rel.driverSponsorId || `${rel.driverId}-${index}`}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-semibold">{getDriverLabel(rel)}</div>
                            <div
                              className="text-muted"
                              style={{ fontSize: "0.9rem" }}
                            >
                              {rel.driverEmail || rel.driverId || "No email"}
                            </div>
                          </div>
                          <div>
                            <strong>{rel.points ?? 0}</strong>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>

            <Card className="mt-4">
              <Card.Body>
                <Card.Title>
                  <strong>Actions</strong>
                </Card.Title>

                <Button
                  variant="primary"
                  onClick={() =>
                    navigate(`/admin/sponsors/${sponsorUser?.username || sponsorId}/edit`)
                  }
                >
                  Edit Sponsor Account
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
}

export default AdminSponsorViewPage;
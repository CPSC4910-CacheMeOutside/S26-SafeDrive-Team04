import { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { ListGroupItem } from "react-bootstrap";
import { fetchAdminUsers } from "./adminUpdateDriverInfo-api";

function ManageAdminsTab({ onSelectAdmin }) {
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedAdminUsername, setSelectedAdminUsername] = useState("");
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState("");

  const selectedAdminUser = useMemo(
    () => adminUsers.find((u) => u.username === selectedAdminUsername) ?? null,
    [adminUsers, selectedAdminUsername]
  );

  useEffect(() => {
    if (onSelectAdmin) {
      onSelectAdmin(selectedAdminUser || null);
    }
  }, [selectedAdminUser, onSelectAdmin]);

  const loadAdminUsers = async () => {
    try {
      setLoadingAdminUsers(true);
      setAdminUsersError("");

      const users = await fetchAdminUsers();
      const safeUsers = Array.isArray(users) ? users : [];

      setAdminUsers(safeUsers);
      setSelectedAdminUsername((prev) => {
        if (prev && safeUsers.some((u) => u.username === prev)) return prev;
        return safeUsers[0]?.username || "";
      });
    } catch (error) {
      console.error(error);
      setAdminUsersError("Failed to load admins.");
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  useEffect(() => {
    loadAdminUsers();
  }, []);

  return (
    <Row className="g-4 align-items-start">
      <Col md={4}>
        <Card className="mb-4">
          <Card.Body>
            <Card.Title className="mb-4">
              <strong>Select an Admin</strong>
            </Card.Title>

            {adminUsersError && (
              <div className="alert alert-danger py-2">{adminUsersError}</div>
            )}

            {loadingAdminUsers ? (
              <div className="text-muted">Loading admins...</div>
            ) : !adminUsers.length ? (
              <div className="text-muted">No admins found.</div>
            ) : (
              <>
                <ListGroup className="mb-3">
                  {adminUsers.map((user) => (
                    <ListGroupItem
                      key={user.username}
                      action
                      active={user.username === selectedAdminUsername}
                      onClick={() => setSelectedAdminUsername(user.username)}
                      style={
                        user.username === selectedAdminUsername
                          ? {
                              backgroundColor: "#10b981",
                              border: "none",
                              color: "white",
                            }
                          : {}
                      }
                    >
                      <div className="fw-semibold">
                        {user.name || user.preferred_username || user.username}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {user.email || user.username}
                      </div>
                    </ListGroupItem>
                  ))}
                </ListGroup>

                <Button
                  className="mt-3"
                  style={{ width: "160px", height: "50px" }}
                  variant="outline-secondary"
                  onClick={loadAdminUsers}
                  disabled={loadingAdminUsers}
                >
                  Refresh
                </Button>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>

      <Col md={8}>
        <Row className="g-4">
          <Col md={12}>
            <Card>
              <Card.Body>
                <Card.Title>
                  <strong>Admin Overview</strong>
                </Card.Title>

                {!selectedAdminUser ? (
                  <div className="text-muted">
                    Select an admin to view their overview.
                  </div>
                ) : (
                  <div className="text-start">
                    <div className="mb-2">
                      <strong>Name:</strong>{" "}
                      {selectedAdminUser.name ||
                        selectedAdminUser.preferred_username ||
                        selectedAdminUser.username}
                    </div>

                    <div className="mb-2">
                      <strong>Email:</strong> {selectedAdminUser.email || "N/A"}
                    </div>

                    <div className="mb-2">
                      <strong>Phone:</strong> {selectedAdminUser.phone_number}
                    </div>

                    <div className="mb-2">
                      <strong>Sub ID:</strong> {selectedAdminUser.username}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export default ManageAdminsTab;
import { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ListGroupItem } from "react-bootstrap";
import { fetchSponsorUsers } from "./adminUpdateDriverInfo-api";
import { useNavigate } from "react-router-dom";

function ManageSponsorsTab({
  onSelectSponsor,
  relationships,
  loadRelationships,
  getDriverLabel,
  driverUsers = [],
  assignDriverToSponsor,
  removeDriverFromSponsor,
}) {
  const [sponsorUsers, setSponsorUsers] = useState([]);
  const [selectedSponsorUsername, setSelectedSponsorUsername] = useState("");
  const [loadingSponsorUsers, setLoadingSponsorUsers] = useState(false);
  const [sponsorUsersError, setSponsorUsersError] = useState("");

  const [selectedDriverUsername, setSelectedDriverUsername] = useState("");
  const [selectedAssignedDriverUsername, setSelectedAssignedDriverUsername] = useState("");
  const [assignDriverError, setAssignDriverError] = useState("");
  const [assignDriverSuccess, setAssignDriverSuccess] = useState("");
  const [assigningDriver, setAssigningDriver] = useState(false);

  const [removeDriverError, setRemoveDriverError] = useState("");
  const [removeDriverSuccess, setRemoveDriverSuccess] = useState("");
  const [removingDriver, setRemovingDriver] = useState(false);

  const navigate = useNavigate();

  const selectedSponsorUser = useMemo(() => {
    return (
      sponsorUsers.find((u) => u.username === selectedSponsorUsername) ?? null
    );
  }, [sponsorUsers, selectedSponsorUsername]);

  const assignedDriverIds = useMemo(() => {
    return new Set(
      (Array.isArray(relationships) ? relationships : [])
        .map((rel) => rel?.driverId)
        .filter(Boolean)
    );
  }, [relationships]);

  const assignableDriverUsers = useMemo(() => {
    return (Array.isArray(driverUsers) ? driverUsers : []).filter(
      (driver) => !assignedDriverIds.has(driver.username)
    );
  }, [driverUsers, assignedDriverIds]);

  const loadSponsorUsers = async () => {
    try {
      setLoadingSponsorUsers(true);
      setSponsorUsersError("");

      const users = await fetchSponsorUsers();
      const safeUsers = Array.isArray(users) ? users : [];

      setSponsorUsers(safeUsers);

      setSelectedSponsorUsername((prev) => {
        if (prev && safeUsers.some((u) => u.username === prev)) {
          return prev;
        }
        return safeUsers[0]?.username || "";
      });
    } catch (error) {
      console.error("Failed to load sponsors:", error);
      setSponsorUsersError("Failed to load sponsors.");
    } finally {
      setLoadingSponsorUsers(false);
    }
  };

  useEffect(() => {
    loadSponsorUsers();
  }, []);

  useEffect(() => {
    if (onSelectSponsor) {
      onSelectSponsor(selectedSponsorUser || null);
    }
  }, [selectedSponsorUser, onSelectSponsor]);

  useEffect(() => {
    if (selectedSponsorUser?.username) {
      loadRelationships(selectedSponsorUser.username);
      setAssignDriverSuccess("");
      setAssignDriverError("");
      setRemoveDriverSuccess("");
      setRemoveDriverError("");
    }
  }, [selectedSponsorUser, loadRelationships]);

  useEffect(() => {
    if (
      selectedDriverUsername &&
      !assignableDriverUsers.some(
        (driver) => driver.username === selectedDriverUsername
      )
    ) {
      setSelectedDriverUsername("");
    }
  }, [assignableDriverUsers, selectedDriverUsername]);

  useEffect(() => {
    if (
      selectedAssignedDriverUsername &&
      !(Array.isArray(relationships) ? relationships : []).some(
        (rel) => rel?.driverId === selectedAssignedDriverUsername
      )
    ) {
      setSelectedAssignedDriverUsername("");
    }
  }, [relationships, selectedAssignedDriverUsername]);

  const handleViewSponsor = () => {
    if (!selectedSponsorUser?.username) return;

    const safeSponsorUser = {
      username: selectedSponsorUser.username ?? "",
      email: selectedSponsorUser.email ?? "",
      name: selectedSponsorUser.name ?? "",
      preferred_username: selectedSponsorUser.preferred_username ?? "",
      nickname: selectedSponsorUser.nickname ?? "",
      phone_number: selectedSponsorUser.phone_number ?? "",
      phone: selectedSponsorUser.phone ?? "",
      affiliation: selectedSponsorUser.affiliation ?? "",
    };

    const safeRelationships = (Array.isArray(relationships) ? relationships : []).map((rel) => ({
      driverSponsorId: rel?.driverSponsorId ?? "",
      driverId: rel?.driverId ?? "",
      sponsorId: rel?.sponsorId ?? "",
      driverName:
        rel?.driverName ||
        rel?.driverNickname ||
        getDriverLabel(rel?.driverId) ||
        rel?.driverEmail ||
        "Unknown Driver",
      driverNickname: rel?.driverNickname ?? "",
      driverEmail: rel?.driverEmail ?? "",
      points: rel?.points ?? 0,
    }));

    navigate(`/admin/sponsors/${selectedSponsorUser.username}/view`, {
      state: {
        sponsorUser: safeSponsorUser,
        relationships: safeRelationships,
      },
    });
  };

  const handleEditSponsor = () => {
    if (!selectedSponsorUser?.username) return;
    navigate(`/admin/sponsors/${selectedSponsorUser.username}/edit`);
  };

  const handleAssignDriver = async () => {
    if (!assignDriverToSponsor) return;
    if (!selectedSponsorUser?.username || !selectedDriverUsername) return;

    try {
      setAssigningDriver(true);
      setAssignDriverError("");
      setAssignDriverSuccess("");

      await assignDriverToSponsor(
        selectedSponsorUser.username,
        selectedDriverUsername
      );

      setAssignDriverSuccess("Driver assigned successfully.");
      setSelectedDriverUsername("");

      await loadRelationships(selectedSponsorUser.username);
    } catch (error) {
      console.error("Failed to assign driver:", error);
      setAssignDriverError("Failed to assign driver.");
    } finally {
      setAssigningDriver(false);
    }
  };

  const handleRemoveDriver = async () => {
    if (!removeDriverFromSponsor) return;
    if (!selectedSponsorUser?.username || !selectedAssignedDriverUsername) return;

    try {
      setRemovingDriver(true);
      setRemoveDriverError("");
      setRemoveDriverSuccess("");

      await removeDriverFromSponsor(
        selectedSponsorUser.username,
        selectedAssignedDriverUsername
      );

      setRemoveDriverSuccess("Driver removed successfully.");
      setSelectedAssignedDriverUsername("");

      await loadRelationships(selectedSponsorUser.username);
    } catch (error) {
      console.error("Failed to remove driver:", error);
      setRemoveDriverError("Failed to remove driver.");
    } finally {
      setRemovingDriver(false);
    }
  };

  const sponsorDisplayName =
    selectedSponsorUser?.affiliation ||
    selectedSponsorUser?.name ||
    selectedSponsorUser?.preferred_username ||
    selectedSponsorUser?.username ||
    "N/A";

  const totalSponsorPoints = (relationships || []).reduce(
    (sum, rel) => sum + (rel.points ?? 0),
    0
  );

  return (
    <Row className="g-4 align-items-start">
      <Col md={4}>
        <Card className="mb-4">
          <Card.Body>
            <Card.Title className="mb-4">
              <strong>Select a Sponsor</strong>
            </Card.Title>

            {sponsorUsersError && (
              <div className="alert alert-danger py-2">{sponsorUsersError}</div>
            )}

            {loadingSponsorUsers ? (
              <div className="text-muted">Loading sponsors...</div>
            ) : !sponsorUsers.length ? (
              <div className="text-muted">No sponsors found.</div>
            ) : (
              <>
                <ListGroup className="mb-3">
                  {sponsorUsers.map((user) => {
                    const isSelected = user.username === selectedSponsorUsername;

                    return (
                      <ListGroupItem
                        key={user.username}
                        action
                        active={isSelected}
                        onClick={() => setSelectedSponsorUsername(user.username)}
                        style={
                          isSelected
                            ? {
                                backgroundColor: "#10b981",
                                border: "none",
                                color: "white",
                              }
                            : {}
                        }
                      >
                        <div className="fw-semibold">
                          {user.affiliation ||
                            user.name ||
                            user.preferred_username ||
                            user.username}
                        </div>

                        <div
                          className={isSelected ? "" : "text-muted"}
                          style={{ fontSize: "0.9rem" }}
                        >
                          {user.email || user.username}
                        </div>
                      </ListGroupItem>
                    );
                  })}
                </ListGroup>

                <Button
                  className="mt-3"
                  style={{ width: "160px", height: "50px" }}
                  variant="outline-secondary"
                  onClick={loadSponsorUsers}
                  disabled={loadingSponsorUsers}
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
                  <strong>Sponsor Overview</strong>
                </Card.Title>

                {!selectedSponsorUser ? (
                  <div className="text-muted">
                    Select a sponsor to view their overview.
                  </div>
                ) : (
                  <div className="text-start">
                    <div className="mb-2">
                      <strong>Name:</strong> {sponsorDisplayName}
                    </div>

                    <div className="mb-2">
                      <strong>Email:</strong>{" "}
                      {selectedSponsorUser.email || "N/A"}
                    </div>

                    <div className="mb-2">
                      <strong>Phone:</strong>{" "}
                      {selectedSponsorUser.phone_number ||
                        selectedSponsorUser.phone ||
                        "N/A"}
                    </div>

                    <div className="mb-2">
                      <strong>Sub ID:</strong> {selectedSponsorUser.username}
                    </div>

                    <div className="mb-2">
                      <strong>Drivers:</strong>{" "}
                      {relationships.length
                        ? relationships
                            .map(
                              (rel) =>
                                `${getDriverLabel(rel.driverId)} (${rel.points ?? 0} pts)`
                            )
                            .join(", ")
                        : "No assigned drivers found."}
                    </div>

                    <div className="mb-2">
                      <strong>Total Points Awarded:</strong> {totalSponsorPoints}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Row className="g-4 mt-1">
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Body className="text-center d-flex flex-column justify-content-center align-items-center">
                    <Card.Title>
                      <strong>View Account</strong>
                    </Card.Title>
                    <Button
                      className="mt-3"
                      style={{ width: "160px", height: "50px" }}
                      variant="primary"
                      disabled={!selectedSponsorUser}
                      onClick={handleViewSponsor}
                    >
                      View
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="h-100">
                  <Card.Body className="text-center d-flex flex-column justify-content-center align-items-center">
                    <Card.Title>
                      <strong>Edit Account</strong>
                    </Card.Title>
                    <Button
                      className="mt-3"
                      style={{ width: "160px", height: "50px" }}
                      variant="primary"
                      disabled={!selectedSponsorUser}
                      onClick={handleEditSponsor}
                    >
                      Edit
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Body className="text-center">
                    <Card.Title className="mb-4">
                      <strong>Assign a Driver</strong>
                    </Card.Title>

                    {assignDriverError && (
                      <div className="alert alert-danger py-2">
                        {assignDriverError}
                      </div>
                    )}

                    {assignDriverSuccess && (
                      <div className="alert alert-success py-2">
                        {assignDriverSuccess}
                      </div>
                    )}

                    <div className="d-flex flex-column align-items-center">
                      <Form.Select
                        style={{ maxWidth: "460px" }}
                        className="mb-3"
                        value={selectedDriverUsername}
                        onChange={(e) => setSelectedDriverUsername(e.target.value)}
                        disabled={!selectedSponsorUser}
                      >
                        <option value="">
                          {!selectedSponsorUser
                            ? "Select a sponsor first"
                            : !assignableDriverUsers.length
                            ? "No unassigned drivers available"
                            : "Select a driver"}
                        </option>

                        {assignableDriverUsers.map((driver) => (
                          <option key={driver.username} value={driver.username}>
                            {driver.name ||
                              driver.preferred_username ||
                              driver.email ||
                              driver.username}
                          </option>
                        ))}
                      </Form.Select>

                      <Button
                        style={{ width: "160px", height: "50px" }}
                        variant="primary"
                        onClick={handleAssignDriver}
                        disabled={
                          !selectedSponsorUser ||
                          !selectedDriverUsername ||
                          assigningDriver
                        }
                      >
                        {assigningDriver ? "Assigning..." : "Assign"}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="h-100">
                  <Card.Body className="text-center">
                    <Card.Title className="mb-4">
                      <strong>Remove a Driver</strong>
                    </Card.Title>

                    {removeDriverError && (
                      <div className="alert alert-danger py-2">
                        {removeDriverError}
                      </div>
                    )}

                    {removeDriverSuccess && (
                      <div className="alert alert-success py-2">
                        {removeDriverSuccess}
                      </div>
                    )}

                    <div className="d-flex flex-column align-items-center">
                      <Form.Select
                        style={{ maxWidth: "460px" }}
                        className="mb-3"
                        value={selectedAssignedDriverUsername}
                        onChange={(e) =>
                          setSelectedAssignedDriverUsername(e.target.value)
                        }
                        disabled={!selectedSponsorUser || !relationships.length}
                      >
                        <option value="">
                          {!selectedSponsorUser
                            ? "Select a sponsor first"
                            : !relationships.length
                            ? "No assigned drivers"
                            : "Select a driver"}
                        </option>

                        {relationships.map((rel, index) => (
                          <option
                            key={rel.driverSponsorId || `${rel.driverId}-${index}`}
                            value={rel.driverId}
                          >
                            {getDriverLabel(rel.driverId)}
                          </option>
                        ))}
                      </Form.Select>

                      <Button
                        style={{ width: "160px", height: "50px" }}
                        variant="outline-danger"
                        onClick={handleRemoveDriver}
                        disabled={
                          !selectedSponsorUser ||
                          !selectedAssignedDriverUsername ||
                          removingDriver
                        }
                      >
                        {removingDriver ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export default ManageSponsorsTab;
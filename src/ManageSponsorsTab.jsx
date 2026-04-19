import { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ListGroupItem } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function ManageSponsorsTab({
  sponsorUsers = [],
  onSelectSponsor,
  relationships = [],
  loadRelationships,
  getUserLabel,
  getEstimatedDollarAmount,
  driverUsers = [],
  sponsorRatioInput,
  setSponsorRatioInput,
  sponsorRatioError,
  sponsorRatioSuccess,
  handleSaveRatio,
  savingRatio,
  assignDriverToSponsor,
  removeDriverFromSponsor,
  awardPointsToDriver,
  deductPointsFromDriver,
}) {
  const [selectedSponsorUsername, setSelectedSponsorUsername] = useState("");

  const [selectedDriverUsername, setSelectedDriverUsername] = useState("");
  const [selectedAssignedDriverUsername, setSelectedAssignedDriverUsername] = useState("");
  const [assignDriverError, setAssignDriverError] = useState("");
  const [assignDriverSuccess, setAssignDriverSuccess] = useState("");
  const [assigningDriver, setAssigningDriver] = useState(false);

  const [removeDriverError, setRemoveDriverError] = useState("");
  const [removeDriverSuccess, setRemoveDriverSuccess] = useState("");
  const [removingDriver, setRemovingDriver] = useState(false);

  const [selectedAwardDriverUsername, setSelectedAwardDriverUsername] = useState("");
  const [selectedDeductDriverUsername, setSelectedDeductDriverUsername] = useState("");
  const [awardPointsAmount, setAwardPointsAmount] = useState("");
  const [deductPointsAmount, setDeductPointsAmount] = useState("");
  const [awardError, setAwardError] = useState("");
  const [awardSuccess, setAwardSuccess] = useState("");
  const [deductError, setDeductError] = useState("");
  const [deductSuccess, setDeductSuccess] = useState("");
  const [updatingPoints, setUpdatingPoints] = useState(false);

  const navigate = useNavigate();

  const selectedSponsorUser = useMemo(() => {
    return sponsorUsers.find((u) => u.username === selectedSponsorUsername) ?? null;
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

  useEffect(() => {
    if (sponsorUsers.length > 0 && !selectedSponsorUsername) {
      setSelectedSponsorUsername(sponsorUsers[0].username);
    }
  }, [sponsorUsers, selectedSponsorUsername]);

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
      setAwardSuccess("");
      setAwardError("");
      setDeductSuccess("");
      setDeductError("");
    }
  }, [selectedSponsorUser, loadRelationships]);

  useEffect(() => {
    if (
      selectedDriverUsername &&
      !assignableDriverUsers.some((driver) => driver.username === selectedDriverUsername)
    ) {
      setSelectedDriverUsername("");
    }
  }, [assignableDriverUsers, selectedDriverUsername]);

  useEffect(() => {
    const assignedIds = new Set(
      (Array.isArray(relationships) ? relationships : [])
        .map((rel) => rel?.driverId)
        .filter(Boolean)
    );

    if (selectedAssignedDriverUsername && !assignedIds.has(selectedAssignedDriverUsername)) {
      setSelectedAssignedDriverUsername("");
    }

    if (selectedAwardDriverUsername && !assignedIds.has(selectedAwardDriverUsername)) {
      setSelectedAwardDriverUsername("");
    }

    if (selectedDeductDriverUsername && !assignedIds.has(selectedDeductDriverUsername)) {
      setSelectedDeductDriverUsername("");
    }
  }, [
    relationships,
    selectedAssignedDriverUsername,
    selectedAwardDriverUsername,
    selectedDeductDriverUsername,
  ]);

  useEffect(() => {
  if (assignDriverSuccess) {
    const timer = setTimeout(() => setAssignDriverSuccess(""), 3000);
    return () => clearTimeout(timer);
  }
}, [assignDriverSuccess]);

useEffect(() => {
  if (assignDriverError) {
    const timer = setTimeout(() => setAssignDriverError(""), 3000);
    return () => clearTimeout(timer);
  }
}, [assignDriverError]);

useEffect(() => {
  if (removeDriverSuccess) {
    const timer = setTimeout(() => setRemoveDriverSuccess(""), 3000);
    return () => clearTimeout(timer);
  }
}, [removeDriverSuccess]);

  useEffect(() => {
    if (removeDriverError) {
        const timer = setTimeout(() => setRemoveDriverError(""), 3000);
        return () => clearTimeout(timer);
    }
  }, [removeDriverError]);

  useEffect(() => {
    if (awardSuccess) {
        const timer = setTimeout(() => setAwardSuccess(""), 3000);
        return () => clearTimeout(timer);
    }
  }, [awardSuccess]);

  useEffect(() => {
    if (awardError) {
        const timer = setTimeout(() => setAwardError(""), 3000);
        return () => clearTimeout(timer);
    }
  }, [awardError]);

  useEffect(() => {
    if (deductSuccess) {
        const timer = setTimeout(() => setDeductSuccess(""), 3000);
        return () => clearTimeout(timer);
    }
  }, [deductSuccess]);

  useEffect(() => {
    if (deductError) {
        const timer = setTimeout(() => setDeductError(""), 3000);
        return () => clearTimeout(timer);
    }
  }, [deductError]);

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
        getUserLabel(rel?.driverId) ||
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

      await assignDriverToSponsor(selectedSponsorUser.username, selectedDriverUsername);

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

  const handleAwardPoints = async () => {
    if (!awardPointsToDriver) return;
    if (!selectedSponsorUser?.username || !selectedAwardDriverUsername) {
      setAwardError("Please select a driver.");
      setAwardSuccess("");
      return;
    }

    const amount = Number(awardPointsAmount);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      setAwardError("Enter a valid positive number of points.");
      setAwardSuccess("");
      return;
    }

    try {
      setUpdatingPoints(true);
      setAwardError("");
      setAwardSuccess("");

      await awardPointsToDriver(
        selectedSponsorUser.username,
        selectedAwardDriverUsername,
        amount
      );

      setAwardSuccess("Points awarded successfully.");
      setAwardPointsAmount("");
      setSelectedAwardDriverUsername("");
      await loadRelationships(selectedSponsorUser.username);
    } catch (error) {
      console.error("Failed to award points:", error);
      setAwardError("Failed to award points.");
      setAwardSuccess("");
    } finally {
      setUpdatingPoints(false);
    }
  };

  const handleDeductPoints = async () => {
    if (!deductPointsFromDriver) return;
    if (!selectedSponsorUser?.username || !selectedDeductDriverUsername) {
      setDeductError("Please select a driver.");
      setDeductSuccess("");
      return;
    }

    const amount = Number(deductPointsAmount);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      setDeductError("Enter a valid positive number of points.");
      setDeductSuccess("");
      return;
    }

    try {
      setUpdatingPoints(true);
      setDeductError("");
      setDeductSuccess("");

      await deductPointsFromDriver(
        selectedSponsorUser.username,
        selectedDeductDriverUsername,
        amount
      );

      setDeductSuccess("Points deducted successfully.");
      setDeductPointsAmount("");
      setSelectedDeductDriverUsername("");
      await loadRelationships(selectedSponsorUser.username);
    } catch (error) {
      console.error("Failed to deduct points:", error);
      setDeductError("Failed to deduct points.");
      setDeductSuccess("");
    } finally {
      setUpdatingPoints(false);
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

              {!sponsorUsers.length ? (
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
                  onClick={() => window.location.reload()}
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
                                `${getUserLabel(rel.driverId)} (${rel.points ?? 0} pts)`
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
                            {`${getUserLabel(rel.driverId)} (${rel.points ?? 0} pts)`}
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

              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>
                      <strong>Award Points</strong>
                    </Card.Title>

                    {awardError && <div className="alert alert-danger py-2">{awardError}</div>}
                    {awardSuccess && <div className="alert alert-success py-2">{awardSuccess}</div>}

                    {!selectedSponsorUser ? (
                      <div className="text-muted">Select a sponsor first.</div>
                    ) : (
                      <>
                        <Form.Group className="mb-3">
                          <Form.Label></Form.Label>
                          <Form.Select
                            value={selectedAwardDriverUsername}
                            onChange={(e) => setSelectedAwardDriverUsername(e.target.value)}
                            disabled={!selectedSponsorUser || !relationships.length}
                          >
                            <option value="">
                              {relationships.length ? "Select a driver" : "No assigned drivers"}
                            </option>
                            {relationships.map((rel, index) => (
                              <option
                                key={rel.driverSponsorId || `${rel.driverId}-${index}`}
                                value={rel.driverId}
                              >
                                {getUserLabel(rel.driverId)}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Control
                            type="number"
                            min="1"
                            value={awardPointsAmount}
                            onChange={(e) => setAwardPointsAmount(e.target.value)}
                            placeholder="Enter points amount"
                          />
                        </Form.Group>

                        <div className="d-flex justify-content-center">
                          <Button
                            style={{ width: "160px", height: "50px" }}
                            variant="success"
                            onClick={handleAwardPoints}
                            disabled={!selectedSponsorUser || updatingPoints}
                          >
                            Award
                          </Button>
                        </div>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>
                      <strong>Deduct Points</strong>
                    </Card.Title>

                    {deductError && <div className="alert alert-danger py-2">{deductError}</div>}
                    {deductSuccess && <div className="alert alert-success py-2">{deductSuccess}</div>}

                    {!selectedSponsorUser ? (
                      <div className="text-muted">Select a sponsor first.</div>
                    ) : (
                      <>
                        <Form.Group className="mb-3">
                          <Form.Label></Form.Label>
                          <Form.Select
                            value={selectedDeductDriverUsername}
                            onChange={(e) => setSelectedDeductDriverUsername(e.target.value)}
                            disabled={!selectedSponsorUser || !relationships.length}
                          >
                            <option value="">
                              {relationships.length ? "Select a driver" : "No assigned drivers"}
                            </option>
                            {relationships.map((rel, index) => (
                              <option
                                key={rel.driverSponsorId || `${rel.driverId}-${index}`}
                                value={rel.driverId}
                              >
                                {getUserLabel(rel.driverId)}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Control
                            type="number"
                            min="1"
                            value={deductPointsAmount}
                            onChange={(e) => setDeductPointsAmount(e.target.value)}
                            placeholder="Enter points amount"
                          />
                        </Form.Group>

                        <div className="d-flex justify-content-center">
                          <Button
                            style={{ width: "160px", height: "50px" }}
                            variant="outline-danger"
                            onClick={handleDeductPoints}
                            disabled={!selectedSponsorUser || updatingPoints}
                          >
                            Deduct
                          </Button>
                        </div>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={12}>
                  <Card>
                    <Card.Body>
                    <Card.Title><strong>Point-to-Dollar Ratio</strong></Card.Title>

                    <Form.Group className="mb-3">
                        <Form.Label></Form.Label>
                        <Form.Control
                        type="number"
                        step="0.001"
                        min="0.001"
                        max="1.0"
                        value={sponsorRatioInput}
                        onChange={(e) => setSponsorRatioInput(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                        Example: 0.10 means each point is worth $0.10.
                        </Form.Text>
                    </Form.Group>

                    {sponsorRatioError && (
                        <div className="alert alert-danger py-2">{sponsorRatioError}</div>
                    )}

                    {sponsorRatioSuccess && (
                        <div className="alert alert-success py-2">{sponsorRatioSuccess}</div>
                    )}

                    <Button
                        onClick={handleSaveRatio}
                        disabled={savingRatio || !selectedSponsorUser?.username}
                    >
                        {savingRatio ? "Saving..." : "Save Ratio"}
                    </Button>
                    </Card.Body>
                  </Card>
              </Col>
              <Col md={12}>
                <Card>
                    <Card.Body>
                    <Card.Title>
                      <strong>
                        Current Driver Relationships
                      </strong>
                    </Card.Title>
                    <Form.Label></Form.Label>

                    {!selectedSponsorUser ? (
                        <div className="text-muted">Select a sponsor to view assignments.</div>
                    ) : !relationships.length ? (
                        <div className="text-muted">
                        No drivers assigned to this sponsor yet.
                        </div>
                    ) : (
                        <ListGroup>
                        {relationships.map((rel, index) => {
                            const key = rel.driverSponsorId || `${rel.driverId}-${rel.sponsorId}-${index}`;

                            return (
                            <ListGroupItem key={key}>
                                <div className="fw-semibold">{getUserLabel(rel.driverId)}</div>
                                <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                  ID: {rel.driverId}
                                </div>
                                <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                  Current Points: {rel.points ?? 0}
                                </div>
                                <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                  Estimated Dollar Value: $
                                  {getEstimatedDollarAmount
                                    ? getEstimatedDollarAmount(rel.points ?? 0, rel.sponsorId)
                                    : "0.00"}
                                </div>
                            </ListGroupItem>
                            );
                        })}
                        </ListGroup>
                    )}
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
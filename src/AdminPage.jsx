import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from './LanguageContext';
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"
import Tabs from "react-bootstrap/Tabs"
import Tab from"react-bootstrap/Tab"
import { ListGroupItem } from 'react-bootstrap';
import UpdateAbout from './UpdateAbout';
import { fetchUnassignedUsers, assignUserGroup } from './adminAssignRoles-api';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();
const DEFAULT_RATIO = 0.10;
import {
  fetchSponsorRelationships,
  assignDriverToSponsor,
  removeDriverFromSponsor,
  ensureSponsorRecord,
  ensureDriverRecord,
  ensureDriverRecords,
  updateDriverSponsorPoints,
} from "./adminDriverSponsor-api";

import {
  fetchDriverUsers,
  fetchSponsorUsers,
} from "./adminUpdateDriverInfo-api";


import {
  createUser,
  deleteUser,
  fetchAdminUsers,

}from "./adminUserMgmt-api";

function AdminPage(){
  const [editingPoints, setEditingPoints] = useState({});
  const [savingPoints, setSavingPoints] = useState(false);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedPendingUsername, setSelectedPendingUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState("Driver");
  const [loadingPendingUsers, setLoadingPendingUsers] = useState(false);
  const [assigningRole, setAssigningRole] = useState(false);
  const [roleCardMessage, setRoleCardMessage] = useState("");
  const [roleCardError, setRoleCardError] = useState("");

  const [driverUsers, setDriverUsers] = useState([]);
  const [selectedDriverUsername, setSelectedDriverUsername] = useState("");
  const [loadingDriverUsers, setLoadingDriverUsers] = useState(false);
  const [driverUsersError, setDriverUsersError] = useState("");

  const [sponsorUsers, setSponsorUsers] = useState([]);
  const [selectedSponsorUsername, setSelectedSponsorUsername] = useState("");
  const [loadingSponsors, setLoadingSponsors] = useState(false);
  const [sponsorRatioInput, setSponsorRatioInput] = useState(DEFAULT_RATIO.toString());
  const [sponsorRatioError, setSponsorRatioError] = useState("");
  const [sponsorRatioSuccess, setSponsorRatioSuccess] = useState("");
  const [savingRatio, setSavingRatio] = useState(false);
  const [sponsors, setSponsors] = useState([]);
  const [relationshipDrivers, setRelationshipDrivers] = useState([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState("");
  const [selectedRelationshipDriverId, setSelectedRelationshipDriverId] = useState("");
  const [relationships, setRelationships] = useState([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);
  const [relationshipMessage, setRelationshipMessage] = useState("");
  const [relationshipError, setRelationshipError] = useState("");

  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTempPassword, setNewTempPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("Driver");
  const [newMgmtMessage, setNewMgmtMessage] = useState("");
  const [userMgmtError, setUserMgmtError] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [allManagedUsers, setAllManagedUsers] = useState([]);
  const [selectedManagedUsername, setSelectedManagedUsername] = useState("");


  const selectedDriverUser = useMemo(
    () => driverUsers.find((u) => u.username === selectedDriverUsername) ?? null,
    [driverUsers, selectedDriverUsername]
  );

  const safeArray = (value) => (Array.isArray(value) ? value : []);

  const pickSelected = (items, currentValue, key) => {
    if (currentValue && items.some((item) => item[key] === currentValue)) {
      return currentValue;
    }
    return items[0]?.[key] || "";
  };

  const loadSponsorRatio = async (username) => {
    try {
      const result = await client.models.Sponsor.get({ sponsorId: username });
      const ratio = result?.data?.pointToDollarRatio ?? DEFAULT_RATIO;
      setSponsorRatioInput(ratio.toString());
      setSponsorRatioError("");
      setSponsorRatioSuccess("");
    } catch (error) {
      console.error(error);
      setSponsorRatioInput(DEFAULT_RATIO.toString());
    }
  };

  const handleSaveRatio = async () => {
    const num = parseFloat(sponsorRatioInput);
    if (isNaN(num) || num < 0.001 || num > 1.0) {
      setSponsorRatioError("Ratio must be between 0.001 and 1.0");
      return;
    }
    try {
      setSavingRatio(true);
      setSponsorRatioError("");

      if (!selectedSponsorId) {
        setSponsorRatioError("Please select a sponsor.");
        return;
      }

      const existing = await client.models.Sponsor.get({ sponsorId: selectedSponsorId });

      if (existing?.data) {
        await client.models.Sponsor.update({
          sponsorId: selectedSponsorId,
          pointToDollarRatio: num,
        });
      } else {
        await client.models.Sponsor.create({
          sponsorId: selectedSponsorId,
          pointToDollarRatio: num,
        });
      }
      setSponsorRatioSuccess("Ratio saved successfully!");
      setTimeout(() => setSponsorRatioSuccess(""), 3000);
    } catch (error) {
      console.error(error);
      setSponsorRatioError("Failed to save ratio.");
    } finally {
      setSavingRatio(false);
    }
  };
  const clearRoleStatus = () => {
    setRoleCardError("");
    setRoleCardMessage("");
  };

  const clearRelationshipStatus = () => {
    setRelationshipError("");
    setRelationshipMessage("");
  };


  const selectedPendingUser = useMemo(() => unassignedUsers.find((u) => u.username === selectedPendingUsername) ?? null, [unassignedUsers, selectedPendingUsername]);
  
  const loadUnassignedUsers = async () => {
    try {
      setLoadingPendingUsers(true);
      clearRoleStatus();

      const users = safeArray(await fetchUnassignedUsers());

      setUnassignedUsers(users);
      setSelectedPendingUsername((prev) => pickSelected(users, prev, "username"));
    } catch (error) {
      console.error(error);
      setRoleCardError("Failed to load unassigned users.");
    } finally {
      setLoadingPendingUsers(false);
    }
  };

  useEffect(() => {
  loadDriverUsers();
  loadUnassignedUsers();
  loadSponsors();
  loadRelationshipDrivers();
  loadManagedUsers();
  }, []);

  useEffect(() => {
  if (selectedSponsorId) {
    loadRelationships(selectedSponsorId);
    loadSponsorRatio(selectedSponsorId);
  } else {
    setSponsorRatioInput(DEFAULT_RATIO.toString());
    setSponsorRatioError("")
    setSponsorRatioSuccess("");
  }
  }, [selectedSponsorId]);

  const handleAssignRole = async () => {
    if (!selectedPendingUser) return;

    try {
      setAssigningRole(true);
      setRoleCardError("");
      setRoleCardMessage("");

      await assignUserGroup(selectedPendingUser.username, selectedRole);

      if (selectedRole === "Sponsor") {
        await ensureSponsorRecord(selectedPendingUser);
        await loadSponsors();
      }

      if (selectedRole === "Driver") {
        await ensureDriverRecord(selectedPendingUser);
        await loadRelationshipDrivers();
        await loadDriverUsers();
      }

      setRoleCardMessage(
        `${selectedPendingUser.name || selectedPendingUser.username} assigned to ${selectedRole}.`
      );

      const updatedUsers = unassignedUsers.filter(
        (u) => u.username !== selectedPendingUser.username
      );
      setUnassignedUsers(updatedUsers);
      setSelectedPendingUsername(updatedUsers[0]?.username ?? "");
    } catch (error) {
      console.error(error);
      setRoleCardError("Failed to assign role.");
    } finally {
      setAssigningRole(false);
    }
  };

  const handleDismissUnassignedUser = () => {
    if (!selectedPendingUser) return;

    const updatedUsers = unassignedUsers.filter((u) => u.username !== selectedPendingUser.username);

    setUnassignedUsers(updatedUsers);
    setSelectedPendingUsername(updatedUsers[0]?.username ?? "");
    setRoleCardMessage(`${selectedPendingUser.name || selectedPendingUser.username} removed from the list.`);
    setRoleCardError("");
  };

  const { t } = useLanguage();
    /*setLogs(prev => [
      {
        driver: selectedDriver.name,
        change: value,
        reason: description || "No Reason Provided",
        time: timestamp
      },
      ...prev
    ]);
    setDescription("");
  };
  */
  const navigate = useNavigate();

  const handleAdminAccountTakeover = () => {
  if (!selectedDriverUser) return;
  navigate(`/admin/drivers/${selectedDriverUser.username}/edit`);
  };


    //Driver Handlers
  const loadDriverUsers = async () => {
    try {
      setLoadingDriverUsers(true);
      setDriverUsersError("");

      const users = safeArray(await fetchDriverUsers());

      setDriverUsers(users);
      setSelectedDriverUsername((prev) => pickSelected(users, prev, "username"));
    } catch (error) {
      console.error(error);
      setDriverUsersError("Failed to load drivers.");
    } finally {
      setLoadingDriverUsers(false);
    }
  };

  //Sponsor User Handlers
  const loadSponsors = async () => {
    try {
      setLoadingSponsors(true);
      setRelationshipError("");

      const sponsorUsers = safeArray(await fetchSponsorUsers());
      const ensuredSponsors = [];

      for (const user of sponsorUsers) {
        const sponsorRecord = await ensureSponsorRecord(user);
        if (sponsorRecord) ensuredSponsors.push(sponsorRecord);
      }

      setSponsors(ensuredSponsors);
      setSelectedSponsorId((prev) => pickSelected(ensuredSponsors, prev, "sponsorId"));
    } catch (error) {
      console.error(error);
      setRelationshipError("Failed to load sponsors.");
    } finally {
      setLoadingSponsors(false);
    }
  };

  const loadRelationshipDrivers = async () => {
    try {
      setRelationshipError("");

      const cognitoDrivers = safeArray(await fetchDriverUsers());
      const ensuredDrivers = await ensureDriverRecords(cognitoDrivers);

      setRelationshipDrivers(ensuredDrivers);
      setSelectedRelationshipDriverId((prev) =>
        pickSelected(ensuredDrivers, prev, "driverId")
      );
    } catch (error) {
      console.error(error);
      setRelationshipError("Failed to load drivers for relationships.");
    }
  };

  const loadRelationships = async (sponsorId) => {
    if (!sponsorId) {
      setRelationships([]);
      return;
    }

    try {
      setLoadingRelationships(true);
      setRelationshipError("");

      const data = await fetchSponsorRelationships(sponsorId);
      const relationshipList = Array.isArray(data) ? data : [];

      setRelationships(relationshipList);

      const nextEditingPoints = {};
      relationshipList.forEach((rel) => {
        nextEditingPoints[`${rel.driverId}-${rel.sponsorId}`] = rel.points ?? 0;
      });
      setEditingPoints(nextEditingPoints);
    } catch (error) {
      console.error(error);
      setRelationshipError("Failed to load sponsor relationships.");
    } finally {
      setLoadingRelationships(false);
    }
  };




  //Relationship Handlers
  const handleAssignDriverToSponsor = async () => {
    if (!selectedSponsorId || !selectedRelationshipDriverId) {
      setRelationshipError("Please select both a sponsor and a driver.");
      return;
    }

    try {
      setRelationshipError("");
      setRelationshipMessage("");

      // optional local duplicate check for friendlier UX
      const alreadyAssigned = relationships.some(
        (rel) =>
          rel.driverId === selectedRelationshipDriverId &&
          rel.sponsorId === selectedSponsorId
      );

      if (alreadyAssigned) {
        setRelationshipMessage("Driver is already assigned to this sponsor.");
        return;
      }

      await assignDriverToSponsor(selectedRelationshipDriverId, selectedSponsorId);

      setRelationshipMessage("Driver assigned to sponsor.");
      await loadRelationships(selectedSponsorId);
    } catch (error) {
      console.error(error);
      setRelationshipError("Failed to assign driver to sponsor.");
    }
  };

  const handleRemoveRelationship = async (driverId, sponsorId) => {
    try {
      setRelationshipError("");
      setRelationshipMessage("");

      await removeDriverFromSponsor(driverId, sponsorId);

      setRelationshipMessage("Driver removed from sponsor.");
      await loadRelationships(sponsorId);
    } catch (error) {
      console.error(error);
      setRelationshipError("Failed to remove relationship.");
    }
  };

  const handleSaveRelationshipPoints = async (driverId, sponsorId) => {
    const key = `${driverId}-${sponsorId}`;
    const rawValue = editingPoints[key];

    if (rawValue === undefined || rawValue === "") {
      setRelationshipError("Please enter a points value.");
      return;
    }

    const parsedPoints = Number(rawValue);

    if (Number.isNaN(parsedPoints)) {
      setRelationshipError("Points must be a valid number.");
      return;
    }

    try {
      setSavingPoints(true);
      setRelationshipError("");
      setRelationshipMessage("");

      await updateDriverSponsorPoints(driverId, sponsorId, parsedPoints);

      setRelationshipMessage("Points updated successfully.");
      await loadRelationships(selectedSponsorId);
    } catch (error) {
      console.error(error);
      setRelationshipError("Failed to update points.");
    } finally {
      setSavingPoints(false);
    }
  };







    const loadManagedUsers = async () => {
    try {
      const [unassigned, drivers, sponsors, admins] = await Promise.all([
        fetchUnassignedUsers(),
        fetchDriverUsers(),
        fetchSponsorUsers(),
        fetchAdminUsers(),
      ]);

      const combined = [
        ...(unassigned || []),
        ...(drivers || []),
        ...(sponsors || []),
        ...(admins || []),
      ];

      const deduped = Array.from(
        new Map(combined.map((u) => [u.username, u])).values()
      );

      setAllManagedUsers(deduped);
      setSelectedManagedUsername(deduped[0]?.username || "");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async() => {
    if(!newUsername || !newEmail || !newTempPassword){
      setUserMgmtError("All Fields Required");
      return;
    }
    try{
      setCreatingUser(true);
      setUserMgmtError("");
      setNewMgmtMessage("");

      await createUser({
        username: newUsername,
        email: newEmail,
        temporaryPassword: newTempPassword,
        group: newUserRole,
      });
      setNewMgmtMessage("User Created Successfully");

      setNewUsername("");
      setNewEmail("");
      setNewTempPassword("");
      setNewUserRole("Driver");

      await loadUnassignedUsers();
      await loadDriverUsers();
      await loadSponsors();
    } catch(err){
        console.error("create user error:", err);
        setUserMgmtError(
          err?.message ||
          err?.response?.data?.message ||
          err?.errors?.[0]?.message ||
          "Failed to create user"
        );
    } finally{
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if(!selectedManagedUsername){
      setUserMgmtError("select a user to delete");
      return;
      
    }
    try{
      setDeletingUser(true);
      setUserMgmtError("");
      setNewMgmtMessage("");

      await deleteUser(selectedManagedUsername);

      setNewMgmtMessage(`${selectedManagedUsername} deleted.`);

      setAllManagedUsers((prev) =>
      prev.filter((u) => u.username !== selectedManagedUsername)
    );
    setSelectedManagedUsername("");

    } catch(err){
      console.error(err);
      setUserMgmtError("Failed to delete user");
    } finally {
      setDeletingUser(false);
    }
  };

  const getSponsorRatio = (sponsorId) => {
    const sponsor = sponsors.find((s) => s.sponsorId === sponsorId);
    return sponsor?.pointToDollarRatio ?? DEFAULT_RATIO;
  };

  const getEstimatedDollarAmount = (points, sponsorId) => {
    const ratio = getSponsorRatio(sponsorId);
    return (Number(points || 0) * Number(ratio || DEFAULT_RATIO)).toFixed(2);
  };


  const getUserLabel = (username) => {
    const driverMatch = driverUsers.find((u) => u.username === username);
    if (driverMatch) {
      return (
        driverMatch.preferred_username ||
        driverMatch.name ||
        driverMatch.email ||
        driverMatch.username
      );
    }
    const sponsorMatch = sponsors.find((s) => s.sponsorId === username);
    if (sponsorMatch) {
      return sponsorMatch.affiliation || sponsorMatch.sponsorId;
    }
    const genericMatch = allManagedUsers.find((u) => u.username === username);
    if (genericMatch) {
      return (
        genericMatch.preferred_username ||
        genericMatch.name ||
        genericMatch.email ||
        genericMatch.username
      );
    }

    return username;
  };


  return(
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
        <h1><strong>{t('admin.title')}</strong></h1>
          <Tabs defaultActiveKey="pendingUsers" className="mb-4">
          <Tab eventKey="pendingUsers" title="Pending Users">
            <Row>
            <Col md={5}>
                <Card className="mb-4">
                  <Card.Body>
                    <Card.Title>Assign Role</Card.Title>
                      {roleCardError && (<div className="alert alert-danger py-2">{roleCardError}</div>)}
                      {roleCardMessage && (<div className="alert alert-success py-2">{roleCardMessage}</div>)}
                      {loadingPendingUsers ? (<div className="text-muted">Loading unassigned users...</div>) : 
                        !unassignedUsers.length ? (<div className="text-muted">No unassigned users found.</div>) : 
                      (
                        <>
                          <ListGroup className="mb-3">
                            {unassignedUsers.map((user) => (
                              <ListGroupItem
                                key={user.username}
                                action
                                active={user.username === selectedPendingUsername}
                                onClick={() => setSelectedPendingUsername(user.username)}
                              >
                                <div className="fw-semibold">
                                  {user.name || user.preferred_username || user.username}
                                </div>
                                <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                  {user.email || user.username}
                                </div>
                              </ListGroupItem>
                            ))}
                          </ListGroup>

                          {selectedPendingUser && (
                            <>
                              <div className="mb-3">
                                <strong>Selected User:</strong><br />
                                {selectedPendingUser.name || "No name"}<br />
                                <span className="text-muted">
                                  {selectedPendingUser.email || selectedPendingUser.username}
                                </span>
                              </div>

                              <Form.Group className="mb-3">
                                <Form.Label>Assign Group</Form.Label>
                                <Form.Select
                                  value={selectedRole}
                                  onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                  <option value="Admin">Admin</option>
                                  <option value="Driver">Driver</option>
                                  <option value="Sponsor">Sponsor</option>
                                </Form.Select>
                              </Form.Group>

                              <div className="d-flex justify-content-center gap-4">
                                <Button style={{ width: "160px", height: "50px" }} onClick={handleAssignRole} disabled={assigningRole}>{assigningRole ? "Assigning..." : "Assign Role"}</Button>
                                <Button style={{ width: "160px", height: "50px" }} variant="outline-secondary" onClick={handleDismissUnassignedUser}>Remove From List</Button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                      <Button style={{ width: "160px", height: "50px" }} variant="outline-secondary" className="mt-3" onClick={loadUnassignedUsers} disabled={loadingPendingUsers}>Refresh</Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>          <Tab eventKey="updateAbout" title="Update About">
            <UpdateAbout />
          </Tab>

          <Tab eventKey="audit" title={t('admin.logsReports')}>
            <div className="text-muted p-3">Audit log coming soon.</div>
          </Tab>

          <Tab eventKey="relationships" title="Sponsor Assignments">
              <Row>
                <Col md={5}>
                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title>Assign Driver to Sponsor</Card.Title>

                      {relationshipError && (
                        <div className="alert alert-danger py-2">{relationshipError}</div>
                      )}

                      {relationshipMessage && (
                        <div className="alert alert-success py-2">{relationshipMessage}</div>
                      )}

                      {loadingSponsors ? (
                        <div className="text-muted">Loading sponsors...</div>
                      ) : !sponsors.length ? (
                        <div className="text-muted">No sponsors found.</div>
                      ) : (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label>Select Sponsor</Form.Label>
                            <Form.Select
                              value={selectedSponsorId}
                              onChange={(e) => setSelectedSponsorId(e.target.value)}
                            >
                              <option value="">Choose a sponsor</option>
                              {sponsors.map((sponsor) => (
                                <option key={sponsor.sponsorId} value={sponsor.sponsorId}>
                                  {sponsor.affiliation || sponsor.sponsorId}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Point-to-Dollar Ratio</Form.Label>
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

                          <Button onClick={handleSaveRatio} disabled={savingRatio || !selectedSponsorId}>
                            {savingRatio ? "Saving..." : "Save Ratio"}
                          </Button>
                          <Form.Group className="mb-3">
                            <Form.Label>Select Driver</Form.Label>
                            <Form.Select
                              value={selectedRelationshipDriverId}
                              onChange={(e) => setSelectedRelationshipDriverId(e.target.value)}
                            >
                              <option value="">Choose a driver</option>
                              {relationshipDrivers.map((driver) => (
                                <option key={driver.driverId} value={driver.driverId}>
                                  {getUserLabel(driver.driverId)}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>

                          <div className="d-flex gap-2">
                            <Button onClick={handleAssignDriverToSponsor}>
                              Assign Driver
                            </Button>
                            <Button
                              variant="outline-secondary"
                              onClick={() => {
                                loadSponsors();
                                loadRelationshipDrivers();
                                if (selectedSponsorId) loadRelationships(selectedSponsorId);
                              }}
                            >
                              Refresh
                            </Button>
                          </div>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={7}>
                  <Card>
                    <Card.Body>
                      <Card.Title>
                        Current Relationships
                        {selectedSponsorId ? ` (${getUserLabel(selectedSponsorId)})` : ""}
                      </Card.Title>

                      {loadingRelationships ? (
                        <div className="text-muted">Loading relationships...</div>
                      ) : !selectedSponsorId ? (
                        <div className="text-muted">Select a sponsor to view assignments.</div>
                      ) : !relationships.length ? (
                        <div className="text-muted">No drivers assigned to this sponsor yet.</div>
                      ) : (
                        <ListGroup>
                          {relationships.map((rel) => {
                            const key = `${rel.driverId}-${rel.sponsorId}`;

                            return (
                              <ListGroupItem
                                key={key}
                                className="d-flex justify-content-between align-items-center"
                              >
                                <div style={{ flex: 1 }}>
                                  <div className="fw-semibold">{getUserLabel(rel.driverId)}</div>
                                  <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                    ID: {rel.driverId}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                    Current Points: {rel.points ?? 0}
                                  </div>
                                  <div classname="text-muted" style={{fontSize: "0.9rem" }}>
                                    Estimated Value: ${getEstimatedDollarAmount(editingPoints[key] ?? rel.points, rel.sponsorId)}
                                  </div>
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                  <Form.Control
                                    type="number"
                                    style={{ width: "100px" }}
                                    value={editingPoints[key] ?? 0}
                                    onChange={(e) =>
                                      setEditingPoints((prev) => ({
                                        ...prev,
                                        [key]: e.target.value,
                                      }))
                                    }
                                  />

                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleSaveRelationshipPoints(rel.driverId, rel.sponsorId)
                                    }
                                    disabled={savingPoints}
                                  >
                                    Save
                                  </Button>

                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveRelationship(rel.driverId, rel.sponsorId)
                                    }
                                  >
                                    Remove
                                  </Button>
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
            </Tab>
            <Tab eventKey="UserManagement" title = "User Management">
              <Row>
                {/* CREATE USER */}
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title>Create User</Card.Title>

                      {userMgmtError && <div className="alert alert-danger">{userMgmtError}</div>}
                      {newMgmtMessage && <div className="alert alert-success">{newMgmtMessage}</div>}

                      <Form.Group className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Confirm Email</Form.Label>
                        <Form.Control value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Password</Form.Label>
                        <Form.Control value={newTempPassword} onChange={(e) => setNewTempPassword(e.target.value)} />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Role</Form.Label>
                        <Form.Select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                          <option value="Admin">Admin</option>
                          <option value="Driver">Driver</option>
                          <option value="Sponsor">Sponsor</option>
                        </Form.Select>
                      </Form.Group>

                      <Button onClick={handleCreateUser} disabled={creatingUser}>
                        {creatingUser ? "Creating..." : "Create"}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                {/* DELETE USER */}
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title>Delete User</Card.Title>

                      <ListGroup className="mb-3">
                        {allManagedUsers.map((user) => (
                          <ListGroupItem
                            key={user.username}
                            action
                            active={user.username === selectedManagedUsername}
                            onClick={() => setSelectedManagedUsername(user.username)}
                          >
                            {getUserLabel(user.username)}
                          </ListGroupItem>
                        ))}
                      </ListGroup>

                      <Button variant="danger" onClick={handleDeleteUser} disabled={deletingUser}>
                        {deletingUser ? "Deleting..." : "Delete"}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
  </Tabs>
 </div>
</Container>
  );  
}

export default AdminPage;
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
import { fetchUnassignedUsers, assignUserGroup } from './adminAssignRoles-api';
import {
  fetchDriverUsersFromData,
  fetchSponsorRelationships,
  assignDriverToSponsor,
  removeDriverFromSponsor,
  ensureSponsorRecord,
  ensureDriverRecord,
} from "./adminDriverSponsor-api";

import {
  fetchDriverUsers,
  fetchSponsorGroupUsers,
} from "./adminUpdateDriverInfo-api";



function AdminPage(){

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
  const [sponsors, setSponsors] = useState([]);
  const [relationshipDrivers, setRelationshipDrivers] = useState([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState("");
  const [selectedRelationshipDriverId, setSelectedRelationshipDriverId] = useState("");
  const [relationships, setRelationships] = useState([]);
  const [loadingSponsors, setLoadingSponsors] = useState(false);
  const [loadingRelationships, setLoadingRelationships] = useState(false);
  const [relationshipMessage, setRelationshipMessage] = useState("");
  const [relationshipError, setRelationshipError] = useState("");



  const selectedDriverUser = useMemo(
    () => driverUsers.find((u) => u.username === selectedDriverUsername) ?? null,
    [driverUsers, selectedDriverUsername]
  );

  const loadDriverUsers = async () => {
    try {
      setLoadingDriverUsers(true);
      setDriverUsersError("");

      const data = await fetchDriverUsers();
      const users = Array.isArray(data) ? data : [];

      setDriverUsers(users);
      setSelectedDriverUsername((prev) => {
        if (prev && users.some((u) => u.username === prev)) return prev;
        return users[0]?.username ?? "";
      });
    } catch (error) {
      console.error(error);
      setDriverUsersError("Failed to load drivers.");
    } finally {
      setLoadingDriverUsers(false);
    }
  };

  const selectedPendingUser = useMemo(() => unassignedUsers.find((u) => u.username === selectedPendingUsername) ?? null, [unassignedUsers, selectedPendingUsername]);
  
  const loadUnassignedUsers = async () => {
    try {
      setLoadingPendingUsers(true);
      setRoleCardError("");
      setRoleCardMessage("");

      const data = await fetchUnassignedUsers();
      const users = Array.isArray(data) ? data : [];

      setUnassignedUsers(users);
      setSelectedPendingUsername((prev) => {
        if (prev && users.some((u) => u.username === prev)) return prev;
        return users[0]?.username ?? "";
      });
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
  }, []);

  useEffect(() => {
  if (selectedSponsorId) {
    loadRelationships(selectedSponsorId);
  } else {
    setRelationships([]);
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













  const loadSponsors = async () => {
    try {
      setLoadingSponsors(true);
      setRelationshipError("");

      const data = await fetchSponsorGroupUsers();
      const sponsorUsers = Array.isArray(data) ? data : [];

      // make sure each sponsor-group user has a Sponsor row
      const ensuredSponsors = [];
      for (const user of sponsorUsers) {
        const sponsorRecord = await ensureSponsorRecord(user);
        if (sponsorRecord) {
          ensuredSponsors.push(sponsorRecord);
        }
      }

      setSponsors(ensuredSponsors);
      setSelectedSponsorId((prev) => {
        if (prev && ensuredSponsors.some((s) => s.sponsorId === prev)) return prev;
        return ensuredSponsors[0]?.sponsorId || "";
      });
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

      const data = await fetchDriverUsersFromData();
      const driversList = Array.isArray(data) ? data : [];

      setRelationshipDrivers(driversList);
      setSelectedRelationshipDriverId((prev) => {
        if (prev && driversList.some((d) => d.driverId === prev)) return prev;
        return driversList[0]?.driverId || "";
      });
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
      setRelationships(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setRelationshipError("Failed to load sponsor relationships.");
    } finally {
      setLoadingRelationships(false);
    }
  };

  const handleAssignDriverToSponsor = async () => {
    if (!selectedSponsorId || !selectedRelationshipDriverId) {
      setRelationshipError("Please select both a sponsor and a driver.");
      return;
    }

    try {
      setRelationshipError("");
      setRelationshipMessage("");

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
                            <Form.Label>Select Driver</Form.Label>
                            <Form.Select
                              value={selectedRelationshipDriverId}
                              onChange={(e) => setSelectedRelationshipDriverId(e.target.value)}
                            >
                              <option value="">Choose a driver</option>
                              {relationshipDrivers.map((driver) => (
                                <option key={driver.driverId} value={driver.driverId}>
                                  {driver.driverId}
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
                        {selectedSponsorId ? ` (${selectedSponsorId})` : ""}
                      </Card.Title>

                      {loadingRelationships ? (
                        <div className="text-muted">Loading relationships...</div>
                      ) : !selectedSponsorId ? (
                        <div className="text-muted">Select a sponsor to view assignments.</div>
                      ) : !relationships.length ? (
                        <div className="text-muted">No drivers assigned to this sponsor yet.</div>
                      ) : (
                        <ListGroup>
                          {relationships.map((rel) => (
                            <ListGroupItem
                              key={`${rel.driverId}-${rel.sponsorId}`}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <div className="fw-semibold">{rel.driverId}</div>
                                <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                  Points: {rel.points || 0}
                                </div>
                              </div>

                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  handleRemoveRelationship(rel.driverId, rel.sponsorId)
                                }
                              >
                                Remove
                              </Button>
                            </ListGroupItem>
                          ))}
                        </ListGroup>
                      )}
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
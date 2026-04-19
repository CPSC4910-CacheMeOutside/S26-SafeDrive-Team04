import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";import { useLanguage } from "./LanguageContext";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import { ListGroupItem } from "react-bootstrap";
import UpdateAbout from "./UpdateAbout";
import { fetchUnassignedUsers, assignUserGroup } from "./adminAssignRoles-api";
import { generateClient } from "aws-amplify/data";
import ManageSponsorsTab from "./ManageSponsorsTab";
import ManageAdminsTab from "./ManageAdminsTab";

const client = generateClient();
const DEFAULT_RATIO = 0.1;

import {
  fetchSponsorRelationships,
  ensureSponsorRecord,
  ensureDriverRecord,
  ensureDriverRecords,
  updateDriverSponsorPoints,
} from "./adminDriverSponsor-api";

import { fetchDriverUsers, fetchSponsorUsers } from "./adminUpdateDriverInfo-api";
import { startDriverView } from "./adminDriverView-api";

import {
  createUser,
  deleteUser,
  fetchAdminUsers,

}from "./adminUserMgmt-api";

function AdminPage() {
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
  const [activeTab, setActiveTab] = useState("manage");

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
  const [selectedAssignedSponsorId, setSelectedAssignedSponsorId] = useState("");
  const [selectedRelationshipDriverId, setSelectedRelationshipDriverId] = useState("");
  const [driverRelationships, setDriverRelationships] = useState([]);
  const [sponsorRelationships, setSponsorRelationships] = useState([]);
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
  const [assignMessage, setAssignMessage] = useState("");
  const [assignError, setAssignError] = useState("");
  const [removeMessage, setRemoveMessage] = useState("");
  const [removeError, setRemoveError] = useState("");

  const [awardPointsAmount, setAwardPointsAmount] = useState("");
  const [deductPointsAmount, setDeductPointsAmount] = useState("");
  const [awardMessage, setAwardMessage] = useState("");
  const [awardError, setAwardError] = useState("");
  const [deductMessage, setDeductMessage] = useState("");
  const [deductError, setDeductError] = useState("");
  const [updatingDriverPoints, setUpdatingDriverPoints] = useState(false);
  const [selectedDriverRecord, setSelectedDriverRecord] = useState(null);
  const [selectedSponsorUser, setSelectedSponsorUser] = useState(null);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [selectedAwardSponsorId, setSelectedAwardSponsorId] = useState("");
  const [selectedDeductSponsorId, setSelectedDeductSponsorId] = useState("");

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
    setAssignError("");
    setAssignMessage("");
  };

  const selectedPendingUser = useMemo(
    () => unassignedUsers.find((u) => u.username === selectedPendingUsername) ?? null,
    [unassignedUsers, selectedPendingUsername]
  );

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
  if (selectedSponsorId) {
    loadRelationships(selectedSponsorId);
    loadSponsorRatio(selectedSponsorId);
  } else {
    setSponsorRatioInput(DEFAULT_RATIO.toString());
    setSponsorRatioError("")
    setSponsorRatioSuccess("");
  }
  }, [selectedSponsorId]);
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

  const loadSelectedDriverRecord = async (driverId) => {
    if (!driverId) {
      setSelectedDriverRecord(null);
      return;
    }
    try {
      const result = await client.models.Driver.get({ driverId });
      setSelectedDriverRecord(result?.data ?? null);
    } catch (error) {
      console.error(error);
      setSelectedDriverRecord(null);
    }
  };

  const loadSponsors = async () => {
    try {
      setLoadingSponsors(true);
      setRelationshipError("");

      const sponsorUsers = safeArray(await fetchSponsorUsers());

      setSponsors(sponsorUsers);
      setSelectedSponsorId((prev) =>
        sponsorUsers.some((s) => (s.sponsorId || s.username) === prev)
          ? prev
          : ""
      );
    } catch (error) {
      console.error(error);
      setRelationshipError("Failed to load sponsors.");
    } finally {
      setLoadingSponsors(false);
    }
  };
  useEffect(() => {
    loadDriverUsers();
    loadUnassignedUsers();
    loadSponsors();
    loadRelationshipDrivers();
    loadManagedUsers();
  }, []);

  const loadDriverRelationships = async (driverId) => {
    if (!driverId) {
      setDriverRelationships([]);
      return;
    }
    try {
      setLoadingRelationships(true);
      setRelationshipError("");
      const data = await client.models.DriverSponsor.list({
        filter: { driverId: { eq: driverId } },
      });
      const relationshipList = Array.isArray(data?.data) ? data.data : [];
      setDriverRelationships(relationshipList);
      const nextEditingPoints = {};
      relationshipList.forEach((rel) => {
        nextEditingPoints[`${rel.driverId}-${rel.sponsorId}`] = rel.points ?? 0;
      });
      setEditingPoints(nextEditingPoints);
    } catch (error) {
      console.error(error);
      setRelationshipError("Failed to load driver sponsors.");
    } finally {
      setLoadingRelationships(false);
    }
  };

  useEffect(() => {
    if (selectedDriverUser?.username) {
      loadDriverRelationships(selectedDriverUser.username);
    } else {
      setDriverRelationships([]);
    }
  }, [selectedDriverUser]);

  useEffect(() => {
    if (selectedDriverUser?.username) {
      loadSelectedDriverRecord(selectedDriverUser.username);
    } else {
      setSelectedDriverRecord(null);
    }
  }, [selectedDriverUser]);

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

      setRoleCardMessage(`${selectedPendingUser.name || selectedPendingUser.username} assigned to ${selectedRole}.`);

      const updatedUsers = unassignedUsers.filter((u) => u.username !== selectedPendingUser.username);
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
  const navigate = useNavigate();

  const handleAdminAccountTakeover = () => {
    if (!selectedDriverUser) return;
    navigate(`/admin/drivers/${selectedDriverUser.id}/edit`);
  };

  const handleViewDriverAccount = async () => {
    if (!selectedDriverUser) return;
    try {
      const data = await startDriverView(selectedDriverUser.username);
      localStorage.setItem(
        "driverViewSession",
        JSON.stringify({
          sessionId: data.sessionId,
          driverUsername: data.driverUsername,
          driverName: data.driverName,
          driverEmail: selectedDriverUser.email || "",
          driverPhone: selectedDriverUser.phone_number || "",
          expiresAt: data.expiresAt,
        })
      );
      navigate("/DriverPage?adminView=1");
    } catch (error) {
      console.error("Error: Failed to start driver view", error);
      alert(error?.message || "Could not open driver account view.");
    }
  };

  const loadRelationshipDrivers = async () => {
    try {
      setRelationshipError("");

      const cognitoDrivers = safeArray(await fetchDriverUsers());
      const ensuredDrivers = await ensureDriverRecords(cognitoDrivers);

      setRelationshipDrivers(ensuredDrivers);
      setSelectedRelationshipDriverId((prev) => pickSelected(ensuredDrivers, prev, "driverId"));
    } catch (error) {
      console.error(error);
      setRelationshipError("Failed to load drivers for relationships.");
    }
  };

  const loadRelationships = useCallback(async (sponsorId) => {
    if (!sponsorId) {
      setSponsorRelationships([]);
      return;
    }

    try {
      setLoadingRelationships(true);
      setRelationshipError("");

      const data = await fetchSponsorRelationships(sponsorId);
      const relationshipList = Array.isArray(data) ? data : [];

      setSponsorRelationships(relationshipList);

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
  }, []);

  const availableSponsors = sponsors.filter(
    (sponsor) => !driverRelationships.some((rel) => rel.sponsorId === sponsor.sponsorId)
  );

  const handleAssignDriverToSponsor = async () => {
    if (!selectedDriverUser || !selectedSponsorId) {
      setAssignError("Please select a driver and a sponsor.");
      setAssignMessage("");
      return;
    }

    try {
      setAssignError("");
      setAssignMessage("");

      const driverId = selectedDriverUser.username;
      const sponsorId = selectedSponsorId;

      const alreadyAssigned = driverRelationships.some(
        (rel) => rel.driverId === driverId && rel.sponsorId === sponsorId
      );

      if (alreadyAssigned) {
        setAssignMessage("Sponsor is already assigned to this driver.");
        return;
      }

      await client.models.DriverSponsor.create({
        driverId,
        sponsorId,
        points: 0,
      });

      setDriverRelationships((prev) => [...prev, { driverId, sponsorId, points: 0 }]);

      setAssignMessage("Sponsor assigned successfully.");
      setSelectedSponsorId("");
    } catch (error) {
      console.error(error);
      setAssignError("Failed to assign sponsor.");
      setAssignMessage("");
    }
  };

  const handleRemoveAssignedSponsor = async () => {
    if (!selectedDriverUser || !selectedAssignedSponsorId) {
      setRemoveError("Please select a sponsor to remove.");
      setRemoveMessage("");
      return;
    }
    try {
      setRemoveError("");
      setRemoveMessage("");
      await client.models.DriverSponsor.delete({
        driverId: selectedDriverUser.username,
        sponsorId: selectedAssignedSponsorId,
      });

      setDriverRelationships((prev) => prev.filter((rel) => rel.sponsorId !== selectedAssignedSponsorId));

      setRemoveMessage("Sponsor removed successfully.");
      setSelectedAssignedSponsorId("");
    } catch (error) {
      console.error(error);
      setRemoveError("Failed to remove sponsor.");
      setRemoveMessage("");
    }
  };

  useEffect(() => {
    if (assignMessage) {
      const timer = setTimeout(() => setAssignMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [assignMessage]);

  useEffect(() => {
    if (assignError) {
      const timer = setTimeout(() => setAssignError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [assignError]);

  useEffect(() => {
    if (removeMessage) {
      const timer = setTimeout(() => setRemoveMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [removeMessage]);

  useEffect(() => {
    if (removeError) {
      const timer = setTimeout(() => setRemoveError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [removeError]);

  const handleAwardPoints = async () => {
    if (!selectedDriverUser) {
      setAwardError("Please select a driver.");
      setAwardMessage("");
      return;
    }

    if (!selectedAwardSponsorId) {
      setAwardError("Please select a sponsor.");
      setAwardMessage("");
      return;
    }

    const amount = Number(awardPointsAmount);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      setAwardError("Enter a valid positive number of points.");
      setAwardMessage("");
      return;
    }

    try {
      setUpdatingDriverPoints(true);
      setAwardError("");
      setAwardMessage("");

      const driverId = selectedDriverUser.username;
      const sponsorId = selectedAwardSponsorId;

      const driverResult = await client.models.Driver.get({ driverId });
      const currentDriverPoints = driverResult?.data?.points ?? 0;

      await client.models.Driver.update({
        driverId,
        points: currentDriverPoints + amount,
      });

      const relResult = await client.models.DriverSponsor.get({
        driverId,
        sponsorId,
      });

      const currentSponsorPoints = relResult?.data?.points ?? 0;

      await client.models.DriverSponsor.update({
        driverId,
        sponsorId,
        points: currentSponsorPoints + amount,
      });

      setAwardMessage("Points awarded successfully.");
      setAwardPointsAmount("");
      setSelectedAwardSponsorId("");
      await loadSelectedDriverRecord(driverId);
      await loadDriverRelationships(driverId);
    } catch (error) {
      console.error(error);
      setAwardError("Failed to award points.");
      setAwardMessage("");
    } finally {
      setUpdatingDriverPoints(false);
    }
  };

  const handleDeductPoints = async () => {
    if (!selectedDriverUser) {
      setDeductError("Please select a driver.");
      setDeductMessage("");
      return;
    }

    if (!selectedDeductSponsorId) {
      setDeductError("Please select a sponsor.");
      setDeductMessage("");
      return;
    }

    const amount = Number(deductPointsAmount);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      setDeductError("Enter a valid positive number of points.");
      setDeductMessage("");
      return;
    }

    try {
      setUpdatingDriverPoints(true);
      setDeductError("");
      setDeductMessage("");

      const driverId = selectedDriverUser.username;
      const sponsorId = selectedDeductSponsorId;
      const driverResult = await client.models.Driver.get({ driverId });
      const currentDriverPoints = driverResult?.data?.points ?? 0;
      const newDriverTotal = Math.max(0, currentDriverPoints - amount);

      await client.models.Driver.update({
        driverId,
        points: newDriverTotal,
      });

      const relResult = await client.models.DriverSponsor.get({
        driverId,
        sponsorId,
      });

      const currentSponsorPoints = relResult?.data?.points ?? 0;
      const newSponsorTotal = Math.max(0, currentSponsorPoints - amount);

      await client.models.DriverSponsor.update({
        driverId,
        sponsorId,
        points: newSponsorTotal,
      });

      setDeductMessage("Points deducted successfully.");
      setDeductPointsAmount("");
      setSelectedDeductSponsorId("");

      await loadSelectedDriverRecord(driverId);
      await loadDriverRelationships(driverId);
    } catch (error) {
      console.error(error);
      setDeductError("Failed to deduct points.");
      setDeductMessage("");
    } finally {
      setUpdatingDriverPoints(false);
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

  const StatusAlert = ({ error, message }) => (
    <>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {message && <div className="alert alert-success py-2">{message}</div>}
    </>
  );

  return (
    <Container fluid className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
        <h1 style={{ fontSize: "60px", fontWeight: "bold" }}>{t("admin.title")}</h1>
        <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <div className="d-flex justify-content-between align-items-center border-bottom mb-4">
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="manage">{t("admin.manageDrivers")}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="manageSponsors">Manage Sponsors</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="manageAdmins">Manage Admins</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="pendingUsers">Manage Pending Users</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="audit">{t("admin.logsReports")}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="manageUsers">Create/Delete Users</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="updateAbout">Update About Info</Nav.Link>
                </Nav.Item>
              </Nav>

              {activeTab === "manage" && (
                <div className="ms-3 pb-2 text-nowrap">
                  <span style={{ color: "black", fontWeight: "600" }} className="me-2">
                    Selected Driver:
                  </span>
                  {selectedDriverUser ? (
                    <span
                      style={{
                        backgroundColor: "#10b981",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontWeight: "500",
                      }}
                    >
                      {selectedDriverUser.name ||
                        selectedDriverUser.preferred_username ||
                        selectedDriverUser.username}
                    </span>
                  ) : (
                    <span className="text-muted">None</span>
                  )}
                </div>
              )}

              {activeTab === "manageAdmins" && (
                <div className="ms-3 pb-2 text-nowrap">
                  <span style={{ color: "black", fontWeight: "600" }} className="me-2">
                    Selected Admin:
                  </span>
                  {selectedAdminUser ? (
                    <span
                      style={{
                        backgroundColor: "#10b981",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontWeight: "500",
                      }}
                    >
                      {selectedAdminUser.name ||
                        selectedAdminUser.preferred_username ||
                        selectedAdminUser.username}
                    </span>
                  ) : (
                    <span className="text-muted">None</span>
                  )}
                </div>
              )}

              {activeTab === "manageSponsors" && (
                <div className="ms-3 pb-2 text-nowrap">
                  <span style={{ color: "black", fontWeight: "600" }} className="me-2">
                    Selected Sponsor:
                  </span>
                  {selectedSponsorUser ? (
                    <span
                      style={{
                        backgroundColor: "#10b981",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontWeight: "500",
                      }}
                    >
                      {selectedSponsorUser.affiliation ||
                        selectedSponsorUser.name ||
                        selectedSponsorUser.preferred_username ||
                        selectedSponsorUser.username}
                    </span>
                  ) : (
                    <span className="text-muted">None</span>
                  )}
                </div>
              )}

              {activeTab === "pendingUsers" && (
                <div className="ms-3 pb-2 text-nowrap">
                  <span style={{ color: "black", fontWeight: "600" }} className="me-2">Selected Pending User:</span>
                  {selectedPendingUser ? (
                    <span
                      style={{
                        backgroundColor: "#10b981",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontWeight: "500",
                      }}
                    >
                      {selectedPendingUser.name ||
                      selectedPendingUser.preferred_username ||
                      selectedPendingUser.username}
                    </span>
                  ) : (
                    <span className="text-muted">None</span>
                  )}
                </div>
              )}
            </div>

            <Tab.Content>
           <Tab.Pane eventKey="manage">
              <Row className="g-4 align-items-start">
                <Col md={4}>
                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title className="mb-4">
                        <strong>Select a Driver</strong>
                      </Card.Title>
                      {loadingDriverUsers ? (
                        <div className="text-muted">Loading drivers...</div>
                      ) : !driverUsers.length ? (
                        <div className="text-muted">No drivers found.</div>
                      ) : (
                        <>
                          <ListGroup className="mb-3">
                            {driverUsers.map((user) => (
                              <ListGroupItem
                                key={user.username}
                                action
                                active={user.username === selectedDriverUsername}
                                onClick={() => setSelectedDriverUsername(user.username)}
                                style={
                                  user.username === selectedDriverUsername
                                    ? { backgroundColor: "#10b981", border: "none", color: "white" }
                                    : {}
                                }
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

                          <Button
                            className="mt-3"
                            style={{ width: "160px", height: "50px" }}
                            variant="outline-secondary"
                            onClick={loadDriverUsers}
                            disabled={loadingDriverUsers}
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
                            <strong>Driver Overview</strong>
                          </Card.Title>
                          {!selectedDriverUser ? (
                            <div className="text-muted">Select a driver to view their overview.</div>
                          ) : (
                            <div className="text-start">
                              <div className="mb-2">
                                <strong>Name:</strong>{" "}
                                {selectedDriverUser.name ||
                                  selectedDriverUser.preferred_username ||
                                  selectedDriverUser.username}
                              </div>

                              <div className="mb-2">
                                <strong>Email:</strong> {selectedDriverUser.email}
                              </div>

                              <div className="mb-2">
                                <strong>Phone:</strong> {selectedDriverUser.phone_number}
                              </div>

                              <div className="mb-2">
                                <strong>Sub ID:</strong> {selectedDriverUser.username}
                              </div>

                              <div className="mb-2">
                                <strong>Sponsors:</strong>{" "}
                                {driverRelationships.length
                                  ? driverRelationships
                                      .map(
                                        (rel) =>
                                          `${getUserLabel(rel.sponsorId)} (${rel.points ?? 0} pts)`
                                      )
                                      .join(", ")
                                  : "No assigned sponsors found."}
                              </div>

                              <div className="mb-2">
                                <strong>Total Points:</strong> {selectedDriverRecord?.points ?? 0}
                              </div>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100">
                        <Card.Body>
                          <Card.Title>
                            <strong>View Account</strong>
                          </Card.Title>
                          <Button
                            className="mt-3"
                            style={{ width: "160px", height: "50px" }}
                            variant="primary"
                            onClick={handleViewDriverAccount}
                            disabled={!selectedDriverUser}
                          >
                            View
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100">
                        <Card.Body>
                          <Card.Title>
                            <strong>Edit Account</strong>
                          </Card.Title>
                          {!selectedDriverUser ? (
                            <div className="text-muted">Select a driver to manage their account.</div>
                          ) : (
                            <Button
                              className="mt-3"
                              style={{ width: "160px", height: "50px" }}
                              variant="primary"
                              onClick={() =>
                                navigate(`/admin/drivers/${selectedDriverUser.username}/edit`)
                              }
                            >
                              Edit
                            </Button>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100">
                        <Card.Body>
                          <Card.Title>
                            <strong>Assign a Sponsor</strong>
                          </Card.Title>
                          <StatusAlert error={assignError} message={assignMessage} />
                          {loadingSponsors ? (
                            <div className="text-muted">Loading sponsors...</div>
                          ) : !sponsors.length ? (
                            <div className="text-muted">No sponsors found.</div>
                          ) : (
                            <>
                              <Form.Group className="mb-3">
                                <Form.Select
                                  value={selectedSponsorId || ""}
                                  onChange={(e) => setSelectedSponsorId(e.target.value)}
                                  disabled={!selectedDriverUser}
                                >
                                  <option value="" disabled>
                                    Select a sponsor
                                  </option>
                                  {availableSponsors.map((sponsor) => (
                                    <option key={sponsor.sponsorId} value={sponsor.sponsorId}>
                                      {sponsor.affiliation || sponsor.sponsorId}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>

                              <div className="d-flex justify-content-center gap-2">
                                <Button
                                  style={{ width: "160px", height: "50px" }}
                                  variant="primary"
                                  onClick={handleAssignDriverToSponsor}
                                >
                                  Assign
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
                            <strong>Remove a Sponsor</strong>
                          </Card.Title>
                          <StatusAlert error={removeError} message={removeMessage} />
                          <Form.Group className="mb-3">
                            <Form.Select
                              value={selectedAssignedSponsorId || ""}
                              onChange={(e) => setSelectedAssignedSponsorId(e.target.value)}
                              disabled={!selectedDriverUser || !driverRelationships.length}
                            >
                              <option value="" disabled>
                                {driverRelationships.length
                                  ? "Select a sponsor"
                                  : "No assigned sponsors"}
                              </option>
                              {driverRelationships.map((rel) => (
                                <option key={rel.sponsorId} value={rel.sponsorId}>
                                  {getUserLabel(rel.sponsorId)}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>

                          <div className="d-flex justify-content-center">
                            <Button
                              style={{ width: "160px", height: "50px" }}
                              variant="outline-danger"
                              onClick={handleRemoveAssignedSponsor}
                              disabled={!selectedDriverUser || !selectedAssignedSponsorId}
                            >
                              Remove
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
                          <StatusAlert error={awardError} message={awardMessage} />
                          {!selectedDriverUser ? (
                            <div className="text-muted">Select a driver first.</div>
                          ) : (
                            <>
                              <Form.Group className="mb-3">
                                <Form.Select
                                  value={selectedAwardSponsorId}
                                  onChange={(e) => setSelectedAwardSponsorId(e.target.value)}
                                  disabled={!selectedDriverUser || !driverRelationships.length}
                                >
                                  <option value="" disabled>
                                    Select a sponsor
                                  </option>
                                  {driverRelationships.map((rel) => (
                                    <option key={rel.sponsorId} value={rel.sponsorId}>
                                      {getUserLabel(rel.sponsorId)}
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
                                  disabled={!selectedDriverUser || updatingDriverPoints}
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
                          <StatusAlert error={deductError} message={deductMessage} />
                          {!selectedDriverUser ? (
                            <div className="text-muted">Select a driver first.</div>
                          ) : (
                            <>
                              <Form.Group className="mb-3">
                                <Form.Select
                                  value={selectedDeductSponsorId}
                                  onChange={(e) => setSelectedDeductSponsorId(e.target.value)}
                                  disabled={!selectedDriverUser || !driverRelationships.length}
                                >
                                  <option value="" disabled>
                                    Select a sponsor
                                  </option>
                                  {driverRelationships.map((rel) => (
                                    <option key={rel.sponsorId} value={rel.sponsorId}>
                                      {getUserLabel(rel.sponsorId)}
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
                                  disabled={!selectedDriverUser || updatingDriverPoints}
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
                          <Card.Title>
                            Current Relationships
                            {selectedSponsorId ? ` (${getUserLabel(selectedSponsorId)})` : ""}
                          </Card.Title>

                          {loadingRelationships ? (
                            <div className="text-muted">Loading relationships...</div>
                          ) : !selectedSponsorId ? (
                            <div className="text-muted">Select a sponsor to view assignments.</div>
                          ) : !sponsorRelationships.length ? (
                            <div className="text-muted">
                              No drivers assigned to this sponsor yet.
                            </div>
                          ) : (
                            <ListGroup>
                              {sponsorRelationships.map((rel) => {
                                const key = `${rel.driverId}-${rel.sponsorId}`;

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
                                      Estimated Value: $
                                      {getEstimatedDollarAmount(
                                        editingPoints[key] ?? rel.points,
                                        rel.sponsorId
                                      )}
                                    </div>
                                  </ListGroupItem>
                                );
                              })}
                            </ListGroup>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={12}>
                      <Card>
                        <Card.Body>
                          <Card.Title>Point-to-Dollar Ratio</Card.Title>

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

                          <Button
                            onClick={handleSaveRatio}
                            disabled={savingRatio || !selectedSponsorId}
                          >
                            {savingRatio ? "Saving..." : "Save Ratio"}
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Tab.Pane>
              <Tab.Pane eventKey="manageSponsors">
                <ManageSponsorsTab
                  sponsorUsers={sponsors}
                  onSelectSponsor={setSelectedSponsorUser}
                  relationships={sponsorRelationships}
                  loadRelationships={loadRelationships}
                  getUserLabel={getUserLabel}
                  driverUsers={driverUsers}
                  assignDriverToSponsor={async (sponsorId, driverId) => {
                    await client.models.DriverSponsor.create({
                      driverId,
                      sponsorId,
                      points: 0,
                    });
                    await loadRelationships(sponsorId);
                  }}
                  removeDriverFromSponsor={async (sponsorId, driverId) => {
                    await client.models.DriverSponsor.delete({
                      driverId,
                      sponsorId,
                    });
                    await loadRelationships(sponsorId);
                  }}
                  awardPointsToDriver={async (sponsorId, driverId, amount) => {
                    const driverResult = await client.models.Driver.get({ driverId });
                    const currentDriverPoints = driverResult?.data?.points ?? 0;

                    await client.models.Driver.update({
                      driverId,
                      points: currentDriverPoints + amount,
                    });

                    const relResult = await client.models.DriverSponsor.get({
                      driverId,
                      sponsorId,
                    });

                    const currentSponsorPoints = relResult?.data?.points ?? 0;

                    await client.models.DriverSponsor.update({
                      driverId,
                      sponsorId,
                      points: currentSponsorPoints + amount,
                    });

                    await loadRelationships(sponsorId);
                  }}
                  deductPointsFromDriver={async (sponsorId, driverId, amount) => {
                    const driverResult = await client.models.Driver.get({ driverId });
                    const currentDriverPoints = driverResult?.data?.points ?? 0;
                    const newDriverTotal = Math.max(0, currentDriverPoints - amount);

                    await client.models.Driver.update({
                      driverId,
                      points: newDriverTotal,
                    });

                    const relResult = await client.models.DriverSponsor.get({
                      driverId,
                      sponsorId,
                    });

                    const currentSponsorPoints = relResult?.data?.points ?? 0;
                    const newSponsorTotal = Math.max(0, currentSponsorPoints - amount);

                    await client.models.DriverSponsor.update({
                      driverId,
                      sponsorId,
                      points: newSponsorTotal,
                    });

                    await loadRelationships(sponsorId);
                  }}
                />
              </Tab.Pane>

              <Tab.Pane eventKey="manageAdmins">
                <ManageAdminsTab onSelectAdmin={setSelectedAdminUser} />
              </Tab.Pane>

              <Tab.Pane eventKey="pendingUsers" title="Pending Users">
                <Row className="g-4 align-items-start">
                  <Col md={4}>
                    <Card className="mb-4">
                      <Card.Body>
                        <Card.Title className="mb-4"><strong>Select a Pending User</strong></Card.Title>
                        {roleCardError && <div className="alert alert-danger py-2">{roleCardError}</div>}
                        {loadingPendingUsers ? (
                          <div className="text-muted">Loading unassigned users...</div>
                        ) : !unassignedUsers.length ? (
                          <div className="text-muted">No unassigned users found.</div>
                        ) : (
                          <>
                            <ListGroup className="mb-3">
                              {unassignedUsers.map((user) => (
                                <ListGroupItem
                                  key={user.username}
                                  action
                                  active={user.username === selectedPendingUsername}
                                  onClick={() => setSelectedPendingUsername(user.username)}
                                  style={
                                    user.username === selectedPendingUsername
                                      ? { backgroundColor: "#10b981", border: "none", color: "white" }
                                      : {}
                                  }
                                >
                                  <div className="fw-semibold"> {user.name || user.preferred_username || user.username}</div>
                                  <div
                                    className={user.username === selectedPendingUsername ? "" : "text-muted"}
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
                              onClick={loadUnassignedUsers}
                              disabled={loadingPendingUsers}
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
                            <Card.Title><strong>Pending User Overview</strong></Card.Title>
                            {!selectedPendingUser ? (
                              <div className="text-muted">Select a pending user to view their overview.</div>
                            ) : (
                              <div className="text-start">
                                <div className="mb-2">
                                  <strong>Name:</strong>{" "}
                                  {selectedPendingUser.name ||
                                    selectedPendingUser.preferred_username ||
                                    selectedPendingUser.username}
                                </div>

                                <div className="mb-2">
                                  <strong>Email:</strong> {selectedPendingUser.email || "N/A"}
                                </div>

                                <div className="mb-2">
                                  <strong>Phone:</strong>{" "}
                                  {selectedPendingUser.phone_number || selectedPendingUser.phone || "N/A"}
                                </div>

                                <div className="mb-2">
                                  <strong>Username:</strong> {selectedPendingUser.username}
                                </div>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={12}>
                        <Card>
                          <Card.Body>
                            <Card.Title><strong>Assign Role</strong></Card.Title>
                            {roleCardError && <div className="alert alert-danger py-2">{roleCardError}</div>}
                            {roleCardMessage && <div className="alert alert-success py-2">{roleCardMessage}</div>}
                            {!selectedPendingUser ? (
                              <div className="text-muted">Select a pending user first.</div>
                            ) : (
                              <>
                                <Form.Group className="mb-3">
                                  <Form.Label></Form.Label>
                                    <Form.Select
                                      value={selectedRole}
                                      onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                      <option value="Admin">Admin</option>
                                      <option value="Driver">Driver</option>
                                      <option value="Sponsor">Sponsor</option>
                                    </Form.Select>
                                </Form.Group>

                                <div className="d-flex justify-content-center gap-3">
                                  <Button
                                    style={{ width: "160px", height: "50px" }}
                                    variant="outline-secondary"
                                    onClick={handleDismissUnassignedUser}
                                  >
                                    Remove From List
                                  </Button>
                                  <Button
                                    style={{ width: "160px", height: "50px" }}
                                    onClick={handleAssignRole}
                                    disabled={assigningRole}
                                  >
                                    {assigningRole ? "Assigning..." : "Assign Role"}
                                  </Button>
                                </div>
                              </>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Tab.Pane>
              <Tab.Pane eventKey={"manageUsers"}>
                    <Row>
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
              </Tab.Pane>
              <Tab.Pane eventKey="updateAbout" title="Update About">
                <UpdateAbout />
              </Tab.Pane>

              <Tab.Pane eventKey="audit" title={t("admin.logsReports")}>
                <div className="text-muted p-3">Audit log coming soon.</div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </Container>
  );
}


export default AdminPage;
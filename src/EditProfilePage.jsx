import { useState, useEffect } from "react";
import useAmplifyAuth from "./UseAmplifyAuth";
import { Form, Button, Container, Row, Col, Image, Alert } from "react-bootstrap";
import { get, put } from "aws-amplify/api";
import { updateUserAttributes, fetchUserAttributes } from "aws-amplify/auth";

function EditProfilePage({
  profilePic,
  setProfilePic,
  adminView = false,
  targetDriverId = null
}) {
  console.log("EditProfilePage rendered", { adminView, targetDriverId });
  const auth = useAmplifyAuth();

  const [formData, setFormData] = useState({
    authFullName: "",
    authPreferredName: "",
    authPhoneNum: "",
    authEmail: ""
  });

  const [authRole, setAuthRole] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (auth.isLoading) return;
      if (!auth.isAuthenticated) return;

      if (!adminView) {
        setFormData({
          authFullName: auth.profile?.name || "",
          authPhoneNum: auth.profile?.phone_number || "",
          authEmail: auth.profile?.email || "",
          authPreferredName: auth.profile?.preferred_username || ""
        });

        setAuthRole(auth.groups || []);

        if (auth.profile?.picture && setProfilePic) {
          setProfilePic(auth.profile.picture);
        }

        return;
      }

      try {
        setLoading(true);

        console.log("idToken exists:", !!auth.idToken);
        console.log("groups:", auth.groups);
        console.log("targetDriverId:", targetDriverId);
        console.log("token issuer:", auth.profile?.iss);

        const restOperation = get({
          apiName: "adminApi",
          path: `/admin/drivers/${encodeURIComponent(targetDriverId)}`,
          options: {
            headers: {
              Authorization: auth.idToken
            }
          }
        });

        const response = await restOperation.response;
        const data = await response.body.json();

        setFormData({
          authFullName: data.name || "",
          authPreferredName: data.preferred_username || "",
          authPhoneNum: data.phone_number || "",
          authEmail: data.email || ""
        });

        setAuthRole(data.groups || ["Driver"]);

        if (data.picture && setProfilePic) {
          setProfilePic(data.picture);
        }
      } catch (error) {
        console.error(error);
        alert("Error loading driver profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [
    auth.isLoading,
    auth.isAuthenticated,
    auth.profile,
    auth.groups,
    auth.idToken,
    adminView,
    targetDriverId,
    setProfilePic
  ]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !setProfilePic) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.authPhoneNum && !/^\+\d{10,15}$/.test(formData.authPhoneNum)) {
      alert("Phone number must be in format like +15551234567");
      return;
    }

    try {
      if (!adminView) {
        const result = await updateUserAttributes({
          userAttributes: {
            name: formData.authFullName,
            preferred_username: formData.authPreferredName,
            phone_number: formData.authPhoneNum,
            email: formData.authEmail
          }
        });

        console.log("update result", result);

        const latest = await fetchUserAttributes();

        setFormData({
          authFullName: latest.name || "",
          authPreferredName: latest.preferred_username || "",
          authPhoneNum: latest.phone_number || "",
          authEmail: latest.email || ""
        });

        alert("Profile update submitted successfully.");
        return;
      }

      const restOperation = put({
        apiName: "adminApi",
        path: `/admin/drivers/${encodeURIComponent(targetDriverId)}`,
        options: {
          headers: {
            Authorization: auth.idToken
          },
          body: {
            name: formData.authFullName,
            preferred_username: formData.authPreferredName,
            phone_number: formData.authPhoneNum,
            email: formData.authEmail,
            picture: profilePic || null
          }
        }
      });

      await restOperation.response;
      alert("Driver profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving.");
    }
  };

  return (
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "30px" }}>
        <h1><strong>Edit Profile</strong></h1>

        {adminView && (
          <Alert variant="warning">
            Admin View: You are editing driver account {targetDriverId}
          </Alert>
        )}

        {loading ? (
          <div>Loading profile...</div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <div style={{ position: "relative", minHeight: "100vh", padding: "30px" }}>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Full Name:</Form.Label>
                <Col sm={6}>
                  <Form.Control
                    name="authFullName"
                    value={formData.authFullName}
                    readOnly
                    plaintext
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Preferred Name:</Form.Label>
                <Col sm={6}>
                  <Form.Control
                    name="authPreferredName"
                    value={formData.authPreferredName}
                    onChange={handleChange}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Phone Number:</Form.Label>
                <Col sm={6}>
                  <Form.Control
                    name="authPhoneNum"
                    value={formData.authPhoneNum}
                    onChange={handleChange}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Email:</Form.Label>
                <Col sm={6}>
                  <Form.Control
                    name="authEmail"
                    value={formData.authEmail}
                    readOnly
                    plaintext
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Role:</Form.Label>
                <Col sm={6} className="d-flex align-items-start">
                  {authRole.length > 0 ? authRole.join(", ") : <span>N/A</span>}
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3 align-items-center">
                <Form.Label column sm={3}>Profile Picture:</Form.Label>
                <Col sm={6}>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-grow-1 me-3"
                    />
                  </div>
                </Col>

                <Col xs="auto" className="d-flex align-items-center">
                  {profilePic && (
                    <Image
                      src={profilePic}
                      roundedCircle
                      width={90}
                      height={90}
                      alt="Profile Preview"
                    />
                  )}
                </Col>
              </Form.Group>

              <Button type="submit">Save Changes</Button>
            </div>
          </Form>
        )}
      </div>
    </Container>
  );
}

export default EditProfilePage;
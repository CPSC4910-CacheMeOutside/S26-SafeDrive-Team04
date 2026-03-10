import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Form, Button, Container, Row, Col, Image, Alert } from "react-bootstrap";
import { get, put } from 'aws-amplify/api';

function EditProfilePage({ profilePic, setProfilePic, adminView = false, targetDriverId = null }) {
  const auth = useAuth();

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
      if (!auth.user) return;

      if (!adminView) {
        setFormData({
          authFullName: auth.user.profile.name || "",
          authPhoneNum: auth.user.profile.phone_number || "",
          authEmail: auth.user.profile.email || "",
          authPreferredName: auth.user.profile.preferred_username || ""
        });

        setAuthRole(auth.user.profile["cognito:groups"] || []);
        return;
      }

      try {
        setLoading(true);

        console.log("id_token exists:", !!auth.user?.id_token);
        console.log("groups:", auth.user?.profile?.["cognito:groups"]);
        console.log("targetDriverId:", targetDriverId);
        console.log("token issuer:", auth.user?.profile?.iss);

        const restOperation = get({
          apiName: 'adminApi',
          path: `/admin/drivers/${encodeURIComponent(targetDriverId)}`,
          options: {
            headers: {
              Authorization: auth.user.id_token
            },
          },
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

  }, [auth.user, adminView, targetDriverId, setProfilePic]);

  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!adminView) {
        const response = await fetch(
          "https://cognito-idp.us-east-1.amazonaws.com/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-amz-json-1.1",
              "X-Amz-Target": "AWSCognitoIdentityProviderService.UpdateUserAttributes",
              Authorization: auth.user.access_token
            },
            body: JSON.stringify({
              UserAttributes: [
                { Name: "name", Value: formData.authFullName },
                { Name: "preferred_username", Value: formData.authPreferredName },
                { Name: "phone_number", Value: formData.authPhoneNum },
                { Name: "email", Value: formData.authEmail }
              ],
              AccessToken: auth.user.access_token,
            })
          }
        );

        if (response.ok) {
          alert("Successfully saved changes!");
          auth.signinSilent();
          return;
        } else {
          const error = await response.json();
          console.error(error);
          alert("Error! Unable to update profile.");
          return;
        }
      }

      const restOperation = put({
        apiName: "adminApi",
        path: `/admin/drivers/${encodeURIComponent(targetDriverId)}`,
        options: {
          headers: {
            Authorization: auth.user.id_token,
          },
          body: {
            name: formData.authFullName,
            preferred_username: formData.authPreferredName,
            phone_number: formData.authPhoneNum,
            email: formData.authEmail,
            picture: profilePic || null,
          },
        },
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
            {authRole.length > 0 ? (
              authRole.join(", ")
            ) : (
              <span>N/A</span>
            )}
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

        <Button type="Submit">Save Changes</Button>
      </div>
      </Form>
      </div>
    </Container>
  );
}

export default EditProfilePage;
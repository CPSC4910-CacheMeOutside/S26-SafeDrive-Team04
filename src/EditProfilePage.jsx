import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { CognitoIdentityProviderClient, DeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Form, Button, Container, Row, Col, Image } from "react-bootstrap";

function EditProfilePage({ profilePic, setProfilePic }) {
  const auth = useAuth();

  const [formData, setFormData] = useState({
    authFullName: "",
    authPreferredName: "",
    authPhoneNum: "",
    authEmail: ""
  });

  const [authRole, setAuthRole] = useState([]);

  useEffect(() => {
    if (auth.user) {
        setFormData({
            authFullName: auth.user.profile.name || "",
            authPhoneNum: auth.user.profile.phone_number || "",
            authEmail: auth.user.profile.email || "",
            authPreferredName: auth.user.profile.preferred_username || ""
        });
        setAuthRole(auth.user.profile["cognito:groups"] || []);
    }

  }, [auth.user]);

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
    }
    else {
      const error = await response.json();
      console.error(error);
      alert("Error! Unable to update profile.");
    }
  };

  // testing from amazon q
  const DeleteAccountComponent = () => {
    const auth = useAuth();

    const deleteUser = async ({ region, accessToken }) => {
      try {
        const client = new CognitoIdentityProviderClient({ region });
        const response = await client.send(
          new DeleteUserCommand({ AccessToken: accessToken })
        );
        return [response, null];
      } catch (err) {
        return [null, err];
      }
    }
  };

  // testing from amazon q
  const handleDeleteAccount = async () => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      );
      if (!confirmed) return;

      const accessToken = auth.user?.access_token;
      if (!accessToken) {
        alert("No valid access token found. Please sign in again.");
        return;
      }

      const [response, error] = await deleteUser({
        region: "us-east-1", 
        accessToken: accessToken
      });

      if (error) {
        throw error;
      }
      await auth.signoutRedirect();
      alert("Your account has been successfully deleted.");
      
    } catch (error) {
      console.error('Error deleting account:', error);
      alert("Failed to delete account. Please try again.");
    }
  };


  return (
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "30px" }}>  
      <h1><strong>Edit Profile</strong></h1>
      
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
      <button onClick={handleDeleteAccount} style={{ padding: '10px 20px' }}>Delete My Account</button>
      </div>
    </Container>
  );
}

export default EditProfilePage;
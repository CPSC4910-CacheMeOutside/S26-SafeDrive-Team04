import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Form, Button, Container, Row, Col, Image } from "react-bootstrap";

function EditProfilePage({ profilePic, setProfilePic }) {
  const auth = useAuth();

  const [formData, setFormData] = useState({
    authFullName: "",
    authPreferredName: "",
    authPhoneNum: "",
    authEmail: ""
  });

  useEffect(() => {
    if (auth.user) {
        setFormData({
            authFullName: auth.user.profile.name || "",
            authPhoneNum: auth.user.profile.phone_number || "",
            authEmail: auth.user.profile.email || "",
            authPreferredName: auth.user.profile.preferred_username || ""
        });
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
      alert("Profile updated!");
      auth.signinSilent();
    }
    else {
      const error = await response.json();
      console.error(error);
      alert("Error! Unable to update profile.");
    }
  };

  return (
    <Container className="mt-4">
      <h3>Edit Profile</h3>
      <Form onSubmit={handleSubmit}>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>Full Name:</Form.Label>
          <Col sm={9}>
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
          <Col sm={9}>
            <Form.Control
              name="authPreferredName"
              value={formData.authPreferredName}
              onChange={handleChange}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>Phone Number:</Form.Label>
          <Col sm={9}>
            <Form.Control
              name="authPhoneNum"
              value={formData.authPhoneNum}
              onChange={handleChange}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>Email:</Form.Label>
          <Col sm={9}>
            <Form.Control
              name="authEmail"
              value={formData.authEmail}
              readOnly
              plaintext
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>Profile Picture:</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {profilePic && (
              <div className="mt-3">
                <Image
                  src={profilePic}
                  roundedCircle
                  width={100}
                  height={100}
                  alt="Profile Preview"
                />
              </div>
            )}
          </Col>
        </Form.Group>

        <Button type="Submit">Save Changes</Button>
      </Form>
    </Container>
  );
}

export default EditProfilePage;
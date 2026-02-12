import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Form, Button, Container } from "react-bootstrap";

function EditProfilePage() {
  const auth = useAuth();

  const [formData, setFormData] = useState({
    authFullName: "",
    authPhoneNum: ""
  });

  useEffect(() => {
    if (auth.user) {
        setFormData({
            authFullName: auth.user.profile.name || "",
            authPhoneNum: auth.user.profile.phone_number || "",
            authEmail: auth.user.profile.email || ""
        });
    }

  }, [auth.user]);

  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });
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
          AccessToken: auth.user.access_token,
          UserAttributes: [
            { Name: "authFullName", Value: formData.authFullName},
            { Name: "authPhoneNum", Value: formData.authPhoneNum},
            { Name: "authEmail", Value: formData.authEmail}
          ]
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
      alert("Error!");
    }
  };

  return (
    // <div>
    //   <pre>{JSON.stringify(auth, null, 2)}</pre>
    // </div>
    <Container className="mt-4">
      <h3>Edit Profile</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            name="authFullName"
            value={formData.authFullName}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            name="authPhoneNum"
            value={formData.authPhoneNum}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            name="authEmail"
            value={formData.authEmail}
            onChange={handleChange}
          />
        </Form.Group>

        <Button type="Submit">Save Changes</Button>
      </Form>
    </Container>
  );
}

export default EditProfilePage;
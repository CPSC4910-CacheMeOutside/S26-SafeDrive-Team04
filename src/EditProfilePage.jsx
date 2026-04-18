import { useState, useEffect } from 'react';
import useAmplifyAuth from './UseAmplifyAuth';
import { Form, Button, Container, Row, Col, Image, Alert } from 'react-bootstrap';
import { get, put } from 'aws-amplify/api';
import { updateUserAttributes, fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';

const client = generateClient();

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

function EditProfilePage({
  profilePic,
  setProfilePic,
  adminView = false,
  targetDriverId = null
}) {
  console.log("EditProfilePage rendered", { adminView, targetDriverId });
  const auth = useAmplifyAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    authName: "",
    authNickname: "",
    authPhoneNum: "",
    authEmail: ""
  });

  const [licenseData, setLicenseData] = useState({
    licenseNo: "",
    expDate: "",
    state: ""
  });

  const [isDriver, setIsDriver] = useState(false);
  const [isSponsor, setIsSponsor] = useState(false);
  const [sponsorAffiliation, setSponsorAffiliation] = useState("");
  const [sponsorDescription, setSponsorDescription] = useState("");
  const [authRole, setAuthRole] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (auth.isLoading) return;
      if (!auth.isAuthenticated) return;

      if (!adminView) {
        const attrs = await fetchUserAttributes();
        setFormData({
          authName: attrs.name || "",
          authNickname: attrs.nickname || "",
          authPhoneNum: attrs.phone_number || "",
          authEmail: attrs.email || "",
        });

        const groups = auth.groups || [];
        setAuthRole(groups);

        if (attrs.picture && setProfilePic) {
          setProfilePic(attrs.picture);
        }

        if (groups.includes('Driver')) {
          setIsDriver(true);
          try {
            const currentUser = await getCurrentUser();
            const driverId = currentUser.username;
            const { data: driverRecord } = await client.models.Driver.get({ driverId });
            if (driverRecord) {
              setLicenseData({
                licenseNo: driverRecord.licenseNo || "",
                expDate: driverRecord.expDate || "",
                state: driverRecord.state || ""
              });
            }
          } catch (err) {
            console.error("Failed to load driver license info:", err);
          }
        }

        if (groups.includes('Sponsor')) {
          setIsSponsor(true);
          try {
            const currentUser = await getCurrentUser();
            const sponsorId = currentUser.username;
            const { data: sponsorRecord } = await client.models.Sponsor.get({ sponsorId });
            if (sponsorRecord) {
              setSponsorAffiliation(sponsorRecord.affiliation || "");
              setSponsorDescription(sponsorRecord.description || "");
            }
          } catch (err) {
            console.error("Failed to load sponsor affiliation:", err);
          }
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
          apiName: "SafeDriveAPI",
          path: `/admin/drivers/${encodeURIComponent(targetDriverId)}`,
          options: {
            headers: {Authorization: auth.idToken}
          }
        });

        const response = await restOperation.response;
        const data = await response.body.json();

        setFormData({
          authName: data.name || "",
          authNickname: data.nickname || "",
          authPhoneNum: data.phone_number || "",
          authEmail: data.email || ""
        });

        setAuthRole(data.groups || ["Driver"]);

        if (data.picture && setProfilePic) {
          setProfilePic(data.picture);
        }
      } catch (error) {
        console.error(error);
        alert(t('editProfile.errorLoadingProfile'));
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

  const handleLicenseChange = (e) => {
    setLicenseData({
      ...licenseData,
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
      alert(t('editProfile.phoneFormatError'));
      return;
    }

    try {
      if (!adminView) {
        const result = await updateUserAttributes({
          userAttributes: {
            nickname: formData.authNickname,
            phone_number: formData.authPhoneNum
          }
        });

        console.log("update result", result);

        if (isDriver) {
          const currentUser = await getCurrentUser();
          const driverId = currentUser.username;

          const { data: existing } = await client.models.Driver.get({ driverId });

          if (existing) {
            await client.models.Driver.update({
              driverId,
              licenseNo: licenseData.licenseNo || null,
              expDate: licenseData.expDate || null,
              state: licenseData.state || null
            });
          } else {
            await client.models.Driver.create({
              driverId,
              licenseNo: licenseData.licenseNo || null,
              expDate: licenseData.expDate || null,
              state: licenseData.state || null
            });
          }
        }

        if (isSponsor) {
          const currentUser = await getCurrentUser();
          const sponsorId = currentUser.username;

          const { data: existingSponsor } = await client.models.Sponsor.get({ sponsorId });

          if (existingSponsor) {
            await client.models.Sponsor.update({
              sponsorId,
              affiliation: sponsorAffiliation || null,
              description: sponsorDescription || null,
            });
          } else {
            await client.models.Sponsor.create({
              sponsorId,
              affiliation: sponsorAffiliation || null,
              description: sponsorDescription || null,
            });
          }
        }

        const latest = await fetchUserAttributes();

        setFormData({
          authName: latest.name || "",
          authNickname: latest.nickname || "",
          authPhoneNum: latest.phone_number || "",
          authEmail: latest.email || ""
        });

        alert(t('editProfile.successSaved'));
        return;
      }

      const restOperation = put({
        apiName: "SafeDriveAPI",
        path: `/admin/drivers/${encodeURIComponent(targetDriverId)}`,
        options: {
          headers: {
            Authorization: auth.idToken
          },
          body: {
            name: formData.authName,
            nickname: formData.authNickname,
            phone_number: formData.authPhoneNum,
            email: formData.authEmail,
            picture: profilePic || null
          }
        }
      });

      await restOperation.response;
      alert(t('editProfile.driverProfileUpdated'));
    } catch (error) {
      console.error("Save error:", error);
      console.error("Save error response:", error?.response);
      console.error("Save error body:", error?.response?.body);
      alert(error?.message || "Something went wrong while saving.");
    }
  };

  return (
    <Container className="mt-4">
      <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
        <h1 style={{ fontSize: "60px", fontWeight: "bold" }}>{adminView ? "Edit Driver Account" : "Edit Profile"}</h1>
        <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
        {adminView && (
          <Alert variant="warning">
            {t('editProfile.adminViewAlert')} {targetDriverId}
          </Alert>
        )}

        {loading ? (
          <div>{t('editProfile.loadingProfile')}</div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>{t('editProfile.fullName')}</Form.Label>
                <Col sm={6}>
                  <Form.Control
                    name="authName"
                    value={formData.authName}
                    readOnly
                    plaintext
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>{t('editProfile.preferredName')}</Form.Label>
                <Col sm={6}>
                  <Form.Control
                    name="authNickname"
                    value={formData.authNickname}
                    onChange={handleChange}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>{t('editProfile.phoneNumber')}</Form.Label>
                <Col sm={6}>
                  <Form.Control
                    name="authPhoneNum"
                    value={formData.authPhoneNum}
                    onChange={handleChange}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>{t('editProfile.email')}</Form.Label>
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
                <Form.Label column sm={3}>{t('editProfile.role')}</Form.Label>
                <Col sm={6} className="d-flex align-items-start">
                  {authRole.length > 0 ? authRole.join(", ") : <span>{t('common.na')}</span>}
                </Col>
              </Form.Group>

              {isDriver && !adminView && (
                <>
                  <hr />
                  <h5 className="mb-3">Driver License Information</h5>

                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>License Number</Form.Label>
                    <Col sm={6}>
                      <Form.Control
                        name="licenseNo"
                        value={licenseData.licenseNo}
                        onChange={handleLicenseChange}
                        placeholder="Enter license number"
                      />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>License Expiration Date</Form.Label>
                    <Col sm={6}>
                      <Form.Control
                        type="date"
                        name="expDate"
                        value={licenseData.expDate}
                        onChange={handleLicenseChange}
                      />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>State</Form.Label>
                    <Col sm={6}>
                      <Form.Select
                        name="state"
                        value={licenseData.state}
                        onChange={handleLicenseChange}
                      >
                        <option value="">Select state...</option>
                        {US_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Form.Group>
                  <hr />
                </>
              )}

              {isSponsor && !adminView && (
                <>
                  <hr />
                  <h5 className="mb-3">Sponsor Information</h5>

                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>Affiliation / Company Name</Form.Label>
                    <Col sm={6}>
                      <Form.Control
                        name="sponsorAffiliation"
                        value={sponsorAffiliation}
                        onChange={(e) => setSponsorAffiliation(e.target.value)}
                        placeholder="Enter your company or organization name"
                      />
                      <Form.Text className="text-muted">
                        This name will appear on your public sponsor profile and to drivers.
                      </Form.Text>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={3}>Company Description</Form.Label>
                    <Col sm={6}>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="sponsorDescription"
                        value={sponsorDescription}
                        onChange={(e) => setSponsorDescription(e.target.value)}
                        placeholder="Describe your company, what drivers can expect, and why they should apply..."
                      />
                      <Form.Text className="text-muted">
                        Shown to drivers on the sponsor listings page and application page.
                      </Form.Text>
                    </Col>
                  </Form.Group>
                  <hr />
                </>
              )}

              <Form.Group as={Row} className="mb-3 align-items-center">
                <Form.Label column sm={3}>{t('editProfile.profilePicture')}</Form.Label>
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
              <Button style={{ width: "160px", height: "50px" }} variant="secondary" className="me-2" onClick={() => navigate("/AdminPage")}>Exit</Button>
              <Button style={{ width: "160px", height: "50px" }} type="submit">Save Changes</Button>
            </div>
          </Form>
        )}
        </div>
      </div>
    </Container>
  );
}

export default EditProfilePage;
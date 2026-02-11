import { useAuth } from 'react-oidc-context';
import { useNavigate } from "react-router-dom";
import Sponsor_ViewDrivers from './Sponsor_ViewDrivers';

function SponsorPage() {
    const auth = useAuth();
    const userEmail = auth.user?.profile?.email;
    const navigate = useNavigate();

    return (
        <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
            <img
                src="/profileTestPic.jpg" 
                alt="User profile"
                style={{
                    position: "absolute",
                    top: "30px",
                    right: "300px",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #000000"
                }}
            />
            <h1>Sponsor Dashboard</h1>
              <p>Welcome Back, {userEmail}!</p>
            
            <button 
              onClick={() => navigate("/sponsor_viewDrivers")}
              style={{ marginTop: "60px", fontSize: "25px"}}
            >View Sponsored Drivers
            </button>

        </div>
    );
}

export default SponsorPage;
import { useAuth } from 'react-oidc-context';
import { useNavigate } from "react-router-dom";

function SponsorPage() {
    const navigate = useNavigate();

    return (
        <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
            <h1>Sponsor Dashboard</h1>
            <button 
              onClick={() => navigate("/sponsor_viewDrivers")}
              style={{ marginTop: "60px", fontSize: "25px"}}
            >View Sponsored Drivers
            </button>

        </div>
    );
}

export default SponsorPage;
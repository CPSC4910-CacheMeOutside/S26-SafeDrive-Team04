import React from "react";
import { useAuth } from 'react-oidc-context';

function SponsorPage() {
    const auth = useAuth();
    const userEmail = auth.user?.profile?.email;

    return (
        <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
            <img
                src="/profileTestPic.jpg" 
                alt="User profile"
                style={{
                    position: "absolute",
                    top: "30px",
                    right: "70px",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #ddd"
                }}
            />
            <h1>Sponsor Dashboard</h1>
              <p>Welcome Back, {userEmail}!</p>
        </div>
    );
}

export default SponsorPage;
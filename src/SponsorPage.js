import React from "react";

function SponsorPage() {
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
        </div>
    );
}

export default SponsorPage;
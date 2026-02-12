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
                    right: "300px",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #000000"
                }}
            />
            <h1>Sponsor Dashboard</h1>
        </div>
    );
}
export default SponsorPage;

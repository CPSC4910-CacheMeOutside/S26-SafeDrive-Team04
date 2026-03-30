import { Button } from "react-bootstrap";
import useAmplifyAuth from "./UseAmplifyAuth";
import "./App.css";

export default function HomePage () {
  const auth = useAmplifyAuth();

  return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "60px", overflowX: "hidden" }}> 
      <div className="hero-content">
      <h1 style={{ fontSize: "60px", fontWeight: "bold" }}>Welcome to Safe Drive!</h1>
      <p className="fs-2">Safe Driving. Big Rewards.</p>
      <Button style={{backgroundColor: "#10b981", border: "none", padding: "12px 24px", fontSize: "1.1rem"}} className="glow-button mt-5 px-5 py-3 fs-3 fw-bold" onClick={() => auth.signupRedirect()}>Get Started!</Button>
      </div>
      <img src="/truckAnim2.png" className="truckAnim2" alt="Truck carrying gifts" />
    </div>
  );
}
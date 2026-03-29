import { Button } from "react-bootstrap";
import useAmplifyAuth from "./UseAmplifyAuth";

export default function HomePage () {
  const auth = useAmplifyAuth();

  return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "60px" }}> 
      <h1 style={{ fontSize: "60px", fontWeight: "bold" }}>Welcome to Safe Drive!</h1>
      <p className="fs-2">Safe Driving. Big Rewards.</p>
      <Button className="mt-5 px-5 py-3 fs-3 fw-bold" onClick={() => auth.signupRedirect()}>Get Started!</Button>
    </div>
  );
}
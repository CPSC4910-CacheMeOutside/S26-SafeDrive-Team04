import { Button } from "react-bootstrap";
import useAmplifyAuth from "./UseAmplifyAuth";

export default function HomePage () {
  const auth = useAmplifyAuth();

  return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "60px" }}> 
      <h1><strong>Welcome to Safe Drive!</strong></h1>
      <p className="fs-3">Safe Driving. Big Rewards.</p>
      <Button size="lg" className="mt-5" onClick={() => auth.signupRedirect()}>Get Started!</Button>
    </div>
  );
}
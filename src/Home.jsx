import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function HomePage () {
  return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "60px" }}> 
      <h1><strong>Welcome to Safe Drive!</strong></h1>
      <p>Ready to drive safely. Apply to a sponsor today!</p>
      <Button as={Link} to='/sponsor-list'>Apply Now!</Button>
    </div>
  );
}
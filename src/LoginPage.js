import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useNavigate } from 'react-router-dom';



function LoginPage() {
    const navigate = useNavigate();

    return(
        <Container classname="mt-4">
            <Card classname="p-4">
                <h2 className='mb-2'>Login(Placeholder)</h2>
                <p className='text-muted'>
                    Sponsor UI Development
                </p>

                <div className="d-flex gap-2">
                    <Button onClick={() => navigate("/sponsor")}>
                        Login as Sponsor
                    </Button>
                    <Button variant="secondary" onClick={() => navigate("/profile")}>
                        Login as Driver
                    </Button>
                    <Button onClick={() => navigate("/admin")}>
                        Login as Admin
                    </Button>
                </div>
            </Card>
        </Container>
    );
}

export default LoginPage;
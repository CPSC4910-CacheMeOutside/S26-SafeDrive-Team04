import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState } from 'react';

function CreatePassword() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const checkPassword = (pass) => {
        if (pass.length < 12) return false;
        if (!/[A-Z]/.test(pass)) return false;
        if (!/[a-z]/.test(pass)) return false;
        if (!/[0-9]/.test(pass)) return false;
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username) {
            setError('Please enter a username');
            return;
        }

        if (!checkPassword(password)) {
            setError('Password must be at least 12 characters with uppercase, lowercase, and a number');
            return;
        }

        alert('Account created for ' + username);
        setUsername('');
        setPassword('');
        setError('');
    };

    return (
        <div className="container" style={{marginTop: '50px'}}>
            <div className="card" style={{maxWidth: '500px', margin: 'auto'}}>
                <div className="card-body">
                    <h3>Create Account</h3>
                    <br />

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label>Username:</label>
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Password:</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <small>Must be 12+ characters with uppercase, lowercase, and number</small>
                        </div>

                        {error && <p style={{color: 'red'}}>{error}</p>}

                        <button type="submit" className="btn btn-primary">
                            Create Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreatePassword;
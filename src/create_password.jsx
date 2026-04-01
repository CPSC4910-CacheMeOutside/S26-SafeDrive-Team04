import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState } from 'react';
import { useLanguage } from './LanguageContext';

function CreatePassword() {
    const { t } = useLanguage();
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
            setError(t('createPassword.usernameRequired'));
            return;
        }

        if (!checkPassword(password)) {
            setError(t('createPassword.passwordInvalid'));
            return;
        }

        alert(t('createPassword.accountCreated') + ' ' + username);
        setUsername('');
        setPassword('');
        setError('');
    };

    return (
        <div className="container" style={{marginTop: '50px'}}>
            <div className="card" style={{maxWidth: '500px', margin: 'auto'}}>
                <div className="card-body">
                    <h3>{t('createPassword.title')}</h3>
                    <br />

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label>{t('createPassword.username')}</label>
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label>{t('createPassword.password')}</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <small>{t('createPassword.passwordHint')}</small>
                        </div>

                        {error && <p style={{color: 'red'}}>{error}</p>}

                        <button type="submit" className="btn btn-primary">
                            {t('createPassword.createButton')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreatePassword;
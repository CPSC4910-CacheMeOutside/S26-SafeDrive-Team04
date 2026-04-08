import { Button } from "react-bootstrap";
import useAmplifyAuth from "./UseAmplifyAuth";
import { useLanguage } from "./LanguageContext";
import "./App.css";

export default function HomePage () {
  const auth = useAmplifyAuth();
  const { t } = useLanguage();

  return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "60px", overflowX: "hidden" }}>
      <div className="hero-content">
      <h1 style={{ fontSize: "60px", fontWeight: "bold" }}>{t('home.welcome')}</h1>
      <p className="fs-2">{t('home.tagline')}</p>
      <Button style={{backgroundColor: "#10b981", border: "none", padding: "12px 24px", fontSize: "1.1rem"}} className="glow-button mt-5 px-5 py-3 fs-3 fw-bold" onClick={() => auth.signupRedirect()}>{t('home.getStarted')}</Button>
      </div>
      <img src="/truckAnim2.png" className="truckAnim2" alt="Truck carrying gifts" />
    </div>
  );
}
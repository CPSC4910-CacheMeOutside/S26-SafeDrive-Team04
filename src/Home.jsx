import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useLanguage } from './LanguageContext';

export default function HomePage () {
  const { t } = useLanguage();
  return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "60px" }}>
      <h1><strong>{t('home.welcome')}</strong></h1>
      <p>{t('home.tagline')}</p>
      <Button as={Link} to='/sponsor-list'>{t('home.applyNow')}</Button>
    </div>
  );
}
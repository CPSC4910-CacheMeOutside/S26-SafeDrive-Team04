import { Container, Row, Col, Stack, Card } from 'react-bootstrap';
import { useLanguage } from './LanguageContext';

export default function ProfilePage(){
  const { t } = useLanguage();
  const alias = "Breaker_1-9";
  const points = 144;
  return(
    <Container className="py-4" style={{ maxWidth: 700 }}>
      <h2 classname="mb-3">{t('profile.title')}</h2>

      <div style={{
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h4>{alias}</h4>
        <div style={{ fontSize: '0.875rem', opacity: 0.7}}>{t('profile.currentPoints')}</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 700}}>{points}</div>
      </div>

    </Container>
  );
}
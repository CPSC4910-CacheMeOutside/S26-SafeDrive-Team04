import { useLanguage } from './LanguageContext';

export default function DriverPage () {
  const { t } = useLanguage();
  return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "60px" }}>
      <h1><strong>{t('driver.title')}</strong></h1>
    </div>
  );
}

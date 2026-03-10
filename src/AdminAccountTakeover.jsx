import { useParams } from 'react-router-dom';
import EditProfilePage from './EditProfilePage';

function AdminAccountTakeover() {
  const { driverId } = useParams();

  return (
    <EditProfilePage adminView={true} targetDriverId={driverId} />
  );
}

export default AdminAccountTakeover;
import { useParams } from "react-router-dom";
import SponsorEditProfilePage from "./SponsorEditProfilePage";

function AdminSponsorAccountEdit() {
  const { sponsorId } = useParams();

  return (
    <SponsorEditProfilePage
      adminView={true}
      targetSponsorId={sponsorId}
    />
  );
}

export default AdminSponsorAccountEdit;
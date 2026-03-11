import { useParams } from "react-router-dom";
import { useState } from "react";
import EditProfilePage from "./EditProfilePage";

function AdminAccountTakeover() {
  const { driverId } = useParams();
  const [profilePic, setProfilePic] = useState("./profileTestPic.jpg");

  console.log("AdminAccountTakeover rendered", { driverId });

  return (
    <EditProfilePage
      profilePic={profilePic}
      setProfilePic={setProfilePic}
      adminView={true}
      targetDriverId={driverId}
    />
  );
}

export default AdminAccountTakeover;
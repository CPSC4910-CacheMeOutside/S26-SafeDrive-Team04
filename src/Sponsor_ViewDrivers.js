// still needs to connect to driver/sponsor profiles in the database. These names were manually entered for testing purposes
function Sponsor_ViewDrivers() {
    return (
      <div style={{ position: "relative", minHeight: "100vh", padding: "40px" }}>
        <h1>Sponsored Drivers</h1>
        <ul style={{ paddingLeft: "875px", paddingTop: "20px",textAlign: "left"}}>
          <li>Haverford, Tom</li>
          <li>Knope, Leslie</li>
          <li>Ludgate, April</li>
          <li>Meagle, Donna</li>
          <li>Swanson, Ron</li>
        </ul>
      </div>
    );
}

export default Sponsor_ViewDrivers;
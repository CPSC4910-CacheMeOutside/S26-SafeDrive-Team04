import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import fs from 'fs';
import path from 'path';

const config = JSON.parse(
  fs.readFileSync(
    path.resolve('amplify_outputs.json'),
    'utf-8'
  )
);

async function createUsers() {

    Amplify.configure(config)
    const client = generateClient();

    console.log("Creating 1 Sponsor and 3 Drivers...");

    const { data: sponsor, errors: err1 } = await client.models.Sponsor.create({
        sponsorId: "a4382458-4031-702b-33f2-03042bdc8523",
        affiliation: "Man Co."
    });

    if (err1 || !sponsor) {
        console.log("Failed to create sponsor:", err1);
    }

    const { data: d1, errors: err2 } = await client.models.Driver.create({
        driverId: "c408d4d8-6081-708c-c189-8f0bdc2adef0",
        licenseNo: "12345678900987654321",
        state: "SC",
        expDate: "12/25/2060"
    });

    if (err2 || !d1) {
        console.log("Failed to create driver 1:", err2);
    }

    const { data: d2, errors: err3 } = await client.models.Driver.create({
        driverId: "54f8a4b8-e011-70d2-a2b3-66c07a5cbf3d",
        licenseNo: "12345678900987654321",
        state: "SC",
        expDate: "12/25/2060"
    });

    if (err3 || !d2) {
        console.log("Failed to create driver 2:", err3);
    }

    const { data: d3, errors: err4 } = await client.models.Driver.create({
        driverId: "94985418-70f1-70e4-833f-aaf084b28c15",
        licenseNo: "12345678900987654321",
        state: "SC",
        expDate: "12/25/2060"
    });

    if (err4 || !d3) {
        console.log("Failed to create driver 3:", err4);
    }

    console.log("User creation Complete!!!");
    console.log("Creating driver-sponsor assignments...");

    const { errors: err5 } = await client.models.DriverSponsor.create({
        driverId: d1.driverId,
        sponsorId: sponsor.sponsorId
    });

    if (err5) console.log("Failed assignment 1:", err5);

    const { errors: err6 } = await client.models.DriverSponsor.create({
        driverId: d2.driverId,
        sponsorId: sponsor.sponsorId
    });

    if (err6) console.log("Failed assignment 2:", err6);

    const { errors: err7 } = await client.models.DriverSponsor.create({
        driverId: d3.driverId,
        sponsorId: sponsor.sponsorId
    });

    if (err7) console.log("Failed assignment 3:", err7);

    console.log("All assignments complete ✅");
}

createUsers();
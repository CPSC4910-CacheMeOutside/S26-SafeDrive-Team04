import { useState, useEffect } from "react";
// Import the front-end star rating widget for catalog items
import StarRating from "./StarRating";
import { useLanguage } from './LanguageContext';
import { generateClient } from 'aws-amplify/data';
import { updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth';
import { AmplifyError } from "@aws-amplify/core/internals/utils";
import useAmplifyAuth from "./UseAmplifyAuth";

export default function SponsorCatalog() {

    // Page State Trackers
    const [isLoading, setIsLoading] = useState(true);
    // Clients
    const client = generateClient();
    const auth = useAmplifyAuth();
    // User Centric Data
    const [userData, updateUserData] = useState(null);
    const [pointTotals, updatePointTotals] = useState(null);
    const [sponsors, updateSponsors] = useState(null);
    const [catalogs, updateCatalogs] = useState(null);
    const [activeCatalog, updateActiveCatalog] = useState(null);
    const [cart, updateCart] = useState(null);
    const [wishlist, updateWishlist] = useState(null);
    // Catalog Filters


    useEffect(() => {

        async function getCogUserData() {
            try {
                const cogAttr = await fetchUserAttributes(); 
                console.log(`Sponsor Data Retrieved from Cognito: `, cogAttr);
                return {
                    id: cogAttr.sub,
                    name: cogAttr.name
                };
            } catch(err) {
                console.log(`Error: Failed to retrive sponsor from Cognito: `, err);
                return;
            }
            
        }
        
        async function getAmpUserData(id) {
            const {data, errors} = await client.models.Driver.get({
                driverId: id
            })

            if (errors) {
                console.log(`Error: Could not obtain driver id:${id} from Driver table:`, errors);
            } else if (data === null) {
                console.log(`Error: Could not obtain driver id:${id} from Driver table: No driver by that id was found`);
            }
            console.log("Retried from Amplify Data: ", data);
            return data;
        }

        async function populateCatalogs (ampData) {
            let obtainedCatalogs = new Map();
            const {data: dbCatalogs, errors} = await ampData.catalogs();

            if (errors) {
                console.log(`Error: Could not obtain wishlists for driver id:${ampData.driverId}:`, errors);
            } else if (dbCatalogs === null) {
                console.log(`Error: Could not obtain wishlists for driver id:${ampData.driverId}: No wishlists were found`);
            }
            console.log("Retried wishlists from Amplify Data: ", dbCatalogs);
            return dbCatalogs;

            for (const catalog of dbCatalogs) {
                const {data: products, errors} = await catalog.products();

                if (errors) {
                    console.log(`Error: Could not obtain products for catalog id:${catalog.id}:`, errors);
                } else if (products === null) {
                    console.log(`Error: Could not obtain products for catalog id:${catalog.id}: No products were found`);
                }

                obtainedCatalogs.set(catalog.sponsorId, products);
            }
            return obtainedCatalogs;
        }

        async function populateSponsors(ampData) {
            const {data: sponsors, errors} = await ampData.sponsors();

            if (errors) {
                console.log(`Error: Could not obtain sponsors for driver id:${ampData.driverId}:`, errors);
            } else if (sponsors === null) {
                console.log(`Error: Could not obtain sponsors for driver id:${ampData.driverId}: No sponsors were found`);
            }
            console.log("Retried sponsors from Amplify Data: ", sponsors);
            return sponsors.map(s => s.sponsorId);
        }

        async function populatePointTotals(id) {
            let pointTotals = new Map();
            const {data: pointTotals, errors} = await client.models.DriverSponsor.list({
                filter: {
                    driverId: { eq: id }
                }
            });

            if (errors) {
                console.log(`Error: Could not obtain point totals for driver id:${id}:`, errors);
            } else if (pointTotals === null) {
                console.log(`Error: Could not obtain point totals for driver id:${id}: No point totals were found`);
            }

            for (const pt of pointTotals) {
                pointTotals.set(pt.sponsorId, pt.points);
            }
        }

        async function loadData() {
            const cogData = await getCogUserData();
            const dbData = await getAmpUserData(cogData.id);

            updateUserData(cogData);
            updateCatalogs(await populateCatalogs(dbData));
            updateSponsors(await populateSponsors(dbData));


        }

        loadData();
    }, []);

    // Check to ensure all user data is loaded
    useEffect(() => {
        if (pointTotals === null) return;
        if (sponsors === null) return;
        if (catalogs === null) return;
        if (activeCatalog === null) return;
        if (cart === null) return;
        if (wishlist === null) return;
        if (userData === null) return;

        isLoading(false);
    }, pointTotals, sponsors, catalogs, activeCatalog, cart, wishlist);

    // TODO: This is here for the sake of testing. Remove once we can get a succesful load
    if (isLoading) {
        return (<h1>Loading...</h1>);
    } else {
        return (<h1>Success!</h1>)
    }
}
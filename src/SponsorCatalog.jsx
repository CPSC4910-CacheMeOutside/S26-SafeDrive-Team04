import { useState, useEffect } from "react";
// Import the front-end star rating widget for catalog items
import StarRating from "./StarRating";
import { useLanguage } from './LanguageContext';
import { generateClient } from 'aws-amplify/data';
import { type } from "node:os";
import { AmplifyError } from "@aws-amplify/core/internals/utils";


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
                throw new Error(`Error: Could not obtain driver id:${id} from Driver table:`, errors);
            } else if (data === null) {
                throw new Error(`Error: Could not obtain driver id:${id} from Driver table: No driver by that id was found`);
            }

            return data;
        }

        async function populateCatalogs (ampData) {
            const catalogs = ampData.catalogs();
            
        }

        const cogData = getCogUserData();
        const dbData = getAmpUserData(cogData.id);

        updateUserData(cogData);


    });

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
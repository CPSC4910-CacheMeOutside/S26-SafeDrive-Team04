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
                return;
            } else if (data === null) {
                console.log(`Error: Could not obtain driver id:${id} from Driver table: No driver by that id was found`);
                return;
            }
            console.log("Retried from Amplify Data: ", data);
            return data;
        }

        async function populateCatalogs (ampData) {
            let obtainedCatalogs = new Map();
            const {data: dbCatalogs, errors} = await ampData.catalogs();

            if (errors) {
                console.log(`Error: Could not obtain catalogs for driver id:${ampData.driverId}:`, errors);
            } else if (dbCatalogs === null) {
                console.log(`Error: Could not obtain catalogs for driver id:${ampData.driverId}: No catalogs were found`);
            }
            console.log("Step 1: Get catalogs", dbCatalogs)
            for (const icatalog of dbCatalogs) {
                const {data: pAssignment, errors} = await icatalog.products();

                if (errors) {
                    console.log(`Error: Could not obtain products for catalog id:${icatalog.id}:`, errors);
                } else if (pAssignment === null) {
                    console.log(`Error: Could not obtain products for catalog id:${icatalog.id}: No products were found`);
                }
                console.log("Step 2: Get assignments", pAssignment)
                let products = [];

                for (const p of pAssignment) {
                    const {data: product, pErrors} = await p.product();

                    if (pErrors) {
                        console.log(`Error: Could not obtain product for product assignment id:${p.id}:`, pErrors);
                    } else if (product === null) {
                        console.log(`Error: Could not obtain product for product assignment id:${p.id}: No product was found`);
                    }
                    console.log("Step 3: Get products, ", product)
                    products.push(product);
                }
                obtainedCatalogs.set(icatalog.sponsorId, products);
            }
            console.log("Retrieved catalogs from Amplify Data: ", obtainedCatalogs);
            return obtainedCatalogs;
        }

        async function populateCart(ampData) {
            const {data: cart, errors} = await ampData.cart();

            if (errors) {
                console.log(`Error: Could not obtain cart for driver id:${ampData.driverId}:`, errors);
                return [];
            } else if (cart === null) {
                console.log(`Error: Could not obtain cart for driver id:${ampData.driverId}: No cart was found`);
                return [];
            }

            console.log("Retried cart from Amplify Data: ", cart);

            const {data: products, errors: productErrors} = await cart.products();

            if (productErrors) {
                console.log(`Error: Could not obtain products for cart id:${cart.id}:`, productErrors);
                return [];
            } else if (products === null) {
                console.log(`Error: Could not obtain products for cart id:${cart.id}: No products were found`);
                return [];
            }

            console.log("Retrieved products from Amplify Data: ", products);
            return products;
        }

        async function populateWishlist(ampData) {
            const {data: wishlist, errors} = await ampData.wishlist();

            if (errors) {
                console.log(`Error: Could not obtain wishlist for driver id:${ampData.driverId}:`, errors);
                return [];
            } else if (wishlist === null) {
                console.log(`Error: Could not obtain wishlist for driver id:${ampData.driverId}: No wishlist was found`);
                return [];
            }

            console.log("Retrieved wishlist from Amplify Data: ", wishlist);

            const {data: products, errors: productErrors} = await wishlist.products();

            if (productErrors) {
                console.log(`Error: Could not obtain products for wishlist id:${wishlist.id}:`, productErrors);
                return [];
            } else if (products === null) {
                console.log(`Error: Could not obtain products for wishlist id:${wishlist.id}: No products were found`);
                return [];
            }

            console.log("Retried products from Amplify Data: ", products);
            return products;
        }

        async function populateSponsors(ampData) {
            const {data: sponsors, errors} = await ampData.sponsors();

            if (errors) {
                console.log(`Error: Could not obtain sponsors for driver id:${ampData.driverId}:`, errors);
                return [];
            } else if (sponsors === null) {
                console.log(`Error: Could not obtain sponsors for driver id:${ampData.driverId}: No sponsors were found`);
                return [];
            }
            console.log("Retrieved sponsors from Amplify Data: ", sponsors);
            return sponsors;
        }

        async function populatePointTotals(id) {
            let pointTotals = new Map();
            const {data: pTotals, errors} = await client.models.DriverSponsor.list({
                filter: {
                    driverId: { eq: id }
                }
            });

            if (errors) {
                console.log(`Error: Could not obtain point totals for driver id:${id}:`, errors);
                return pointTotals;
            } else if (pTotals === null) {
                console.log(`Error: Could not obtain point totals for driver id:${id}: No point totals were found`);
                return pointTotals;
            }

            for (const pt of pTotals) {
                pointTotals.set(pt.sponsorId, pt.points);
            }

            console.log("Loaded point totals: ", pointTotals);
            return pointTotals;
        }

        async function loadData() {
            const cogData = await getCogUserData();
            const dbData = await getAmpUserData(cogData.id);

            updateUserData(cogData);
            updateSponsors(await populateSponsors(dbData));
            updatePointTotals(await populatePointTotals(cogData.id));
            updateCart(await populateCart(dbData));
            updateWishlist(await populateWishlist(dbData));
            updateCatalogs(await populateCatalogs(dbData));
        }

        loadData();
    }, []);

    // Check to ensure all user data is loaded
    useEffect(() => {
        if (userData === null) return;
        if (sponsors === null) return;
        if (pointTotals === null) return;
        if (cart === null) return;
        if (wishlist === null) return;
        if (catalogs === null) return;

        console.log("Page loading finished!");
        setIsLoading(false);
    }, [pointTotals, sponsors, catalogs, cart, wishlist]);

    // TODO: This is here for the sake of testing. Remove once we can get a succesful load
    if (isLoading) {
        return (<h1>Loading...</h1>);
    } else {
        return (<h1>Success!</h1>)
    }
}
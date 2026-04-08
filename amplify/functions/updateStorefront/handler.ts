import type { EventBridgeHandler } from "aws-lambda";
import type { AboutSchema } from '../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

type tProduct = {
    id: number;
    title: string;
    images: string[];
    slug: string;
    description: string;
    category: {
        name: string;
    };
    price: number;
};

export const handler: EventBridgeHandler<"Scheduled Event", null, void> = async (event) => {
    console.log("Lambda updateStorefront triggered...");
    console.log("Event:", JSON.stringify(event));

    // Generate client
    const client = generateClient<AboutSchema>();
    // Contact the store api
    const apiStr = "https://api.escuelajs.co/api/v1/products";

    const storeRequest = await fetch(apiStr);
    const storeFront = await storeRequest.json() as tProduct[];

    if (!Array.isArray(storeFront)) {
        console.log("API did not return an array");
        return;
    }

    // Store all products available on the storefront
    const storeFrontProducts = storeFront.map( (rawProduct : tProduct) => (
        {
            pId: String(rawProduct.id),
            title: rawProduct.title,
            imgs: rawProduct.images,
            synop: rawProduct.slug,
            desc: rawProduct.description,
            catagory: rawProduct.category.name,
            price: rawProduct.price,
            available: true,
        }
    ));
    console.log("Pulled the following from Platzi: ", storeFrontProducts);

    // Store all products already present in the Product table
    const { data: tableProducts, errors: tpErrors } = await client.models.Product.list({});

    if (tpErrors) {
        console.log("Storefront Error: Could not get products from table: ", tpErrors);
        return;
    }
    console.log("Pulled the following from table Product: ", tableProducts);

    // For each product in the table that isn't in the store front products, set availability to false
    if (tableProducts !== null) {
        const storeFrontIds = new Set(storeFrontProducts.map(p => String(p.pId) ));
        const notInStoreFront = tableProducts.filter(item => !storeFrontIds.has(item.pId));

        for (const prod of notInStoreFront) {
            let iproduct = tableProducts.find(i => i.pId === prod.pId);
            if (iproduct) {
                iproduct.available = false
                const {data: updatedProd, errors: upErrors } = await client.models.Product.update(iproduct);

                if (upErrors) {
                    console.log(`Storefront Error: Could not update product:${updatedProd} :${upErrors}`);
                    return;
                } else if (updatedProd === null) {
                    console.log(`Storefront Error: Could not update product:${updatedProd} : Attempted to update null`);
                    return;
                }
            }
        }
        console.log("Marked the following products as unavailable: ", notInStoreFront);
    } 

    // Add the store front products not present in the product table
    const tableProductIds = new Set(tableProducts ? tableProducts.map(p => String(p.pId)) : []);
    const notInTable = storeFrontProducts.filter(item => !tableProductIds.has(String(item.pId)));
    console.log("Adding new products to table...");
    for (const prod of notInTable) {
        const { data: createdProd, errors: cpErrors } = await client.models.Product.create(prod);

        if (cpErrors) {
            console.log(`Storefront Error: Could not add product:${createdProd} to table :${cpErrors}`);
            return;
        } else if (createdProd === null) {
            console.log(`Storefront Error: Could not add product:${createdProd} to table : Attempted to add null`);
            return;
        }
        console.log("Added product: ", createdProd);
    }
    console.log("Lambda updateStorefront completed!")
};
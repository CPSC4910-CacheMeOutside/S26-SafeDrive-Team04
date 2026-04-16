import type { EventBridgeHandler } from "aws-lambda";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { Amplify } from "aws-amplify";
import type { AboutSchema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/update-storefront";

// Ensure AMPLIFY_DATA_DEFAULT_NAME is available

type palatziProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  slug: string;
  category: {
    name: string;
  };
};

// Generate client
const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<AboutSchema>();

const badNames = ["test", "Test", "UNIQPRODUCT", "update", "Update",
  "user", "User", "product", "Product"
];

const approvedCategories = ["Clothes", "clothes", "Furniture", "furniture", "Shoes",
  "shoes", "Technology", "technology"]

export const handler: EventBridgeHandler<
  "Scheduled Event",
  null,
  void
> = async (event) => {
  console.log("Lambda updateStorefront triggered...");
  console.log("Event:", JSON.stringify(event));

  // Contact the store api
  const apiStr = "https://api.escuelajs.co/api/v1/products";

  const storeRequest = await fetch(apiStr);
  let storeFront = (await storeRequest.json()) as palatziProduct[];

  if (!Array.isArray(storeFront)) {
    console.log("API did not return an array");
    return;
  }

  // Sanatize the inputs
  // Remove products that have a bad name
  storeFront = storeFront.filter( p => !badNames.some(name => p.title.includes(name)));
  // Remove products that are not in one of the approved categories
  storeFront = storeFront.filter( p => approvedCategories.some(category => p.category.name.includes(category)));

  // Store all products available on the storefront
  const storeFrontProducts = storeFront.map((rawProduct: palatziProduct) => ({
    pId: String(rawProduct.id),
    title: rawProduct.title,
    imgs: rawProduct.images,
    synop: rawProduct.slug,
    desc: rawProduct.description,
    category: rawProduct.category.name,
    price: rawProduct.price,
    available: true,
  }));
  console.log("Pulled the following from Platzi: ", storeFrontProducts);

  // Store all products already present in the Product table
  const { data: tableProducts, errors: tpErrors } = await client.models.Product.list({});

  if (tpErrors) {
    console.log("Storefront Error: Could not get products from table: ", JSON.stringify(tpErrors));
    return;
  }
  console.log("Pulled the following from table Product: ", JSON.stringify(tableProducts));

  // If the table is populated run availability check
  if (tableProducts.length > 0) {
    // For each product in the table that isn't in the store front products, set availability to false
    const storeFrontIds = new Set(storeFrontProducts.map((p) => String(p.pId)));
    const notInStoreFront = tableProducts.filter( (item) => !storeFrontIds.has(item.pId));

    for (const prod of notInStoreFront) {
      let iproduct = tableProducts.find((i) => i.pId === prod.pId);
      if (iproduct) {
        iproduct.available = false;
        const { data: updatedProd, errors: upErrors } = await client.models.Product.update(iproduct);

        if (upErrors) {
          console.log(
            `Storefront Error: Could not update product:${JSON.stringify(updatedProd)} : ${JSON.stringify(upErrors)}`,
          );
          return;
        } else if (updatedProd === null) {
          console.log(
            `Storefront Error: Could not update product:${JSON.stringify(updatedProd)} : Attempted to update null`,
          );
          return;
        }
      }
    }
    console.log("Marked the following products as unavailable: ", notInStoreFront);

    // For each product in the store front that isn't in the table, add it to the table
    const tableIds = new Set(tableProducts.map((p) => String(p.pId)));
    const notInTable = storeFrontProducts.filter( (item) => !tableIds.has(item.pId));

    for (const prod of notInTable) {
      // Filter out any product that might be a "test" product
  
      // Add the product
      const {data: addedProduct, errors: apErrors} = await client.models.Product.create({
        pId: prod.pId,
        title: prod.title,
        imgs: JSON.stringify(prod.imgs),
        synop: prod.synop,
        category: prod.category,
        price: prod.price,
        desc: prod.desc,
        available: true,
      });

      if (apErrors) {  
        console.log(`Storefront Error: Could not add product:${JSON.stringify(prod)} to table: ${JSON.stringify(apErrors)}`)
      }
      
    }
  }
  // If the product table is empty, add all products marked as available
  else {
    console.log(`No products in table. Adding all retrieved products...`)
    for (const prod of storeFrontProducts) { 
      // Ensure that the product is not a "test" product before being added
     
      const {data: addedProduct, errors: apErrors} = await client.models.Product.create({
      pId: prod.pId,
      title: prod.title,
      imgs: JSON.stringify(prod.imgs),
      synop: prod.synop,
      category: prod.category,
      price: prod.price,
      desc: prod.desc,
      available: true,
      });

      if (apErrors) {
        console.log(`Storefront Error: Could not add product:${JSON.stringify(prod)} to table: ${JSON.stringify(apErrors)}`);
        return;
      } else if (addedProduct === null ) {
        console.log(`Storefront Error: Could not add product:${JSON.stringify(prod)} to table: Created null`);
        return;
      }
      
    }
  }
  console.log("Lambda updateStorefront completed!");
};


export class PalatziQueryStruct {

    constructor(title='', limit=10, offset=0, minPrice=0, maxPrice=Number.MAX_SAFE_INTEGER, category='') {
        this.title = title;
        this.limit = limit;
        this.offset = offset;
        this.price_min = minPrice;
        this.price_max = maxPrice,
        this.categorySlug = category
    }

    /* Set a new set of filters while keeping the defaults
       Returns a new instance of the object*/
    update(newValues) {
        return new PalatziQueryStruct(
            newValues.title ?? this.title,
            newValues.limit ?? this.limit,
            newValues.offset ?? this.offset,
            newValues.price_min ?? this.price_min,
            newValues.price_max ?? this.price_max,
            newValues.categorySlug ?? this.categorySlug
        );
    }
}

function makeApiString(filters) {
    let base = 'https://api.escuelajs.co/api/v1/products';

    const params = Object.entries(filters)
        .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

    const apiString = params ? `${base}?${params}` : base;
    console.log("Created Palazi API String: ", apiString);
    return apiString;
}

export async function getProducts(filters){
    try {
        const apiStr = makeApiString(filters)
        const storeRequest = await fetch(apiStr);
        const storeData = await storeRequest.json();
        console.log("The API pulled the following products: ", storeData);

        let products = storeData.map(rawProduct => (
        {
            pId: rawProduct.id,
            title: rawProduct.title,
            imgs: rawProduct.images,
            synop: rawProduct.slug,
            desc: rawProduct.description,
            category: rawProduct.category.name,
            price: rawProduct.price,
            available: true,
        }
        ));
        console.log("Adding the following as the catalog: ", products)
        return products;
    } catch (err) {
        console.log("Storefront product retrieval failed: ", err);
        return null;
    }
}
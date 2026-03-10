
export class PalatziQueryStruct {

    constructor(title='', limit=10, offset=0, minPrice=0, maxPrice=Number.MAX_SAFE_INTEGER, category='') {
        this.title = title;
        this.limit = limit;
        this.offset = offset;
        this.price_min = minPrice;
        this.price_max = maxPrice,
        this.categorySlug = category
    }
}

function makeApiString(filters) {
    let apiString = 'https://api.escuelajs.co/api/v1/products'

    Object.keys(filters).filter(f => filters[f] != null)
    .forEach((filter, index) => {

        if (index === 0 ) {
            apiString += '/?'
        }

        if (filters[filter]) {
            apiString += `${filter}=${filters[filter]}`
        }

        if (!(index === keys.length-1)) {
            apiString += '&'
        }
    });
}

export async function getProducts(filters){
    try {
        const apiStr = makeApiString(filters)
        const storeRequest = await fetch(apiStr);
        const storeData = await storeRequest.json();

        let products = storeData.map(rawProduct => (
        {
            pId: rawProduct.id,
            title: rawProduct.title,
            imgs: rawProduct.images,
            synop: rawProduct.slug,
            desc: rawProduct.description,
            catagory: rawProduct.category.name,
            price: rawProduct.price,
            available: true,
        }
        ));
        return products;
    } catch (err) {
        console.log("Storefront product retrieval failed: ", err);
        return null;
    }
}
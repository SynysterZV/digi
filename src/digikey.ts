export interface iPartData {
    Description: {
        ProductDescription: string;
        DetailedDescription: string;
    };
    Manufacturer: {
        Name: string;
    };
    ProductVariations: Array<{ DigiKeyProductNumber: string }>;
    DatasheetUrl: string;
}

let token_cache: string | null = null

async function getToken() {

    if(token_cache) return token_cache

    const res = await fetch('https://sandbox-api.digikey.com/v1/oauth2/token', {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            client_id: process.env["client_id"],
            client_secret: process.env["client_secret"],
            grant_type: "client_credentials"
        })
    }).then(res => res.json())

    token_cache = res.access_token

    return res.access_token
}

async function search(part: string) {
    const url = `https://www.digikey.com/suggestions/v3/search?keywordPrefix=${part}&maxSuggestions=5`

    const res = await fetch(url, {
        headers: {
            "lang": "en",
            "site": "US",
            "x-Currency": "USD"
        }
    })

    if(res.status == 204) {
        return null
    }

    const parts = await res.json()

    return parts.suggestedProductNumbers[0].digiKeyProductNumber
}

export async function getPart(part: string): Promise<iPartData | null> {

    const token = await getToken()
    if(!token) throw new Error("Unable to authenticate")

    const partNumber = await search(part)
    if(!partNumber) throw new Error("Invalid part")

    const url = `https://sandbox-api.digikey.com/products/v4/search/${partNumber}/productdetails`

    const res = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "X-DIGIKEY-Client-Id": process.env["client_id"]
        }
    }).then(res => res.json())

    if(!res.Product) {
        return null
    }

    return res.Product
}
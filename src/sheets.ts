import { google, Auth } from "googleapis"
import { getPart } from "./digikey.js"

export async function editSheet() {
    
    const auth = new Auth.GoogleAuth({ keyFile: `${process.cwd()}/credentials.json`, scopes: ["https://www.googleapis.com/auth/spreadsheets"] })

    const client = google.sheets({ version: "v4", auth })

    const  s = await client.spreadsheets.values.get({
        spreadsheetId: process.env["spreadsheetId"],
        range: "Sheet1!C2:C"
    })

    const values = s.data.values?.flat() || []

    const data = await Promise.all(values.map(async (x, i) => {
        const product = await getPart(x)

        if(!product) throw new Error("Bruh")

        return {
            range: `D${i+2}:H${i+2}`,
            values: [
                [
                    product.Description.ProductDescription || "Not Found",
                    product.Description.DetailedDescription || "Not Found",
                    product.Manufacturer.Name || "Not Found",
                    product.ProductVariations[0]?.DigiKeyProductNumber || "Not Found",
                    product.DatasheetUrl || "Not Found"
                ]
            ]
        }
    }))

    await client.spreadsheets.values.batchUpdate({
        spreadsheetId: process.env["spreadsheetId"],
        requestBody: {
            includeValuesInResponse: true,
            valueInputOption: "RAW",
            data
        }
    })
}
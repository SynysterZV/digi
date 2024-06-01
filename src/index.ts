import "./env.js"

import { PrismaClient, Prisma } from "@prisma/client";
import { getPart } from "./digikey.js";
import { parts } from "./contants.js";

const db = new PrismaClient()

async function editDB() {

    const partData: (Prisma.PartCreateInput|null)[] = await Promise.all(parts.map(async x => {
        const product = await getPart(x)

        if(!product) return null

        return {
            PartIdentifier: x,
            DigiKeyProductNumber: product.ProductVariations[0].DigiKeyProductNumber || "Not Found",
            ProductDescription: product.Description.ProductDescription || "Not Found",
            DetailedDescription: product.Description.DetailedDescription || "Not Found",
            ManufacturerName: product.Manufacturer.Name || "Not Found",
            DatasheetUrl: product.DatasheetUrl || "Not Found"
        }
    }))

    const res = await db.part.createMany({
        // @ts-ignore
        data: partData.filter(x=>x)
    })
}

editDB()
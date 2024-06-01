import "dotenv/config"

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            client_id: string;
            client_secret: string;
            spreadsheetId: string;
        }
    }
}

let envNF: string[] = [];

["client_id", "client_secret", "spreadsheetId"].forEach(x => {
    if(!process.env[x]) envNF.push(x)
})

if(envNF.length > 0) {
    throw new Error(`Missing environment variables: ${envNF.join(", ")}`)
}
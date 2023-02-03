import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { query } = req.body;


    let paginationToken
    let mintlist: any[] = []
    const key = process.env.HELIUS_API_KEY!
    const url = `https://api.helius.xyz/v1/mintlist?api-key=${key}`
    while (true) {
        const { data }: any = await axios.post(url, {
            "query": query,
            "options": {
                "limit": 10000,
                "paginationToken": paginationToken
            }
        }).catch((err) => {
            res.status(500).json(err.message)
        })
        console.log("Mintlist: ", data.result);
        mintlist.push(...data.result)

        if (data.paginationToken) {
            paginationToken = data.paginationToken;
            console.log(`Proceeding to next page with token ${paginationToken}.`);
        } else {
            console.log('Finished getting all events.');
            break;
        }
    }

    res.status(200).json(mintlist);
}
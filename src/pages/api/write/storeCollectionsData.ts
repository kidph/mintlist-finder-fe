import fs from 'fs';
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === 'POST') {
        const { collectionData } = req.body;

        fs.writeFile('./src/lib/collections.json', JSON.stringify(collectionData), (err) => {
            if (err) {
                res.status(500).json('Error writing file');
            } else {
                res.status(200).json('File written');
            }

        })
    } else {
        res.status(405).json('Method not allowed')
    }
}
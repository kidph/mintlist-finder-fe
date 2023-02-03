import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const collections = require('../../lib/collections.json');

    res.status(200).json(collections);


}
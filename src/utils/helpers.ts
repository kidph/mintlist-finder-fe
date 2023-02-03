
import { Metaplex } from '@metaplex-foundation/js';
import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
const connection = new Connection(process.env.NEXT_PUBLIC_RPC!, 'confirmed')
const metaplex = new Metaplex(connection);


export default async function getLookupAddress(
    mint: string
) {
    const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mint!) });
    if (nft.collection) {
        const newNft = await metaplex.nfts().findByMint({ mintAddress: nft.collection.address });
        const lookupAddress = nft.collection.address.toBase58();
        const name = newNft.name!
        const collection = true
        const newObj = {
            name: name,
            collection: collection,
            lookupAddress: lookupAddress
        }
        return newObj
    } else {
        let name: string
        if (nft.json?.collection) {
            name = nft.json.collection.name!
        } else {
            name = nft.symbol!
        }
        const lookupAddress = nft.creators[0].address.toBase58();
        const collection = false
        const newObj = {
            name: name,
            collection: collection,
            lookupAddress: lookupAddress
        }
        return newObj
    }
}

export function isValidAddress(address: string) {
    try {
        new PublicKey(address)
        return true
    } catch (e) {
        return false
    }
}

export function checkIfCollectionMintlist(address: string) {
    const collectionData = require('../lib/collections.json');
    const stored = collectionData.filter((e: any) => e.lookupAddress === address)
    if (stored.length) {
        try {
            const collection = require('../lib/collections/' + stored[0].name.replace(" ", "-") + '.json')
            return collection
        } catch (e) {
            return false
        }
    }
    return false
}

export async function storeCollection(address: string, name: string, collection: boolean) {
    const collectionData = require('../lib/collections.json');
    if (collectionData.some((e: any) => e.lookupAddress === address)) return 'Already stored'
    const image = await getCollectionImage(address, collection)
    const newObj = {
        name: name,
        collection: collection,
        lookupAddress: address,
        image: image
    }
    collectionData.push(newObj)
    const result = await axios.post('/api/write/storeCollectionsData', { collectionData: collectionData })
    if (result.status === 200) {
        return { status: 200, message: "Collection Data stored" }
    } else {
        return { status: 500, message: "Collection Data not stored" }
    }
}

export async function getMintlistFromCollection(address: string) {
    const response = await axios.post("/api/getMintlist", {

        query: {
            "verifiedCollectionAddresses": [address]
        },
    })

    if (response.data) {
        const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(address) });
        let name = nft.name!
        return { mintlist: response.data, name: name, collection: true }
    } else {
        return null
    }
}
export async function getMintlistFromCreator(address: string) {
    const response = await axios.post("/api/getMintlist", {

        query: {
            "firstVerifiedCreators": [address]
        },

    });
    if (response.data) {
        let name: string
        const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(response.data[0].mint) });
        if (nft.json?.collection) {
            name = nft.json.collection.name?.replace(" ", "-")!
        } else {
            name = nft.symbol!
        }
        return { mintlist: response.data, name: name, collection: true }
    } else {
        return null
    }
}

export async function storeMintlist(name: string, mintlist: any) {
    const result = await axios.post('/api/write/storeMintlist', { name: name, mintlist: mintlist })

    if (result.status === 200) {
        return { status: 200, message: "Mintlist stored" }
    } else {
        return { status: 500, message: "Mintlist not stored" }
    }
}

async function getCollectionImage(address: string, collection: boolean) {
    if (collection) {
        const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(address) });
        return nft.json?.image
    } else {
        return '/no-image.jpg'
    }
}
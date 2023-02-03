import DownloadButton from "@/components/DownloadButton";
import getLookupAddress, {
  checkIfCollectionMintlist,
  getMintlistFromCollection,
  getMintlistFromCreator,
  isValidAddress,
  storeCollection,
  storeMintlist,
} from "@/utils/helpers";
import axios from "axios";
import Head from "next/head";
import { useEffect, useState } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type CollectionInfo = {
  name: string;
  collection: boolean;
  lookupAddress: string;
  image: string;
};

export default function Home() {
  const [collections, setCollections] = useState<CollectionInfo[]>();
  const [address, setAddress] = useState<string>("");
  const [type, setType] = useState<"collection" | "creator" | "mint">(
    "collection"
  );
  const [mintList, setMintList] = useState<any[]>();
  const [isInputError, setIsInputError] = useState<boolean>(false);
  const [viewAmount, setViewAmount] = useState<number>(8);
  const [collectionName, setCollectionName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshCollections, setRefreshCollections] = useState<boolean>(false);

  function handleAddressInput(e: React.ChangeEvent<HTMLInputElement>) {
    setAddress(e.target.value);
  }
  function handlePopularChoice(collection: CollectionInfo) {
    setAddress(collection.lookupAddress);
    setType(collection.collection ? "collection" : "creator");
  }
  function handleTypeSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setType(e.target.value as "collection" | "creator" | "mint");
  }

  async function loadCollections() {
    const response = await axios.get("/api/getCollections");
    setCollections(response.data);
    setRefreshCollections(false);
  }

  useEffect(() => {
    if (refreshCollections) loadCollections();
  }, [refreshCollections]);

  useEffect(() => {
    loadCollections();
  }, []);

  function triggerRefresh() {
    setRefreshCollections(true);
  }
  async function getMintList() {
    setIsLoading(true);
    const isValid = isValidAddress(address);
    if (!isValid) {
      setIsInputError(true);
      setTimeout(() => setIsInputError(false), 500);
      toast.error("Invalid Address", { autoClose: 1000 });
      setIsLoading(false);
      return;
    }
    let toastPromise = toast.loading(
      "Checking Address and Fetching Mintlist..."
    );
    const isCollectionData = await checkIfCollectionMintlist(address);

    if (isCollectionData) {
      setMintList(isCollectionData);
      setCollectionName(isCollectionData.name);
      toast.update(toastPromise, {
        render: "Found Collection",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setIsLoading(false);
      return;
    }

    switch (type) {
      case "collection": {
        const collectionMintlist = await getMintlistFromCollection(address);
        if (collectionMintlist) {
          setMintList(collectionMintlist.mintlist);
          setCollectionName(collectionMintlist.name);
          storeCollection(address, collectionMintlist.name, true);
          storeMintlist(collectionMintlist.name, collectionMintlist.mintlist);
          toast.update(toastPromise, {
            render: "Found Collection",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          setIsLoading(false);
          break;
        } else {
          toast.error("Could not find collection", { autoClose: 1000 });
          setIsLoading(false);
          break;
        }
      }
      case "creator": {
        const creatorMintlist = await getMintlistFromCreator(address);
        if (creatorMintlist) {
          setMintList(creatorMintlist.mintlist);
          setCollectionName(creatorMintlist.name);
          storeCollection(address, creatorMintlist.name, false);
          storeMintlist(creatorMintlist.name, creatorMintlist.mintlist);
          toast.update(toastPromise, {
            render: "Found Collection",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          setIsLoading(false);
          break;
        } else {
          toast.error("Could not find creator", { autoClose: 1000 });
          setIsLoading(false);
          break;
        }
      }
      case "mint": {
        const lookupAddress = await getLookupAddress(address);
        const storedMintlist = checkIfCollectionMintlist(
          lookupAddress.lookupAddress
        );

        if (storedMintlist) {
          setMintList(storedMintlist.mintlist);
          setCollectionName(storedMintlist.name);
          toast.update(toastPromise, {
            render: "Found Collection",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          setIsLoading(false);
        } else {
          if (lookupAddress.collection) {
            const collectionMintlist = await getMintlistFromCollection(
              lookupAddress.lookupAddress
            );
            if (collectionMintlist) {
              setMintList(collectionMintlist.mintlist);
              setCollectionName(collectionMintlist.name);
              storeCollection(address, collectionMintlist.name, true);
              storeMintlist(
                collectionMintlist.name,
                collectionMintlist.mintlist
              );
              toast.update(toastPromise, {
                render: "Found Collection",
                type: "success",
                isLoading: false,
                autoClose: 3000,
              });
              setIsLoading(false);
              break;
            } else {
              toast.error("Could not find collection", { autoClose: 1000 });
              setIsLoading(false);
              break;
            }
          } else {
            const creatorMintlist = await getMintlistFromCreator(
              lookupAddress.lookupAddress
            );
            if (creatorMintlist) {
              setMintList(creatorMintlist.mintlist);
              setCollectionName(creatorMintlist.name);
              storeCollection(address, creatorMintlist.name, false);
              storeMintlist(creatorMintlist.name, creatorMintlist.mintlist);
              toast.update(toastPromise, {
                render: "Found Collection",
                type: "success",
                isLoading: false,
                autoClose: 3000,
              });
              setIsLoading(false);
              break;
            } else {
              toast.error("Could not find creator", { autoClose: 1000 });
              setIsLoading(false);
              break;
            }
          }
        }
      }
      default: {
        toast.error("Something went wrong", { autoClose: 1000 });
        setIsLoading(false);
        break;
      }
    }
  }

  function showMore() {
    setViewAmount(collections?.length!);
  }
  function showLess() {
    setViewAmount(8);
  }

  return (
    <>
      <ToastContainer
        transition={Bounce}
        theme="colored"
        position="top-center"
      />
      <Head>
        <title>Collection Mintlist</title>
        <meta
          name="description"
          content="Find the mintlist of a collection on Solana"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-screen h-screen bg-gradient-to-tr from-blue-800 via-black-600 to-black flex flex-col justify-start items-center">
        <div className="flex flex-col items-center justify-start h-full w-3/4 mt-36">
          <div className="flex flex-row items-center justify-center w-full gap-2">
            <h1 className="text-4xl font-bold text-white">
              Collection Mintlist
            </h1>
            <div
              className="relative before:z-10 before:text-[1rem] before:absolute before:left-1/2 before:-top-3 before:w-max before:max-w-xs before:-translate-x-1/2 before:translate-y-full before:rounded-lg before:bg-neutral-700 before:px-2 before:py-1.5 before:text-white before:invisible before:content-[attr(data-tip)] after:z-10 after:absolute after:left-1/2 after:-bottom-3 after:h-0 after:w-0 after:-translate-x-1/2 after:border-8 after:border-b-gray-700 after:border-l-transparent after:border-t-transparent after:border-r-transparent after:invisible hover:before:visible hover:after:visible"
              data-tip="This app uses limited resources and thus may begin to fail after too many requests, depending on usage."
            >
              <BsInfoCircle className="text-white text-2xl cursor-pointer" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-4">
            Enter either a collection, first verified creator or an nft mint
            address below and get a downloadable JSON.
          </h2>
          <h3 className="text-sm font-bold text-white mt-2 text-center">
            * This system is not fail proof. When a verified collection is not
            found it uses the first creator (Usually the Candy Machine Creator
            ID) however, this can be removed, changed, or be an address that is
            present on multiple collections or nfts outside the desired
            collection. *
          </h3>
          <div className="flex flex-row items-center justify-center w-full mt-8 gap-2">
            {mintList?.length ? (
              <DownloadButton
                isLoading={isLoading}
                mintlist={mintList}
                name={collectionName}
              />
            ) : null}
            <input
              type="text"
              placeholder={
                type === "collection"
                  ? "Enter Collection Mint Address"
                  : type === "creator"
                  ? "Enter First Verified Creator Address"
                  : "Enter NFT Mint Address"
              }
              className={`input input-bordered w-full max-w-lg ${
                isInputError && "hover: animate-shake"
              }`}
              onChange={handleAddressInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  getMintList();
                }
              }}
              value={address}
            />
            <select
              className="select select-bordered w-sm"
              onChange={handleTypeSelect}
              value={type}
            >
              <option value="collection">Collection</option>
              <option value="creator"> Creator</option>
              <option value="mint">Mint</option>
            </select>
            <div className="h-full w-12 bg-base-100 hover:bg-neutral-700 cursor-pointer border border-neutral-700 rounded-lg flex items-center justify-center">
              <FaSearch onClick={getMintList} />
            </div>
          </div>

          <div className="flex flex-col items-start justify-center w-3/4 mt-8 gap-2 rounded-lg p-4 bg-gray-600">
            <h3 className="text-md font-bold text-white">
              Or Select From Stored Collections
            </h3>
            <h4 className="text-xs ">
              *This list is permissionless and will update when searched via
              mint*
            </h4>
            <div
              className={`flex flex-wrap items-start justify-center w-full ml-auto mr-auto h-auto
              } mt-4 gap-3`}
            >
              {collections?.slice(0, viewAmount).map((collection, i) => (
                <div
                  className="flex flex-col items-center justify-center gap-2 text-center cursor-pointer"
                  onClick={() => handlePopularChoice(collection)}
                  key={i}
                >
                  <img
                    src={collection.image}
                    className="w-12 h-12 rounded-full cursor-pointer"
                  />
                  <h4 className="text-[10px] text-white w-20 cursor-pointer">
                    {collection.name}
                  </h4>
                </div>
              ))}
            </div>
            {collections?.length! - 1 <= 8 ? null : (
              <div
                className="flex flex-col items-center justify-center ml-auto mr-auto gap-2 mt-2 cursor-pointer"
                onClick={viewAmount > 8 ? showLess : showMore}
              >
                <h4 className="text-xs text-white">
                  {viewAmount > 8 ? "View Less" : "View More"}
                </h4>
                {viewAmount > 8 ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

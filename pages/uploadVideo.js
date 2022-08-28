import Header from "../components/Header";
import { useState, useEffect } from "react";

import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/pinata";
import { ethers } from "ethers";
import DVideos from "../utils/DVideos.json";

export default function UploadVideo() {
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [price, setPrice] = useState();
  const [fileURL, setFileURL] = useState();
  const [message, setMessage] = useState("");
  const [signer, setSigner] = useState();

  const uploadVideo = async (e) => {
    let file = e.target.files[0];

    try {
      setMessage("uploading video... please wait");
      const response = await uploadFileToIPFS(file);

      if (response.success === true) {
        console.log("Uploaded to Pinata: ", response.pinataURL);
        setFileURL(response.pinataURL);
        setMessage(null);
      }
    } catch (e) {
      console.log("Error during file upload", e);
      setMessage(null);
    }
  };

  const uploadMetadataToIPFS = async () => {
    if (!title || !description || !fileURL) return;

    const nftJSON = {
      name: title,
      description,
      price: 0.01,
      image: fileURL,
    };
    console.log(nftJSON);
    try {
      //upload the metadata JSON to IPFS

      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Uploaded JSON to Pinata: ", response);
        return response.pinataURL;
      }
      console.log(response);
    } catch (e) {
      console.log("error uploading JSON metadata:", e);
      setMessage(null);
    }
  };

  const listVideo = async () => {
    try {
      const metadataURL = await uploadMetadataToIPFS();
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setMessage("Please wait.. uploading (upto 5 mins)");
      let contract = new ethers.Contract(DVideos.address, DVideos.abi, signer);
      // console.log(price);
      const price = ethers.utils.parseUnits("0.1", "ether");
      // let listingPrice = await contract.getListPrice();
      // listingPrice = listingPrice.toString();

      let transaction = await contract.createToken(metadataURL, price, {
        value: price,
      });
      await transaction.wait();

      alert("Successfully listed your NFT!");

      window.location.replace("/");
    } catch (e) {
      alert("Upload error" + e);
      setMessage(null);
    }
  };
  const loadWallet = async () => {
    await window.ethereum.enable();
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    setSigner(signer);
  };

  useEffect(() => {
    loadWallet();

  }, []);
  return (
    <div>
      <Header />
      <main className="max-w-lg mx-auto pt-10 pb-12 px-4 lg:pb-16">
        <div className="space-y-6">
          <div>
            <h1 className="text-lg leading-6 font-medium text-gray-900">
              Upload Video
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Let’s get started by filling in the information below to create
              your video.
            </p>
          </div>

          <div>
            <label
              htmlFor="project-name"
              className="block text-sm font-medium text-gray-700"
            >
              Video Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="project-name"
                id="project-name"
                className="block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border-gray-300 rounded-md"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={3}
                className="block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border border-gray-300 rounded-md"
                defaultValue={""}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* <div>
            <label
              htmlFor="project-name"
              className="block text-sm font-medium text-gray-700"
            >
              Video Price (if not intested in selling put 999 ETH)
            </label>
            <div className="mt-1">
              <textarea
                type="number"
                name="price"
                className="block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border-gray-300 rounded-md"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div> */}

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Select video
            </label>
            <div className="mt-1">
              <input
                type="file"
                accept="video/*"
                onChange={uploadVideo}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              onClick={listVideo}
              disabled={message}
            >
              Post video
            </button>
          </div>
          {message && <p>{message}</p>}
        </div>
      </main>
    </div>
  );
}

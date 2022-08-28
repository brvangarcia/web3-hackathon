import ReactPlayer from "react-player";

import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";

import DVideos from "../utils/DVideos.json";

export default function Home() {
  const [videos, setVideos] = useState();
  const [currentVideo, setCurrentVideo] = useState();
  // const [signer, setSigner] = useState();

  const loadVideos = async () => {
    try {
      const signer = await loadWallet();
      let contract = new ethers.Contract(DVideos.address, DVideos.abi, signer);
      //create an NFT Token
      let transaction = await contract.getAllNFTs();

      const items = await Promise.all(
        transaction.map(async (i) => {
          const tokenURI = await contract.tokenURI(i.tokenId);
          let { data } = await axios.get(tokenURI);

          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            owner: i.owner,
            image: data.image,
            name: data.name,
            description: data.description,
          };
          return item;
        })
      );

      setCurrentVideo(items[0]);
      setVideos(items);
    } catch (error) {
      console.log(error);
    }
  };

  const loadWallet = async () => {
    await window.ethereum.enable();
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return signer;
  };

  useEffect(() => {
    loadWallet();
    loadVideos();
  }, []);
  return (
    <div className="min-h-full">
      <main className="">
        {/* Page header */}
        <Header />

        <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
          <div className="space-y-6 lg:col-start-1 lg:col-span-2">
            {/* Description list*/}

            <section aria-labelledby="applicant-information-title">
              <div className="bg-white shadow sm:rounded-lg">
                {currentVideo && (
                  <div>
                    <div className="px-4 py-5 sm:px-6">
                      <h2
                        id="applicant-information-title"
                        className="text-lg leading-6 font-medium text-gray-900"
                      >
                        {currentVideo.name}
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {currentVideo.description}
                      </p>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Owner {currentVideo.owner}
                      </p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <ReactPlayer
                        url={currentVideo.image}
                        controls
                        fallback={() => <p>Loading video...</p>}
                      />
                    </div>
                  </div>
                )}
               
              </div>
            </section>

         
          </div>

          <section
            aria-labelledby="timeline-title"
            className="lg:col-start-3 lg:col-span-1"
          >
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
              <h2
                id="timeline-title"
                className="text-lg font-medium text-gray-900"
              >
                Videos
              </h2>

              {/* Activity Feed */}
              <div className="mt-6 flow-root">
                <ul role="list" className="-mb-8">
                  {videos &&
                    videos.map((item, itemIdx) => (
                      <li key={item.id}>
                        <div
                          className="relative pb-8"
                          onClick={() => setCurrentVideo(videos[itemIdx])}
                        >
                          <div className="relative flex space-x-3">
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {item.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {item.description}
                                </p>
                              </div>
                              <video
                                source={item.image}
                                height="100"
                                width="180"
                              />
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  {/* { this.props.videos.map((video, key) => {
              return(
                <div className="card mb-4 text-center bg-secondary mx-auto" style={{ width: '175px'}} key={key} >
                  <div className="card-title bg-dark">
                    <small className="text-white"><b>{video.title}</b></small>
                  </div>
                  <div>
                    <p onClick={() => this.props.changeVideo(video.hash, video.title)}>
                      <video
                        src={`https://ipfs.infura.io/ipfs/${video.hash}`}
                        style={{ width: '150px' }}
                      />
                    </p>
                  </div>
                </div>
              )
            })} */}
                </ul>
              </div>
              {/* <div className="mt-6 flex flex-col justify-stretch">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Advance to offer
                </button>
              </div> */}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

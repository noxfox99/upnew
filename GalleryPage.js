// GalleryPage.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PinataSDK } from "pinata";

const PINATA_API_KEY = 'd89b13f00fa146e1aa418ab686628494';  // Replace with your Infura Project ID
const PINATA_SECRET_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4ZWY3N2NlNC1lYjRkLTQ3NmQtYjc3ZC0yZjQwMWQwZTdhMmMiLCJlbWFpbCI6InNxYWltZXNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjY1YmJiYmI3YzJjMjE1NGI3YzIwIiwic2NvcGVkS2V5U2VjcmV0IjoiZTdjZDA4ZTZkZGQyNGM4NzEyZTgwZmIzMjgzNDU4MjBlZTYxNWEwNTFlNjViMTViZTdlMTgwNDFmZTczMmM2YyIsImV4cCI6MTc2MjQ1NTExM30.PC3g9CarhHwxVynKXoqQwsqC9qZoEEKZdm2EY0L7HZk';  // Replace with your Infura Project Secret
const pinata = new PinataSDK({
  pinataJwt: PINATA_SECRET_API_KEY,
  pinataGateway: "https://chocolate-internal-scorpion-907.mypinata.cloud",
});
//bafkreifye7mrysnirozj3yvho3xrhtjrrl26jxn5f6lmpcjedsjm3k7gee
const GalleryPage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const jsonUrl = params.get('jsonUrl');
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descrx, setDescrx] = useState([]);

function extractAfterFiles(url) {
    return url.split('files/')[1];
}

  useEffect(() => {
    // Fetch the JSON data from the given IPFS URL
    const fetchData = async () => {
      try {
        console.log('start');
        console.log(jsonUrl)
      //  const { dataz, contentTypex } = await pinata.gateways.get(jsonUrl);
        console.log('xxxxx');
      //  console.log(dataz);
      
        //const datac = await pinata.gateways.get("bafkreibm6jg3ux5qumhcn2b3flc3tyu6dmlb4xa7u5bf44yegnrjhc4yeq");
      const urlx = await pinata.gateways.createSignedURL({
  cid: jsonUrl,
  expires: 3000, // Number of seconds link is valid for
});

        console.log(urlx);
  console.log('bbbbb');
  const corsProxy = 'https://api.allorigins.win/get?url=';
  const proxiedUrl = `${corsProxy}${encodeURIComponent(urlx)}`;
 console.log(proxiedUrl);

        const response = await fetch(proxiedUrl);
        const datax = await response.json();
        console.log('vvvvv');
        console.log(datax);
        if (!response.ok) throw new Error('Network response was not OK');
        console.log('ggggg');
        //console.log(response);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received data is not in JSON format");
        }

        const data = JSON.parse(datax.contents);
        //console.log(data);
        //setImageUrls(data.images.map(image => image.url));
    
    async function updateImageUrls(data) {
    const imageUrls = await Promise.all(
        data.images.map(async (image) => {
            const cid = extractAfterFiles(image.url); // Extract the CID from image URL
            const signedUrl = await pinata.gateways.createSignedURL({
                cid: cid,
                expires: 3000, // Number of seconds link is valid for
            });
            return signedUrl;
        })
    );
    
    setImageUrls(imageUrls); // Set the array of signed URLs
}
setDescrx(data.description);
updateImageUrls(data);

      } catch (error) {
        console.error('Error fetching gallery data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jsonUrl]);

  if (loading) {
    return <div className="text-center text-white">Loading Gallery...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
    <header className="w-full flex md:justify-center justify-between items-center flex-col p-4 bg-gradient-to-r from-gray-700 to-gray-900 mb-6">
        <div className="flex flex-1 justify-evenly items-center flex-wrap sm:mt-0 mt-5 w-full ">
        <div className="flex flex-[0.5] justify-center items-center">
          {/* "PhotoBunker" as a button-like text */}
          <div className="flex items-center space-x-2 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-lg shadow-lg hover:opacity-75">
            <span className="text-2xl font-semibold">PhotoBunker</span>
            {/* Upload Icon SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 40 20"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v6.586l3.707-3.707a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 10.586V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
              <path d="M10 13a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
          </div>
        </div>
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {imageUrls.map((url, index) => (
          <div key={index} className="relative">
            <img
              src={url}
              alt={`Gallery Image ${index + 1}`}
              className="w-full h-auto rounded-lg shadow-lg hover:opacity-90 transition-opacity duration-200"
            />
          </div>
        ))}
      </div>
      {/* Example Text Section */}

   {/* Example Text Section */}
      <section className="w-full p-6 bg-gradient-to-r mt-2 from-gray-800 to-gray-700 text-center mb-6">
        <h2 className="text-1xl font-semibold mb-2">Комментарий</h2>
        <p className="text-md text-gray-300">
        {descrx}
        </p>
      </section>
      {/* Advertising Section */}
      <section className="w-full p-8 bg-gradient-to-r from-indigo-700 to-purple-800 text-center rounded-lg mb-6 shadow-lg">
        <h2 className="text-3xl font-bold mb-4 text-white">Реклама</h2>
        <p className="text-lg text-gray-200 mb-6">
          Присоединяйтесь к нашему сервису и получайте доступ к безопасному и анонимному хранению изображений.
        </p>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300">
          Узнать больше
        </button>
      </section>
      {/* Footer */}
      <footer className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-center">
        <p className="text-sm">Powered by PhotoBunker | Secure & Anonymous Storage</p>
      </footer>
    </div>
  );
};

export default GalleryPage;

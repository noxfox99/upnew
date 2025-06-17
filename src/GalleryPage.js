// GalleryPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { PinataSDK } from "pinata";
import Modal from 'react-modal';

const PINATA_API_KEY = 'b1adb65f27feca2b1cdc';
const PINATA_SECRET_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const pinata = new PinataSDK({
  pinataJwt: PINATA_SECRET_API_KEY,
  pinataGateway: "https://magenta-able-dormouse-779.mypinata.cloud",
});

const GalleryPage = () => {
  const { bunkerId } = useParams();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const jsonUrl = params.get('x');
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descrx, setDescrx] = useState([]);
  const [Noticex, setNoticex] = useState([]);
  const [filesDeleted, setFilesDeleted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  function extractAfterFiles(url) {
    return url.split('files/')[1];
  }

  const deleteFilesWithDelay = async (ids, delay) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, delay));
      await pinata.files.delete(ids);
    } catch (error) {
      console.error("Error deleting files:", error);
    }
  };

  const handleImageError = (event) => {
    const img = event.target;
    setTimeout(() => {
      if (!img.complete || img.naturalWidth === 0) {
        setFilesDeleted(true);
      }
    }, 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlx = await pinata.gateways.createSignedURL({
          cid: bunkerId,
          expires: 3000,
        });

        const proxyUrl = `https://photobunker.pro/proxy?url=${encodeURIComponent(urlx)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) throw new Error('Network response was not OK');
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received data is not in JSON format");
        }

        const data = await response.json();

        const imageUrls = await Promise.all(
          data.images.map(async (image) => {
            const cid = extractAfterFiles(image.url);
            const url = await pinata.gateways.createSignedURL({
              cid: cid,
              expires: 3000,
            });
            return url;
          })
        );

        setImageUrls(imageUrls);

        if (data.timex === 1 && data.xec) {
          const idsToDelete = data.xec.map((entry) => entry.id);
          setNoticex(data.timex);
          await deleteFilesWithDelay(idsToDelete, 4000);
        }

        setDescrx(data.description);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jsonUrl]);

  if (filesDeleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-800 text-white py-4 px-8 rounded-lg shadow-lg mb-6">
          Файлы были удалены и больше недоступны.
        </h1>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          Вернуться на главную страницу
        </button>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  const Loader = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <span className="text-2xl font-semibold">X</span>
        <div className="flex space-x-1">
          <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
        </div>
      </div>
      <p className="mt-4 text-sm">Загрузка... Ожидайте</p>
    </div>
  );

  const openPopup = (url) => setSelectedImage(url);
  const closePopup = () => setSelectedImage(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-0 flex flex-col md:flex-row">
      <aside className="md:w-1/4 bg-gray-800 p-4 hidden md:block">
        <a href="/" className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-lg shadow hover:opacity-80">
          <span className="text-xl font-semibold">X</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v6.586l3.707-3.707a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 10.586V4a1 1 0 011-1z" clipRule="evenodd" />
            <path d="M10 13a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
        </a>
      </aside>

      <main className="flex-1 p-4">
        {loading ? <Loader /> : (
          <>
            {Noticex == 1 && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md text-center mb-4">
                <p>Файлы были удалены и больше не существуют. Повторный просмотр файлов невозможен.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Gallery Image ${index + 1}`}
                    onClick={() => openPopup(url)}
                    className="w-full h-auto rounded-lg shadow-lg hover:opacity-90 transition-opacity duration-200"
                    onError={handleImageError}
                  />
                </div>
              ))}
            </div>

            <section className="w-full p-6 bg-gradient-to-r mt-4 from-gray-800 to-gray-700 text-center">
              <h2 className="text-1xl font-semibold mb-2">Комментарий</h2>
              <p className="text-md text-gray-300">{descrx}</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default GalleryPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PinataSDK } from "pinata";
import QRCode from 'qrcode.react'; // Импортируем компонент QRCode
import imageCompression from 'browser-image-compression';

const PINATA_API_KEY = 'b1adb65f27feca2b1cdc';  // Replace with your Infura Project ID
const PINATA_SECRET_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlZGE3OTU1ZS01NThhLTQ0YjItYmUwYS0xMmE5NTRhYmYxZGMiLCJlbWFpbCI6InJvaW92ZXJAcHJvdG9uLm1lIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImIxYWRiNjVmMjdmZWNhMmIxY2RjIiwic2NvcGVkS2V5U2VjcmV0IjoiNmUzY2RjNmExNWU1YThhNWUxNTkwMmI5NGUwMWM1MjgyY2U0ODM3ODBhMWY0ZjcwMzQxYzI3NTFjYjVhNTlkZCIsImV4cCI6MTc2NDQxMjU3Nn0.FD15exn56ICeP46SOWpCXkOqpgsR1Evh9Cde9-xnUjI';  // Replace with your Infura Project Secret
const pinata = new PinataSDK({
  pinataJwt: PINATA_SECRET_API_KEY,
  pinataGateway: "https://magenta-able-dormouse-779.mypinata.cloud/",
});
const compressAndRemoveMetadata = async (file) => {
  const options = {
    maxSizeMB: 1, // Максимальный размер файла — 1 МБ
    maxWidthOrHeight: 1920, // Изменить размер изображения до 1920x1920
    useWebWorker: true, // Включить многопоточность для повышения производительности
    exifOrientation: true, // Сохраняет правильную ориентацию, но удаляет метаданные
  };

  try {
    const compressedFile = await imageCompression(file, options); // Сжимает файл
    return compressedFile; // Возвращает обработанный файл
  } catch (error) {
    console.error('Ошибка при удалении метаданных и сжатии:', error);
    throw new Error('Ошибка удаления метаданных и сжатия.');
  }
};
const UploadService = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [comment, setComment] = useState('');
  const [galleryJsonUrl, setGalleryJsonUrl] = useState(null); // URL for the gallery JSON file
  const [expirationTime, setExpirationTime] = useState(2); // Default to 2
  const [expirationUnit, setExpirationUnit] = useState('d'); // Default to days
  const [removeMetadata, setRemoveMetadata] = useState(false);
  const [loadingx, setLoadingx] = useState(true); 
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [isdelChecked, setIsdelChecked] = useState(false);
  const [error, setError] = useState(""); // Error message state

   const handleExpirationChange = (event) => {
    const value = event.target.value;

    // Validate the input value based on the selected unit
    let maxAllowedValue;
    switch (expirationUnit) {
      case "h": // Hours
        maxAllowedValue = 24;
        break;
      case "d": // Days
        maxAllowedValue = 365;
        break;
      case "w": // Weeks
        maxAllowedValue = 52;
        break;
      case "M": // Months
        maxAllowedValue = 12;
        break;
      default:
        maxAllowedValue = Infinity;
    }

    if (value === "" || (Number(value) > 0 && Number(value) <= maxAllowedValue)) {
      setExpirationTime(value); // Update input if valid
      setError(""); // Clear error
    } else {
      setError(
        `Максимально допустимое значение для "${getUnitLabel(
          expirationUnit
        )}" - ${maxAllowedValue}.`
      );
    }
  };

  const handleUnitChange = (event) => {
    setExpirationUnit(event.target.value);
    setError(""); // Reset error when unit changes
  };

  const getUnitLabel = (unit) => {
    switch (unit) {
      case "h":
        return "Часы";
      case "d":
        return "Дни";
      case "w":
        return "Недели";
      case "M":
        return "Месяцы";
      default:
        return "";
    }
  };

  
  
    // Simulate page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingx(false);
    }, 3000); // Simulate a 3-second page load

    return () => clearTimeout(timer); // Cleanup timer
  }, []);
   const handleCheckboxChange = (event) => {
    setIsdelChecked(event.target.checked);
  };
  // Loader component
  const Loader = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <span className="text-2xl font-semibold">X Image</span>
        <div className="flex space-x-1">
          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "1.2s" }}></span>
          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "1.4s" }}></span>
        </div>
      </div>
      <p className="mt-4 text-sm">Загрузка... Ожидайте</p>
    </div>
  );

const handleFileChange = async (event) => {
  const selectedFiles = Array.from(event.target.files);

  try {
    const processedFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        if (removeMetadata) {
          return await compressAndRemoveMetadata(file);
        }
        return file; // Если флажок не выбран, возвращаем исходный файл
      })
    );

    if (processedFiles.length + files.length <= 10) {
      setFiles((prevFiles) => [...prevFiles, ...processedFiles]);
    } else {
      alert('Можно загрузить не более 10 файлов.');
    }
  } catch (error) {
    console.error('Ошибка обработки файлов:', error);
    alert('Не удалось обработать файлы.');
  }
};


   const createGalleryJson = (imageUrls,descrx,idxc) => {
     const advancedDelChecked = isdelChecked;
     console.log(advancedDelChecked);
    return JSON.stringify({
      title: "Gallery",
      timex: advancedDelChecked ? 1 : 3,
      description: descrx,
      images: imageUrls.map(url => ({ url })),
      xec: idxc.map(id => ({ id })),
    }, null, 2);
  };
  
  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length + files.length <= 10) {
      setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    } else {
      alert('You can only upload a maximum of 10 files.');
    }
  };
  
    const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://photobunker.pro/gallery/${encodeURIComponent(galleryJsonUrl)}`);
    alert("Ссылка скопирована в буфер обмена!");
  };

  const handleDeleteNow = () => {
    window.location.reload();
  };
  
  const handleDragOver = (event) => {
    event.preventDefault();
  };

const handleUpload = async () => {
    setLoading(true);
    const imageUrls = [];
    const idxc = [];

    try {
      // Step 1: Upload each image and get its URL
      const uploadPromises = files.map(async (file) => {
        const response = await pinata.upload.file(file);
        imageUrls.push(`https://chocolate-internal-scorpion-907.mypinata.cloud/files/${response.cid}`);
        idxc.push(`${response.id}`);
      });
      await Promise.all(uploadPromises);

      // Step 2: Create JSON content for the gallery
      const jsonContent = createGalleryJson(imageUrls,comment,idxc);
      const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
      const jsonFile = new File([jsonBlob], 'gallery.json', { type: 'application/json' });

      // Step 3: Upload JSON file to IPFS
      const jsonResponse = await pinata.upload.file(jsonFile);
      console.log('test')
            console.log(jsonResponse.cid)

   
    //const datax = await pinata.gateways.get(jsonResponse.cid);
    //console.log(datax)

    setGalleryJsonUrl(`${jsonResponse.cid}`);
    //console.log(datax)
    setFilesUploaded(true);

  

      
      console.log(jsonResponse.cid)
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files.');
    } finally {
      setLoading(false);
      setFiles([]);
    }
  };
  const Loaderx = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <span className="text-2xl font-semibold">X</span>
        <div className="flex space-x-1">
          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
        </div>
      </div>
      <p className="mt-4 text-sm">Загрузка... Ожидайте</p>
    </div>
  );
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
    <div className="flex flex-col items-center p-1 bg-gradient-to-r from-gray-800 to-black text-white min-h-screen">
      {/* Header Section */}
             <header className="w-full flex md:justify-center justify-between items-center flex-col p-2 bg-gradient-to-r from-gray-700 to-gray-900 mb-4">

<div className="flex justify-between items-center w-full sm:mt-0 mt-5">
  {/* Center Content */}
  <div className="flex flex-1 justify-center items-center">
    {/* "PhotoBunker" as a button-like text */}
    <a href="/">
     
    {/* Replace "X" with your PNG logo */}
    <img
      src="logo.png" // <-- Update this path
      alt="PhotoBunker"
      className="h-8 w-auto" // Adjust size as needed
    />
</a>
  </div>

  {/* Right-aligned Telegram SVG */}
  <div className="flex flex-[0.1] justify-end">
    <a href="https://t.me/photobunker_bot" target="_blank" rel="noopener noreferrer">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Telegram"
        viewBox="0 0 512 512"
        className="w-8 h-8 cursor-pointer hover:opacity-75"
      >
        <rect width="512" height="512" fill="#37aee2" rx="15%"></rect>
        <path fill="#c8daea" d="M199 404c-11 0-10-4-13-14l-32-105 245-144"></path>
        <path fill="#a9c9dd" d="M199 404c7 0 11-4 16-8l45-43-56-34"></path>
        <path
          fill="#f6fbfe"
          d="M204 319l135 99c14 9 26 4 30-14l55-258c5-22-9-32-24-25L79 245c-21 8-21 21-4 26l83 26 190-121c9-5 17-3 11 4"
        ></path>
      </svg>
    </a>
  </div>
</div>

            </header>
      {!filesUploaded && ( <h1 className="text-white text-2xl sm:text-2xl py-2 text-gradient ">Загрузите файлы в IPFS</h1>  )}
                  {!filesUploaded && (
      <div className="border-dashed border-4 border-white p-10 w-full max-w-lg text-center cursor-pointer bg-gray-900 rounded-lg shadow-lg hover:opacity-75 transition"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="block text-xl font-semibold">
          Перетащите файлы или кликните для загрузки
        </label>
      </div>
   )}
{/* Expires Section */}
{/* Stylish Settings Box */}
{!filesUploaded && (
<div style={{
    background: 'linear-gradient(to right, #111827, rgb(55 65 81))',
    border: '1px solid rgb(55 65 81)',
  }} className="mt-2 p-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl max-w-lg w-full space-y-4">
{/*  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Настройки</h2> */}

  {/* Expires Section */}
  <div style={{
    background: 'linear-gradient(to right, #111827, rgb(55 65 81))',
    border: '1px solid rgb(55 65 81)',
  }} className="flex flex-wrap items-center space-y-3 sm:space-y-0 sm:space-x-3 p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-md">
    <label
      style={{
      color:'white',
  }}
      htmlFor="expires"
      className="block sm:inline text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0"
    >
      Срок хранения:
    </label>
    <input
      type="text"
      value={expirationTime}
      onChange={handleExpirationChange}
style={{
    color:'white',
    background: 'linear-gradient(to right, #111827, rgb(55 65 81))',
    border: '1px solid rgb(55 65 81)',
  }}
      className="w-full sm:w-20 p-2 text-sm font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
    />
    <select
      value={expirationUnit}
      onChange={handleUnitChange}
style={{
    color:'white',
    background: 'linear-gradient(to right, #111827, rgb(55 65 81))',
    border: '1px solid rgb(55 65 81)',
  }}
      className="w-full sm:w-auto p-2 text-sm font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
    >
      <option style={{
    color:'white',
    background: 'rgb(55, 65, 81)',
    border: '1px solid rgb(55 65 81)',
  }} value="h">Часы</option>
      <option style={{
    color:'white',
    background: 'rgb(55, 65, 81)',
    border: '1px solid rgb(55 65 81)',
  }} value="d">Дни</option>
      <option style={{
    color:'white',
    background: 'rgb(55, 65, 81)',
    border: '1px solid rgb(55 65 81)',
  }} value="w">Недели</option>
      <option style={{
    color:'white',
    background: 'rgb(55, 65, 81)',
    border: '1px solid rgb(55 65 81)',
  }} value="M">Месяцы</option>
    </select>
{error && (
               <div className="flex items-center text-red-500 text-sm mt-2 sm:mt-0">
          {/* Error Icon (SVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 32 32"
            style={{ marginRight: "8px" }}
          >
            <circle cx="16" cy="16" r="16" style={{ fill: "#D72828" }} />
            <path
              d="M14.5,25h3v-3h-3V25z M14.5,6v13h3V6H14.5z"
              style={{ fill: "#E6E6E6" }}
            />
          </svg>
          <p>{error}</p>
        </div>
      )}
</div>


  
  {/* Additional Settings */}
  <div style={{
    background: 'linear-gradient(to right, #111827, rgb(55 65 81))',
    border: '1px solid rgb(55 65 81)',
  }} className="mt-2 p-6 bg-gray-200 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl max-w-lg w-full space-y-4">
   {/* <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Дополнительные настройки</h3>*/}
    <ul className="space-y-2">
    <li className="flex items-center">
        <input
          id="advanced-del"
          type="checkbox"
          checked={isdelChecked}
          onChange={handleCheckboxChange}
        style={{
    color:'white',
    background: 'linear-gradient(to right, #111827, rgb(55 65 81))',
    border: '1px solid rgb(55 65 81)',
  }}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
        />
        <label style={{
    color:'white',
  }}
          htmlFor="advanced-encryption"
          className="ml-3 text-sm font-medium text-gray-800 dark:text-gray-300"
        >
          Удалить после просмотра
        </label>
      </li>
      <li className="flex items-center">
       <input
  id="remove-metadata"
  type="checkbox"
style={{
    color:'white',
    background: 'linear-gradient(to right, #111827, rgb(55 65 81))',
    border: '1px solid rgb(55 65 81)',
  }}
  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
  checked={removeMetadata}
  onChange={() => setRemoveMetadata(!removeMetadata)}
/>
<label
  htmlFor="remove-metadata"
style={{
    color:'white',
  }}
  className="ml-3 text-sm font-medium text-gray-800 dark:text-gray-300"
>
  Сжать и удалить метаданные
</label>
      </li>
    </ul>
  </div>
</div>

)}

      {files.length > 0 && (
        <div className="mt-6 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-4">Ваши Файлы:</h2>
          <div className="grid grid-cols-2 gap-4">
            {files.map((file, index) => (
    <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg cursor-pointer"
                onClick={() => {
                  setSelectedImage(URL.createObjectURL(file));
                  setIsPopupOpen(true);
                }}
              />
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {file.name}
              </span>
            </div>
            ))}
          </div>
{/* Hint Section */}
{/* Hint Section */}
<div className="flex flex-col items-center mt-6">
  <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-500 shadow-lg shadow-green-500/50 p-3 mx-4 rounded-md">
    Метаданные были успешно очищены при загрузке. Ваши файлы безопасны и защищены от лишней информации.
  </p>
</div>

          <div style={{
    background: 'linear-gradient(to right, #111827, rgb(55 65 81))',
    border: '1px solid rgb(55 65 81)',
  }} className="mt-3 w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
   
        <div style={{
    background: 'linear-gradient(to right, #111827, rgb(55 65 81))',
    border: '1px solid rgb(55 65 81)',
  }} className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
          <label htmlFor="comment" className="sr-only">Your comment</label>
          <textarea
          id="comment"
          rows="4"
style={{
    background: 'linear-gradient(to right, #111827, rgb(55 65 81))',
    border: '1px solid rgb(55 65 81)',
    color: 'white',
  }}
          className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
          placeholder="Комментарий..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
        </div>
             <div class="text-xs flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
         * Комментарии будут добавлены ко всем загружаемым файлам
                  </div>  
             {/* Popup for previewing image and comment */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg max-w-xl">
            <button
              onClick={() => setIsPopupOpen(false)}
              className="text-red-600 float-right"
            >
              X
            </button>
            <img src={selectedImage} alt="Selected" className="w-full h-auto rounded" />
            <p className="mt-4 text-gray-700">{comment}</p>
          </div>
        </div>
      )}
      </div>
        </div>
      )}
{!filesUploaded && (
      <button
        onClick={handleUpload}
        className={`mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-6 rounded-lg transition ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-75'
        }`}
        disabled={loading || files.length === 0}
      >
        {loading ? 'Загрузка...' : 'Загрузить файлы'}
      </button>
)}
      {loading && (
        <div className="mt-4 text-center text-lg font-semibold">
          <p>Загрузка... Ожидайте</p>
        </div>
      )}
{galleryJsonUrl && (
  <div className="flex flex-col justify-center items-center mt-3 w-full max-w-lg">
    <h1 className="text-white text-2xl sm:text-2xl py-2 text-gradient text-center">Галерея доступна по ссылке</h1>
  </div>
)}
 {galleryJsonUrl && (
        <div className="flex items-center p-4 mt-6 border border-gray-300 bg-gray-100 rounded-lg shadow-md dark:border-gray-700 dark:bg-gray-800">
          <div className="mr-4">
            <QRCode value={`https://upfx.vercel.app/gallery/${encodeURIComponent(galleryJsonUrl)}`} size={100} />
          </div>
          <div className="flex-1">
            <textarea
              readOnly
              value={`https://upfx.vercel.app/gallery/${encodeURIComponent(galleryJsonUrl)}`}
              className="w-full p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded resize-none focus:outline-none dark:bg-gray-700 dark:text-white"
            />
            <div className="flex mt-2 space-x-2">
          <button
  onClick={() => window.open(`${window.location.origin}/gallery/${encodeURIComponent(galleryJsonUrl)}`, '_blank')}
  className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
>
  Открыть галерею
</button>

             <button
  onClick={handleCopyUrl}
  className="p-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg shadow-md transition duration-300"
  style={{ display: "inline-block", whiteSpace: "nowrap" }} // Ensures proper alignment
>
  {/* SVG Icon */}
  <svg
    style={{ display: "inline-block", whiteSpace: "nowrap" }}
    width="20px"
    height="20px"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-2" // Adds some space between the icon and text
  >
    <path
      d="M9 12C9 13.3807 7.88071 14.5 6.5 14.5C5.11929 14.5 4 13.3807 4 12C4 10.6193 5.11929 9.5 6.5 9.5C7.88071 9.5 9 10.6193 9 12Z"
      stroke="#1C274C"
      strokeWidth="1.5"
    />
    <path
      d="M14 6.5L9 10"
      stroke="#1C274C"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 17.5L9 14"
      stroke="#1C274C"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M19 18.5C19 19.8807 17.8807 21 16.5 21C15.1193 21 14 19.8807 14 18.5C14 17.1193 15.1193 16 16.5 16C17.8807 16 19 17.1193 19 18.5Z"
      stroke="#1C274C"
      strokeWidth="1.5"
    />
    <path
      d="M19 5.5C19 6.88071 17.8807 8 16.5 8C15.1193 8 14 6.88071 14 5.5C14 4.11929 15.1193 3 16.5 3C17.8807 3 19 4.11929 19 5.5Z"
      stroke="#1C274C"
      strokeWidth="1.5"
    />
  </svg>
  {/* Button Text */}
  <span>Копировать</span>
</button>

            </div>
          </div>
        </div>
      )}
      {uploadedUrls.length > 0 && (
        <div className="mt-6 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-4">Загруженные Файлы:</h2>
          <div>
            {uploadedUrls.map((url, index) => (
              <div key={index} className="text-center mb-4">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {url}
                </a>
              </div>
            ))}
          </div>

        </div>
      )}
        <div className="w-full flex flex-col items-center bg-gray-900 py-10 px-4 text-white my-10 rounded-lg shadow-lg max-w-screen-lg mx-auto">
  <h2 className="text-2xl font-bold mb-6 text-center">Почему выбрать наш сервис?</h2>
  <p className="text-md text-center mb-8">
    Наш фотохостинг обеспечивает полную анонимность, безопасность и доступность ваших данных благодаря передовым технологиям хранения.
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full px-4">
        {/* Advances Encryption Section */}
<div className="flex flex-col items-center bg-gray-800 rounded-lg shadow-md p-6 transform hover:scale-105 hover:shadow-lg transition-transform duration-300 ease-in-out">
  <svg
    className="w-10 h-10 text-blue-400 mb-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
  <h3 className="text-lg font-semibold">Продвинутое Шифрование</h3>
  <p className="text-sm mt-2 text-gray-400">
    Криптографическая стойкость SHA-256 основана на вычислительной сложности подбора правильного хэша. Даже при использовании современных суперкомпьютеров, перебор всех возможных комбинаций занял бы миллиарды лет. Это делает хэши IPFS устойчивыми к атакам методом полного перебора (brute force).
  </p>
</div>
    {/* Privacy Section */}
<div className="flex flex-col items-center bg-gray-800 rounded-lg shadow-md p-6 transform hover:scale-105 hover:shadow-lg transition-transform duration-300 ease-in-out">
  <svg className="w-10 h-10 text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354V19m7-7H5m11-5l-3-3-3 3M6 6h12m-2 10l3 3-3-3m-10 3l3-3m0 0l-3 3"></path>
  </svg>
  <h3 className="text-lg font-semibold">Приватность и Безопасность</h3>
  <p className="text-sm mt-2 text-gray-400">
    Мы удаляем метаданные из файлов для защиты вашей приватности. Это предотвращает возможность передачи личной информации, такой как местоположение, время создания и другие данные, которые могут быть встроены в файлы.
  </p>
</div>

    {/* Anonymity Section */}
    <div className="flex flex-col items-center bg-gray-800 rounded-lg shadow-md p-6 transform hover:scale-105 hover:shadow-lg transition-transform duration-300 ease-in-out">
      <svg className="w-10 h-10 text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16v5H4zM4 15h16v5H4zM4 9a8 8 0 1116 0v1H4z"></path>
      </svg>
      <h3 className="text-lg font-semibold">Полная Анонимность</h3>
      <p className="text-sm mt-2 text-gray-400">
        Мы не собираем личные данные и не отслеживаем активность. Ваши файлы защищены и доступны только вам.
      </p>
    </div>

    {/* Secure Storage Section */}
    <div className="flex flex-col items-center bg-gray-800 rounded-lg shadow-md p-6 transform hover:scale-105 hover:shadow-lg transition-transform duration-300 ease-in-out">
      <svg className="w-10 h-10 text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7-9 7-9-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10v8a1 1 0 001 1h3m10 0h3a1 1 0 001-1v-8"></path>
      </svg>
      <h3 className="text-lg font-semibold">Распределенное Хранилище</h3>
      <p className="text-sm mt-2 text-gray-400">
        Ваши файлы надежно хранятся в сети IPFS, обеспечивая высокий уровень безопасности и доступности.
      </p>
    </div>
{/* Advances Encryption Section */}
<div className="flex flex-col items-center bg-gray-800 rounded-lg shadow-md p-6 transform hover:scale-105 hover:shadow-lg transition-transform duration-300 ease-in-out">
  <svg
    className="w-10 h-10 text-blue-400 mb-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
  <h3 className="text-lg font-semibold">Целостность Данных</h3>
  <p className="text-sm mt-2 text-gray-400">
    <strong>Как это обеспечивает безопасность?</strong> Алгоритм SHA-256 не только защищает файлы от взлома, но и обеспечивает целостность данных. Если кто-то попытается изменить файл, новый хэш сразу выявит подмену. Это делает хранение на платформе безопасным и надёжным.
  </p>
</div>

    {/* 24/7 Uptime Section */}
    <div className="flex flex-col items-center bg-gray-800 rounded-lg shadow-md p-6 transform hover:scale-105 hover:shadow-lg transition-transform duration-300 ease-in-out">
      <svg className="w-10 h-10 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-3.7 0-6.7 3-6.7 6.7S8.3 21.3 12 21.3s6.7-3 6.7-6.7c0-2.9-1.8-5.5-4.5-6.4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15l3 3 3-3"></path>
      </svg>
      <h3 className="text-lg font-semibold">Доступность 24/7</h3>
      <p className="text-sm mt-2 text-gray-400">
        Мы обеспечиваем круглосуточную доступность сервиса, чтобы ваши файлы были всегда под рукой.
      </p>
    </div>
  </div>
</div>

     {/*    <div>
      <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white"> </h3>
      <ul className="grid w-full gap-6 md:grid-cols-3">
        <li>
          <input type="checkbox" id="react-option" className="hidden peer" required />
          <label
            htmlFor="react-option"
            className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <div className="block">
                            <svg
                className="mb-2 w-7 h-7 text-green-400"
                fill="currentColor"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M356.9 64.3H280l-56 88.6-48-88.6H0L224 448 448 64.3h-91.1z..."></path>
              </svg>
              <div className="w-full text-lg font-semibold">Рекламный Блок</div>
              <div className="w-full text-sm">Отправте запрос на info@photobunker.pro</div>
            </div>
          </label>
        </li>

        <li>
          <input type="checkbox" id="flowbite-option" className="hidden peer" />
          <label
            htmlFor="flowbite-option"
            className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <div className="block">
              <svg
                className="mb-2 w-7 h-7 text-green-400"
                fill="currentColor"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M356.9 64.3H280l-56 88.6-48-88.6H0L224 448 448 64.3h-91.1z..."></path>
              </svg>
              <div className="w-full text-lg font-semibold">Рекламный Блок</div>
              <div className="w-full text-sm">Отправте запрос на info@photobunker.pro</div>
            </div>
          </label>
        </li>

        <li>
          <input type="checkbox" id="angular-option" className="hidden peer" />
          <label
            htmlFor="angular-option"
            className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <div className="block">
                  <svg
                className="mb-2 w-7 h-7 text-green-400"
                fill="currentColor"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M356.9 64.3H280l-56 88.6-48-88.6H0L224 448 448 64.3h-91.1z..."></path>
              </svg>
               <div className="w-full text-lg font-semibold">Рекламный Блок</div>
              <div className="w-full text-sm">Отправте запрос на info@photobunker.pro</div>
            </div>
          </label>
        </li>
      </ul>
    </div>*/}
   <section className="mt-20 w-full flex flex-col items-center bg-white-800 p-10 text-white my-5 items-start white-glassmorphism p-3 m-2 cursor-pointer hover:shadow-xl mt-10">
        <h2 className="text-2xl font-bold mb-4 text-gradient">Почему IPFS?</h2>
        <p className="text-white text-base text-center mx-2 text-center mb-4 text-white py-2 text-gradient">
          IPFS (InterPlanetary File System) — это децентрализованный протокол, который позволяет эффективно хранить и делиться данными. Благодаря IPFS, ваши файлы будут доступны в любое время, из любой точки мира, без рисков утраты данных.
        </p>
      </section>
         <section className="mt-5 w-full flex flex-col items-center bg-white-800 p-10 text-white my-20 items-start white-glassmorphism p-3 m-2 cursor-pointer hover:shadow-xl mt-10">
        <h2 className="text-2xl font-bold mb-4 text-gradient">Удаление Метаданных</h2>
        <p className="text-white text-base text-center mx-2 text-center mb-4 text-white py-2 text-gradient">
          Загружаемый файл отчищается от таких метаданных как геолокация, телефон, разрешение девайса и прочих дополнительных данных, гарантируя анонимность источника создания
        </p>
      </section>
      {/* Footer Section */}
      <footer className="w-full flex md:justify-center justify-between items-center flex-col p-4 bg-gradient-to-r from-gray-700 to-gray-900 mt-10">
        <div className="w-full flex sm:flex-row flex-col justify-between items-center my-4">
          <div className="flex flex-[0.5] justify-center items-center">
          <div className="flex flex-1 justify-evenly items-center flex-wrap sm:mt-0 mt-5 w-full ">

          <div className="w-10 h-10 rounded-full flex justify-center items-center bg-[#2952E3]">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 16 16"
              fontSize="21"
              className="text-white"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647z"
              ></path>
            </svg>
                        <p className="text-white text-4xl sm:text-5xl py-2 text-gradient">X</p>

          </div>
          </div>
          </div>
          <div className="flex flex-1 justify-evenly items-center flex-wrap sm:mt-0 mt-5 w-full ">
          </div>
        </div>
                   <div className="flex flex-[0.1] justify-end items-center">
    <a href="https://t.me/photobunker_bot" target="_blank" rel="noopener noreferrer">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Telegram"
        viewBox="0 0 512 512"
        className="w-8 h-8 cursor-pointer hover:opacity-75"
      >
        <rect width="512" height="512" fill="#37aee2" rx="15%"></rect>
        <path fill="#c8daea" d="M199 404c-11 0-10-4-13-14l-32-105 245-144"></path>
        <path fill="#a9c9dd" d="M199 404c7 0 11-4 16-8l45-43-56-34"></path>
        <path
          fill="#f6fbfe"
          d="M204 319l135 99c14 9 26 4 30-14l55-258c5-22-9-32-24-25L79 245c-21 8-21 21-4 26l83 26 190-121c9-5 17-3 11 4"
        ></path>
      </svg>
    </a>
  </div>      
        <div className="flex justify-center items-center flex-col mt-5">
          <p className="text-white text-sm text-center">Бесплатное хранилище нового поколения для ваших медиафайлов</p>
          <p className="text-white text-sm text-center font-medium mt-2">support@x.pro</p>
        </div>
        <div className="sm:w-[90%] w-full h-[0.25px] bg-gray-400 mt-5 "></div>
        <div className="sm:w-[90%] w-full flex justify-between items-center mt-3">
          <p className="text-white text-left text-xs">X 2024</p>
          <p className="text-white text-right text-xs">All rights reserved</p>
        </div>
      </footer>
    </div>
 )}
    </>
  );
};

export default UploadService;

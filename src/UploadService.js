import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import QRCode from 'qrcode.react';
import { PinataSDK } from 'pinata';

// Pinata credentials
const PINATA_API_KEY = 'b1adb65f27feca2b1cdc';
const PINATA_SECRET_API_KEY = 'eyJhbGciOiJIUzI1NiI...';
const pinata = new PinataSDK({
  pinataJwt: PINATA_SECRET_API_KEY,
  pinataGateway: 'https://chocolate-internal-scorpion-907.mypinata.cloud',
});

function UploadService() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [galleryJsonUrl, setGalleryJsonUrl] = useState(null);
  const [expirationTime, setExpirationTime] = useState(2);
  const [expirationUnit, setExpirationUnit] = useState('d');
  const [removeMetadata, setRemoveMetadata] = useState(false);
  const [isdelChecked, setIsdelChecked] = useState(false);
  const [comment, setComment] = useState('');
  const [loadingx, setLoadingx] = useState(true);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Initial loader
  useEffect(() => {
    const timer = setTimeout(() => setLoadingx(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  // Success message timer
  useEffect(() => {
    if (!filesUploaded) return;
    const timer = setTimeout(() => setFilesUploaded(false), 5000);
    return () => clearTimeout(timer);
  }, [filesUploaded]);

  // Custom select logic
  useEffect(() => {
    function closeAllSelect() {
      document.querySelectorAll('.select-items').forEach(el => el.classList.add('select-hide'));
      document.querySelectorAll('.select-selected').forEach(el => el.classList.remove('select-arrow-active'));
    }
    document.querySelectorAll('.custom-select').forEach(selEl => {
      const selected = selEl.querySelector('.select-selected');
      selected.addEventListener('click', e => {
        e.stopPropagation(); closeAllSelect();
        selEl.querySelector('.select-items').classList.toggle('select-hide');
        selected.classList.toggle('select-arrow-active');
      });
    });
    document.addEventListener('click', closeAllSelect);
    return () => document.removeEventListener('click', closeAllSelect);
  }, []);

  const handleFileChange = e => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected].slice(0, 10));
  };
  const handleDrop = e => { e.preventDefault(); handleFileChange(e); };
  const handleDragOver = e => e.preventDefault();
  const handleExpirationChange = e => setExpirationTime(e.target.value);
  const handleUnitChange = e => setExpirationUnit(e.target.value);
  const handleCheckboxChange = e => setIsdelChecked(e.target.checked);

  const createGalleryJson = (imageUrls, descrx, idxc) => JSON.stringify({
    title: 'Gallery', timex: isdelChecked ? 1 : 3, description: descrx,
    images: imageUrls.map(url => ({ url })), xec: idxc.map(id => ({ id })),
  }, null, 2);

  const handleUpload = async () => {
    setLoading(true); setError('');
    try {
      const imageUrls = [], idxc = [];
      await Promise.all(files.map(async file => {
        const res = await pinata.upload.file(file);
        imageUrls.push(`https://chocolate-internal-scorpion-907.mypinata.cloud/files/${res.cid}`);
        idxc.push(res.id);
      }));
      const jsonBlob = new Blob([createGalleryJson(imageUrls, comment, idxc)], { type: 'application/json' });
      const jsonFile = new File([jsonBlob], 'gallery.json');
      const jsonRes = await pinata.upload.file(jsonFile);
      setGalleryJsonUrl(jsonRes.cid);
      setFilesUploaded(true);
      setFiles([]);
    } catch {
      setError('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    const url = `https://upfx.vercel.app/gallery/${galleryJsonUrl}`;
    navigator.clipboard.writeText(url);
    alert('Ссылка скопирована');
  };

  if (loadingx) return <div className="loading">Loading...</div>;

  return (
    <div>
      <header>
            <div class="logo">
                <svg width="115" height="42" viewBox="0 0 115 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M94.9447 20.0833C93.6603 20.0833 92.5116 19.805 91.4985 19.2483C90.4854 18.6916 89.6894 17.9014 89.1105 16.8777C88.5316 15.8361 88.2422 14.606 88.2422 13.1873C88.2422 11.7506 88.5316 10.5114 89.1105 9.46984C89.7075 8.42825 90.5125 7.62909 91.5256 7.07238C92.5568 6.51566 93.7146 6.2373 94.999 6.2373C96.2834 6.2373 97.4322 6.51566 98.4452 7.07238C99.4764 7.62909 100.281 8.42825 100.86 9.46984C101.457 10.4935 101.756 11.7147 101.756 13.1334C101.756 14.5701 101.457 15.8092 100.86 16.8508C100.263 17.8924 99.4493 18.6916 98.4181 19.2483C97.387 19.805 96.2292 20.0833 94.9447 20.0833ZM94.9176 18.1708C95.7136 18.1708 96.4643 18.0002 97.1699 17.6589C97.8754 17.2998 98.4452 16.752 98.8794 16.0157C99.3317 15.2615 99.5578 14.3097 99.5578 13.1603C99.5578 11.993 99.3407 11.0412 98.9066 10.3049C98.4724 9.56862 97.9025 9.02986 97.197 8.68865C96.5096 8.32948 95.7678 8.14989 94.9719 8.14989C94.1759 8.14989 93.4342 8.32948 92.7467 8.68865C92.0593 9.02986 91.4985 9.57759 91.0643 10.3319C90.6482 11.0682 90.4402 12.011 90.4402 13.1603C90.4402 14.3276 90.6482 15.2794 91.0643 16.0157C91.4804 16.752 92.0231 17.2998 92.6925 17.6589C93.3799 18.0002 94.1216 18.1708 94.9176 18.1708Z" fill="#F5F4F3"/>
                    <path d="M81.7696 6.42657V2.65527H83.8047V6.42657H87.4138V8.31222H83.8047V15.5585C83.8047 16.3846 83.9766 16.9862 84.3203 17.3633C84.6821 17.7405 85.1344 17.9649 85.6771 18.0368C86.2379 18.1086 86.8168 18.1086 87.4138 18.0368V19.7877C86.7083 19.9494 86.0118 19.9943 85.3243 19.9224C84.655 19.8506 84.049 19.653 83.5063 19.3298C82.9816 18.9886 82.5565 18.5127 82.2309 17.9021C81.9233 17.2915 81.7696 16.5103 81.7696 15.5585V8.31222H79.7344V6.42657H81.7696Z" fill="#F5F4F3"/>
                    <path d="M72.1127 20.0833C70.8283 20.0833 69.6795 19.805 68.6665 19.2483C67.6534 18.6916 66.8574 17.9014 66.2785 16.8777C65.6996 15.8361 65.4102 14.606 65.4102 13.1873C65.4102 11.7506 65.6996 10.5114 66.2785 9.46984C66.8755 8.42825 67.6805 7.62909 68.6936 7.07238C69.7247 6.51566 70.8825 6.2373 72.167 6.2373C73.4514 6.2373 74.6001 6.51566 75.6132 7.07238C76.6444 7.62909 77.4494 8.42825 78.0283 9.46984C78.6253 10.4935 78.9238 11.7147 78.9238 13.1334C78.9238 14.5701 78.6253 15.8092 78.0283 16.8508C77.4313 17.8924 76.6172 18.6916 75.5861 19.2483C74.5549 19.805 73.3971 20.0833 72.1127 20.0833ZM72.0856 18.1708C72.8815 18.1708 73.6323 18.0002 74.3378 17.6589C75.0434 17.2998 75.6132 16.752 76.0474 16.0157C76.4997 15.2615 76.7258 14.3097 76.7258 13.1603C76.7258 11.993 76.5087 11.0412 76.0745 10.3049C75.6404 9.56862 75.0705 9.02986 74.365 8.68865C73.6775 8.32948 72.9358 8.14989 72.1398 8.14989C71.3438 8.14989 70.6021 8.32948 69.9147 8.68865C69.2273 9.02986 68.6665 9.57759 68.2323 10.3319C67.8162 11.0682 67.6082 12.011 67.6082 13.1603C67.6082 14.3276 67.8162 15.2794 68.2323 16.0157C68.6484 16.752 69.1911 17.2998 69.8604 17.6589C70.5479 18.0002 71.2896 18.1708 72.0856 18.1708Z" fill="#F5F4F3"/>
                    <path d="M52.2148 0.5H54.25V8.25809C54.6842 7.61158 55.2721 7.11772 56.0139 6.77651C56.7556 6.41734 57.5877 6.23776 58.5103 6.23776C59.5053 6.23776 60.3918 6.46224 61.1697 6.9112C61.9475 7.36017 62.5536 8.02463 62.9878 8.9046C63.44 9.78457 63.6662 10.88 63.6662 12.191V19.8952H61.4953V12.4335C61.4953 11.0327 61.1968 9.96415 60.5998 9.22785C60.0028 8.47359 59.1345 8.09647 57.9948 8.09647C56.8189 8.09647 55.8963 8.49155 55.2269 9.28173C54.5757 10.0719 54.25 11.2213 54.25 12.7298V19.8952H52.2148V0.5Z" fill="#F5F4F3"/>
                    <path d="M43.8744 10.3057C44.8875 10.3057 45.7106 10.153 46.3438 9.84773C46.9769 9.54244 47.4383 9.11143 47.7277 8.55471C48.0352 7.998 48.189 7.35149 48.189 6.61519C48.189 5.44789 47.8453 4.54098 47.1578 3.89447C46.4885 3.24796 45.394 2.92471 43.8744 2.92471H39.3427V10.3057H43.8744ZM50.3327 6.61519C50.3327 7.35149 50.2061 8.06086 49.9528 8.74328C49.7177 9.40775 49.3378 10.0004 48.8131 10.5212C48.2885 11.042 47.6192 11.455 46.8051 11.7603C45.991 12.0477 45.0141 12.1913 43.8744 12.1913H39.3427V19.8955H37.1719V1.03906H43.8744C45.3578 1.03906 46.5699 1.29048 47.5106 1.79332C48.4694 2.29616 49.1749 2.96961 49.6272 3.81366C50.0976 4.65771 50.3327 5.59155 50.3327 6.61519Z" fill="#F5F4F3"/>
                    <path d="M108 27.8419H109.872L109.981 29.8084C110.343 29.3235 110.777 28.9104 111.283 28.5692C111.808 28.228 112.378 27.9946 112.993 27.8688C113.626 27.7252 114.295 27.7162 115.001 27.8419V29.8622C114.241 29.7186 113.554 29.7186 112.939 29.8622C112.342 30.0059 111.826 30.2753 111.392 30.6704C110.958 31.0655 110.623 31.5683 110.388 32.1789C110.153 32.7715 110.035 33.4629 110.035 34.2531V41.3108H108V27.8419Z" fill="#F5F4F3"/>
                    <path d="M99.7389 41.4994C98.4726 41.4994 97.3419 41.1941 96.347 40.5835C95.3701 39.9729 94.6012 39.1378 94.0404 38.0783C93.4796 37.0187 93.1992 35.8065 93.1992 34.4417C93.1992 33.1307 93.4796 31.9634 94.0404 30.9397C94.6012 29.9161 95.3701 29.1169 96.347 28.5423C97.3239 27.9496 98.4364 27.6533 99.6847 27.6533C100.915 27.6533 102.009 27.9227 102.968 28.4615C103.945 29.0002 104.705 29.7455 105.248 30.6973C105.79 31.6491 106.043 32.7356 106.007 33.9568C106.007 34.1543 105.998 34.3608 105.98 34.5763C105.962 34.7918 105.944 35.0253 105.926 35.2767H95.4244C95.4605 36.1208 95.6686 36.8661 96.0485 37.5126C96.4284 38.1591 96.9259 38.6709 97.5409 39.048C98.1741 39.4072 98.8887 39.5868 99.6847 39.5868C100.734 39.5868 101.62 39.3892 102.344 38.9941C103.086 38.5991 103.619 38.0334 103.945 37.2971L105.709 37.9974C105.166 39.1288 104.379 39.9998 103.348 40.6104C102.317 41.203 101.114 41.4994 99.7389 41.4994ZM103.782 33.5258C103.8 32.7535 103.628 32.0711 103.267 31.4785C102.923 30.8859 102.434 30.4189 101.801 30.0777C101.168 29.7365 100.435 29.5659 99.6033 29.5659C98.8796 29.5659 98.2193 29.7365 97.6224 30.0777C97.0254 30.4189 96.5279 30.8948 96.1299 31.5054C95.75 32.0981 95.5239 32.7715 95.4515 33.5258H103.782Z" fill="#F5F4F3"/>
                    <path d="M81.3555 21.916H83.4178V33.6878H84.666L90.0118 27.8423H92.8882L86.4841 34.5768L92.9153 41.3112H90.0118L84.666 35.4388H83.4178V41.3112H81.3555V21.916Z" fill="#F5F4F3"/>
                    <path d="M67.4219 27.8419H69.2942L69.4028 29.7545C69.837 29.09 70.4068 28.5782 71.1123 28.219C71.8179 27.8419 72.641 27.6533 73.5817 27.6533C74.6129 27.6533 75.5174 27.8778 76.2953 28.3268C77.0732 28.7578 77.6792 29.4133 78.1134 30.2932C78.5476 31.1552 78.7646 32.2417 78.7646 33.5527V41.3108H76.7295V33.7951C76.7295 32.3944 76.4219 31.3348 75.8068 30.6165C75.2098 29.8802 74.3415 29.512 73.2018 29.512C72.0259 29.512 71.1033 29.8981 70.4339 30.6704C69.7827 31.4426 69.4571 32.5829 69.4571 34.0915V41.3108H67.4219V27.8419Z" fill="#F5F4F3"/>
                    <path d="M64.6359 41.3107H62.7907L62.655 39.3712C62.2389 40.0536 61.6781 40.5834 60.9726 40.9605C60.2671 41.3197 59.444 41.4993 58.5032 41.4993C57.454 41.4993 56.5404 41.2838 55.7625 40.8528C54.9846 40.4218 54.3786 39.7753 53.9444 38.9132C53.5284 38.0512 53.3203 36.9647 53.3203 35.6538V27.8418H55.3284V35.4383C55.3284 36.8211 55.6269 37.8716 56.2238 38.59C56.8389 39.2904 57.7163 39.6406 58.856 39.6406C60.0138 39.6406 60.9274 39.2724 61.5967 38.5361C62.2842 37.7819 62.6279 36.6505 62.6279 35.1419V27.8418H64.6359V41.3107Z" fill="#F5F4F3"/>
                    <path d="M48.6777 27.5733C48.6777 26.5855 48.343 25.8043 47.6736 25.2297C47.0224 24.637 46.0455 24.3407 44.743 24.3407H39.3701V30.7789H44.8244C46.0545 30.7789 47.0043 30.4915 47.6736 29.9169C48.343 29.3422 48.6777 28.561 48.6777 27.5733ZM37.1992 41.3116V22.4551H44.9329C46.2716 22.4551 47.3751 22.6796 48.2435 23.1285C49.1118 23.5775 49.754 24.1701 50.1701 24.9064C50.6043 25.6248 50.8214 26.4239 50.8214 27.3039C50.8214 28.1659 50.6586 28.8932 50.3329 29.4859C50.0254 30.0605 49.6003 30.5185 49.0576 30.8597C48.5329 31.2009 47.954 31.4344 47.3209 31.5601V31.7486C48.0807 31.8564 48.7591 32.0988 49.3561 32.4759C49.953 32.8351 50.4234 33.329 50.7671 33.9575C51.1108 34.5861 51.2827 35.3493 51.2827 36.2472C51.2827 37.1811 51.0475 38.0341 50.5772 38.8063C50.1068 39.5786 49.4103 40.1891 48.4877 40.6381C47.5832 41.0871 46.4706 41.3116 45.15 41.3116H37.1992ZM39.3701 39.4259H44.9872C46.2897 39.4259 47.3028 39.1386 48.0264 38.5639C48.7681 37.9713 49.139 37.1272 49.139 36.0317C49.139 34.9363 48.75 34.1012 47.9721 33.5265C47.2123 32.9518 46.1902 32.6645 44.9058 32.6645H39.3701V39.4259Z" fill="#F5F4F3"/>
                    <path d="M11.1552 16.592H2.2405L2.24092 28.6272L12.5543 35.5039L21.9095 28.6528L21.9093 7.37963L12.0985 10.8881L4.85008 8.67972L4.83687 8.67562L4.82385 8.67132L0 7.04297L0.592345 5.31376L5.40339 6.93759L12.0518 8.96307L23.7494 4.78027L23.7496 29.5753L12.6043 37.7373L0.401093 29.6009L0.400267 14.7654H12.9952V27.1604H11.1552V16.592Z" fill="#C4ED31"/>
                </svg>
            </div>
            <button class="btn btn-primary btn-icon active">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.6875 5.25C1.6875 4.93934 1.93934 4.6875 2.25 4.6875H15.75C16.0607 4.6875 16.3125 4.93934 16.3125 5.25C16.3125 5.56066 16.0607 5.8125 15.75 5.8125H2.25C1.93934 5.8125 1.6875 5.56066 1.6875 5.25Z" fill="#21252A"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.6875 9C1.6875 8.68934 1.93934 8.4375 2.25 8.4375H15.75C16.0607 8.4375 16.3125 8.68934 16.3125 9C16.3125 9.31066 16.0607 9.5625 15.75 9.5625H2.25C1.93934 9.5625 1.6875 9.31066 1.6875 9Z" fill="#21252A"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.6875 12.75C1.6875 12.4393 1.93934 12.1875 2.25 12.1875H15.75C16.0607 12.1875 16.3125 12.4393 16.3125 12.75C16.3125 13.0607 16.0607 13.3125 15.75 13.3125H2.25C1.93934 13.3125 1.6875 13.0607 1.6875 12.75Z" fill="#21252A"/>
                </svg>
            </button>
        </header>

      <main>
        {!filesUploaded && (
          <>
            <h1 className="h1">Загрузите файлы в IPFS</h1>
            <div className="upload-form" onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current.click()}>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} hidden />
              <p className="caption">Перетащите файлы или кликните для загрузки <span className="hidden-lg">Тапните для загрузки</span></p>
            </div>
            <div className="upload-settings">
              <h2 className="h2">Настройки</h2>
              <div className="custom-select selects-list">
                <div className="select-selected">Время жизни: {expirationTime}{expirationUnit}</div>
                <div className="select-items select-hide">
                  <div onClick={() => { setExpirationUnit('h'); setError(''); }}>Часы</div>
                  <div onClick={() => { setExpirationUnit('d'); setError(''); }}>Дни</div>
                  <div onClick={() => { setExpirationUnit('w'); setError(''); }}>Недели</div>
                  <div onClick={() => { setExpirationUnit('M'); setError(''); }}>Месяцы</div>
                </div>
              </div>
              <div className="settings-inputs">
                <input type="text" value={expirationTime} onChange={handleExpirationChange} />
                {error && <div className="error-msg">{error}</div>}
                <label><input type="checkbox" checked={isdelChecked} onChange={handleCheckboxChange} /> Удалить после просмотра</label>
                <label><input type="checkbox" checked={removeMetadata} onChange={() => setRemoveMetadata(!removeMetadata)} /> Сжать и удалить метаданные</label>
              </div>
              <button className="btn btn-primary" onClick={handleUpload} disabled={loading || files.length === 0}>{loading ? 'Загрузка...' : 'Загрузить файлы'}</button>
            </div>
          </>
        )}

        {files.length > 0 && (
          <div className="files-preview">
            {files.map((file, idx) => (
              <div key={idx} className="file-item">
                <img src={URL.createObjectURL(file)} alt="preview" onClick={() => setFilesUploaded(true)} />
                <span className="file-name">{file.name}</span>
              </div>
            ))}
            <textarea placeholder="Комментарий..." value={comment} onChange={e => setComment(e.target.value)} />
            <div className="comment-hint">* Комментарий будет добавлен ко всем файлам</div>
          </div>
        )}

        {galleryJsonUrl && (
          <div className="gallery-link-block">
            <h1 className="h1">Галерея готова</h1>
            <QRCode value={`https://upfx.vercel.app/gallery/${galleryJsonUrl}`} size={200} />
            <textarea readOnly value={`https://upfx.vercel.app/gallery/${galleryJsonUrl}`} />
            <div className="button-group">
              <button onClick={() => window.open(`/gallery/${galleryJsonUrl}`, '_blank')} className="btn btn-primary">Открыть галерею</button>
              <button onClick={handleCopyUrl} className="btn btn-secondary">Копировать ссылку</button>
            </div>
          </div>
        )}
      </main>

      <section className="features">
        <h2 className="h1">Почему выбрать наш сервис?</h2>
        <div className="feature-list">
          <div className="feature-item">
            <h3 className="h2">Продвинутое Шифрование</h3>
            <p>Криптографическая стойкость SHA-256 обеспечивает защиту...</p>
          </div>
          <div className="feature-item">
            <h3 className="h2">Приватность и Безопасность</h3>
            <p>Мы удаляем метаданные для защиты вашей приватности...</p>
          </div>
          <div className="feature-item">
            <h3 className="h2">Полная Анонимность</h3>
            <p>Мы не храним личные данные и не отслеживаем активность...</p>
          </div>
          <div className="feature-item">
            <h3 className="h2">Распределенное Хранилище</h3>
            <p>Ваши файлы надежно хранятся в сети IPFS...</p>
          </div>
        </div>
      </section>

      <section className="info-sections">
        <h2 className="h1">Почему IPFS?</h2>
        <p>IPFS — это децентрализованная файловая система...</p>
        <h2 className="h1">Удаление Метаданных</h2>
        <p>Файлы очищаются от геолокации, EXIF, и др. для анонимности...</p>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div className="logo-footer">{/* SVG */}</div>
          <div className="social-footer">{/* Telegram icon */}</div>
        </div>
        <div className="footer-bot">
          <p>X 2024</p><p>All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}

export default UploadService;

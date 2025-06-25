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
    <div className="page-wrapper upload-page">
      <header>
        <div className="logo">{/* SVG as in index.html */}</div>
        <button className="btn btn-primary btn-icon active" onClick={() => fileInputRef.current.click()}> {/* SVG upload */} </button>
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

import React, { useState } from 'react';
import { Storage } from 'aws-amplify';

export default function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = e => setFile(e.target.files[0]);
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const key = `${Date.now()}_${file.name}`;
    try {
      await Storage.put(key, file, { contentType: file.type });
      const url = await Storage.get(key);
      onUpload({ key, url });
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading…' : 'Upload Scan'}
      </button>
    </div>
  );
}

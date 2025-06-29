import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import FileUpload from './components/FileUpload';
import Chatbot from './components/Chatbot';

Amplify.configure(awsconfig);

export default function App() {
  const [fileKey, setFileKey] = useState(null);

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>Medical Scan QA Chatbot</h1>

      {!fileKey ? (
        <FileUpload onUpload={data => setFileKey(data.key)} />
      ) : (
        <Chatbot fileKey={fileKey} />
      )}
    </div>
  );
}

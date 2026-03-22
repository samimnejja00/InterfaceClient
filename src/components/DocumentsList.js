import React from 'react';
import '../styles/DocumentsList.css';

function DocumentsList({ documents }) {
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="documents-list">
      {documents && documents.length > 0 ? (
        <table className="documents-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Upload Date</th>
              <th>Size</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="doc-name">
                  <span className="doc-icon">📄</span>
                  <span>{doc.name}</span>
                </td>
                <td className="doc-date">{doc.uploadDate}</td>
                <td className="doc-size">{doc.size}</td>
                <td className="doc-action">
                  <button className="download-btn" title="Download document">
                    📥 Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-documents">
          <p>No documents uploaded</p>
        </div>
      )}
    </div>
  );
}

export default DocumentsList;

import React from 'react';

function DocumentsList({ documents }) {
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div>
      {documents && documents.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-comar-gray-bg/50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider">Nom du Document</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider hidden sm:table-cell">Date de Téléchargement</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider hidden sm:table-cell">Taille</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-comar-gray-text uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-comar-gray-bg/30 transition-colors duration-150">
                    <td className="px-5 py-4 text-sm text-comar-navy font-medium">
                      <span className="inline-flex items-center gap-2">
                        <span>📄</span>
                        <span>{doc.name}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-comar-gray-text hidden sm:table-cell">{doc.uploadDate}</td>
                    <td className="px-5 py-4 text-sm text-comar-gray-text hidden sm:table-cell">{doc.size}</td>
                    <td className="px-5 py-4">
                      <button 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-comar-royal bg-comar-royal/10 rounded-lg hover:bg-comar-royal/20 transition-all duration-200"
                        title="Télécharger le document"
                      >
                        📥 Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
          <p className="text-sm text-comar-gray-text">Aucun document téléchargé</p>
        </div>
      )}
    </div>
  );
}

export default DocumentsList;

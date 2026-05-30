const fs = require('fs');
let code = fs.readFileSync('src/pages/MyRequests.jsx', 'utf8');

const regex = /return \(\s*<div className="my-requests-container">.*?\);\s*}/s;

const replacement = `return (
    <div className="my-requests-container" style={{ backgroundColor: '#FAFBFD', minHeight: '100vh', paddingBottom: '2rem' }}>
      <div className="my-requests-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Full width filter panel */}
        <div style={{ marginBottom: '2rem' }}>
          <FilterPanel
            filterStatus={filterStatus}
            filterType={filterType}
            searchQuery={searchQuery}
            onFilterStatusChange={setFilterStatus}
            onFilterTypeChange={setFilterType}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Espace comprenant le compteur à gauche et le bouton à droite dans l'alignement */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="requests-summary" style={{ margin: 0 }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Affichage de <strong>{filteredRequests.length}</strong> demande(s)</p>
          </div>
          <Link to="/soumettre-dossier" className="create-request-link" style={{ backgroundColor: '#214e9f', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', boxShadow: '0 2px 4px rgba(33, 78, 159, 0.2)', backgroundImage: 'none', border: 'none', fontSize: '0.95rem' }}>
            + Nouvelle Demande
          </Link>
        </div>

        {loading ? (
            <div className="loading-spinner" style={{ padding: '2rem', textAlign: 'center' }}>Chargement de vos demandes...</div>
        ) : error ? (
            <div className="error-message" style={{ color: 'red', padding: '1rem' }}>{error}</div>
        ) : filteredRequests.length > 0 ? (
          <RequestTable requests={filteredRequests} />
        ) : (
          <div className="no-requests" style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Aucune demande trouvée.</p>        
            <Link to="/soumettre-dossier" className="create-link" style={{ color: '#214e9f', fontWeight: '500', textDecoration: 'none' }}>Créer votre première demande</Link>
          </div>
        )}
      </div>
    </div>
  );
}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/MyRequests.jsx', code, 'utf8');
console.log('Fix completed.');

import React from 'react';
import '../styles/FilterPanel.css';

function FilterPanel({ filterStatus, filterType, searchQuery, onFilterStatusChange, onFilterTypeChange, onSearchChange }) {
  return (
    <div className="filter-panel">
      {/* Search */}
      <div className="filter-group search-group">
        <input
          type="text"
          placeholder="Rechercher par N° demande ou police..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Status Filter */}
      <div className="filter-group">
        <label htmlFor="statusFilter">Statut:</label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="filter-select"
        >
          <option value="All">Tous les statuts</option>
          <option value="En attente">En attente</option>
          <option value="En cours">En cours</option>
          <option value="Validé">Validé</option>
          <option value="Rejeté">Rejeté</option>
        </select>
      </div>

      {/* Type Filter */}
      <div className="filter-group">
        <label htmlFor="typeFilter">Type de Prestation:</label>
        <select
          id="typeFilter"
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
          className="filter-select"
        >
          <option value="All">Tous les types</option>
          <option value="Rachat partiel">Rachat partiel</option>
          <option value="Avance sur contrat">Avance sur contrat</option>
          <option value="Transfert">Transfert</option>
          <option value="Résiliation">Résiliation</option>
        </select>
      </div>

      {/* Reset Button */}
      <button
        className="reset-button"
        onClick={() => {
          onFilterStatusChange('All');
          onFilterTypeChange('All');
          onSearchChange('');
        }}
      >
        Réinitialiser Filtres
      </button>
    </div>
  );
}

export default FilterPanel;

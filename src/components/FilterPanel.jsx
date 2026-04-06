import React from 'react';

function FilterPanel({ filterStatus, filterType, searchQuery, onFilterStatusChange, onFilterTypeChange, onSearchChange }) {
  const selectClasses = "px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-comar-navy focus:outline-none focus:ring-2 focus:ring-comar-royal/30 focus:border-comar-royal transition-all duration-200 appearance-none cursor-pointer";

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par N° demande ou police..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-comar-gray-bg text-sm text-comar-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-comar-royal/30 focus:border-comar-royal transition-all duration-200"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="statusFilter" className="text-xs font-semibold text-comar-gray-text uppercase tracking-wider whitespace-nowrap hidden sm:block">
            Statut:
          </label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className={selectClasses}
          >
            <option value="All">Tous les statuts</option>
            <option value="En cours">En cours</option>
            <option value="En instance">En instance</option>
            <option value="Clôturé">Clôturé</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="typeFilter" className="text-xs font-semibold text-comar-gray-text uppercase tracking-wider whitespace-nowrap hidden sm:block">
            Demande:
          </label>
          <select
            id="typeFilter"
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value)}
            className={selectClasses}
          >
            <option value="All">Toutes les demandes</option>
            <option value="Rachat Total">Rachat Total</option>
            <option value="Rachat Partiel">Rachat Partiel</option>
            <option value="Rachat Échu">Rachat Échu</option>
            <option value="Transfert Contrat">Transfert Contrat</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          className="px-4 py-2.5 text-sm font-medium text-comar-gray-text bg-comar-gray-bg rounded-xl border border-gray-200 hover:bg-gray-100 hover:text-comar-navy transition-all duration-200"
          onClick={() => {
            onFilterStatusChange('All');
            onFilterTypeChange('All');
            onSearchChange('');
          }}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

export default FilterPanel;

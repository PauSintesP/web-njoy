import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EventCard from '../components/EventCard';
import { getEventTypes, getLocations, searchEvents } from '../services/api';
import './HomePage.css';

const HomePage = ({ events, loading, error, handleEventClick }) => {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [availableTypes, setAvailableTypes] = useState(['All']);
    const [locations, setLocations] = useState([]);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Load dynamic types and locations on mount
    useEffect(() => {
        const loadFilters = async () => {
            const types = await getEventTypes();
            setAvailableTypes(['All', ...types]);

            const locs = await getLocations();
            setLocations(locs);
        };
        loadFilters();
    }, []);

    // Filter events based on category when events change
    useEffect(() => {
        if (events.length > 0) {
            let filtered = events;

            if (selectedCategory !== 'All') {
                filtered = filtered.filter(event =>
                    event.category === selectedCategory
                );
            }

            setFilteredEvents(filtered);
        } else {
            setFilteredEvents([]);
        }
    }, [events, selectedCategory]);

    // Handle search
    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const filters = {};
            if (searchQuery) filters.q = searchQuery;
            if (selectedCategory !== 'All') filters.tipo = selectedCategory;
            if (priceMin) filters.precio_min = parseFloat(priceMin);
            if (priceMax) filters.precio_max = parseFloat(priceMax);
            if (selectedLocation) filters.localidad_id = parseInt(selectedLocation);

            const results = await searchEvents(filters);
            setFilteredEvents(results);
        } catch (err) {
            console.error('Error searching:', err);
        } finally {
            setIsSearching(false);
        }
    };

    // Clear filters
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setPriceMin('');
        setPriceMax('');
        setSelectedLocation('');
        setFilteredEvents(events);
    };

    // Handle Enter key in search
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <main>
            <section className="hero">
                <div className="container hero-content">
                    <h1 className="hero-title">
                        {t('Find your next favorite event')}
                    </h1>
                    <p className="hero-subtitle">
                        {t('hero.subtitle')}
                    </p>
                </div>
                <div className="hero-glow"></div>
            </section>

            <section className="events-section container">
                {/* Search Bar */}
                <div className="search-container">
                    <div className="search-bar">
                        <i className="fa-solid fa-search search-icon"></i>
                        <input
                            type="text"
                            placeholder={t('Buscar eventos...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="search-input"
                        />
                        <button
                            className="search-btn"
                            onClick={handleSearch}
                            disabled={isSearching}
                        >
                            {isSearching ? <i className="fa-solid fa-spinner fa-spin"></i> : t('Buscar')}
                        </button>
                        <button
                            className={`filter-toggle-btn ${showAdvancedFilters ? 'active' : ''}`}
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        >
                            <i className="fa-solid fa-sliders"></i>
                        </button>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showAdvancedFilters && (
                        <div className="advanced-filters">
                            <div className="filter-group">
                                <label>Precio</label>
                                <div className="price-range">
                                    <input
                                        type="number"
                                        placeholder="Min €"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                        className="price-input"
                                    />
                                    <span>-</span>
                                    <input
                                        type="number"
                                        placeholder="Max €"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                        className="price-input"
                                    />
                                </div>
                            </div>
                            <div className="filter-group">
                                <label>Zona</label>
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="location-select"
                                >
                                    <option value="">Todas las zonas</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.ciudad}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-actions">
                                <button className="btn-clear" onClick={clearFilters}>
                                    <i className="fa-solid fa-times"></i> Limpiar
                                </button>
                                <button className="btn-apply" onClick={handleSearch}>
                                    <i className="fa-solid fa-check"></i> Aplicar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="section-header">
                    <h2>{t('filters.upcoming')}</h2>
                    <div className="filter-tags">
                        {availableTypes.map(category => (
                            <span
                                key={category}
                                className={`tag ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    if (searchQuery || priceMin || priceMax || selectedLocation) {
                                        // If there are active filters, trigger search with new category
                                        setTimeout(handleSearch, 0);
                                    }
                                }}
                            >
                                {category === 'All' ? t('filters.all') : category}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="events-grid">
                    {loading || isSearching ? (
                        <div className="loading-state">
                            <i className="fa-solid fa-spinner fa-spin"></i> {t('common.loading')}
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        filteredEvents.map(event => (
                            <EventCard key={event.id} event={event} onClick={() => handleEventClick(event)} />
                        ))
                    ) : (
                        <div className="no-events">
                            <i className="fa-solid fa-calendar-xmark"></i>
                            <p>{searchQuery ? 'No se encontraron eventos con esos filtros' : t('common.noEvents')}</p>
                            {(searchQuery || priceMin || priceMax || selectedLocation) && (
                                <button className="btn-clear-search" onClick={clearFilters}>
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default HomePage;

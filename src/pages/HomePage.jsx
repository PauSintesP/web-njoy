import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import EventCard from '../components/EventCard';
import './HomePage.css';

const HomePage = ({ events, loading, error, handleEventClick }) => {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = React.useState('All');
    const [filteredEvents, setFilteredEvents] = React.useState([]);

    React.useEffect(() => {
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
                <div className="section-header">
                    <h2>{t('filters.upcoming')}</h2>
                    <div className="filter-tags">
                        {['All', 'Music', 'Art', 'Tech', 'Food'].map(category => (
                            <span
                                key={category}
                                className={`tag ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {t(`filters.${category.toLowerCase()}`)}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="events-grid">
                    {loading ? (
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
                            <p>{t('common.noEvents', { location })}</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default HomePage;

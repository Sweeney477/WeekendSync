'use client';

import { useState } from 'react';
import { format, parseISO, addDays } from 'date-fns';
import Image from 'next/image';

type SearchEvent = {
  externalEventId: string;
  title: string;
  startTime: string;
  venue: string | null;
  category: string | null;
  url: string | null;
  imageUrl: string | null;
};

export default function EventSearch() {
    const [keyword, setKeyword] = useState('');
    const [city, setCity] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [events, setEvents] = useState<SearchEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        setError(null);

        const today = format(new Date(), 'yyyy-MM-dd');
        const defaultEnd = format(addDays(new Date(), 30), 'yyyy-MM-dd');
        const start = startDate || today;
        const end = endDate || defaultEnd;

        try {
            const url = new URL('/api/events/search', window.location.origin);
            if (keyword) url.searchParams.set('keyword', keyword);
            if (city) url.searchParams.set('city', city);
            url.searchParams.set('startDate', start);
            url.searchParams.set('endDate', end);

            const res = await fetch(url.pathname + url.search);
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(json.error ?? 'Search failed');
                setEvents([]);
                return;
            }
            setEvents((json.events ?? []) as SearchEvent[]);
        } catch (err) {
            setError('Search failed. Please try again.');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Find Events for Your Weekend</h2>
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Keyword</label>
                        <input
                            type="text"
                            placeholder="Team, Artist, or Event"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                            type="text"
                            placeholder="City (e.g., Los Angeles)"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="lg:col-span-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Searching...' : 'Search Events'}
                        </button>
                    </div>
                </form>
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700 text-sm" role="alert">
                    {error}
                </div>
            )}

            {!loading && searched && !error && events.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No events found. Try adjusting your search criteria.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => {
                    const date = event.startTime ? format(parseISO(event.startTime), 'yyyy-MM-dd') : '';
                    return (
                        <div key={event.externalEventId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative h-48 w-full bg-slate-100">
                                {event.imageUrl && (
                                    <Image
                                        src={event.imageUrl}
                                        alt={event.title}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    {date && (
                                        <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                                            {date}
                                        </span>
                                    )}
                                    {event.venue && (
                                        <span className="text-xs text-gray-500 line-clamp-1">{event.venue}</span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{event.title}</h3>
                                {event.venue && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">{event.venue}</p>
                                )}
                                {event.url && (
                                    <a
                                        href={event.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center px-4 py-2 bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        View Tickets
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

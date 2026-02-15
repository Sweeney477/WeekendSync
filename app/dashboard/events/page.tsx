import EventSearch from '@/components/EventSearch';

export default function EventsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-ink-dark">Event Search</h1>
                <p className="text-gray-500 dark:text-muted-dark mt-2">
                    Find concerts, sports events, and entertainment for your trip. Search by city and date to discover what&apos;s happening.
                </p>
                <p className="text-sm text-gray-400 dark:text-muted-dark mt-1">
                    💡 Tip: Try searching for &quot;[Sport team name] [city]&quot; or &quot;concerts in [city]&quot;
                </p>
            </div>
            <EventSearch />
        </div>
    );
}

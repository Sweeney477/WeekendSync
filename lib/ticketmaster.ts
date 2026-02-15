

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

// Types for Ticketmaster API response
export interface TicketmasterImage {
    ratio: string;
    url: string;
    width: number;
    height: number;
    fallback: boolean;
}

export interface TicketmasterDate {
    start: {
        localDate: string;
        localTime: string;
        dateTime: string;
        dateTBD: boolean;
        dateTBA: boolean;
        timeTBA: boolean;
        noSpecificTime: boolean;
    };
    timezone: string;
    status: {
        code: string;
    };
}

export interface TicketmasterVenue {
    name: string;
    type: string;
    id: string;
    test: boolean;
    url: string;
    locale: string;
    postalCode: string;
    timezone: string;
    city: {
        name: string;
    };
    state: {
        name: string;
        stateCode: string;
    };
    country: {
        name: string;
        countryCode: string;
    };
    address: {
        line1: string;
    };
    location: {
        longitude: string;
        latitude: string;
    };
}

export interface TicketmasterEvent {
    name: string;
    type: string;
    id: string;
    test: boolean;
    url: string;
    locale: string;
    images: TicketmasterImage[];
    dates: TicketmasterDate;
    _embedded?: {
        venues?: TicketmasterVenue[];
    };
    classifications?: {
        segment?: {
            name: string;
        };
    }[];
}

interface TicketmasterResponse {
    _embedded?: {
        events: TicketmasterEvent[];
    };
    page: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    };
}

export type SearchEventsParams = {
    keyword?: string;
    city?: string;
    startDateTime?: string;
    endDateTime?: string;
    size?: number;
    category?: string;
    countryCode?: string;
};

export async function searchEvents(params: SearchEventsParams): Promise<TicketmasterEvent[]> {
    if (!TICKETMASTER_API_KEY) {
        console.error('TICKETMASTER_API_KEY is not set');
        return [];
    }

    const searchParams = new URLSearchParams({
        apikey: TICKETMASTER_API_KEY,
        sort: 'date,asc',
        size: (params.size || 20).toString(),
    });

    if (params.keyword) searchParams.append('keyword', params.keyword);
    if (params.city) searchParams.append('city', params.city);
    if (params.category) searchParams.append('classificationName', params.category);
    searchParams.append('countryCode', params.countryCode || 'US');
    if (params.startDateTime) searchParams.append('startDateTime', params.startDateTime);
    if (params.endDateTime) searchParams.append('endDateTime', params.endDateTime);

    try {
        const response = await fetch(`${BASE_URL}?${searchParams.toString()}`, {
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            console.error(`Ticketmaster API error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data: TicketmasterResponse = await response.json();
        return data._embedded?.events || [];
    } catch (error) {
        console.error('Failed to fetch events from Ticketmaster:', error);
        return [];
    }
}

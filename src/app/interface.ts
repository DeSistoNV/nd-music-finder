interface User {
    firstImage?: object;
    images?: Array<object>;
}
interface Track {
    artists?: Array<Artist>;
    firstArtist?: Artist;
}
interface MetroArea {
    displayName?: string;
}
interface SongKickStart {
    date?: string;
}
interface Venue {
    metroArea?: MetroArea;
    lat?: number;
    lng?: number;
}
interface SongKickArtist {
    artist?: Array<Artist>;
    event?: Array<Event>;
}
interface SongKickResults {
    results?: SongKickArtist ;
}


export interface SongKickResponse {
    resultsPage?: SongKickResults;
}
export interface Event {
    uri?: string;
    venue?: Venue;
    start?: SongKickStart;
}
export interface ApiData {
    user?: User;
    topTracks?: Array<Track>;
    topArtists?: Array<Artist>;
    genres: Array<string>;
}
export interface Artist {
    events?: Array<object>;
    nextEvent?: object;
    name?: string;
    genres?: Array<string>;
    id?: string;
}
export interface Params {
    access_token?: string;
    refresh_token?: string;
    error?: string;
}



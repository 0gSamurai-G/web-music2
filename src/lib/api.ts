// VoidFrequencies Cosmic Music Site API Integration Layer
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Song {
    id: number;
    title: string;
    duration: string;
    seconds: number;
    lyrics: string | null;
    audio_path: string | null;
    track_number: number;
    album_id: string;
}

export interface Album {
    id: string;
    title: string;
    year: number;
    cover: string;
    description: string;
    genre_tags: string;
    position: number;
    songs: Song[];
}

export interface FrontendAlbum {
    id: string;
    title: string;
    year: number;
    tracks: number;
    cover: string;
    description: string;
    genre_tags: string[];
    songs: Song[];
}

export interface SiteSetting {
    key: string;
    value: string;
}

export interface Chapter {
    id: string;
    title: string;
    description: string;
    chapter_label: string;
    image: string;
    eyebrow: string;
    stat_number: string | null;
    stat_label: string | null;
    accent_color: string;
    image_side: string;
    show_divider: number;
    position: number;
}

export function mapAlbumToFrontend(album: Album): FrontendAlbum {
    let coverUrl = album.cover;
    if (coverUrl && !coverUrl.startsWith("http") && !coverUrl.startsWith("/")) {
        coverUrl = `${API_BASE_URL}/api/${coverUrl}`;
    }
    return {
        id: album.id,
        title: album.title,
        year: album.year,
        tracks: album.songs ? album.songs.length : 0,
        cover: coverUrl,
        description: album.description,
        genre_tags: album.genre_tags ? album.genre_tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        songs: album.songs || [],
    };
}

export function mapChapterToFrontend(chap: Chapter): Chapter {
    let imageUrl = chap.image;
    if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
        imageUrl = `${API_BASE_URL}/api/${imageUrl}`;
    }
    return {
        ...chap,
        image: imageUrl
    };
}

export async function fetchAlbums(): Promise<FrontendAlbum[]> {
    const res = await fetch(`${API_BASE_URL}/api/albums`);
    if (!res.ok) {
        throw new Error("Failed to fetch albums");
    }
    const data: Album[] = await res.json();
    return data.map(mapAlbumToFrontend);
}

export async function fetchAlbum(id: string): Promise<FrontendAlbum> {
    const res = await fetch(`${API_BASE_URL}/api/albums/${id}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch album ${id}`);
    }
    const data: Album = await res.json();
    return mapAlbumToFrontend(data);
}

export async function fetchSettings(): Promise<SiteSetting[]> {
    const res = await fetch(`${API_BASE_URL}/api/settings`);
    if (!res.ok) {
        throw new Error("Failed to fetch site settings");
    }
    return res.json();
}

export async function fetchChapters(): Promise<Chapter[]> {
    const res = await fetch(`${API_BASE_URL}/api/chapters`);
    if (!res.ok) {
        throw new Error("Failed to fetch scrollytelling chapters");
    }
    const data: Chapter[] = await res.json();
    return data.map(mapChapterToFrontend);
}

export async function verifyAuthToken(idToken: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
        return res.ok;
    } catch {
        return false;
    }
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import InteractiveStarfield from '../components/InteractiveStarfield';
import CustomCursor from '../components/CustomCursor';
import AppLogo from '@/components/ui/AppLogo';
import { fetchAlbums, fetchSettings, fetchChapters, API_BASE_URL, FrontendAlbum, Song, SiteSetting, Chapter } from '@/lib/api';

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);
    const [authLoading, setAuthErrorLoading] = useState(true);
    const router = useRouter();

    // Data states
    const [albums, setAlbums] = useState<FrontendAlbum[]>([]);
    const [settings, setSettings] = useState<SiteSetting[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
    const [yearsActive, setYearsActive] = useState('3');
    const [streams, setStreams] = useState('∞');

    // Loading & message states
    const [dataLoading, setDataLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Tab selection
    const [activeTab, setActiveTab] = useState<'albums' | 'songs' | 'chapters' | 'settings'>('albums');

    // Modals & Editing states
    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState<FrontendAlbum | null>(null); // null means "Create mode"
    const [albumForm, setAlbumForm] = useState({
        id: '',
        title: '',
        year: 2024,
        cover: '',
        description: '',
        genre_tags: ''
    });

    const [isSongModalOpen, setIsSongModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<Song | null>(null); // null means "Create mode"
    const [songForm, setSongForm] = useState({
        title: '',
        duration: '3:30',
        seconds: 180,
        lyrics: '',
        track_number: 1,
        album_id: ''
    });

    const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [chapterForm, setChapterForm] = useState({
        id: '',
        title: '',
        description: '',
        chapter_label: '',
        eyebrow: '',
        stat_number: '',
        stat_label: ''
    });

    // File uploads state
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [chapterFile, setChapterFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Auth monitor
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (usr) => {
            if (usr) {
                if (usr.email === 'srdeshpande1122@gmail.com') {
                    setUser(usr);
                } else {
                    // Sign out invalid user
                    signOut(auth);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setAuthErrorLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch data if authenticated
    useEffect(() => {
        if (user) {
            loadAllData();
        }
    }, [user]);

    async function loadAllData() {
        setDataLoading(true);
        try {
            const [albumsData, settingsData, chaptersData] = await Promise.all([
                fetchAlbums(),
                fetchSettings(),
                fetchChapters()
            ]);
            setAlbums(albumsData);
            setSettings(settingsData);
            setChapters(chaptersData);

            if (albumsData.length > 0 && !selectedAlbumId) {
                setSelectedAlbumId(albumsData[0].id);
            }

            const ya = settingsData.find(s => s.key === 'years_active');
            if (ya) setYearsActive(ya.value);

            const st = settingsData.find(s => s.key === 'streams');
            if (st) setStreams(st.value);

        } catch (err: any) {
            setErrorMessage("Failed to load dashboard data.");
            console.error(err);
        } finally {
            setDataLoading(false);
        }
    }

    const showSuccess = (msg: string) => {
        setStatusMessage(msg);
        setTimeout(() => setStatusMessage(''), 4000);
    };

    const showError = (msg: string) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(''), 4000);
    };

    // Sign out helper
    const handleSignOut = async () => {
        await signOut(auth);
        router.push('/');
    };

    // Auth Header Helper
    const getAuthHeaders = async (): Promise<Record<string, string>> => {
        if (!auth.currentUser) return {};
        const token = await auth.currentUser.getIdToken();
        return {
            'Authorization': `Bearer ${token}`
        };
    };

    // ==================== ALBUM ACTIONS ====================

    const openAlbumCreate = () => {
        setEditingAlbum(null);
        setAlbumForm({
            id: '',
            title: '',
            year: 2024,
            cover: '',
            description: '',
            genre_tags: ''
        });
        setCoverFile(null);
        setPreviewUrl('');
        setIsAlbumModalOpen(true);
    };

    const openAlbumEdit = (alb: FrontendAlbum) => {
        setEditingAlbum(alb);
        setAlbumForm({
            id: alb.id,
            title: alb.title,
            year: alb.year,
            cover: alb.cover,
            description: alb.description,
            genre_tags: alb.genre_tags.join(', ')
        });
        setCoverFile(null);
        setPreviewUrl(alb.cover);
        setIsAlbumModalOpen(true);
    };

    const handleAlbumSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const headers = await getAuthHeaders();
            let savedAlbumId = albumForm.id;

            if (!editingAlbum) {
                if (!albumForm.id) {
                    showError("Album ID/slug is required for creation");
                    return;
                }
                const res = await fetch(`${API_BASE_URL}/api/albums`, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: albumForm.id,
                        title: albumForm.title,
                        year: Number(albumForm.year),
                        cover: 'media/albums/' + albumForm.id + '/cover.png',
                        description: albumForm.description,
                        genre_tags: albumForm.genre_tags
                    })
                });
                if (!res.ok) throw new Error(await res.text());
                showSuccess("Album created successfully");
            } else {
                const res = await fetch(`${API_BASE_URL}/api/albums/${editingAlbum.id}`, {
                    method: 'PUT',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: albumForm.title,
                        year: Number(albumForm.year),
                        description: albumForm.description,
                        genre_tags: albumForm.genre_tags
                    })
                });
                if (!res.ok) throw new Error(await res.text());
                showSuccess("Album updated successfully");
                savedAlbumId = editingAlbum.id;
            }

            if (coverFile) {
                const formData = new FormData();
                formData.append('file', coverFile);
                const uploadRes = await fetch(`${API_BASE_URL}/api/upload/cover/${savedAlbumId}`, {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });
                if (!uploadRes.ok) throw new Error("Failed to upload cover artwork");
            }

            setIsAlbumModalOpen(false);
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Operation failed");
        }
    };

    const handleAlbumDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this album? This will permanently delete all its songs and files!")) return;
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/albums/${id}`, {
                method: 'DELETE',
                headers: headers
            });
            if (!res.ok) throw new Error(await res.text());
            showSuccess("Album deleted successfully");
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Delete failed");
        }
    };

    const handleAlbumReorder = async (id: string, direction: 'up' | 'down') => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/albums/${id}/reorder?direction=${direction}`, {
                method: 'POST',
                headers: headers
            });
            if (!res.ok) throw new Error(await res.text());
            showSuccess("Reordered successfully");
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Reordering failed");
        }
    };

    // ==================== SONG ACTIONS ====================

    const openSongCreate = () => {
        setEditingSong(null);
        setSongForm({
            title: '',
            duration: '3:30',
            seconds: 180,
            lyrics: '',
            track_number: 1,
            album_id: selectedAlbumId
        });
        setAudioFile(null);
        setIsSongModalOpen(true);
    };

    const openSongEdit = (song: Song) => {
        setEditingSong(song);
        setSongForm({
            title: song.title,
            duration: song.duration,
            seconds: song.seconds,
            lyrics: song.lyrics || '',
            track_number: song.track_number,
            album_id: song.album_id
        });
        setAudioFile(null);
        setIsSongModalOpen(true);
    };

    const handleSongSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const headers = await getAuthHeaders();
            let savedSongId = editingSong?.id;

            if (!editingSong) {
                const res = await fetch(`${API_BASE_URL}/api/songs`, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(songForm)
                });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                savedSongId = data.id;
                showSuccess("Song added successfully");
            } else {
                const res = await fetch(`${API_BASE_URL}/api/songs/${editingSong.id}`, {
                    method: 'PUT',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(songForm)
                });
                if (!res.ok) throw new Error(await res.text());
                showSuccess("Song updated successfully");
            }

            if (audioFile && savedSongId) {
                const formData = new FormData();
                formData.append('file', audioFile);
                const uploadRes = await fetch(`${API_BASE_URL}/api/upload/audio/${savedSongId}`, {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });
                if (!uploadRes.ok) throw new Error("Failed to upload audio file");
            }

            setIsSongModalOpen(false);
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Operation failed");
        }
    };

    const handleSongDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this track?")) return;
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/songs/${id}`, {
                method: 'DELETE',
                headers: headers
            });
            if (!res.ok) throw new Error(await res.text());
            showSuccess("Song deleted successfully");
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Delete failed");
        }
    };

    const handleSongReorder = async (id: number, direction: 'up' | 'down') => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/songs/${id}/reorder?direction=${direction}`, {
                method: 'POST',
                headers: headers
            });
            if (!res.ok) throw new Error(await res.text());
            showSuccess("Reordered successfully");
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Reordering failed");
        }
    };

    // ==================== CHAPTER ACTIONS ====================

    const openChapterCreate = () => {
        setEditingChapter(null);
        setChapterForm({
            id: '',
            title: '',
            description: '',
            chapter_label: '',
            eyebrow: '',
            stat_number: '',
            stat_label: ''
        });
        setChapterFile(null);
        setPreviewUrl('');
        setIsChapterModalOpen(true);
    };

    const openChapterEdit = (chap: Chapter) => {
        setEditingChapter(chap);
        setChapterForm({
            id: chap.id,
            title: chap.title,
            description: chap.description,
            chapter_label: chap.chapter_label,
            eyebrow: chap.eyebrow,
            stat_number: chap.stat_number || '',
            stat_label: chap.stat_label || ''
        });
        setChapterFile(null);
        setPreviewUrl(chap.image);
        setIsChapterModalOpen(true);
    };

    const handleChapterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const headers = await getAuthHeaders();
            let savedChapterId = chapterForm.id;

            if (!editingChapter) {
                if (!chapterForm.id) {
                    showError("Chapter ID is required");
                    return;
                }
                const res = await fetch(`${API_BASE_URL}/api/chapters`, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: chapterForm.id,
                        title: chapterForm.title,
                        description: chapterForm.description,
                        chapter_label: chapterForm.chapter_label,
                        eyebrow: chapterForm.eyebrow,
                        stat_number: chapterForm.stat_number || null,
                        stat_label: chapterForm.stat_label || null,
                        image: 'media/chapters/' + chapterForm.id + '.png'
                    })
                });
                if (!res.ok) throw new Error(await res.text());
                showSuccess("Chapter created successfully");
            } else {
                const res = await fetch(`${API_BASE_URL}/api/chapters/${editingChapter.id}`, {
                    method: 'PUT',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: chapterForm.title,
                        description: chapterForm.description,
                        chapter_label: chapterForm.chapter_label,
                        eyebrow: chapterForm.eyebrow,
                        stat_number: chapterForm.stat_number || null,
                        stat_label: chapterForm.stat_label || null
                    })
                });
                if (!res.ok) throw new Error(await res.text());
                showSuccess("Chapter updated successfully");
                savedChapterId = editingChapter.id;
            }

            if (chapterFile) {
                const formData = new FormData();
                formData.append('file', chapterFile);
                const uploadRes = await fetch(`${API_BASE_URL}/api/upload/chapter/${savedChapterId}`, {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });
                if (!uploadRes.ok) throw new Error("Failed to upload chapter artwork");
            }

            setIsChapterModalOpen(false);
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Operation failed");
        }
    };

    const handleChapterDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this chapter?")) return;
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/chapters/${id}`, {
                method: 'DELETE',
                headers: headers
            });
            if (!res.ok) throw new Error(await res.text());
            showSuccess("Chapter deleted successfully");
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Delete failed");
        }
    };

    const handleChapterReorder = async (id: string, direction: 'up' | 'down') => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/chapters/${id}/reorder?direction=${direction}`, {
                method: 'POST',
                headers: headers
            });
            if (!res.ok) throw new Error(await res.text());
            showSuccess("Reordered successfully");
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Reordering failed");
        }
    };

    // ==================== SITE SETTINGS ====================

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([
                    { key: 'years_active', value: yearsActive },
                    { key: 'streams', value: streams }
                ])
            });
            if (!res.ok) throw new Error(await res.text());
            showSuccess("Settings updated successfully");
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Failed to update settings");
        }
    };

    if (authLoading) {
        return (
            <div className="relative min-h-screen bg-void-black flex items-center justify-center text-star-white">
                <InteractiveStarfield opacity={0.6} />
                <p className="font-display text-xs uppercase tracking-widest opacity-50">Authenticating Access...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="relative min-h-screen bg-void-black flex flex-col items-center justify-center text-star-white px-4">
                <InteractiveStarfield opacity={0.6} />
                <CustomCursor />
                <div className="relative z-10 p-8 glass-card max-w-sm w-full text-center">
                    <h2 className="font-display font-bold text-2xl mb-4 tracking-wide text-red-400">Access Denied</h2>
                    <p className="text-sm opacity-60 mb-6 font-sans">
                        You must be signed in as the authorized administrator to access this interface.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="glass-btn px-6 py-2.5 font-display text-xs tracking-widest uppercase transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const currentAlbumSongs = albums.find(a => a.id === selectedAlbumId)?.songs || [];

    return (
        <div className="relative min-h-screen bg-void-black text-star-white font-sans pb-24">
            <InteractiveStarfield opacity={0.5} />
            <CustomCursor />

            {/* Admin Header */}
            <header className="relative z-10 border-b border-glass-border bg-[rgba(5,5,15,0.85)] backdrop-blur-md px-6 md:px-12 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <AppLogo size={24} />
                    <span className="font-display text-star-white text-md font-semibold tracking-tight">
                        Cosmic Control Panel
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-xs opacity-50 hidden sm:inline-block font-mono">{user.email}</span>
                    <button
                        onClick={handleSignOut}
                        className="glass-btn px-4 py-2 font-display text-xs uppercase tracking-widest text-red-300 hover:text-red-400"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Dashboard Contents */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 mt-12">
                {/* Alert banners */}
                {statusMessage && (
                    <div className="mb-6 bg-[rgba(168,180,248,0.15)] border border-[rgba(168,180,248,0.35)] p-4 rounded-lg text-ice-blue text-sm font-display tracking-wide shadow-lg">
                        ✦ {statusMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-6 bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.35)] p-4 rounded-lg text-red-400 text-sm font-display tracking-wide shadow-lg">
                        ⚠️ {errorMessage}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 border-b border-glass-border pb-4 mb-8">
                    {[
                        { id: 'albums', label: 'Albums' },
                        { id: 'songs', label: 'Songs & Tracks' },
                        { id: 'chapters', label: 'Chapters (Scrolly)' },
                        { id: 'settings', label: 'Stats Settings' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`font-display text-xs uppercase tracking-widest pb-2 border-b-2 transition-all ${
                                activeTab === tab.id
                                    ? 'border-ice-blue text-ice-blue opacity-100'
                                    : 'border-transparent text-star-white opacity-40 hover:opacity-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB 1: ALBUMS */}
                {activeTab === 'albums' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-display font-bold text-xl text-ice-blue">Manage Albums</h2>
                            <button
                                onClick={openAlbumCreate}
                                className="glass-btn px-4 py-2 font-display text-xs uppercase tracking-widest"
                            >
                                + Create New Album
                            </button>
                        </div>

                        {dataLoading ? (
                            <p className="opacity-50 text-xs">Loading data...</p>
                        ) : (
                            <div className="grid gap-4">
                                {albums.map((alb, index) => (
                                    <div key={alb.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <img src={alb.cover} alt={alb.title} className="w-16 h-16 object-cover rounded-lg border border-glass-border" />
                                            <div>
                                                <h3 className="font-display font-semibold text-star-white">{alb.title}</h3>
                                                <p className="text-xs opacity-50">{alb.year} · {alb.tracks} Tracks · Slug: {alb.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                disabled={index === 0}
                                                onClick={() => handleAlbumReorder(alb.id, 'up')}
                                                className="glass-btn px-3 py-1 text-xs disabled:opacity-20"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                disabled={index === albums.length - 1}
                                                onClick={() => handleAlbumReorder(alb.id, 'down')}
                                                className="glass-btn px-3 py-1 text-xs disabled:opacity-20"
                                            >
                                                ▼
                                            </button>

                                            <button
                                                onClick={() => openAlbumEdit(alb)}
                                                className="glass-btn px-3 py-1 text-xs text-ice-blue"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleAlbumDelete(alb.id)}
                                                className="glass-btn px-3 py-1 text-xs text-red-400 hover:text-red-500"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: SONGS */}
                {activeTab === 'songs' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-display uppercase tracking-wider text-ice-blue">Select Album:</span>
                                <select
                                    value={selectedAlbumId}
                                    onChange={(e) => setSelectedAlbumId(e.target.value)}
                                    className="bg-void-black border border-glass-border text-star-white rounded-lg p-2 text-xs font-display"
                                >
                                    {albums.map(a => (
                                        <option key={a.id} value={a.id}>{a.title}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={openSongCreate}
                                className="glass-btn px-4 py-2 font-display text-xs uppercase tracking-widest"
                            >
                                + Add Track to Album
                            </button>
                        </div>

                        {dataLoading ? (
                            <p className="opacity-50 text-xs">Loading tracks...</p>
                        ) : (
                            <div className="grid gap-2">
                                {currentAlbumSongs.length === 0 ? (
                                    <p className="opacity-40 text-xs text-center p-8 border border-dashed border-glass-border rounded-lg">No songs in this album yet.</p>
                                ) : (
                                    currentAlbumSongs.map((song, index) => (
                                        <div key={song.id} className="glass-card p-3 flex items-center justify-between gap-4 text-xs font-mono">
                                            <div className="flex items-center gap-4">
                                                <span className="opacity-40">#{String(index + 1).padStart(2, '0')}</span>
                                                <div>
                                                    <span className="font-display font-semibold text-star-white text-sm block">{song.title}</span>
                                                    <span className="opacity-50 text-[10px]">{song.duration} ({song.seconds}s) · {song.lyrics ? 'Has Lyrics' : 'No Lyrics'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    disabled={index === 0}
                                                    onClick={() => handleSongReorder(song.id, 'up')}
                                                    className="glass-btn px-2 py-0.5 disabled:opacity-20"
                                                >
                                                    ▲
                                                </button>
                                                <button
                                                    disabled={index === currentAlbumSongs.length - 1}
                                                    onClick={() => handleSongReorder(song.id, 'down')}
                                                    className="glass-btn px-2 py-0.5 disabled:opacity-20"
                                                >
                                                    ▼
                                                </button>
                                                <button
                                                    onClick={() => openSongEdit(song)}
                                                    className="glass-btn px-2.5 py-0.5 text-ice-blue"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleSongDelete(song.id)}
                                                    className="glass-btn px-2.5 py-0.5 text-red-400"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: CHAPTERS */}
                {activeTab === 'chapters' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-display font-bold text-xl text-ice-blue">Manage Scrollytelling Chapters</h2>
                            <button
                                onClick={openChapterCreate}
                                className="glass-btn px-4 py-2 font-display text-xs uppercase tracking-widest"
                            >
                                + Create New Chapter
                            </button>
                        </div>

                        {dataLoading ? (
                            <p className="opacity-50 text-xs">Loading chapters...</p>
                        ) : (
                            <div className="grid gap-4">
                                {chapters.map((chap, index) => (
                                    <div key={chap.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <img src={chap.image} alt={chap.title} className="w-16 h-16 object-cover rounded-lg border border-glass-border bg-[rgba(255,255,255,0.03)]" />
                                            <div>
                                                <span className="text-[10px] text-ice-blue uppercase font-display block">{chap.chapter_label} · {chap.eyebrow}</span>
                                                <h3 className="font-display font-bold text-star-white text-md mb-1">{chap.title}</h3>
                                                <p className="text-xs opacity-60 line-clamp-2 max-w-xl">{chap.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                disabled={index === 0}
                                                onClick={() => handleChapterReorder(chap.id, 'up')}
                                                className="glass-btn px-3 py-1 text-xs disabled:opacity-20"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                disabled={index === chapters.length - 1}
                                                onClick={() => handleChapterReorder(chap.id, 'down')}
                                                className="glass-btn px-3 py-1 text-xs disabled:opacity-20"
                                            >
                                                ▼
                                            </button>
                                            <button
                                                onClick={() => openChapterEdit(chap)}
                                                className="glass-btn px-3 py-1 text-xs text-ice-blue"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleChapterDelete(chap.id)}
                                                className="glass-btn px-3 py-1 text-xs text-red-400 hover:text-red-500"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: STATS SETTINGS */}
                {activeTab === 'settings' && (
                    <div className="max-w-md">
                        <h2 className="font-display font-bold text-xl text-ice-blue mb-6">Edit Site Stats</h2>
                        <form onSubmit={handleSettingsSubmit} className="glass-card p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-display uppercase tracking-wider opacity-60 mb-2">Years Active</label>
                                <input
                                    type="text"
                                    value={yearsActive}
                                    onChange={(e) => setYearsActive(e.target.value)}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-3 text-sm text-star-white focus:outline-none focus:border-ice-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-display uppercase tracking-wider opacity-60 mb-2">Total Streams Stat</label>
                                <input
                                    type="text"
                                    value={streams}
                                    onChange={(e) => setStreams(e.target.value)}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-3 text-sm text-star-white focus:outline-none focus:border-ice-blue"
                                />
                            </div>
                            <button
                                type="submit"
                                className="glass-btn py-3 mt-4 font-display text-xs uppercase tracking-widest w-full"
                            >
                                Save Settings
                            </button>
                        </form>
                    </div>
                )}
            </main>

            {/* ALBUM CREATE/EDIT MODAL */}
            {isAlbumModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)] p-4 overflow-y-auto">
                    <div className="glass-card p-6 max-w-lg w-full relative">
                        <button onClick={() => setIsAlbumModalOpen(false)} className="absolute top-4 right-4 text-xs font-display opacity-50 hover:opacity-100">✕ Close</button>
                        <h3 className="font-display font-bold text-lg mb-6 text-ice-blue">
                            {editingAlbum ? 'Edit Album' : 'Create New Album'}
                        </h3>

                        <form onSubmit={handleAlbumSubmit} className="flex flex-col gap-4 text-sm">
                            {!editingAlbum && (
                                <div>
                                    <label className="block text-xs opacity-50 mb-1">Album ID/Slug (e.g. nebula-drift)</label>
                                    <input
                                        type="text"
                                        required
                                        value={albumForm.id}
                                        onChange={(e) => setAlbumForm({...albumForm, id: e.target.value})}
                                        className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs opacity-50 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={albumForm.title}
                                    onChange={(e) => setAlbumForm({...albumForm, title: e.target.value})}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs opacity-50 mb-1">Release Year</label>
                                    <input
                                        type="number"
                                        required
                                        value={albumForm.year}
                                        onChange={(e) => setAlbumForm({...albumForm, year: Number(e.target.value)})}
                                        className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs opacity-50 mb-1">Genre Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        placeholder="Ambient, Space"
                                        value={albumForm.genre_tags}
                                        onChange={(e) => setAlbumForm({...albumForm, genre_tags: e.target.value})}
                                        className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs opacity-50 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={albumForm.description}
                                    onChange={(e) => setAlbumForm({...albumForm, description: e.target.value})}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs opacity-50 mb-1">Cover Artwork Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setCoverFile(file);
                                            setPreviewUrl(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="w-full text-xs opacity-80"
                                />
                                {previewUrl && (
                                    <div className="mt-3">
                                        <p className="text-[10px] opacity-40 mb-1">Artwork Preview:</p>
                                        <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded border border-glass-border" />
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="glass-btn py-3 mt-4 font-display text-xs uppercase tracking-widest w-full">
                                {editingAlbum ? 'Save Album Changes' : 'Create Album'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* SONG CREATE/EDIT MODAL */}
            {isSongModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)] p-4 overflow-y-auto">
                    <div className="glass-card p-6 max-w-lg w-full relative">
                        <button onClick={() => setIsSongModalOpen(false)} className="absolute top-4 right-4 text-xs font-display opacity-50 hover:opacity-100">✕ Close</button>
                        <h3 className="font-display font-bold text-lg mb-6 text-ice-blue">
                            {editingSong ? 'Edit Track' : 'Add Track'}
                        </h3>

                        <form onSubmit={handleSongSubmit} className="flex flex-col gap-4 text-sm">
                            <div>
                                <label className="block text-xs opacity-50 mb-1">Song Title</label>
                                <input
                                    type="text"
                                    required
                                    value={songForm.title}
                                    onChange={(e) => setSongForm({...songForm, title: e.target.value})}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs opacity-50 mb-1">Duration (e.g. 3:42)</label>
                                    <input
                                        type="text"
                                        required
                                        value={songForm.duration}
                                        onChange={(e) => setSongForm({...songForm, duration: e.target.value})}
                                        className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs opacity-50 mb-1">Total Seconds (e.g. 222)</label>
                                    <input
                                        type="number"
                                        required
                                        value={songForm.seconds}
                                        onChange={(e) => setSongForm({...songForm, seconds: Number(e.target.value)})}
                                        className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs opacity-50 mb-1">Lyrics (Optional, multi-line)</label>
                                <textarea
                                    rows={5}
                                    value={songForm.lyrics}
                                    onChange={(e) => setSongForm({...songForm, lyrics: e.target.value})}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none resize-none text-xs font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs opacity-50 mb-1">Audio File (MP3 Upload)</label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setAudioFile(file);
                                    }}
                                    className="w-full text-xs opacity-80"
                                />
                                {editingSong?.audio_path && (
                                    <p className="text-[10px] opacity-40 mt-1.5 font-mono">Current Audio Path: {editingSong.audio_path}</p>
                                )}
                            </div>

                            <button type="submit" className="glass-btn py-3 mt-4 font-display text-xs uppercase tracking-widest w-full">
                                {editingSong ? 'Save Track' : 'Add Track'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CHAPTER CREATE/EDIT MODAL */}
            {isChapterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)] p-4 overflow-y-auto">
                    <div className="glass-card p-6 max-w-lg w-full relative">
                        <button onClick={() => setIsChapterModalOpen(false)} className="absolute top-4 right-4 text-xs font-display opacity-50 hover:opacity-100">✕ Close</button>
                        <h3 className="font-display font-bold text-lg mb-6 text-ice-blue">
                            {editingChapter ? 'Edit Chapter' : 'Create New Chapter'}
                        </h3>

                        <form onSubmit={handleChapterSubmit} className="flex flex-col gap-4 text-sm">
                            {!editingChapter && (
                                <div>
                                    <label className="block text-xs opacity-50 mb-1">Chapter ID (e.g. chapter-5)</label>
                                    <input
                                        type="text"
                                        required
                                        value={chapterForm.id}
                                        onChange={(e) => setChapterForm({...chapterForm, id: e.target.value})}
                                        className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs opacity-50 mb-1">Chapter Label (e.g. Chapter 01)</label>
                                    <input
                                        type="text"
                                        required
                                        value={chapterForm.chapter_label}
                                        onChange={(e) => setChapterForm({...chapterForm, chapter_label: e.target.value})}
                                        className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs opacity-50 mb-1">Eyebrow Header</label>
                                    <input
                                        type="text"
                                        required
                                        value={chapterForm.eyebrow}
                                        onChange={(e) => setChapterForm({...chapterForm, eyebrow: e.target.value})}
                                        className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs opacity-50 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={chapterForm.title}
                                    onChange={(e) => setChapterForm({...chapterForm, title: e.target.value})}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs opacity-50 mb-1">Narrative Description / Story</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={chapterForm.description}
                                    onChange={(e) => setChapterForm({...chapterForm, description: e.target.value})}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs opacity-50 mb-1">Stat Number (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 5"
                                        value={chapterForm.stat_number}
                                        onChange={(e) => setChapterForm({...chapterForm, stat_number: e.target.value})}
                                        className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs opacity-50 mb-1">Stat Label (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Across the Cosmos"
                                        value={chapterForm.stat_label}
                                        onChange={(e) => setChapterForm({...chapterForm, stat_label: e.target.value})}
                                        className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs opacity-50 mb-1">Character Graphic Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setChapterFile(file);
                                            setPreviewUrl(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="w-full text-xs opacity-80"
                                />
                                {previewUrl && (
                                    <div className="mt-3">
                                        <p className="text-[10px] opacity-40 mb-1">Graphic Preview:</p>
                                        <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded border border-glass-border" />
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="glass-btn py-3 mt-4 font-display text-xs uppercase tracking-widest w-full">
                                {editingChapter ? 'Save Chapter Changes' : 'Create Chapter'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import InteractiveStarfield from '../components/InteractiveStarfield';
import CustomCursor from '../components/CustomCursor';
import AppLogo from '@/components/ui/AppLogo';
import { fetchAlbums, fetchSettings, fetchChapters, API_BASE_URL, FrontendAlbum, Song, SiteSetting, Chapter, verifyAuthToken } from '@/lib/api';

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
        stat_label: '',
        accent_color: '#a8b4f8',
        image_side: 'left',
        show_divider: 1
    });

    // File uploads state
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [chapterFile, setChapterFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Live preview local blob URLs
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>('');
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>('');
    const [chapterPreviewUrl, setChapterPreviewUrl] = useState<string>('');

    const [loginError, setLoginError] = useState('');

    // Field-level error messages
    const [albumErrors, setAlbumErrors] = useState<Record<string, string>>({});
    const [songErrors, setSongErrors] = useState<Record<string, string>>({});
    const [chapterErrors, setChapterErrors] = useState<Record<string, string>>({});

    // File error states
    const [coverError, setCoverError] = useState('');
    const [audioError, setAudioError] = useState('');
    const [chapterError, setChapterError] = useState('');

    // Upload progress indicators
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // List view Search & Filter
    const [albumSearch, setAlbumSearch] = useState('');

    // Chapter custom configurations
    const [useLiveAlbumCount, setUseLiveAlbumCount] = useState(false);

    // Inline song list editing (fluid nested editing of songs in album detail modal)
    const [albumSongsLocal, setAlbumSongsLocal] = useState<Song[]>([]);
    const [inlineEditingSongId, setInlineEditingSongId] = useState<number | null>(null);
    const [isAddingSongInline, setIsAddingSongInline] = useState(false);

    // Action execution states
    const [submitting, setSubmitting] = useState(false);

    // Dark-cosmic themed deletion confirmation
    const [deleteConfirmState, setDeleteConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmTextRequired?: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    // Auth monitor
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (usr) => {
            if (usr) {
                if (usr.email === 'srdeshpande1122@gmail.com') {
                    try {
                        const token = await usr.getIdToken();
                        const isVerified = await verifyAuthToken(token);
                        if (isVerified) {
                            setUser(usr);
                        } else {
                            setLoginError('Server-side verification failed.');
                            await signOut(auth);
                            setUser(null);
                        }
                    } catch (err) {
                        setLoginError('Authentication check failed.');
                        await signOut(auth);
                        setUser(null);
                    }
                } else {
                    setLoginError('Unauthorized email address.');
                    await signOut(auth);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setAuthErrorLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        setLoginError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user.email === 'srdeshpande1122@gmail.com') {
                const token = await result.user.getIdToken();
                const isVerified = await verifyAuthToken(token);
                if (isVerified) {
                    setUser(result.user);
                } else {
                    setLoginError('Server-side verification failed.');
                    await auth.signOut();
                }
            } else {
                setLoginError('Unauthorized email address.');
                await auth.signOut();
            }
        } catch (err: any) {
            console.error("Sign-in error", err);
            setLoginError(err.message || 'Failed to sign in.');
        }
    };

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

    const uploadFileWithProgress = (url: string, file: File, headers: Record<string, string>): Promise<any> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url);

            Object.entries(headers).forEach(([k, v]) => {
                xhr.setRequestHeader(k, v);
            });

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch {
                        resolve(xhr.responseText);
                    }
                } else {
                    reject(new Error(xhr.responseText || `Upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error("Network error during file upload"));
            };

            const formData = new FormData();
            formData.append('file', file);
            xhr.send(formData);
        });
    };

    const validateImageFile = (file: File): boolean => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const ext = file.name.split('.').pop()?.toLowerCase();
        const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
        if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext || '')) {
            return false;
        }
        if (file.size > 10 * 1024 * 1024) {
            return false;
        }
        return true;
    };

    const validateAudioFile = (file: File): boolean => {
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];
        const ext = file.name.split('.').pop()?.toLowerCase();
        const allowedExts = ['mp3', 'wav'];
        if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext || '')) {
            return false;
        }
        if (file.size > 30 * 1024 * 1024) {
            return false;
        }
        return true;
    };

    const validateAlbumField = (name: string, value: any) => {
        const errs = { ...albumErrors };
        if (name === 'id') {
            if (!value.trim()) {
                errs.id = 'Album ID/slug is required';
            } else if (!/^[a-z0-9-]+$/.test(value)) {
                errs.id = 'Must contain lowercase letters, numbers, and hyphens only (e.g. nebula-drift)';
            } else {
                delete errs.id;
            }
        }
        if (name === 'title') {
            if (!value.trim()) {
                errs.title = 'Title is required';
            } else {
                delete errs.title;
            }
        }
        if (name === 'year') {
            const yr = Number(value);
            if (!value || isNaN(yr) || yr < 1900 || yr > 2100) {
                errs.year = 'Enter a valid year between 1900 and 2100';
            } else {
                delete errs.year;
            }
        }
        if (name === 'description') {
            if (!value.trim()) {
                errs.description = 'Description is required';
            } else {
                delete errs.description;
            }
        }
        setAlbumErrors(errs);
    };

    const validateSongField = (name: string, value: any) => {
        const errs = { ...songErrors };
        if (name === 'title') {
            if (!value.trim()) {
                errs.title = 'Title is required';
            } else {
                delete errs.title;
            }
        }
        if (name === 'duration') {
            if (!value.trim()) {
                errs.duration = 'Duration is required';
            } else if (!/^\d+:\d{2}$/.test(value)) {
                errs.duration = 'Must be in MM:SS format (e.g. 3:42)';
            } else {
                delete errs.duration;
            }
        }
        if (name === 'seconds') {
            const sec = Number(value);
            if (!value || isNaN(sec) || sec <= 0) {
                errs.seconds = 'Enter a positive number of seconds';
            } else {
                delete errs.seconds;
            }
        }
        setSongErrors(errs);
    };

    const validateChapterField = (name: string, value: any) => {
        const errs = { ...chapterErrors };
        if (name === 'id') {
            if (!value.trim()) {
                errs.id = 'Chapter ID is required';
            } else if (!/^[a-z0-9-]+$/.test(value)) {
                errs.id = 'Must contain lowercase letters, numbers, and hyphens only (e.g. chapter-1)';
            } else {
                delete errs.id;
            }
        }
        if (name === 'chapter_label') {
            if (!value.trim()) {
                errs.chapter_label = 'Chapter label is required';
            } else {
                delete errs.chapter_label;
            }
        }
        if (name === 'eyebrow') {
            if (!value.trim()) {
                errs.eyebrow = 'Eyebrow header is required';
            } else {
                delete errs.eyebrow;
            }
        }
        if (name === 'title') {
            if (!value.trim()) {
                errs.title = 'Title is required';
            } else {
                delete errs.title;
            }
        }
        if (name === 'description') {
            if (!value.trim()) {
                errs.description = 'Description is required';
            } else {
                delete errs.description;
            }
        }
        setChapterErrors(errs);
    };

    // Keyboard listener to close modals
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsAlbumModalOpen(false);
                setIsSongModalOpen(false);
                setIsChapterModalOpen(false);
                setDeleteConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
        setCoverPreviewUrl('');
        setAlbumErrors({});
        setCoverError('');
        setAlbumSongsLocal([]);
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
        setCoverPreviewUrl('');
        setAlbumErrors({});
        setCoverError('');
        setIsAlbumModalOpen(true);
    };

    const handleAlbumSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setUploadProgress(null);
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
                setIsUploading(true);
                setUploadProgress(0);
                await uploadFileWithProgress(`${API_BASE_URL}/api/upload/cover/${savedAlbumId}`, coverFile, headers);
            }

            setIsAlbumModalOpen(false);
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Operation failed");
        } finally {
            setSubmitting(false);
            setUploadProgress(null);
            setIsUploading(false);
        }
    };

    const handleAlbumDelete = async (id: string) => {
        const alb = albums.find(a => a.id === id);
        if (!alb) return;
        const songCount = alb.songs ? alb.songs.length : 0;

        setDeleteConfirmState({
            isOpen: true,
            title: `Delete Album '${alb.title}'?`,
            message: `You are about to permanently delete the album "${alb.title}" (${alb.year}).\n\nThis will permanently destroy ${songCount} tracks and all associated files from local disk storage.\n\nThis action is irreversible and cannot be undone!`,
            confirmTextRequired: alb.title,
            onConfirm: async () => {
                try {
                    const headers = await getAuthHeaders();
                    const res = await fetch(`${API_BASE_URL}/api/albums/${id}`, {
                        method: 'DELETE',
                        headers: headers
                    });
                    if (!res.ok) throw new Error(await res.text());
                    showSuccess(`Album "${alb.title}" and all its tracks successfully deleted.`);
                    loadAllData();
                } catch (err: any) {
                    showError(err.message || "Delete failed");
                }
            }
        });
    };

    const handleAlbumReorder = async (id: string, direction: 'up' | 'down') => {
        const updatedAlbums = [...albums];
        const idx = updatedAlbums.findIndex(a => a.id === id);
        if (idx === -1) return;

        if (direction === 'up' && idx > 0) {
            const temp = updatedAlbums[idx - 1];
            updatedAlbums[idx - 1] = updatedAlbums[idx];
            updatedAlbums[idx] = temp;
        } else if (direction === 'down' && idx < updatedAlbums.length - 1) {
            const temp = updatedAlbums[idx + 1];
            updatedAlbums[idx + 1] = updatedAlbums[idx];
            updatedAlbums[idx] = temp;
        }

        setAlbums(updatedAlbums);

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/albums/${id}/reorder?direction=${direction}`, {
                method: 'POST',
                headers: headers
            });
            if (!res.ok) throw new Error(await res.text());
            showSuccess("Album order saved to database.");
            const freshAlbums = await fetchAlbums();
            setAlbums(freshAlbums);
        } catch (err: any) {
            showError("Reordering failed: " + (err.message || "Unknown error"));
            loadAllData();
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
        setAudioPreviewUrl('');
        setSongErrors({});
        setAudioError('');
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
        setAudioPreviewUrl('');
        setSongErrors({});
        setAudioError('');
        setIsSongModalOpen(true);
    };

    const handleSongSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setUploadProgress(null);
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
                setIsUploading(true);
                setUploadProgress(0);
                await uploadFileWithProgress(`${API_BASE_URL}/api/upload/audio/${savedSongId}`, audioFile, headers);
            }

            setIsSongModalOpen(false);
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Operation failed");
        } finally {
            setSubmitting(false);
            setUploadProgress(null);
            setIsUploading(false);
        }
    };

    const handleSongDelete = async (id: number) => {
        const song = albums.flatMap(a => a.songs || []).find(s => s.id === id);
        if (!song) return;

        setDeleteConfirmState({
            isOpen: true,
            title: `Delete Track '${song.title}'?`,
            message: `Are you sure you want to permanently delete the track "${song.title}" from its album?\n\nThis will remove the audio file from local disk. This action cannot be undone!`,
            onConfirm: async () => {
                try {
                    const headers = await getAuthHeaders();
                    const res = await fetch(`${API_BASE_URL}/api/songs/${id}`, {
                        method: 'DELETE',
                        headers: headers
                    });
                    if (!res.ok) throw new Error(await res.text());
                    showSuccess(`Track "${song.title}" successfully deleted.`);
                    loadAllData();
                } catch (err: any) {
                    showError(err.message || "Delete failed");
                }
            }
        });
    };

    const handleSongReorder = async (id: number, direction: 'up' | 'down') => {
        const updatedSongs = [...albumSongsLocal];
        const idx = updatedSongs.findIndex(s => s.id === id);
        if (idx === -1) return;

        if (direction === 'up' && idx > 0) {
            const temp = updatedSongs[idx - 1];
            updatedSongs[idx - 1] = updatedSongs[idx];
            updatedSongs[idx] = temp;
        } else if (direction === 'down' && idx < updatedSongs.length - 1) {
            const temp = updatedSongs[idx + 1];
            updatedSongs[idx + 1] = updatedSongs[idx];
            updatedSongs[idx] = temp;
        }

        setAlbumSongsLocal(updatedSongs);

        if (editingAlbum) {
            setAlbums(prevAlbums => prevAlbums.map(alb => {
                if (alb.id === editingAlbum.id) {
                    return { ...alb, songs: updatedSongs };
                }
                return alb;
            }));
        }

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/songs/${id}/reorder?direction=${direction}`, {
                method: 'POST',
                headers: headers
            });
            if (!res.ok) throw new Error(await res.text());
            showSuccess("Track order saved to database.");
            const freshAlbums = await fetchAlbums();
            setAlbums(freshAlbums);
            const updatedAlb = freshAlbums.find(a => a.id === (editingAlbum?.id || selectedAlbumId));
            if (updatedAlb) {
                setAlbumSongsLocal(updatedAlb.songs);
            }
        } catch (err: any) {
            showError("Reordering failed: " + (err.message || "Unknown error"));
            loadAllData();
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
            stat_label: '',
            accent_color: '#a8b4f8',
            image_side: 'left',
            show_divider: 1
        });
        setChapterFile(null);
        setChapterPreviewUrl('');
        setUseLiveAlbumCount(false);
        setChapterErrors({});
        setChapterError('');
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
            stat_label: chap.stat_label || '',
            accent_color: chap.accent_color || '#a8b4f8',
            image_side: chap.image_side || 'left',
            show_divider: typeof chap.show_divider === 'number' ? chap.show_divider : 1
        });
        setChapterFile(null);
        setChapterPreviewUrl('');
        setUseLiveAlbumCount(!chap.stat_number);
        setChapterErrors({});
        setChapterError('');
        setIsChapterModalOpen(true);
    };

    const handleChapterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setUploadProgress(null);
        try {
            const headers = await getAuthHeaders();
            let savedChapterId = chapterForm.id;

            const finalStatNumber = useLiveAlbumCount ? null : (chapterForm.stat_number || null);

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
                        stat_number: finalStatNumber,
                        stat_label: chapterForm.stat_label || null,
                        accent_color: chapterForm.accent_color,
                        image_side: chapterForm.image_side,
                        show_divider: Number(chapterForm.show_divider),
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
                        stat_number: finalStatNumber,
                        stat_label: chapterForm.stat_label || null,
                        accent_color: chapterForm.accent_color,
                        image_side: chapterForm.image_side,
                        show_divider: Number(chapterForm.show_divider)
                    })
                });
                if (!res.ok) throw new Error(await res.text());
                showSuccess("Chapter updated successfully");
                savedChapterId = editingChapter.id;
            }

            if (chapterFile) {
                setIsUploading(true);
                setUploadProgress(0);
                await uploadFileWithProgress(`${API_BASE_URL}/api/upload/chapter/${savedChapterId}`, chapterFile, headers);
            }

            setIsChapterModalOpen(false);
            loadAllData();
        } catch (err: any) {
            showError(err.message || "Operation failed");
        } finally {
            setSubmitting(false);
            setUploadProgress(null);
            setIsUploading(false);
        }
    };

    const handleChapterDelete = async (id: string) => {
        const chap = chapters.find(c => c.id === id);
        if (!chap) return;

        setDeleteConfirmState({
            isOpen: true,
            title: `Delete Chapter '${chap.title}'?`,
            message: `Are you sure you want to permanently delete chapter "${chap.chapter_label}: ${chap.title}"?\n\nThis will remove its narrative from the scrollytelling section and delete the character graphic from disk. This cannot be undone!`,
            onConfirm: async () => {
                try {
                    const headers = await getAuthHeaders();
                    const res = await fetch(`${API_BASE_URL}/api/chapters/${id}`, {
                        method: 'DELETE',
                        headers: headers
                    });
                    if (!res.ok) throw new Error(await res.text());
                    showSuccess(`Chapter "${chap.title}" successfully deleted.`);
                    loadAllData();
                } catch (err: any) {
                    showError(err.message || "Delete failed");
                }
            }
        });
    };

    const handleChapterReorder = async (id: string, direction: 'up' | 'down') => {
        const updatedChapters = [...chapters];
        const idx = updatedChapters.findIndex(c => c.id === id);
        if (idx === -1) return;

        if (direction === 'up' && idx > 0) {
            const temp = updatedChapters[idx - 1];
            updatedChapters[idx - 1] = updatedChapters[idx];
            updatedChapters[idx] = temp;
        } else if (direction === 'down' && idx < updatedChapters.length - 1) {
            const temp = updatedChapters[idx + 1];
            updatedChapters[idx + 1] = updatedChapters[idx];
            updatedChapters[idx] = temp;
        }

        setChapters(updatedChapters);

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/chapters/${id}/reorder?direction=${direction}`, {
                method: 'POST',
                headers: headers
            });
            if (!res.ok) throw new Error(await res.text());
            showSuccess("Chapter order saved to database.");
            const freshChapters = await fetchChapters();
            setChapters(freshChapters);
        } catch (err: any) {
            showError("Reordering failed: " + (err.message || "Unknown error"));
            loadAllData();
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
                <div className="relative z-10 p-8 glass-card max-w-md w-full text-center">
                    <div className="flex justify-center mb-4">
                        <AppLogo size={48} />
                    </div>
                    <h2 className="font-display font-bold text-2xl mb-2 tracking-wide text-ice-blue">Admin Access</h2>
                    <p className="text-sm opacity-60 mb-6 font-sans">
                        Sign in with the authorized Google account to manage the site content.
                    </p>

                    <button
                        onClick={handleGoogleLogin}
                        className="glass-btn px-6 py-3 font-display text-sm tracking-widest w-full flex items-center justify-center gap-3 transition-colors hover:bg-[rgba(255,255,255,0.1)] mb-4"
                    >
                        Sign in with Google
                    </button>

                    {loginError && (
                        <div className="mb-4 text-red-400 text-sm font-sans px-4 py-2 bg-[rgba(255,0,0,0.1)] border border-[rgba(255,0,0,0.2)] rounded-md">
                            ⚠️ {loginError}
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/')}
                        className="text-xs uppercase tracking-widest text-star-white opacity-50 hover:opacity-100 transition-opacity"
                    >
                        Back to Public Site
                    </button>
                </div>
            </div>
        );
    }

    const currentAlbumSongs = albums.find(a => a.id === selectedAlbumId)?.songs || [];

    const filteredAlbums = albums.filter(alb =>
        alb.title.toLowerCase().includes(albumSearch.toLowerCase()) ||
        alb.id.toLowerCase().includes(albumSearch.toLowerCase())
    );

    const hasAlbumErrors = Object.keys(albumErrors).length > 0 || !albumForm.title.trim() || !albumForm.description.trim() || (!editingAlbum && !albumForm.id.trim());
    const hasSongErrors = Object.keys(songErrors).length > 0 || !songForm.title.trim() || !songForm.duration.trim();
    const hasChapterErrors = Object.keys(chapterErrors).length > 0 || !chapterForm.title.trim() || !chapterForm.description.trim() || !chapterForm.chapter_label.trim() || !chapterForm.eyebrow.trim() || (!editingChapter && !chapterForm.id.trim());

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
                    <div className="mb-6 bg-green-500/15 border border-green-500/40 p-4 rounded-lg text-green-300 text-sm font-display tracking-wide shadow-lg flex items-center gap-2 animate-pulse">
                        <span className="text-green-400 text-lg">✦</span> {statusMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-6 bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.35)] p-4 rounded-lg text-red-400 text-sm font-display tracking-wide shadow-lg flex items-center gap-2">
                        <span className="text-red-500 text-lg">⚠️</span> {errorMessage}
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
                                    ? 'border-ice-blue text-ice-blue opacity-100 font-semibold'
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
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                            <div>
                                <h2 className="font-display font-bold text-xl text-ice-blue">Manage Albums</h2>
                                <p className="text-xs text-star-white/40 mt-1">Add, edit, or reorder cosmic discography.</p>
                            </div>

                            <div className="flex gap-3 items-center">
                                {/* Search filter */}
                                <input
                                    type="text"
                                    value={albumSearch}
                                    onChange={(e) => setAlbumSearch(e.target.value)}
                                    placeholder="Search albums..."
                                    className="bg-void-black/60 border border-glass-border rounded-lg px-3 py-1.5 text-xs text-star-white placeholder-star-white/30 focus:outline-none focus:border-ice-blue w-48 font-display"
                                />

                                <button
                                    onClick={openAlbumCreate}
                                    className="glass-btn px-4 py-2 font-display text-xs uppercase tracking-widest"
                                >
                                    + Create New Album
                                </button>
                            </div>
                        </div>

                        {dataLoading ? (
                            <p className="opacity-50 text-xs font-mono animate-pulse">Loading data...</p>
                        ) : (
                            <div className="grid gap-4">
                                {filteredAlbums.length === 0 ? (
                                    <div className="glass-card p-12 text-center opacity-40 text-xs border border-dashed border-glass-border">
                                        No albums match your search query.
                                    </div>
                                ) : (
                                    filteredAlbums.map((alb, index) => (
                                        <div key={alb.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:border-ice-blue/35 hover:bg-white/5">
                                            <div className="flex items-center gap-4">
                                                <img src={alb.cover} alt={alb.title} className="w-16 h-16 object-cover rounded-lg border border-glass-border bg-[rgba(255,255,255,0.03)]" />
                                                <div>
                                                    <h3 className="font-display font-semibold text-star-white text-md">{alb.title}</h3>
                                                    <p className="text-xs opacity-50 mt-0.5">{alb.year} · {alb.tracks} Tracks · Slug: <span className="font-mono text-ice-blue bg-white/5 px-1.5 py-0.5 rounded">{alb.id}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    disabled={index === 0}
                                                    onClick={() => handleAlbumReorder(alb.id, 'up')}
                                                    className="glass-btn px-3 py-1.5 text-xs disabled:opacity-20 hover:bg-white/5"
                                                    title="Move Up"
                                                >
                                                    ▲
                                                </button>
                                                <button
                                                    disabled={index === albums.length - 1}
                                                    onClick={() => handleAlbumReorder(alb.id, 'down')}
                                                    className="glass-btn px-3 py-1.5 text-xs disabled:opacity-20 hover:bg-white/5"
                                                    title="Move Down"
                                                >
                                                    ▼
                                                </button>

                                                <button
                                                    onClick={() => openAlbumEdit(alb)}
                                                    className="glass-btn px-3 py-1.5 text-xs text-ice-blue hover:bg-ice-blue/10"
                                                >
                                                    Edit / Songs
                                                </button>
                                                <button
                                                    onClick={() => handleAlbumDelete(alb.id)}
                                                    className="glass-btn px-3 py-1.5 text-xs text-red-400 hover:text-red-500 hover:bg-red-500/10 border-red-500/20"
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

                {/* TAB 2: SONGS */}
                {activeTab === 'songs' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-display uppercase tracking-wider text-ice-blue">Select Album:</span>
                                <select
                                    value={selectedAlbumId}
                                    onChange={(e) => setSelectedAlbumId(e.target.value)}
                                    className="bg-void-black border border-glass-border text-star-white rounded-lg p-2 text-xs font-display focus:border-ice-blue"
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
                            <p className="opacity-50 text-xs font-mono animate-pulse">Loading tracks...</p>
                        ) : (
                            <div className="grid gap-2">
                                {currentAlbumSongs.length === 0 ? (
                                    <p className="opacity-40 text-xs text-center p-8 border border-dashed border-glass-border rounded-lg">No songs in this album yet.</p>
                                ) : (
                                    currentAlbumSongs.map((song, index) => (
                                        <div key={song.id} className="glass-card p-3 flex items-center justify-between gap-4 text-xs font-mono transition-all duration-300 hover:bg-white/5">
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
                                                    className="glass-btn px-2.5 py-1 disabled:opacity-20"
                                                >
                                                    ▲
                                                </button>
                                                <button
                                                    disabled={index === currentAlbumSongs.length - 1}
                                                    onClick={() => handleSongReorder(song.id, 'down')}
                                                    className="glass-btn px-2.5 py-1 disabled:opacity-20"
                                                >
                                                    ▼
                                                </button>
                                                <button
                                                    onClick={() => openSongEdit(song)}
                                                    className="glass-btn px-3 py-1 text-ice-blue hover:bg-ice-blue/10"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleSongDelete(song.id)}
                                                    className="glass-btn px-3 py-1 text-red-400 hover:bg-red-500/10 border-red-500/20"
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
                            <div>
                                <h2 className="font-display font-bold text-xl text-ice-blue">Manage Scrollytelling Chapters</h2>
                                <p className="text-xs text-star-white/40 mt-1">Configure sections of narrative text, stats, and alignment on the homepage.</p>
                            </div>
                            <button
                                onClick={openChapterCreate}
                                className="glass-btn px-4 py-2 font-display text-xs uppercase tracking-widest"
                            >
                                + Create New Chapter
                            </button>
                        </div>

                        {dataLoading ? (
                            <p className="opacity-50 text-xs font-mono animate-pulse">Loading chapters...</p>
                        ) : (
                            <div className="grid gap-4">
                                {chapters.map((chap, index) => (
                                    <div key={chap.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:border-ice-blue/35 hover:bg-white/5">
                                        <div className="flex items-center gap-4">
                                            <img src={chap.image} alt={chap.title} className="w-16 h-16 object-cover rounded-lg border border-glass-border bg-[rgba(255,255,255,0.03)]" />
                                            <div>
                                                <span className="text-[10px] text-ice-blue uppercase font-display block font-semibold" style={{ color: chap.accent_color }}>{chap.chapter_label} · {chap.eyebrow}</span>
                                                <h3 className="font-display font-bold text-star-white text-md mb-1">{chap.title}</h3>
                                                <p className="text-xs opacity-60 line-clamp-2 max-w-xl">{chap.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                disabled={index === 0}
                                                onClick={() => handleChapterReorder(chap.id, 'up')}
                                                className="glass-btn px-3 py-1.5 text-xs disabled:opacity-20 hover:bg-white/5"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                disabled={index === chapters.length - 1}
                                                onClick={() => handleChapterReorder(chap.id, 'down')}
                                                className="glass-btn px-3 py-1.5 text-xs disabled:opacity-20 hover:bg-white/5"
                                            >
                                                ▼
                                            </button>
                                            <button
                                                onClick={() => openChapterEdit(chap)}
                                                className="glass-btn px-3 py-1.5 text-xs text-ice-blue hover:bg-ice-blue/10"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleChapterDelete(chap.id)}
                                                className="glass-btn px-3 py-1.5 text-xs text-red-400 hover:text-red-500 hover:bg-red-500/10 border-red-500/20"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.85)] p-4 overflow-y-auto">
                    <div className="glass-card p-6 max-w-2xl w-full relative border border-glass-border bg-void-black/95">
                        <button onClick={() => setIsAlbumModalOpen(false)} className="absolute top-4 right-4 text-xs font-display opacity-50 hover:opacity-100 hover:text-red-400">✕ Close</button>
                        <h3 className="font-display font-bold text-lg mb-6 text-ice-blue border-b border-glass-border pb-3">
                            {editingAlbum ? `Edit Album: ${editingAlbum.title}` : 'Create New Album'}
                        </h3>

                        <form onSubmit={handleAlbumSubmit} className="flex flex-col gap-4 text-sm">
                            {!editingAlbum && (
                                <div>
                                    <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Album ID/Slug *</label>
                                    <input
                                        type="text"
                                        required
                                        value={albumForm.id}
                                        onChange={(e) => {
                                            setAlbumForm({...albumForm, id: e.target.value});
                                            validateAlbumField('id', e.target.value);
                                        }}
                                        className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue ${
                                            albumErrors.id ? 'border-red-500' : 'border-glass-border'
                                        }`}
                                        placeholder="e.g. quantum-state"
                                    />
                                    {albumErrors.id && (
                                        <p className="text-red-400 text-xs mt-1 font-mono">{albumErrors.id}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={albumForm.title}
                                    onChange={(e) => {
                                        setAlbumForm({...albumForm, title: e.target.value});
                                        validateAlbumField('title', e.target.value);
                                    }}
                                    className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue ${
                                        albumErrors.title ? 'border-red-500' : 'border-glass-border'
                                    }`}
                                />
                                {albumErrors.title && (
                                    <p className="text-red-400 text-xs mt-1 font-mono">{albumErrors.title}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Release Year *</label>
                                    <input
                                        type="number"
                                        required
                                        value={albumForm.year}
                                        onChange={(e) => {
                                            setAlbumForm({...albumForm, year: Number(e.target.value)});
                                            validateAlbumField('year', e.target.value);
                                        }}
                                        className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue ${
                                            albumErrors.year ? 'border-red-500' : 'border-glass-border'
                                        }`}
                                    />
                                    {albumErrors.year && (
                                        <p className="text-red-400 text-xs mt-1 font-mono">{albumErrors.year}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Genre Tags</label>
                                    <input
                                        type="text"
                                        placeholder="Ambient, Space, Electronic"
                                        value={albumForm.genre_tags}
                                        onChange={(e) => setAlbumForm({...albumForm, genre_tags: e.target.value})}
                                        className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Description *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={albumForm.description}
                                    onChange={(e) => {
                                        setAlbumForm({...albumForm, description: e.target.value});
                                        validateAlbumField('description', e.target.value);
                                    }}
                                    className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue resize-none ${
                                        albumErrors.description ? 'border-red-500' : 'border-glass-border'
                                    }`}
                                />
                                {albumErrors.description && (
                                    <p className="text-red-400 text-xs mt-1 font-mono">{albumErrors.description}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Cover Artwork Image</label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={(e) => {
                                        setCoverError('');
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (validateImageFile(file)) {
                                                setCoverFile(file);
                                                setCoverPreviewUrl(URL.createObjectURL(file));
                                            } else {
                                                e.target.value = '';
                                                setCoverFile(null);
                                                setCoverPreviewUrl('');
                                                setCoverError("Must be a JPG, JPEG, PNG, or WEBP image under 10MB");
                                            }
                                        }
                                    }}
                                    className="w-full text-xs opacity-80 cursor-pointer"
                                />
                                {coverError && (
                                    <p className="text-red-400 text-xs mt-1 font-mono">⚠️ {coverError}</p>
                                )}

                                <div className="flex gap-4 items-end mt-4">
                                    {editingAlbum?.cover && (
                                        <div>
                                            <p className="text-[10px] opacity-40 mb-1">Current Saved Cover:</p>
                                            <img src={editingAlbum.cover} alt="Current" className="w-24 h-24 object-cover rounded border border-glass-border" />
                                        </div>
                                    )}
                                    {coverPreviewUrl && (
                                        <div>
                                            <p className="text-[10px] text-ice-blue mb-1">New Image Selected:</p>
                                            <img src={coverPreviewUrl} alt="New Preview" className="w-24 h-24 object-cover rounded border border-ice-blue" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* UPLOAD PROGRESS BAR */}
                            {isUploading && uploadProgress !== null && (
                                <div className="w-full mt-4">
                                    <div className="flex justify-between text-xs font-mono text-ice-blue mb-1">
                                        <span>Uploading Celestial Assets...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-glass-border">
                                        <div className="h-full bg-ice-blue rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={hasAlbumErrors || submitting}
                                className={`glass-btn py-3 mt-4 font-display text-xs uppercase tracking-widest w-full ${
                                    (hasAlbumErrors || submitting) ? 'opacity-40 cursor-not-allowed bg-black/40 border-glass-border text-star-white/40' : 'text-ice-blue border-ice-blue/40 hover:bg-ice-blue/10'
                                }`}
                            >
                                {submitting ? 'Saving changes...' : editingAlbum ? 'Save Album Changes' : 'Create Album'}
                            </button>
                        </form>

                        {/* Expandable/collapsible Songs subsection inside edit album modal */}
                        {editingAlbum && (
                            <div className="mt-8 border-t border-glass-border pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-display font-bold text-sm text-ice-blue">Album Songs ({albumSongsLocal.length})</h4>
                                        <p className="text-[10px] text-star-white/40">Manage tracks for this album inline instantly</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingSong(null);
                                            setSongForm({
                                                title: '',
                                                duration: '3:30',
                                                seconds: 180,
                                                lyrics: '',
                                                track_number: albumSongsLocal.length + 1,
                                                album_id: editingAlbum.id
                                            });
                                            setAudioFile(null);
                                            setAudioPreviewUrl('');
                                            setSongErrors({});
                                            setAudioError('');
                                            setIsSongModalOpen(true);
                                        }}
                                        className="glass-btn px-2.5 py-1 text-xs"
                                    >
                                        + Add New Song
                                    </button>
                                </div>

                                <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1">
                                    {albumSongsLocal.length === 0 ? (
                                        <p className="text-xs opacity-40 text-center py-6 border border-dashed border-glass-border rounded-lg">No tracks yet.</p>
                                    ) : (
                                        albumSongsLocal.map((song, sIdx) => (
                                            <div key={song.id} className="p-2.5 bg-white/5 border border-glass-border/40 rounded-lg flex items-center justify-between text-xs transition-all hover:bg-white/10">
                                                <div className="flex items-center gap-3">
                                                    <span className="opacity-40 font-mono">#{String(sIdx + 1).padStart(2, '0')}</span>
                                                    <div>
                                                        <span className="font-display font-semibold text-star-white block">{song.title}</span>
                                                        <span className="opacity-40 text-[10px]">{song.duration}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        disabled={sIdx === 0}
                                                        onClick={() => handleSongReorder(song.id, 'up')}
                                                        className="glass-btn px-1.5 py-0.5 text-[10px] disabled:opacity-20"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={sIdx === albumSongsLocal.length - 1}
                                                        onClick={() => handleSongReorder(song.id, 'down')}
                                                        className="glass-btn px-1.5 py-0.5 text-[10px] disabled:opacity-20"
                                                    >
                                                        ▼
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openSongEdit(song)}
                                                        className="glass-btn px-2 py-0.5 text-ice-blue"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSongDelete(song.id)}
                                                        className="glass-btn px-2 py-0.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 border-red-500/20"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SONG CREATE/EDIT MODAL */}
            {isSongModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,0,0,0.85)] p-4 overflow-y-auto">
                    <div className="glass-card p-6 max-w-lg w-full relative border border-glass-border bg-void-black/95">
                        <button onClick={() => setIsSongModalOpen(false)} className="absolute top-4 right-4 text-xs font-display opacity-50 hover:opacity-100 hover:text-red-400">✕ Close</button>
                        <h3 className="font-display font-bold text-lg mb-6 text-ice-blue border-b border-glass-border pb-3">
                            {editingSong ? `Edit Track: ${editingSong.title}` : 'Add New Track'}
                        </h3>

                        <form onSubmit={handleSongSubmit} className="flex flex-col gap-4 text-sm">
                            <div>
                                <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Song Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={songForm.title}
                                    onChange={(e) => {
                                        setSongForm({...songForm, title: e.target.value});
                                        validateSongField('title', e.target.value);
                                    }}
                                    className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue ${
                                        songErrors.title ? 'border-red-500' : 'border-glass-border'
                                    }`}
                                />
                                {songErrors.title && (
                                    <p className="text-red-400 text-xs mt-1 font-mono">{songErrors.title}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Duration (e.g. 3:42) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={songForm.duration}
                                        onChange={(e) => {
                                            setSongForm({...songForm, duration: e.target.value});
                                            validateSongField('duration', e.target.value);
                                        }}
                                        className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue ${
                                            songErrors.duration ? 'border-red-500' : 'border-glass-border'
                                        }`}
                                    />
                                    {songErrors.duration && (
                                        <p className="text-red-400 text-xs mt-1 font-mono">{songErrors.duration}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Total Seconds *</label>
                                    <input
                                        type="number"
                                        required
                                        value={songForm.seconds}
                                        onChange={(e) => {
                                            setSongForm({...songForm, seconds: Number(e.target.value)});
                                            validateSongField('seconds', e.target.value);
                                        }}
                                        className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue ${
                                            songErrors.seconds ? 'border-red-500' : 'border-glass-border'
                                        }`}
                                    />
                                    {songErrors.seconds && (
                                        <p className="text-red-400 text-xs mt-1 font-mono">{songErrors.seconds}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Lyrics (Optional)</label>
                                <textarea
                                    rows={4}
                                    value={songForm.lyrics}
                                    onChange={(e) => setSongForm({...songForm, lyrics: e.target.value})}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none resize-none text-xs font-mono"
                                    placeholder="Paste multi-line lyrics here..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Audio File (MP3/WAV Upload)</label>
                                <input
                                    type="file"
                                    accept=".mp3,.wav"
                                    onChange={(e) => {
                                        setAudioError('');
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (validateAudioFile(file)) {
                                                setAudioFile(file);
                                                setAudioPreviewUrl(URL.createObjectURL(file));
                                            } else {
                                                e.target.value = '';
                                                setAudioFile(null);
                                                setAudioPreviewUrl('');
                                                setAudioError("Must be an MP3 or WAV audio track under 30MB");
                                            }
                                        }
                                    }}
                                    className="w-full text-xs opacity-80 cursor-pointer"
                                />
                                {audioError && (
                                    <p className="text-red-400 text-xs mt-1 font-mono">⚠️ {audioError}</p>
                                )}

                                {/* Live audio preview player controllers */}
                                {editingSong?.audio_path && (
                                    <div className="mt-3 p-3 bg-white/5 border border-glass-border rounded-lg">
                                        <span className="text-[10px] opacity-40 block mb-1">Currently Saved Audio (Disc):</span>
                                        <span className="text-[10px] font-mono block mb-2 text-ice-blue truncate">{editingSong.audio_path}</span>
                                        <audio controls src={`${API_BASE_URL}/api/${editingSong.audio_path}`} className="w-full h-8" />
                                    </div>
                                )}
                                {audioPreviewUrl && (
                                    <div className="mt-3 p-3 bg-ice-blue/10 border border-ice-blue/30 rounded-lg animate-pulse">
                                        <span className="text-[10px] text-ice-blue font-semibold block mb-1">New Selection Selected:</span>
                                        <span className="text-[10px] font-mono block mb-2 truncate">{audioFile?.name}</span>
                                        <audio controls src={audioPreviewUrl} className="w-full h-8" />
                                    </div>
                                )}
                            </div>

                            {/* UPLOAD PROGRESS BAR */}
                            {isUploading && uploadProgress !== null && (
                                <div className="w-full mt-4">
                                    <div className="flex justify-between text-xs font-mono text-ice-blue mb-1">
                                        <span>Uploading Cosmic Audio Track...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-glass-border">
                                        <div className="h-full bg-ice-blue rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={hasSongErrors || submitting}
                                className={`glass-btn py-3 mt-4 font-display text-xs uppercase tracking-widest w-full ${
                                    (hasSongErrors || submitting) ? 'opacity-40 cursor-not-allowed bg-black/40 border-glass-border text-star-white/40' : 'text-ice-blue border-ice-blue/40 hover:bg-ice-blue/10'
                                }`}
                            >
                                {submitting ? 'Uploading celestial track...' : editingSong ? 'Save Track Changes' : 'Add Track'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CHAPTER CREATE/EDIT MODAL */}
            {isChapterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.85)] p-4 overflow-y-auto">
                    <div className="glass-card p-6 max-w-2xl w-full relative border border-glass-border bg-void-black/95">
                        <button onClick={() => setIsChapterModalOpen(false)} className="absolute top-4 right-4 text-xs font-display opacity-50 hover:opacity-100 hover:text-red-400">✕ Close</button>
                        <h3 className="font-display font-bold text-lg mb-6 text-ice-blue border-b border-glass-border pb-3">
                            {editingChapter ? `Edit Chapter: ${editingChapter.title}` : 'Create New Chapter'}
                        </h3>

                        <form onSubmit={handleChapterSubmit} className="flex flex-col gap-4 text-sm">
                            {!editingChapter && (
                                <div>
                                    <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Chapter ID/Slug *</label>
                                    <input
                                        type="text"
                                        required
                                        value={chapterForm.id}
                                        onChange={(e) => {
                                            setChapterForm({...chapterForm, id: e.target.value});
                                            validateChapterField('id', e.target.value);
                                        }}
                                        className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue ${
                                            chapterErrors.id ? 'border-red-500' : 'border-glass-border'
                                        }`}
                                        placeholder="e.g. chapter-5"
                                    />
                                    {chapterErrors.id && (
                                        <p className="text-red-400 text-xs mt-1 font-mono">{chapterErrors.id}</p>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Chapter Label *</label>
                                    <input
                                        type="text"
                                        required
                                        value={chapterForm.chapter_label}
                                        onChange={(e) => {
                                            setChapterForm({...chapterForm, chapter_label: e.target.value});
                                            validateChapterField('chapter_label', e.target.value);
                                        }}
                                        placeholder="e.g. Chapter 01"
                                        className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue ${
                                            chapterErrors.chapter_label ? 'border-red-500' : 'border-glass-border'
                                        }`}
                                    />
                                    {chapterErrors.chapter_label && (
                                        <p className="text-red-400 text-xs mt-1 font-mono">{chapterErrors.chapter_label}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Eyebrow Header *</label>
                                    <input
                                        type="text"
                                        required
                                        value={chapterForm.eyebrow}
                                        onChange={(e) => {
                                            setChapterForm({...chapterForm, eyebrow: e.target.value});
                                            validateChapterField('eyebrow', e.target.value);
                                        }}
                                        placeholder="e.g. Narrative"
                                        className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue ${
                                            chapterErrors.eyebrow ? 'border-red-500' : 'border-glass-border'
                                        }`}
                                    />
                                    {chapterErrors.eyebrow && (
                                        <p className="text-red-400 text-xs mt-1 font-mono">{chapterErrors.eyebrow}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={chapterForm.title}
                                    onChange={(e) => {
                                        setChapterForm({...chapterForm, title: e.target.value});
                                        validateChapterField('title', e.target.value);
                                    }}
                                    className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue ${
                                        chapterErrors.title ? 'border-red-500' : 'border-glass-border'
                                    }`}
                                />
                                {chapterErrors.title && (
                                    <p className="text-red-400 text-xs mt-1 font-mono">{chapterErrors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Narrative Description *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={chapterForm.description}
                                    onChange={(e) => {
                                        setChapterForm({...chapterForm, description: e.target.value});
                                        validateChapterField('description', e.target.value);
                                    }}
                                    className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue resize-none ${
                                        chapterErrors.description ? 'border-red-500' : 'border-glass-border'
                                    }`}
                                />
                                {chapterErrors.description && (
                                    <p className="text-red-400 text-xs mt-1 font-mono">{chapterErrors.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* STAT LABEL */}
                                <div>
                                    <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Stat Label (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Across the Cosmos"
                                        value={chapterForm.stat_label}
                                        onChange={(e) => setChapterForm({...chapterForm, stat_label: e.target.value})}
                                        className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white focus:outline-none focus:border-ice-blue"
                                    />
                                </div>

                                {/* LIVE VS MANUAL STAT NUMBER TOGGLE */}
                                <div className="flex flex-col gap-2">
                                    <label className="block text-xs opacity-70 font-display uppercase tracking-wider">Stat Number Input</label>
                                    <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-glass-border">
                                        <span className="text-xs text-star-white/70">Use Live Album Count</span>
                                        <input
                                            type="checkbox"
                                            checked={useLiveAlbumCount}
                                            onChange={(e) => {
                                                const active = e.target.checked;
                                                setUseLiveAlbumCount(active);
                                                if (active) {
                                                    setChapterForm(prev => ({ ...prev, stat_number: '' }));
                                                }
                                            }}
                                            className="w-4 h-4 accent-ice-blue cursor-pointer"
                                        />
                                    </div>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            disabled={useLiveAlbumCount}
                                            value={chapterForm.stat_number}
                                            onChange={(e) => setChapterForm({...chapterForm, stat_number: e.target.value})}
                                            placeholder="Manual override (e.g. 5)"
                                            className={`w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2 text-star-white focus:outline-none ${
                                                useLiveAlbumCount ? 'opacity-30 cursor-not-allowed bg-black/40' : ''
                                            }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* ACCENT COLOR PICKER WITH SWATCH */}
                                <div className="flex flex-col">
                                    <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Accent Color</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            value={chapterForm.accent_color}
                                            onChange={(e) => setChapterForm({...chapterForm, accent_color: e.target.value})}
                                            className="w-12 h-10 bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg cursor-pointer focus:outline-none flex-shrink-0"
                                        />
                                        <span className="text-xs font-mono bg-white/5 border border-glass-border rounded-md px-2.5 py-2 uppercase text-star-white flex-1 text-center">
                                            {chapterForm.accent_color}
                                        </span>
                                    </div>
                                </div>

                                {/* IMAGE SIDE SEGMENTED CONTROL */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Image Side Alignment</label>
                                    <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-glass-border h-10">
                                        <button
                                            type="button"
                                            onClick={() => setChapterForm({...chapterForm, image_side: 'left'})}
                                            className={`flex-1 text-[10px] uppercase font-display tracking-widest rounded transition-all ${
                                                chapterForm.image_side === 'left'
                                                    ? 'bg-ice-blue text-void-black font-semibold'
                                                    : 'text-star-white/60 hover:text-star-white'
                                            }`}
                                        >
                                            ◀ Left
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setChapterForm({...chapterForm, image_side: 'right'})}
                                            className={`flex-1 text-[10px] uppercase font-display tracking-widest rounded transition-all ${
                                                chapterForm.image_side === 'right'
                                                    ? 'bg-ice-blue text-void-black font-semibold'
                                                    : 'text-star-white/60 hover:text-star-white'
                                            }`}
                                        >
                                            Right ▶
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs opacity-70 mb-1 font-display uppercase tracking-wider">Character Graphic Image</label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={(e) => {
                                        setChapterError('');
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (validateImageFile(file)) {
                                                setChapterFile(file);
                                                setPreviewUrl(URL.createObjectURL(file));
                                            } else {
                                                e.target.value = '';
                                                setChapterFile(null);
                                                setChapterPreviewUrl('');
                                                setChapterError("Must be a JPG, JPEG, PNG, or WEBP image under 10MB");
                                            }
                                        }
                                    }}
                                    className="w-full text-xs opacity-80 cursor-pointer"
                                />
                                {chapterError && (
                                    <p className="text-red-400 text-xs mt-1 font-mono">⚠️ {chapterError}</p>
                                )}

                                <div className="flex gap-4 items-end mt-4">
                                    {editingChapter?.image && (
                                        <div>
                                            <p className="text-[10px] opacity-40 mb-1">Current Graphic:</p>
                                            <img src={editingChapter.image} alt="Current" className="w-24 h-24 object-cover rounded border border-glass-border" />
                                        </div>
                                    )}
                                    {chapterPreviewUrl && (
                                        <div>
                                            <p className="text-[10px] text-ice-blue mb-1">New Selected Graphic:</p>
                                            <img src={chapterPreviewUrl} alt="New Preview" className="w-24 h-24 object-cover rounded border border-ice-blue" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CHAPTER VISUAL LIVE PREVIEW CARD */}
                            <div className="border border-glass-border p-4 rounded-xl bg-void-black/80 relative overflow-hidden mt-2">
                                <h4 className="text-[10px] uppercase font-display tracking-widest text-ice-blue mb-3">✦ Styled Chapter Live Preview ✦</h4>
                                <div className={`flex items-center gap-4 ${chapterForm.image_side === 'right' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                    {/* Mock Character graphic */}
                                    <div className="w-16 h-20 rounded bg-white/5 border border-glass-border flex items-center justify-center relative overflow-hidden flex-shrink-0">
                                        {chapterPreviewUrl || editingChapter?.image ? (
                                            <img src={chapterPreviewUrl || editingChapter?.image} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span className="text-lg">👤</span>
                                        )}
                                    </div>

                                    {/* Live styled texts */}
                                    <div className="flex-1">
                                        <span className="text-[9px] uppercase font-display tracking-widest block" style={{ color: chapterForm.accent_color }}>
                                            {chapterForm.chapter_label || 'Chapter label'} · {chapterForm.eyebrow || 'eyebrow'}
                                        </span>
                                        <h3 className="font-display font-bold text-sm text-star-white mt-0.5 uppercase" style={{ textShadow: `0 0 10px ${chapterForm.accent_color}60` }}>
                                            {chapterForm.title || 'CHAPTER TITLE'}
                                        </h3>
                                        <p className="text-[10px] opacity-60 mt-1 font-sans line-clamp-2">
                                            {chapterForm.description || 'Description narrative text.'}
                                        </p>
                                        {chapterForm.stat_label && (
                                            <div className="mt-2 p-1.5 rounded bg-white/5 border border-glass-border inline-block text-[9px]">
                                                <span className="font-display font-bold text-star-white block">
                                                    {useLiveAlbumCount ? String(albums.length) : (chapterForm.stat_number || '0')} ALBUMS
                                                </span>
                                                <span className="opacity-50 block uppercase tracking-wider">{chapterForm.stat_label}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* UPLOAD PROGRESS BAR */}
                            {isUploading && uploadProgress !== null && (
                                <div className="w-full mt-4">
                                    <div className="flex justify-between text-xs font-mono text-ice-blue mb-1">
                                        <span>Uploading Celestial Graphic...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-glass-border">
                                        <div className="h-full bg-ice-blue rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={hasChapterErrors || submitting}
                                className={`glass-btn py-3 mt-4 font-display text-xs uppercase tracking-widest w-full ${
                                    (hasChapterErrors || submitting) ? 'opacity-40 cursor-not-allowed bg-black/40 border-glass-border text-star-white/40' : 'text-ice-blue border-ice-blue/40 hover:bg-ice-blue/10'
                                }`}
                            >
                                {submitting ? 'Saving changes...' : editingChapter ? 'Save Chapter Changes' : 'Create Chapter'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* THEMED PERMANENT DELETION OVERLAY CONFIRMATION */}
            {deleteConfirmState.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.85)] p-4">
                    <div className="glass-card p-6 max-w-md w-full border border-red-500/30 bg-void-black/95 shadow-2xl">
                        <h3 className="font-display font-bold text-lg mb-3 text-red-400">
                            {deleteConfirmState.title}
                        </h3>
                        <p className="text-xs opacity-80 mb-6 font-sans whitespace-pre-line leading-relaxed text-star-white/90">
                            {deleteConfirmState.message}
                        </p>
                        {deleteConfirmState.confirmTextRequired && (
                            <div className="mb-6">
                                <label className="block text-[10px] uppercase font-display tracking-widest opacity-50 mb-2">Type "{deleteConfirmState.confirmTextRequired}" exactly to confirm:</label>
                                <input
                                    type="text"
                                    id="deleteConfirmInput"
                                    autoFocus
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-glass-border rounded-lg p-2.5 text-star-white text-xs focus:outline-none focus:border-red-500 font-display"
                                    placeholder={deleteConfirmState.confirmTextRequired}
                                />
                            </div>
                        )}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirmState(prev => ({ ...prev, isOpen: false }))}
                                className="glass-btn flex-1 py-2.5 font-display text-xs uppercase tracking-widest text-star-white hover:bg-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (deleteConfirmState.confirmTextRequired) {
                                        const val = (document.getElementById('deleteConfirmInput') as HTMLInputElement)?.value;
                                        if (val !== deleteConfirmState.confirmTextRequired) {
                                            showError("Confirmation text did not match exactly.");
                                            return;
                                        }
                                    }
                                    deleteConfirmState.onConfirm();
                                    setDeleteConfirmState(prev => ({ ...prev, isOpen: false }));
                                }}
                                className="glass-btn flex-1 py-2.5 font-display text-xs uppercase tracking-widest text-red-400 border-red-500/30 hover:bg-red-500/10"
                            >
                                Permanent Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from pathlib import Path

from database import get_db
from models import Album, Song, SiteSetting, ScrollytellingChapter
from schemas import (
    AlbumCreate, AlbumUpdate, AlbumResponse,
    SongCreate, SongUpdate, SongResponse,
    SiteSettingResponse, SiteSettingCreate,
    ScrollytellingChapterCreate, ScrollytellingChapterUpdate, ScrollytellingChapterResponse
)
from auth_utils import verify_firebase_token

router = APIRouter()

@router.get("/auth/verify")
async def verify_auth(_email: str = Depends(verify_firebase_token)):
    return {"status": "success", "email": _email}

# Local Media Storage Base
MEDIA_DIR = Path(__file__).resolve().parent / "media"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

def delete_file_from_disk(relative_path: str):
    if not relative_path:
        return
    full_path = MEDIA_DIR / relative_path.replace("media/", "", 1) if relative_path.startswith("media/") else MEDIA_DIR / relative_path
    if full_path.exists() and full_path.is_file():
        try:
            full_path.unlink()
        except Exception as e:
            print(f"Failed to delete file {full_path}: {e}")

# ==================== ALBUM ENDPOINTS ====================

@router.get("/albums", response_model=List[AlbumResponse])
async def list_albums(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Album).options(selectinload(Album.songs)).order_by(Album.position))
    return result.scalars().all()

@router.get("/albums/{album_id}", response_model=AlbumResponse)
async def get_album(album_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Album).options(selectinload(Album.songs)).where(Album.id == album_id))
    album = result.scalar_one_or_none()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    return album

@router.post("/albums", response_model=AlbumResponse, status_code=status.HTTP_201_CREATED)
async def create_album(
    album_data: AlbumCreate,
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    exists = await db.execute(select(Album).where(Album.id == album_data.id))
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Album with this ID/slug already exists")

    max_pos = await db.execute(select(func.max(Album.position)))
    pos = (max_pos.scalar() or 0) + 1

    new_album = Album(**album_data.model_dump())
    new_album.position = pos
    db.add(new_album)
    await db.commit()

    # Reload with songs eagerly loaded
    result = await db.execute(select(Album).options(selectinload(Album.songs)).where(Album.id == new_album.id))
    return result.scalar_one()

@router.put("/albums/{album_id}", response_model=AlbumResponse)
async def update_album(
    album_id: str,
    album_data: AlbumUpdate,
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    result = await db.execute(select(Album).options(selectinload(Album.songs)).where(Album.id == album_id))
    album = result.scalar_one_or_none()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")

    update_dict = album_data.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(album, k, v)

    await db.commit()
    await db.refresh(album)
    return album

@router.delete("/albums/{album_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_album(
    album_id: str,
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    result = await db.execute(select(Album).options(selectinload(Album.songs)).where(Album.id == album_id))
    album = result.scalar_one_or_none()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")

    delete_file_from_disk(album.cover)
    for song in album.songs:
        if song.audio_path:
            delete_file_from_disk(song.audio_path)

    album_dir = MEDIA_DIR / "albums" / album_id
    if album_dir.exists() and album_dir.is_dir():
        try:
            shutil.rmtree(album_dir)
        except Exception as e:
            print(f"Failed to delete directory {album_dir}: {e}")

    await db.delete(album)
    await db.commit()
    return

@router.post("/albums/{album_id}/reorder")
async def reorder_album(
    album_id: str,
    direction: str,
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    if direction not in ("up", "down"):
        raise HTTPException(status_code=400, detail="Invalid direction. Must be 'up' or 'down'")

    result = await db.execute(select(Album).where(Album.id == album_id))
    album = result.scalar_one_or_none()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")

    albums_result = await db.execute(select(Album).order_by(Album.position))
    all_albums = albums_result.scalars().all()

    idx = all_albums.index(album)
    if direction == "up" and idx > 0:
        other = all_albums[idx - 1]
        album.position, other.position = other.position, album.position
    elif direction == "down" and idx < len(all_albums) - 1:
        other = all_albums[idx + 1]
        album.position, other.position = other.position, album.position

    await db.commit()
    return {"status": "success"}

# ==================== SONG ENDPOINTS ====================

@router.post("/songs", response_model=SongResponse, status_code=status.HTTP_201_CREATED)
async def create_song(
    song_data: SongCreate,
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    album_res = await db.execute(select(Album).where(Album.id == song_data.album_id))
    if not album_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Album not found")

    max_track = await db.execute(select(func.max(Song.track_number)).where(Song.album_id == song_data.album_id))
    track_num = (max_track.scalar() or 0) + 1

    new_song = Song(**song_data.model_dump())
    new_song.track_number = track_num
    db.add(new_song)
    await db.commit()
    await db.refresh(new_song)
    return new_song

@router.put("/songs/{song_id}", response_model=SongResponse)
async def update_song(
    song_id: int,
    song_data: SongUpdate,
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    result = await db.execute(select(Song).where(Song.id == song_id))
    song = result.scalar_one_or_none()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    update_dict = song_data.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(song, k, v)

    await db.commit()
    await db.refresh(song)
    return song

@router.delete("/songs/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_song(
    song_id: int,
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    result = await db.execute(select(Song).where(Song.id == song_id))
    song = result.scalar_one_or_none()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    if song.audio_path:
        delete_file_from_disk(song.audio_path)

    await db.delete(song)
    await db.commit()
    return

@router.post("/songs/{song_id}/reorder")
async def reorder_song(
    song_id: int,
    direction: str,
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    if direction not in ("up", "down"):
        raise HTTPException(status_code=400, detail="Invalid direction. Must be 'up' or 'down'")

    result = await db.execute(select(Song).where(Song.id == song_id))
    song = result.scalar_one_or_none()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    songs_result = await db.execute(select(Song).where(Song.album_id == song.album_id).order_by(Song.track_number))
    all_songs = songs_result.scalars().all()

    idx = all_songs.index(song)
    if direction == "up" and idx > 0:
        other = all_songs[idx - 1]
        song.track_number, other.track_number = other.track_number, song.track_number
    elif direction == "down" and idx < len(all_songs) - 1:
        other = all_songs[idx + 1]
        song.track_number, other.track_number = other.track_number, song.track_number

    await db.commit()
    return {"status": "success"}

# ==================== SCROLLYTELLING CHAPTERS ====================

@router.get("/chapters", response_model=List[ScrollytellingChapterResponse])
async def list_chapters(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ScrollytellingChapter).order_by(ScrollytellingChapter.position))
    return result.scalars().all()

@router.get("/chapters/{chapter_id}", response_model=ScrollytellingChapterResponse)
async def get_chapter(chapter_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ScrollytellingChapter).where(ScrollytellingChapter.id == chapter_id))
    chap = result.scalar_one_or_none()
    if not chap:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chap

@router.post("/chapters", response_model=ScrollytellingChapterResponse, status_code=status.HTTP_201_CREATED)
async def create_chapter(
    chap_data: ScrollytellingChapterCreate,
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    exists = await db.execute(select(ScrollytellingChapter).where(ScrollytellingChapter.id == chap_data.id))
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Chapter with this ID already exists")

    max_pos = await db.execute(select(func.max(ScrollytellingChapter.position)))
    pos = (max_pos.scalar() or 0) + 1

    new_chap = ScrollytellingChapter(**chap_data.model_dump())
    new_chap.position = pos
    db.add(new_chap)
    await db.commit()
    await db.refresh(new_chap)
    return new_chap

@router.put("/chapters/{chapter_id}", response_model=ScrollytellingChapterResponse)
async def update_chapter(
    chapter_id: str,
    chap_data: ScrollytellingChapterUpdate,
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    result = await db.execute(select(ScrollytellingChapter).where(ScrollytellingChapter.id == chapter_id))
    chap = result.scalar_one_or_none()
    if not chap:
        raise HTTPException(status_code=404, detail="Chapter not found")

    update_dict = chap_data.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(chap, k, v)

    await db.commit()
    await db.refresh(chap)
    return chap

@router.delete("/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chapter(
    chapter_id: str,
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    result = await db.execute(select(ScrollytellingChapter).where(ScrollytellingChapter.id == chapter_id))
    chap = result.scalar_one_or_none()
    if not chap:
        raise HTTPException(status_code=404, detail="Chapter not found")

    delete_file_from_disk(chap.image)
    await db.delete(chap)
    await db.commit()
    return

@router.post("/chapters/{chapter_id}/reorder")
async def reorder_chapter(
    chapter_id: str,
    direction: str,
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    if direction not in ("up", "down"):
        raise HTTPException(status_code=400, detail="Invalid direction. Must be 'up' or 'down'")

    result = await db.execute(select(ScrollytellingChapter).where(ScrollytellingChapter.id == chapter_id))
    chap = result.scalar_one_or_none()
    if not chap:
        raise HTTPException(status_code=404, detail="Chapter not found")

    result_chaps = await db.execute(select(ScrollytellingChapter).order_by(ScrollytellingChapter.position))
    all_chaps = result_chaps.scalars().all()

    idx = all_chaps.index(chap)
    if direction == "up" and idx > 0:
        other = all_chaps[idx - 1]
        chap.position, other.position = other.position, chap.position
    elif direction == "down" and idx < len(all_chaps) - 1:
        other = all_chaps[idx + 1]
        chap.position, other.position = other.position, chap.position

    await db.commit()
    return {"status": "success"}

# ==================== SITE SETTINGS ENDPOINTS ====================

@router.get("/settings", response_model=List[SiteSettingResponse])
async def list_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SiteSetting))
    return result.scalars().all()

@router.put("/settings", response_model=List[SiteSettingResponse])
async def update_settings(
    settings_data: List[SiteSettingCreate],
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    for setting in settings_data:
        result = await db.execute(select(SiteSetting).where(SiteSetting.key == setting.key))
        existing = result.scalar_one_or_none()
        if existing:
            existing.value = setting.value
        else:
            db.add(SiteSetting(key=setting.key, value=setting.value))
    await db.commit()

    updated_result = await db.execute(select(SiteSetting))
    return updated_result.scalars().all()

# ==================== FILE UPLOAD ENDPOINTS ====================

def validate_file(file: UploadFile, is_audio: bool):
    ext = Path(file.filename or "").suffix.lower()
    if is_audio:
        allowed_exts = {".mp3", ".wav"}
        max_size = 30 * 1024 * 1024  # 30MB
        error_msg = "Audio file must be MP3 or WAV and under 30MB."
    else:
        allowed_exts = {".jpg", ".jpeg", ".png", ".webp"}
        max_size = 10 * 1024 * 1024  # 10MB
        error_msg = "Image file must be JPG, JPEG, PNG, or WEBP and under 10MB."

    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Invalid file type. {error_msg}")

    try:
        file.file.seek(0, os.SEEK_END)
        size = file.file.tell()
        file.file.seek(0)
    except Exception:
        size = 0

    if size > max_size:
        raise HTTPException(status_code=400, detail=f"File is too large. {error_msg}")

@router.post("/upload/cover/{album_id}")
async def upload_cover(
    album_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    validate_file(file, is_audio=False)

    result = await db.execute(select(Album).where(Album.id == album_id))
    album = result.scalar_one_or_none()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")

    album_dir = MEDIA_DIR / "albums" / album_id
    album_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix or ".jpg"
    target_path = album_dir / f"cover{ext}"

    if album.cover:
        delete_file_from_disk(album.cover)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    rel_path = f"media/albums/{album_id}/cover{ext}"
    album.cover = rel_path
    await db.commit()

    return {"cover_url": f"/api/{rel_path}"}

@router.post("/upload/audio/{song_id}")
async def upload_audio(
    song_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    validate_file(file, is_audio=True)

    result = await db.execute(select(Song).where(Song.id == song_id))
    song = result.scalar_one_or_none()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    album_dir = MEDIA_DIR / "albums" / song.album_id / "songs"
    album_dir.mkdir(parents=True, exist_ok=True)

    slug = song.title.lower().replace(" ", "-")
    track_num_str = str(song.track_number).zfill(2)
    ext = Path(file.filename).suffix or ".mp3"

    target_filename = f"{track_num_str}-{slug}{ext}"
    target_path = album_dir / target_filename

    if song.audio_path:
        delete_file_from_disk(song.audio_path)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    rel_path = f"media/albums/{song.album_id}/songs/{target_filename}"
    song.audio_path = rel_path
    await db.commit()

    return {"audio_url": f"/api/{rel_path}"}

@router.post("/upload/chapter/{chapter_id}")
async def upload_chapter_image(
    chapter_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _email: str = Depends(verify_firebase_token)
):
    validate_file(file, is_audio=False)

    result = await db.execute(select(ScrollytellingChapter).where(ScrollytellingChapter.id == chapter_id))
    chap = result.scalar_one_or_none()
    if not chap:
        raise HTTPException(status_code=404, detail="Chapter not found")

    chap_dir = MEDIA_DIR / "chapters"
    chap_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix or ".jpg"
    target_filename = f"{chapter_id}{ext}"
    target_path = chap_dir / target_filename

    if chap.image:
        delete_file_from_disk(chap.image)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    rel_path = f"media/chapters/{target_filename}"
    chap.image = rel_path
    await db.commit()

    return {"image_url": f"/api/{rel_path}"}

from pydantic import BaseModel, Field, model_validator
from typing import List, Optional
import os
from pathlib import Path

MEDIA_DIR = Path(__file__).resolve().parent / "media"

def add_cache_buster(relative_path: Optional[str]) -> Optional[str]:
    if not relative_path:
        return relative_path
    clean_path = relative_path.split("?")[0]
    sub_path = clean_path.replace("media/", "", 1) if clean_path.startswith("media/") else clean_path
    full_path = MEDIA_DIR / sub_path
    if full_path.exists() and full_path.is_file():
        mtime = int(full_path.stat().st_mtime)
        return f"{clean_path}?v={mtime}"
    return relative_path

class SiteSettingBase(BaseModel):
    key: str
    value: str

class SiteSettingCreate(SiteSettingBase):
    pass

class SiteSettingResponse(SiteSettingBase):
    class Config:
        from_attributes = True

class SongBase(BaseModel):
    title: str
    duration: str
    seconds: int
    lyrics: Optional[str] = None
    audio_path: Optional[str] = None
    track_number: int = 1

class SongCreate(SongBase):
    album_id: str

class SongUpdate(BaseModel):
    title: Optional[str] = None
    duration: Optional[str] = None
    seconds: Optional[int] = None
    lyrics: Optional[str] = None
    audio_path: Optional[str] = None
    track_number: Optional[int] = None

class SongResponse(SongBase):
    id: int
    album_id: str

    class Config:
        from_attributes = True

    @model_validator(mode='after')
    def append_cache_buster(self):
        if self.audio_path:
            self.audio_path = add_cache_buster(self.audio_path)
        return self

class AlbumBase(BaseModel):
    id: str # Slug as ID
    title: str
    year: int
    cover: str
    description: str
    genre_tags: str = ""
    position: int = 0

class AlbumCreate(AlbumBase):
    pass

class AlbumUpdate(BaseModel):
    title: Optional[str] = None
    year: Optional[int] = None
    cover: Optional[str] = None
    description: Optional[str] = None
    genre_tags: Optional[str] = None
    position: Optional[int] = None

class AlbumResponse(AlbumBase):
    songs: List[SongResponse] = []

    class Config:
        from_attributes = True

    @model_validator(mode='after')
    def append_cache_buster(self):
        if self.cover:
            self.cover = add_cache_buster(self.cover)
        return self

class ScrollytellingChapterBase(BaseModel):
    id: str
    title: str
    description: str
    chapter_label: str
    image: str
    eyebrow: str
    stat_number: Optional[str] = None
    stat_label: Optional[str] = None
    accent_color: str = "#a8b4f8"
    image_side: str = "left"
    show_divider: int = 1
    position: int = 1

class ScrollytellingChapterCreate(ScrollytellingChapterBase):
    pass

class ScrollytellingChapterUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    chapter_label: Optional[str] = None
    image: Optional[str] = None
    eyebrow: Optional[str] = None
    stat_number: Optional[str] = None
    stat_label: Optional[str] = None
    accent_color: Optional[str] = None
    image_side: Optional[str] = None
    show_divider: Optional[int] = None
    position: Optional[int] = None

class ScrollytellingChapterResponse(ScrollytellingChapterBase):
    class Config:
        from_attributes = True

    @model_validator(mode='after')
    def append_cache_buster(self):
        if self.image:
            self.image = add_cache_buster(self.image)
        return self

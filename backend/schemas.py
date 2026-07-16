from pydantic import BaseModel, Field
from typing import List, Optional

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

class ScrollytellingChapterBase(BaseModel):
    id: str
    title: str
    description: str
    chapter_label: str
    image: str
    eyebrow: str
    stat_number: Optional[str] = None
    stat_label: Optional[str] = None
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
    position: Optional[int] = None

class ScrollytellingChapterResponse(ScrollytellingChapterBase):
    class Config:
        from_attributes = True

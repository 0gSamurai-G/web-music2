from sqlalchemy import Column, String, Integer, ForeignKey, Text, select, func
from sqlalchemy.orm import relationship
from database import Base

class Album(Base):
    __tablename__ = "albums"

    id = Column(String, primary_key=True, index=True) # slug e.g. "void-frequencies"
    title = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    cover = Column(String, nullable=False) # cover img relative path
    description = Column(String, nullable=False)
    genre_tags = Column(String, nullable=False, default="") # comma-separated list like "Ambient,Space"
    position = Column(Integer, nullable=False, default=0)

    # Relationship to Songs
    songs = relationship("Song", back_populates="album", cascade="all, delete-orphan", order_by="Song.track_number")

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    duration = Column(String, nullable=False) # e.g. "3:42"
    seconds = Column(Integer, nullable=False) # e.g. 222
    lyrics = Column(Text, nullable=True) # Multi-line text lyrics or NULL
    audio_path = Column(String, nullable=True) # relative path to actual uploaded MP3 or NULL
    track_number = Column(Integer, nullable=False, default=1)
    album_id = Column(String, ForeignKey("albums.id", ondelete="CASCADE"), nullable=False)

    # Relationship to Album
    album = relationship("Album", back_populates="songs")

class SiteSetting(Base):
    __tablename__ = "site_settings"

    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)

class ScrollytellingChapter(Base):
    __tablename__ = "scrollytelling_chapters"

    id = Column(String, primary_key=True, index=True) # e.g. "chapter-1"
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    chapter_label = Column(String, nullable=False) # e.g. "Chapter 01"
    image = Column(String, nullable=False) # e.g. relative path to chapter character illustration
    eyebrow = Column(String, nullable=False) # e.g. "Discography"
    stat_number = Column(String, nullable=True) # e.g. "5"
    stat_label = Column(String, nullable=True) # e.g. "Across the Cosmos"
    position = Column(Integer, nullable=False, default=1)

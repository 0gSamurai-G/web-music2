import os
import asyncio
import shutil
import random
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, delete

# Add parent path to import correctly
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))

from database import DATABASE_URL, Base, DB_PATH
from models import Album, Song, SiteSetting, ScrollytellingChapter

# Existing assets directory in Next.js public folder
NEXT_PUBLIC_IMAGES = Path(__file__).resolve().parent.parent / "public" / "assets" / "images"
MEDIA_DIR = Path(__file__).resolve().parent / "media"

ALBUMS_SEED = [
    {
        "id": "void-frequencies",
        "title": "Void Frequencies",
        "year": 2024,
        "cover": "Artboard_4-1781358319348.png",
        "description": "The debut album that started everything. Twelve tracks of deep space noir, recorded in the quiet hours between midnight and dawn. Each song is a frequency sent into the void — some came back, some didn't. Engineered in total darkness. Mixed with the kind of silence that only comes after everything loud has faded away. The album drifts between neo-classical ambient and hard-edged electronic noir, carving out its own gravitational field.",
        "genre_tags": "Ambient,Electronic Noir,Space",
    },
    {
        "id": "nebula-drift",
        "title": "Nebula Drift",
        "year": 2023,
        "cover": "Artboard_3-1781358319362.png",
        "description": "Drifting through star clusters and finding beauty in the between.",
        "genre_tags": "Ambient,Space",
    },
    {
        "id": "surface-tension",
        "title": "Surface Tension",
        "year": 2023,
        "cover": "Artboard_2-1781358319225.png",
        "description": "The underwater chapter. Pressure, depth, and the will to rise.",
        "genre_tags": "Electronic Noir,Ambient",
    },
    {
        "id": "starfall",
        "title": "Starfall",
        "year": 2022,
        "cover": "Artboard_1-1781358319348.png",
        "description": "When stars fall, they leave trails. This album is the trail.",
        "genre_tags": "Space,Ambient",
    },
    {
        "id": "echo-protocol",
        "title": "Echo Protocol",
        "year": 2022,
        "cover": "Artboard_4-1781358319348.png",
        "description": "Signals sent into the void. Some echoed back. Some didn't.",
        "genre_tags": "Electronic Noir",
    },
    {
        "id": "abyssal-chorus",
        "title": "Abyssal Chorus",
        "year": 2021,
        "cover": "Artboard_2-1781358319225.png",
        "description": "Deep below the pressure point, songs still echo.",
        "genre_tags": "Ambient",
    },
    {
        "id": "neon-vanguard",
        "title": "Neon Vanguard",
        "year": 2021,
        "cover": "Artboard_3-1781358319362.png",
        "description": "Fast, electric, unapologetic.",
        "genre_tags": "Electronic Noir",
    },
    {
        "id": "quantum-state",
        "title": "Quantum State",
        "year": 2020,
        "cover": "Artboard_1-1781358319348.png",
        "description": "A study in uncertainty and sonic superpositions.",
        "genre_tags": "Space,Electronic Noir",
    },
    {
        "id": "horizon-event",
        "title": "Horizon Event",
        "year": 2020,
        "cover": "Artboard_4-1781358319348.png",
        "description": "The point of no return. You have been warned.",
        "genre_tags": "Space",
    },
    {
        "id": "origin-story",
        "title": "Origin Story",
        "year": 2019,
        "cover": "Artboard_2-1781358319225.png",
        "description": "Where it all began. The very first frequencies.",
        "genre_tags": "Ambient",
    },
]

TRACKS_VOID_FREQUENCIES = [
  { "id": 1, "title": "Free Fall", "duration": "3:42", "seconds": 222 },
  { "id": 2, "title": "Impact", "duration": "4:15", "seconds": 255 },
  { "id": 3, "title": "Descent", "duration": "5:01", "seconds": 301 },
  { "id": 4, "title": "Bubble Up", "duration": "3:28", "seconds": 208 },
  { "id": 5, "title": "Surface", "duration": "4:44", "seconds": 284 },
  { "id": 6, "title": "Void Walk", "duration": "3:55", "seconds": 235 },
  { "id": 7, "title": "Neon Depth", "duration": "4:08", "seconds": 248 },
  { "id": 8, "title": "Orbit", "duration": "3:33", "seconds": 213 },
  { "id": 9, "title": "Resonance", "duration": "4:50", "seconds": 290 },
  { "id": 10, "title": "Triumph", "duration": "5:12", "seconds": 312 },
  { "id": 11, "title": "Echo Return", "duration": "3:18", "seconds": 198 },
  { "id": 12, "title": "Void Signal", "duration": "4:30", "seconds": 270 }
]

LYRICS_FREE_FALL = """Falling through the void between the stars
No ground beneath my feet, no ceiling far
The silence wraps around like second skin
I let go of everything that held me in
Free fall, free fall
Where the gravity dissolves
Free fall, free fall
Into everything that calls"""

OTHER_ALBUMS_TRACK_COUNTS = {
    "nebula-drift": 10,
    "surface-tension": 9,
    "starfall": 11,
    "echo-protocol": 8,
    "abyssal-chorus": 14,
    "neon-vanguard": 7,
    "quantum-state": 9,
    "horizon-event": 10,
    "origin-story": 13
}

CHAPTERS_SEED = [
    {
        "id": "chapter-1",
        "title": "FREE FALL",
        "description": "The moment gravity becomes freedom.",
        "chapter_label": "Chapter 01",
        "image_source": "Artboard_1-1781358319348.png",
        "eyebrow": "Chapter 01",
        "stat_number": None,
        "stat_label": None,
        "image_side": "left",
        "accent_color": "#a8b4f8",
        "show_divider": 1
    },
    {
        "id": "chapter-2",
        "title": "DESCENT",
        "description": "Sinking deeper into the blue.",
        "chapter_label": "Chapter 02",
        "image_source": "Artboard_2-1781358319225.png",
        "eyebrow": "Chapter 02",
        "stat_number": None,
        "stat_label": None,
        "image_side": "right",
        "accent_color": "#6b5fe4",
        "show_divider": 1
    },
    {
        "id": "chapter-3",
        "title": "SURFACE",
        "description": "Breaking through with everything I have.",
        "chapter_label": "Chapter 03",
        "image_source": "Artboard_3-1781358319362.png",
        "eyebrow": "Chapter 03",
        "stat_number": None,
        "stat_label": None,
        "image_side": "left",
        "accent_color": "#a8b4f8",
        "show_divider": 1
    },
    {
        "id": "chapter-4",
        "title": "TRIUMPH",
        "description": "Everything I survived led here.",
        "chapter_label": "Chapter 04",
        "image_source": "Artboard_4-1781358319348.png",
        "eyebrow": "Discography",
        "stat_number": "5",
        "stat_label": "Across the Cosmos",
        "image_side": "right",
        "accent_color": "#c9a84c",
        "show_divider": 1
    }
]

async def seed_data():
    engine = create_async_engine(DATABASE_URL)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("Cleaning up target media directory...")
    if MEDIA_DIR.exists():
        shutil.rmtree(MEDIA_DIR)
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)

    async with async_session() as session:
        # Clear existing entries
        print("Clearing existing tables...")
        await session.execute(delete(Song))
        await session.execute(delete(Album))
        await session.execute(delete(SiteSetting))
        await session.execute(delete(ScrollytellingChapter))
        await session.commit()

        # Seed Site Settings
        print("Seeding site settings...")
        session.add_all([
            SiteSetting(key="years_active", value="3"),
            SiteSetting(key="streams", value="∞")
        ])
        await session.commit()

        # Seed Albums & Songs
        print("Seeding albums and songs...")
        for pos, alb in enumerate(ALBUMS_SEED, start=1):
            album_slug = alb["id"]

            dest_album_dir = MEDIA_DIR / "albums" / album_slug
            dest_album_dir.mkdir(parents=True, exist_ok=True)

            src_cover_file = NEXT_PUBLIC_IMAGES / alb["cover"]
            cover_ext = src_cover_file.suffix or ".png"
            dest_cover_file = dest_album_dir / f"cover{cover_ext}"

            if src_cover_file.exists():
                shutil.copy2(src_cover_file, dest_cover_file)
            else:
                dest_cover_file.touch()

            relative_cover_path = f"media/albums/{album_slug}/cover{cover_ext}"

            album_model = Album(
                id=album_slug,
                title=alb["title"],
                year=alb["year"],
                cover=relative_cover_path,
                description=alb["description"],
                genre_tags=alb["genre_tags"],
                position=pos
            )
            session.add(album_model)
            await session.flush()

            songs_list = []
            if album_slug == "void-frequencies":
                for idx, track in enumerate(TRACKS_VOID_FREQUENCIES, start=1):
                    lyrics = LYRICS_FREE_FALL if track["title"] == "Free Fall" else None
                    song_slug = track["title"].lower().replace(" ", "-")
                    track_str = str(idx).zfill(2)
                    audio_filename = f"{track_str}-{song_slug}.mp3"

                    songs_dir = dest_album_dir / "songs"
                    songs_dir.mkdir(parents=True, exist_ok=True)
                    (songs_dir / audio_filename).touch()

                    song_model = Song(
                        title=track["title"],
                        duration=track["duration"],
                        seconds=track["seconds"],
                        lyrics=lyrics,
                        audio_path=f"media/albums/{album_slug}/songs/{audio_filename}",
                        track_number=idx,
                        album_id=album_slug
                    )
                    songs_list.append(song_model)
            else:
                track_count = OTHER_ALBUMS_TRACK_COUNTS.get(album_slug, 10)
                for idx in range(1, track_count + 1):
                    title = f"Scaffold Song {str(idx).zfill(2)}"
                    minutes = random.randint(3, 4)
                    seconds_rem = random.randint(0, 59)
                    duration_str = f"{minutes}:{str(seconds_rem).zfill(2)}"
                    total_seconds = minutes * 60 + seconds_rem

                    song_slug = title.lower().replace(" ", "-")
                    track_str = str(idx).zfill(2)
                    audio_filename = f"{track_str}-{song_slug}.mp3"

                    songs_dir = dest_album_dir / "songs"
                    songs_dir.mkdir(parents=True, exist_ok=True)
                    (songs_dir / audio_filename).touch()

                    song_model = Song(
                        title=title,
                        duration=duration_str,
                        seconds=total_seconds,
                        lyrics=None,
                        audio_path=f"media/albums/{album_slug}/songs/{audio_filename}",
                        track_number=idx,
                        album_id=album_slug
                    )
                    songs_list.append(song_model)

            session.add_all(songs_list)
            await session.commit()
            print(f"Successfully seeded album: {album_slug} with {len(songs_list)} tracks.")

        # Seed Scrollytelling Chapters
        print("Seeding scrollytelling chapters...")
        dest_chap_dir = MEDIA_DIR / "chapters"
        dest_chap_dir.mkdir(parents=True, exist_ok=True)

        for pos, chap in enumerate(CHAPTERS_SEED, start=1):
            src_image = NEXT_PUBLIC_IMAGES / chap["image_source"]
            img_ext = src_image.suffix or ".png"
            dest_image_file = dest_chap_dir / f"{chap['id']}{img_ext}"

            if src_image.exists():
                shutil.copy2(src_image, dest_image_file)
            else:
                dest_image_file.touch()

            relative_image_path = f"media/chapters/{chap['id']}{img_ext}"

            chapter_model = ScrollytellingChapter(
                id=chap["id"],
                title=chap["title"],
                description=chap["description"],
                chapter_label=chap["chapter_label"],
                image=relative_image_path,
                eyebrow=chap["eyebrow"],
                stat_number=chap["stat_number"],
                stat_label=chap["stat_label"],
                accent_color=chap["accent_color"],
                image_side=chap["image_side"],
                show_divider=chap["show_divider"],
                position=pos
            )
            session.add(chapter_model)
            await session.commit()
            print(f"Successfully seeded chapter: {chap['id']}")

    print("All seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())

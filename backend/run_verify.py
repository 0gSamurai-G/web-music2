import os
import asyncio
import sys

sys.path.insert(0, os.path.dirname(__file__))

from database import async_session
from sqlalchemy import select
from models import Album, Song, SiteSetting, ScrollytellingChapter

async def verify():
    async with async_session() as session:
        albums_res = await session.execute(select(Album))
        albums = albums_res.scalars().all()
        print(f"Total Albums: {len(albums)}")

        songs_res = await session.execute(select(Song))
        songs = songs_res.scalars().all()
        print(f"Total Songs: {len(songs)}")

        settings_res = await session.execute(select(SiteSetting))
        settings = settings_res.scalars().all()
        print("Site Settings:")
        for s in settings:
            print(f"  {s.key}: {s.value}")

        chaps_res = await session.execute(select(ScrollytellingChapter))
        chaps = chaps_res.scalars().all()
        print(f"Total Chapters: {len(chaps)}")
        for c in chaps:
            print(f"  {c.chapter_label} - {c.title}: {c.description} (Image: {c.image})")

if __name__ == "__main__":
    asyncio.run(verify())

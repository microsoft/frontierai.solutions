"""Customer story scraping and storage module."""
import json
import os
from typing import Optional, Dict, Any
from datetime import datetime
import requests
from bs4 import BeautifulSoup


class StoryCache:
    """Simple JSON-based cache for customer stories."""
    
    def __init__(self, cache_file: str = "stories_cache.json"):
        self.cache_file = cache_file
        self._cache = self._load_cache()
    
    def _load_cache(self) -> Dict[str, Any]:
        """Load cache from file."""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}
    
    def _save_cache(self):
        """Save cache to file."""
        try:
            with open(self.cache_file, 'w') as f:
                json.dump(self._cache, f, indent=2)
        except Exception as e:
            print(f"Error saving cache: {e}")
    
    def get(self, url: str) -> Optional[Dict[str, Any]]:
        """Get story from cache."""
        return self._cache.get(url)
    
    def set(self, url: str, story: Dict[str, Any]):
        """Save story to cache."""
        self._cache[url] = story
        self._save_cache()


class StoryScraper:
    """Scraper for Microsoft customer stories."""
    
    def __init__(self):
        self.cache = StoryCache()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def scrape_story(self, url: str) -> Dict[str, Any]:
        """Scrape a customer story from URL."""
        cached = self.cache.get(url)
        if cached:
            return cached
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            story = {
                'url': url,
                'title': self._extract_title(soup),
                'summary': self._extract_summary(soup),
                'content': self._extract_content(soup),
                'image': self._extract_image(soup),
                'scraped_at': datetime.utcnow().isoformat()
            }
            
            self.cache.set(url, story)
            
            return story
            
        except Exception as e:
            return {
                'url': url,
                'title': 'Story unavailable',
                'summary': f'Unable to load story: {str(e)}',
                'content': '',
                'image': None,
                'error': str(e),
                'scraped_at': datetime.utcnow().isoformat()
            }
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract story title."""
        title = soup.find('h1')
        if title:
            return title.get_text(strip=True)
        
        og_title = soup.find('meta', property='og:title')
        if og_title:
            return og_title.get('content', '')
        
        return 'Customer Story'
    
    def _extract_summary(self, soup: BeautifulSoup) -> str:
        """Extract story summary."""
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            return meta_desc.get('content', '')
        
        og_desc = soup.find('meta', property='og:description')
        if og_desc:
            return og_desc.get('content', '')
        
        first_p = soup.find('p')
        if first_p:
            return first_p.get_text(strip=True)[:200] + '...'
        
        return ''
    
    def _extract_content(self, soup: BeautifulSoup) -> str:
        """Extract main story content."""
        content_areas = [
            soup.find('article'),
            soup.find('main'),
            soup.find('div', class_='content'),
            soup.find('div', class_='story-content')
        ]
        
        for area in content_areas:
            if area:
                paragraphs = area.find_all('p')
                if paragraphs:
                    text = ' '.join([p.get_text(strip=True) for p in paragraphs[:5]])
                    return text[:500] + '...' if len(text) > 500 else text
        
        return ''
    
    def _extract_image(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract hero image URL."""
        og_image = soup.find('meta', property='og:image')
        if og_image:
            return og_image.get('content')
        
        img = soup.find('img')
        if img:
            return img.get('src')
        
        return None


scraper = StoryScraper()

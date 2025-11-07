"""Tests for app/story_scraper.py customer story scraping functionality."""

import json
import os
import pytest
from unittest.mock import MagicMock, patch, mock_open
from datetime import datetime
from app.story_scraper import StoryCache, StoryScraper


class TestStoryCache:
    """Tests for StoryCache class."""
    
    def test_initialization_creates_empty_cache(self):
        """Test StoryCache initializes with empty cache when file doesn't exist."""
        with patch('os.path.exists', return_value=False):
            cache = StoryCache("test_cache.json")
            
            assert cache._cache == {}
    
    def test_initialization_loads_existing_cache(self):
        """Test StoryCache loads existing cache from file."""
        cache_data = {
            "https://example.com/story": {
                "title": "Test Story",
                "content": "Test content"
            }
        }
        
        with patch('os.path.exists', return_value=True):
            with patch('builtins.open', mock_open(read_data=json.dumps(cache_data))):
                cache = StoryCache("test_cache.json")
                
                assert cache._cache == cache_data
    
    def test_get_returns_cached_story(self):
        """Test get returns story from cache."""
        cache_data = {
            "https://example.com/story": {"title": "Test Story"}
        }
        
        with patch('os.path.exists', return_value=True):
            with patch('builtins.open', mock_open(read_data=json.dumps(cache_data))):
                cache = StoryCache("test_cache.json")
                result = cache.get("https://example.com/story")
                
                assert result == {"title": "Test Story"}
    
    def test_get_returns_none_for_missing_story(self):
        """Test get returns None when story not in cache."""
        with patch('os.path.exists', return_value=False):
            cache = StoryCache("test_cache.json")
            result = cache.get("https://example.com/nonexistent")
            
            assert result is None
    
    def test_set_adds_story_to_cache(self):
        """Test set adds story to cache and saves to file."""
        with patch('os.path.exists', return_value=False):
            with patch('builtins.open', mock_open()) as mock_file:
                cache = StoryCache("test_cache.json")
                story = {"title": "New Story", "content": "New content"}
                
                cache.set("https://example.com/new", story)
                
                assert cache._cache["https://example.com/new"] == story


class TestStoryScraper:
    """Tests for StoryScraper class."""
    
    def test_initialization(self):
        """Test StoryScraper initializes correctly."""
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            
            assert scraper.cache is not None
            assert scraper.headers['User-Agent'] is not None
    
    def test_scrape_story_returns_cached_story(self):
        """Test scrape_story returns cached story if available."""
        cached_story = {
            "url": "https://example.com/story",
            "title": "Cached Story",
            "content": "Cached content"
        }
        
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            scraper.cache.set("https://example.com/story", cached_story)
            
            result = scraper.scrape_story("https://example.com/story")
            
            assert result == cached_story
    
    @patch('requests.get')
    def test_scrape_story_fetches_new_story(self, mock_get):
        """Test scrape_story fetches and parses new story."""
        html_content = """
        <html>
            <head>
                <title>Test Story</title>
                <meta name="description" content="Test story description">
                <meta property="og:image" content="https://example.com/image.jpg">
            </head>
            <body>
                <h1>Customer Success Story</h1>
                <article>
                    <p>This is the first paragraph of the story.</p>
                    <p>This is the second paragraph.</p>
                </article>
            </body>
        </html>
        """
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = html_content.encode('utf-8')
        mock_get.return_value = mock_response
        
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            result = scraper.scrape_story("https://example.com/new-story")
            
            assert result['url'] == "https://example.com/new-story"
            assert result['title'] == "Customer Success Story"
            assert "Test story description" in result['summary']
            assert result['image'] == "https://example.com/image.jpg"
            assert 'scraped_at' in result
    
    @patch('requests.get')
    def test_scrape_story_handles_request_failure(self, mock_get):
        """Test scrape_story handles request failures gracefully."""
        mock_get.side_effect = Exception("Network error")
        
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            result = scraper.scrape_story("https://example.com/failing")
            
            assert result['url'] == "https://example.com/failing"
            assert result['title'] == "Story unavailable"
            assert 'error' in result
            assert 'Network error' in result['error']
    
    def test_extract_title_from_h1(self):
        """Test _extract_title extracts title from h1 tag."""
        from bs4 import BeautifulSoup
        
        html = "<html><body><h1>Story Title</h1></body></html>"
        soup = BeautifulSoup(html, 'html.parser')
        
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            title = scraper._extract_title(soup)
            
            assert title == "Story Title"
    
    def test_extract_title_from_og_title(self):
        """Test _extract_title extracts title from og:title meta tag."""
        from bs4 import BeautifulSoup
        
        html = '<html><head><meta property="og:title" content="OG Story Title"></head></html>'
        soup = BeautifulSoup(html, 'html.parser')
        
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            title = scraper._extract_title(soup)
            
            assert title == "OG Story Title"
    
    def test_extract_title_fallback(self):
        """Test _extract_title returns default when no title found."""
        from bs4 import BeautifulSoup
        
        html = "<html><body></body></html>"
        soup = BeautifulSoup(html, 'html.parser')
        
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            title = scraper._extract_title(soup)
            
            assert title == "Customer Story"
    
    def test_extract_summary_from_meta_description(self):
        """Test _extract_summary extracts from meta description."""
        from bs4 import BeautifulSoup
        
        html = '<html><head><meta name="description" content="Story summary"></head></html>'
        soup = BeautifulSoup(html, 'html.parser')
        
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            summary = scraper._extract_summary(soup)
            
            assert summary == "Story summary"
    
    def test_extract_summary_from_og_description(self):
        """Test _extract_summary extracts from og:description."""
        from bs4 import BeautifulSoup
        
        html = '<html><head><meta property="og:description" content="OG summary"></head></html>'
        soup = BeautifulSoup(html, 'html.parser')
        
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            summary = scraper._extract_summary(soup)
            
            assert summary == "OG summary"
    
    def test_extract_content_from_article(self):
        """Test _extract_content extracts content from article tag."""
        from bs4 import BeautifulSoup
        
        html = """
        <html>
            <body>
                <article>
                    <p>First paragraph.</p>
                    <p>Second paragraph.</p>
                </article>
            </body>
        </html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            content = scraper._extract_content(soup)
            
            assert "First paragraph" in content
            assert "Second paragraph" in content
    
    def test_extract_image_from_og_image(self):
        """Test _extract_image extracts from og:image meta tag."""
        from bs4 import BeautifulSoup
        
        html = '<html><head><meta property="og:image" content="https://example.com/img.jpg"></head></html>'
        soup = BeautifulSoup(html, 'html.parser')
        
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            image = scraper._extract_image(soup)
            
            assert image == "https://example.com/img.jpg"
    
    def test_extract_image_from_img_tag(self):
        """Test _extract_image extracts from img tag."""
        from bs4 import BeautifulSoup
        
        html = '<html><body><img src="https://example.com/image.png"></body></html>'
        soup = BeautifulSoup(html, 'html.parser')
        
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            image = scraper._extract_image(soup)
            
            assert image == "https://example.com/image.png"
    
    def test_extract_image_returns_none_when_not_found(self):
        """Test _extract_image returns None when no image found."""
        from bs4 import BeautifulSoup
        
        html = "<html><body></body></html>"
        soup = BeautifulSoup(html, 'html.parser')
        
        with patch('os.path.exists', return_value=False):
            scraper = StoryScraper()
            image = scraper._extract_image(soup)
            
            assert image is None

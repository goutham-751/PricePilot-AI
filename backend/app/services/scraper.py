"""
Competitor Price Scraper — Production-grade web scraper for extracting
competitor product prices and storing them in Supabase.

Features:
    - Async HTTP with httpx + retry logic + exponential backoff
    - User-Agent rotation to avoid detection
    - BeautifulSoup price extraction with multi-strategy CSS selectors
    - Price normalization (currency symbols, commas, ranges)
    - Rate limiting with random delays (2–5s)
    - Batch upsert to Supabase competitor_prices table
    - Structured error logging per domain

Usage:
    scraper = CompetitorScraper()
    results = await scraper.scrape_all(targets)
"""

import re
import random
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

import httpx
from bs4 import BeautifulSoup

from db.supabase_client import supabase
from db.schemas import CompetitorPriceCreate

# ── Logging ──────────────────────────────────────────────────────────

logger = logging.getLogger("scraper")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    ))
    logger.addHandler(handler)

# ── Constants ────────────────────────────────────────────────────────

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
]

# CSS selectors to try IN ORDER for price extraction
PRICE_SELECTORS = [
    # Generic e-commerce patterns
    '[data-price]',
    '.price-current', '.product-price', '.offer-price',
    '.a-price .a-offscreen',              # Amazon
    '._30jeq3',                            # Flipkart
    '.price', '.current-price', '.sale-price',
    '[itemprop="price"]',
    'span.price', 'div.price', 'p.price',
    '.pdp-price', '.product-detail-price',
    # Broader fallbacks
    '[class*="price"]', '[id*="price"]',
]

MAX_RETRIES = 3
BASE_TIMEOUT = 10.0       # seconds
MIN_DELAY = 2.0           # seconds between requests
MAX_DELAY = 5.0           # seconds between requests


# ── Price Normalization ──────────────────────────────────────────────

def normalize_price(raw: str) -> Optional[float]:
    """
    Extract a numeric price from raw text.
    Handles: ₹1,234.56, $99.99, Rs. 1234, 1,000–2,000 (averages range), etc.
    Returns None if no valid price found.
    """
    if not raw or not raw.strip():
        return None

    text = raw.strip()

    # Strip known currency symbols and prefixes
    text = re.sub(r'[₹$€£¥]', '', text)
    text = re.sub(r'(?i)^(rs\.?|inr|usd|eur)\s*', '', text)
    text = text.strip()

    # Handle price ranges (e.g., "1,000 - 2,000" → average)
    range_match = re.match(
        r'([\d,]+(?:\.\d+)?)\s*[-–—to]+\s*([\d,]+(?:\.\d+)?)', text
    )
    if range_match:
        low = float(range_match.group(1).replace(',', ''))
        high = float(range_match.group(2).replace(',', ''))
        return round((low + high) / 2, 2)

    # Standard single price
    price_match = re.search(r'([\d,]+(?:\.\d{1,2})?)', text)
    if price_match:
        cleaned = price_match.group(1).replace(',', '')
        try:
            value = float(cleaned)
            if value > 0:
                return round(value, 2)
        except ValueError:
            pass

    return None


# ── Scraper Class ────────────────────────────────────────────────────

class CompetitorScraper:
    """
    Async competitor price scraper with retry, rate limiting and
    multi-strategy price extraction.
    """

    def __init__(self):
        self.results: list[dict] = []
        self.errors: list[dict] = []

    def _get_headers(self) -> dict:
        """Return randomized request headers."""
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
        }

    async def _fetch_page(self, url: str) -> Optional[str]:
        """
        Fetch a URL with retry + exponential backoff.
        Returns HTML string or None on failure.
        """
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                async with httpx.AsyncClient(
                    follow_redirects=True,
                    timeout=httpx.Timeout(BASE_TIMEOUT + attempt * 2),
                    verify=True,
                ) as client:
                    response = await client.get(url, headers=self._get_headers())
                    response.raise_for_status()

                    content_type = response.headers.get("content-type", "")
                    if "text/html" not in content_type and "text/plain" not in content_type:
                        logger.warning(f"Non-HTML response from {url}: {content_type}")
                        return None

                    logger.info(f"✓ Fetched {url} (attempt {attempt}, {len(response.text)} chars)")
                    return response.text

            except httpx.TimeoutException:
                logger.warning(f"Timeout on {url} (attempt {attempt}/{MAX_RETRIES})")
            except httpx.HTTPStatusError as e:
                logger.warning(f"HTTP {e.response.status_code} on {url} (attempt {attempt}/{MAX_RETRIES})")
                if e.response.status_code == 403:
                    logger.error(f"Access denied for {url} — likely blocked")
                    return None
            except httpx.RequestError as e:
                logger.warning(f"Request error on {url}: {e} (attempt {attempt}/{MAX_RETRIES})")

            if attempt < MAX_RETRIES:
                backoff = (2 ** attempt) + random.uniform(0, 1)
                logger.info(f"Retrying in {backoff:.1f}s...")
                await asyncio.sleep(backoff)

        logger.error(f"✗ Failed to fetch {url} after {MAX_RETRIES} attempts")
        return None

    def _extract_price(self, html: str, url: str) -> Optional[float]:
        """
        Extract price from HTML using multi-strategy CSS selectors.
        Tries each selector in priority order with fallback.
        """
        soup = BeautifulSoup(html, "lxml")

        # Strategy 1: Try CSS selectors in order
        for selector in PRICE_SELECTORS:
            try:
                elements = soup.select(selector)
                for el in elements:
                    # Try data-price attribute first
                    data_price = el.get("data-price") or el.get("content")
                    if data_price:
                        price = normalize_price(str(data_price))
                        if price:
                            logger.debug(f"Price from attr [{selector}]: {price}")
                            return price

                    # Try text content
                    price = normalize_price(el.get_text(strip=True))
                    if price:
                        logger.debug(f"Price from text [{selector}]: {price}")
                        return price
            except Exception:
                continue

        # Strategy 2: Regex scan on raw HTML for price patterns
        price_patterns = [
            r'["\']\s*price["\']?\s*[:=]\s*["\']?\s*([\d,]+\.?\d*)',
            r'₹\s*([\d,]+\.?\d*)',
            r'Rs\.?\s*([\d,]+\.?\d*)',
            r'\$\s*([\d,]+\.?\d*)',
        ]
        for pattern in price_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                price = normalize_price(match.group(1))
                if price:
                    logger.debug(f"Price from regex [{pattern[:30]}...]: {price}")
                    return price

        logger.warning(f"No price found on {url}")
        return None

    async def scrape_single(self, target: dict) -> Optional[dict]:
        """
        Scrape a single competitor target.

        Args:
            target: dict with keys:
                - product_id: str (UUID of the product)
                - competitor_name: str
                - url: str (page URL to scrape)

        Returns:
            dict with scraped data or None on failure.
        """
        url = target.get("url", "")
        competitor = target.get("competitor_name", "unknown")
        product_id = target.get("product_id", "")

        if not url:
            logger.error(f"No URL provided for {competitor}")
            self.errors.append({"competitor": competitor, "error": "No URL"})
            return None

        logger.info(f"Scraping {competitor}: {url}")

        html = await self._fetch_page(url)
        if not html:
            self.errors.append({"competitor": competitor, "url": url, "error": "Fetch failed"})
            return None

        price = self._extract_price(html, url)
        if not price:
            self.errors.append({"competitor": competitor, "url": url, "error": "Price not found"})
            return None

        result = {
            "product_id": product_id,
            "competitor_name": competitor,
            "price": price,
        }

        logger.info(f"✓ {competitor}: ₹{price}")
        return result

    async def scrape_all(self, targets: list[dict]) -> dict:
        """
        Scrape all competitor targets with rate limiting.

        Args:
            targets: list of dicts, each with product_id, competitor_name, url.

        Returns:
            dict with 'scraped' (list), 'errors' (list), 'stored' (int).
        """
        self.results = []
        self.errors = []

        for i, target in enumerate(targets):
            result = await self.scrape_single(target)
            if result:
                self.results.append(result)

            # Rate limit: random delay between requests
            if i < len(targets) - 1:
                delay = random.uniform(MIN_DELAY, MAX_DELAY)
                logger.info(f"Rate limit: waiting {delay:.1f}s...")
                await asyncio.sleep(delay)

        # Store valid results in Supabase
        stored_count = 0
        if self.results:
            stored_count = await self._store_results(self.results)

        summary = {
            "scraped": self.results,
            "errors": self.errors,
            "stored": stored_count,
            "total_targets": len(targets),
            "success_rate": f"{len(self.results)}/{len(targets)}",
        }

        logger.info(
            f"Scrape complete: {len(self.results)}/{len(targets)} succeeded, "
            f"{stored_count} stored, {len(self.errors)} errors"
        )
        return summary

    async def _store_results(self, results: list[dict]) -> int:
        """
        Validate and batch insert scraped prices into Supabase.
        Returns count of successfully stored records.
        """
        valid_records = []
        for r in results:
            try:
                validated = CompetitorPriceCreate(**r)
                valid_records.append(validated.model_dump())
            except Exception as e:
                logger.warning(f"Validation failed for {r}: {e}")

        if not valid_records:
            logger.warning("No valid records to store")
            return 0

        try:
            response = supabase.table("competitor_prices").insert(valid_records).execute()
            count = len(response.data) if response.data else 0
            logger.info(f"✓ Stored {count} records in competitor_prices")
            return count
        except Exception as e:
            logger.error(f"✗ Supabase insert failed: {e}")
            return 0


# ── Standalone test ──────────────────────────────────────────────────

if __name__ == "__main__":
    async def _test():
        scraper = CompetitorScraper()
        # Demo: Try scraping a public pricing page
        demo_targets = [
            {
                "product_id": "test-uuid-placeholder",
                "competitor_name": "Example Store",
                "url": "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
            },
        ]
        result = await scraper.scrape_all(demo_targets)
        print("\n=== SCRAPE RESULTS ===")
        print(f"Scraped: {result['success_rate']}")
        print(f"Stored:  {result['stored']}")
        for r in result["scraped"]:
            print(f"  {r['competitor_name']}: ₹{r['price']}")
        for e in result["errors"]:
            print(f"  ERROR: {e}")

    asyncio.run(_test())

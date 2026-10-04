"""
Import a full panel chart (open panna / jodi / close panna) from various
matka chart websites into a market's Result history.

Supported formats (auto-detected):
  A) Weekly rows, triplet cells:   | 19/12/2022 to 25/12/2022 | 2<br>3<br>4 | 91 | 1<br>2<br>8 | ...
     (sattamatka.email, matkaji.net, sattamatka.sale, sattakalyanmatka.net,
      khabar.bet, madhurbazar.com — dd/mm/yyyy, d/m/yy, dd-mm-yyyy sab chalega)
  B) Weekly rows, single cell per day with 8 digits:  | 2026-09-28 To 2026-10-04 | 23947368 | ...
     (sara777.in, matkafunapk.com)
  C) Daily rows under month headings:  ## October 2026 ... | Sun, 04 Oct | 230 | 55 | 140 |
     (kalyanbazar.co.in)

Usage (run on the server, from the matka-bakend folder):

    cd /var/www/new-matka/matka-bakend
    source env/bin/activate
    python3 scripts/import_panel_chart.py --market "RAJAN MORNING" \
        --url "https://sattamatka.email/record/raja-rani-morning-panel-chart" --dry-run

Existing results (same market + same date) are skipped, so re-running is safe.
"""

import argparse
import re
import sys
import urllib.request
from datetime import datetime, timedelta
from html.parser import HTMLParser

sys.path.insert(0, ".")  # allow "app" imports when run from matka-bakend/


# ----------------------------------------------------------------------
# HTML PARSER: collects table rows AND headings, in document order
# ----------------------------------------------------------------------
class DocParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.items = []          # ("heading", text) | ("row", [cells])
        self._row = None
        self._cell = None
        self._heading = None

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self._row = []
        elif tag in ("td", "th") and self._row is not None:
            self._cell = []
        elif tag in ("h1", "h2", "h3", "h4", "h5"):
            self._heading = []

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self._cell is not None:
            self._row.append(" ".join(self._cell).strip())
            self._cell = None
        elif tag == "tr" and self._row is not None:
            if self._row:
                self.items.append(("row", self._row))
            self._row = None
        elif tag in ("h1", "h2", "h3", "h4", "h5") and self._heading is not None:
            self.items.append(("heading", " ".join(self._heading).strip()))
            self._heading = None

    def handle_data(self, data):
        if self._cell is not None:
            self._cell.append(data.strip())
        elif self._heading is not None:
            self._heading.append(data.strip())


MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6, "june": 6,
    "jul": 7, "july": 7, "aug": 8, "sep": 9, "sept": 9, "oct": 10,
    "nov": 11, "dec": 12,
}

ISO_DATE_RE = re.compile(r"(\d{4})-(\d{1,2})-(\d{1,2})")
DMY_DATE_RE = re.compile(r"(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})")


def digits(cell):
    """Keep digits only. '2 3 4' -> '234'. '**'/'✪'/'—' -> ''."""
    return re.sub(r"\D", "", cell or "")


def parse_any_date(text):
    """First date found in text: yyyy-mm-dd OR dd/mm/yyyy OR d-m-yy etc."""
    m = ISO_DATE_RE.search(text)
    if m:
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return _safe_date(y, mo, d)
    m = DMY_DATE_RE.search(text)
    if m:
        d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if y < 100:
            y += 2000
        return _safe_date(y, mo, d)
    return None


def _safe_date(y, mo, d):
    try:
        return datetime(y, mo, d)
    except ValueError:
        return None


def fetch_html(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0 Safari/537.36"
            )
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def parse_weekly_row(start, cells):
    """Weekly row -> list of (date, open, jodi, close). Handles triplet cells,
    8-digit single cells, star/✪ gaps."""
    out = []

    # Row mode: if 2+ cells contain exactly 8 digits -> single-cell-per-day mode
    eight = sum(1 for c in cells if len(digits(c)) == 8)
    single_mode = eight >= 2

    if single_mode:
        day = 0
        for c in cells:
            if day > 6:
                break
            dg = digits(c)
            if len(dg) == 8:
                out.append((start + timedelta(days=day), dg[:3], dg[3:5], dg[5:8]))
            day += 1
        return out

    # Triplet mode
    p, day = 0, 0
    n = len(cells)
    while p < n and day <= 6:
        c0 = digits(cells[p])
        c1 = digits(cells[p + 1]) if p + 1 < n else ""
        c2 = digits(cells[p + 2]) if p + 2 < n else ""

        if len(c0) == 3 and len(c1) == 2 and len(c2) == 3:
            out.append((start + timedelta(days=day), c0, c1, c2))
            p += 3
            day += 1
            continue

        # junk cell(s): star triplet (***, **, ***) or single ✪ marker
        if c0 == "":
            n1 = digits(cells[p + 1]) if p + 1 < n else ""
            n2 = digits(cells[p + 2]) if p + 2 < n else ""
            n3 = digits(cells[p + 3]) if p + 3 < n else ""
            # single junk cell followed by a valid triplet -> consume 1
            if len(n1) == 3 and len(n2) == 2 and len(n3) == 3:
                p += 1
            else:
                p += 3
            day += 1
            continue

        # unrecognized/partial result -> skip this day
        p += 3
        day += 1

    return out


def parse_daily_row(cells, year):
    """Daily row like ['Sun, 04 Oct', '230', '55', '140'] -> one entry or None."""
    if len(cells) < 4:
        return None
    o, j, c = digits(cells[1]), digits(cells[2]), digits(cells[3])
    if len(o) != 3 or len(j) != 2 or len(c) != 3:
        return None
    m = re.search(r"(\d{1,2})\s*([A-Za-z]+)", cells[0])
    if not m:
        return None
    day = int(m.group(1))
    mon = MONTHS.get(m.group(2).lower()[:4]) or MONTHS.get(m.group(2).lower()[:3])
    if not mon:
        return None
    dt = _safe_date(year or datetime.now().year, mon, day)
    if not dt:
        return None
    return (dt, o, j, c)


def parse_chart(html):
    parser = DocParser()
    parser.feed(html)

    entries = []
    current_year = None

    for kind, data in parser.items:
        if kind == "heading":
            ym = re.search(r"(20\d{2})", data)
            if ym:
                current_year = int(ym.group(1))
            continue

        cells = data
        if not cells:
            continue

        start = parse_any_date(cells[0])
        if start:
            entries.extend(parse_weekly_row(start, cells[1:]))
        else:
            e = parse_daily_row(cells, current_year)
            if e:
                entries.append(e)

    # de-dupe by date (keep first occurrence)
    seen, unique = set(), []
    for e in entries:
        key = e[0].date()
        if key in seen:
            continue
        seen.add(key)
        unique.append(e)
    unique.sort(key=lambda x: x[0])
    return unique


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--market", required=True, help='Market name, e.g. "RAJAN MORNING"')
    ap.add_argument("--url", required=True, help="Panel chart page URL")
    ap.add_argument("--dry-run", action="store_true", help="Parse & preview only, no DB writes")
    args = ap.parse_args()

    print(f"Fetching: {args.url}")
    try:
        html = fetch_html(args.url)
    except Exception as e:
        print(f"!! URL open nahi hua: {e}")
        sys.exit(1)

    entries = parse_chart(html)
    print(f"Parsed {len(entries)} day-results from chart")

    if not entries:
        print("!! Kuch parse nahi hua. Ye URL/format supported nahi hai — mujhe batao.")
        sys.exit(1)

    print("Sample (first 3):")
    for d, o, j, c in entries[:3]:
        print(f"   {d.date()}  {o}-{j}-{c}")
    print("Sample (last 3):")
    for d, o, j, c in entries[-3:]:
        print(f"   {d.date()}  {o}-{j}-{c}")

    if args.dry_run:
        print("\n--dry-run: DB me kuch save NAHI kiya. Sab sahi lage to --dry-run hata ke chalao.")
        return

    from mongoengine import connect
    from app.config import settings
    from app.models import Market, Result

    connect(host=settings.MONGO_URI)

    market = Market.objects(name__iexact=args.market.strip()).first()
    if not market:
        market = Market.objects(name__icontains=args.market.strip()).first()
    if not market:
        print(f"!! Market '{args.market}' nahi mila. Admin me market ka exact naam check karo.")
        sys.exit(1)

    mid = str(market.id)
    print(f"Market mila: '{market.name}' (id={mid})")

    added, skipped = 0, 0
    for d, o, j, c in entries:
        day_start = datetime(d.year, d.month, d.day)
        day_end = day_start + timedelta(days=1) - timedelta(seconds=1)

        exists = Result.objects(
            market_id=mid, date__gte=day_start, date__lte=day_end
        ).first()
        if exists:
            skipped += 1
            continue

        Result(
            market_id=mid,
            date=day_start,
            open_panna=o,
            open_digit=j[0],
            close_panna=c,
            close_digit=j[1],
        ).save()
        added += 1

    print(f"\nDONE ✅  Added: {added}  |  Skipped (already existed): {skipped}")


if __name__ == "__main__":
    main()

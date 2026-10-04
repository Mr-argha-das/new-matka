"""
Import a full panel chart (open panna / jodi / close panna) from
sattamatka.email style record pages into a market's Result history.

Usage (run on the server, from the matka-bakend folder):

    cd /var/www/new-matka/matka-bakend
    python3 scripts/import_panel_chart.py \
        --market "RAJAN MORNING" \
        --url "https://sattamatka.email/record/raja-rani-morning-panel-chart" \
        --dry-run          # pehle preview dekho

    # sab sahi dikhe to --dry-run hata ke dobara chalao:
    python3 scripts/import_panel_chart.py \
        --market "RAJAN MORNING" \
        --url "https://sattamatka.email/record/raja-rani-morning-panel-chart"

Existing results (same market + same date) are skipped, so it is safe
to re-run (e.g. weekly) to pull in new rows.
"""

import argparse
import re
import sys
import urllib.request
from datetime import datetime, timedelta
from html.parser import HTMLParser

sys.path.insert(0, ".")  # allow "app" imports when run from matka-bakend/

from mongoengine import connect  # noqa: E402
from app.config import settings  # noqa: E402
from app.models import Market, Result  # noqa: E402


# ----------------------------------------------------------------------
# HTML TABLE PARSER (stdlib only - no bs4 needed)
# ----------------------------------------------------------------------
class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []          # list of rows; each row = list of cell texts
        self._row = None
        self._cell = None

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self._row = []
        elif tag in ("td", "th") and self._row is not None:
            self._cell = []

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self._cell is not None:
            self._row.append("".join(self._cell).strip())
            self._cell = None
        elif tag == "tr" and self._row is not None:
            if self._row:
                self.rows.append(self._row)
            self._row = None

    def handle_data(self, data):
        if self._cell is not None:
            self._cell.append(data.strip())


DATE_RE = re.compile(r"(\d{2}/\d{2}/\d{4})")


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


def clean_num(cell):
    """Keep digits only. '2 3 4' / '2\n3\n4' -> '234'. '**' -> ''."""
    return re.sub(r"\D", "", cell)


def parse_chart(html):
    """Yield (date, open_panna, jodi, close_panna) for every played day."""
    parser = TableParser()
    parser.feed(html)

    entries = []
    for row in parser.rows:
        if not row:
            continue
        dates = DATE_RE.findall(row[0])
        if not dates:
            continue  # header or junk row

        start = datetime.strptime(dates[0], "%d/%m/%Y")
        cells = row[1:]

        # cells come in groups of 3 per day: open panna, jodi, close panna
        for day_idx in range(min(7, len(cells) // 3)):
            o = clean_num(cells[day_idx * 3])
            j = clean_num(cells[day_idx * 3 + 1])
            c = clean_num(cells[day_idx * 3 + 2])

            if len(o) != 3 or len(j) != 2 or len(c) != 3:
                continue  # '**' = no result that day

            entries.append((start + timedelta(days=day_idx), o, j, c))

    return entries


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--market", required=True, help='Market name, e.g. "RAJAN MORNING"')
    ap.add_argument("--url", required=True, help="Panel chart page URL")
    ap.add_argument("--dry-run", action="store_true", help="Parse & preview only, no DB writes")
    args = ap.parse_args()

    print(f"Fetching: {args.url}")
    html = fetch_html(args.url)
    entries = parse_chart(html)
    print(f"Parsed {len(entries)} day-results from chart")

    if not entries:
        print("!! Kuch parse nahi hua. Page ka structure badla ho sakta hai.")
        sys.exit(1)

    print("Sample (first 3):")
    for d, o, j, c in entries[:3]:
        print(f"   {d.date()}  {o}-{j}-{c}")
    print("Sample (last 3):")
    for d, o, j, c in entries[-3:]:
        print(f"   {d.date()}  {o}-{j}-{c}")

    if args.dry_run:
        print("\n--dry-run: DB me kuch save NahI kiya. Sab sahi lage to --dry-run hata ke chalao.")
        return

    connect(host=settings.MONGO_URI)

    market = Market.objects(name__iexact=args.market.strip()).first()
    if not market:
        # try contains match as fallback
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
    print("Ab site par us market ke chart me pura record dikhega.")


if __name__ == "__main__":
    main()

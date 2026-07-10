from fastapi import APIRouter, HTTPException, Depends
import datetime
from zoneinfo import ZoneInfo
from ..models import Bid, Wallet, Market
from ..auth import get_current_user, require_admin
from ..game_types import VALID_GAMES, validate_digit

router = APIRouter(prefix="/bid")
IST = ZoneInfo("Asia/Kolkata")

def get_market_window(open_time: str, close_time: str):
    fmt = "%I:%M %p"
    now_dt = datetime.datetime.now(IST)
    today = now_dt.date()

    open_dt = datetime.datetime.combine(
        today,
        datetime.datetime.strptime(open_time, fmt).time(),
        tzinfo=IST
    )
    close_dt = datetime.datetime.combine(
        today,
        datetime.datetime.strptime(close_time, fmt).time(),
        tzinfo=IST
    )

    if close_dt <= open_dt:
        close_dt += datetime.timedelta(days=1)
        if now_dt < open_dt:
            open_dt -= datetime.timedelta(days=1)
            close_dt -= datetime.timedelta(days=1)

    return now_dt, open_dt, close_dt


# ------------------------------
# PLACE BID API
# ------------------------------

@router.post("/place")
def place_bid(
    market_id: str,
    game_type: str,
    session: str,
    points: int,
    digit: str = None,               # normal games
    open_panna: str = None,          # for sangam
    close_panna: str = None,         # for sangam
    open_digit: str = None,          # for half_sangam
    close_digit: str = None,         # for half_sangam
    user=Depends(get_current_user)
):

    # Wallet Check
    wallet = Wallet.objects(user_id=str(user.id)).first()
    if not wallet:
        raise HTTPException(400, "Wallet not found")

    if wallet.balance < points:
        raise HTTPException(400, "Insufficient Balance")

    # Market Check
    market = Market.objects(id=market_id).first()
    if not market:
        raise HTTPException(404, "Invalid Market ID")

    if market.status is not True:
        raise HTTPException(400, "Market Closed")

    now_dt, open_dt, close_dt = get_market_window(market.open_time, market.close_time)

    if now_dt >= close_dt:
        raise HTTPException(400, "Market Closed")

    if now_dt < open_dt and session != "open":
        raise HTTPException(400, "Only OPEN session allowed before open time")

    if open_dt <= now_dt < close_dt and session != "close":
        raise HTTPException(400, "Only CLOSE session allowed after open time")

    # Validate Game Type
    if game_type not in VALID_GAMES:
        raise HTTPException(400, "Invalid Game Type")

    # Validate Session
    if session not in ["open", "close"]:
        raise HTTPException(400, "Invalid Session")

    # -------------------------------------------------------------------
    # 🔥 Sangam Digit Auto-Generate Logic
    # -------------------------------------------------------------------
    if game_type == "full_sangam":
        if not open_panna or not close_panna:
            raise HTTPException(400, "Full Sangam requires open_panna and close_panna")

        digit = f"{open_panna}-{close_panna}"

    elif game_type == "half_sangam":

        # CASE 1 → OPEN PANNA + CLOSE DIGIT
        if open_panna and close_digit:
            digit = f"{open_panna}-{close_digit}"

        # CASE 2 → CLOSE PANNA + OPEN DIGIT
        elif close_panna and open_digit:
            digit = f"{close_panna}-{open_digit}"

        else:
            raise HTTPException(400, "Half Sangam requires (open_panna + close_digit) OR (close_panna + open_digit)")

    # For all other games → digit required normally
    elif digit is None:
        raise HTTPException(400, "Digit is required for this game type")

    # -------------------------------------------
    # 🔥 Validate final digit
    # -------------------------------------------
    validate_digit(game_type, digit)

    # Deduct points
    wallet.update(
        dec__balance=points,
        set__updated_at=datetime.datetime.utcnow()
    )

    # Save Bid
    bid = Bid(
        user_id=str(user.id),
        market_id=market_id,
        game_type=game_type,
        session=session,
        digit=digit,
        points=points
    ).save()

    return {
        "msg": "Bid Successfully Placed",
        "bid": {
            "id": str(bid.id),
            "market_id": bid.market_id,
            "game_type": bid.game_type,
            "session": bid.session,
            "digit": bid.digit,
            "points": bid.points,
            "created_at": bid.created_at
        }
    }


# ------------------------------
# MY BIDS
# ------------------------------

@router.get("/my-bids")
def my_bids(user=Depends(get_current_user)):
    bids = Bid.objects(user_id=str(user.id)).order_by("-created_at").limit(100)
    return [{
        "id": str(b.id),
        "market_id": b.market_id,
        "game_type": b.game_type,
        "session": b.session,
        "digit": b.digit,
        "points": b.points,
        "created_at": b.created_at
    } for b in bids]


# ------------------------------
# ADMIN: MARKET BIDS
# ------------------------------

@router.get("/market-bids")
def market_bids(market_id: str, admin=Depends(require_admin)):
    bids = Bid.objects(market_id=market_id).order_by("-created_at")
    return [{
        "id": str(b.id),
        "user_id": b.user_id,
        "game_type": b.game_type,
        "digit": b.digit,
        "points": b.points,
        "session": b.session,
        "created_at": b.created_at
    } for b in bids]

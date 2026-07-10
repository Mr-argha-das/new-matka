import uuid
from app.auth import get_current_user, require_admin
from app.models import Bid, Market, RateChart, Result, Transaction, Wallet
from app.game_types import bid_wins, rate_key
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
# from ..auth import require_admin
import datetime

router = APIRouter(prefix="/api/admin", tags=["Market Result Management"])


# -----------------------------
# GAME RATES
# -----------------------------
GAME_RATES = {
    "single": 9,
    "jodi": 95,
    "single_panna": 140,
    "double_panna": 300,
    "triple_panna": 600,
    "half_sangam": 1200,
    "full_sangam": 10000,
}


# -----------------------------
# INPUT MODEL
# -----------------------------
class ResultDeclare(BaseModel):
    game_id: str
    date: str
    session: str  # open / close
    open_digit: str = None
    open_panna: str = None
    close_digit: str = None
    close_panna: str = None


# -----------------------------
# SETTLEMENT LOGIC
# -----------------------------
import uuid
from datetime import datetime

def settle_results(market_id: str, result_obj: Result, session: str):

    chart = RateChart.objects().first()
    if not chart:
        print("Rate chart not found!")
        return

    RATE_MAP = {
        "single": chart.single_digit_x,
        "jodi": chart.jodi_digit_x,
        "single_panna": chart.single_pana_x,
        "double_panna": chart.double_pana_x,
        "triple_panna": chart.tripple_pana_x,
        "half_sangam": chart.half_sangam_x,
        "full_sangam": chart.full_sangam_x,
    }
    RATE_MAP.update({
        "single_bulk": RATE_MAP["single"],
        "jodi_bulk": RATE_MAP["jodi"],
        "single_panna_bulk": RATE_MAP["single_panna"],
        "double_panna_bulk": RATE_MAP["double_panna"],
        "half_sangam_a": RATE_MAP["half_sangam"],
        "half_sangam_b": RATE_MAP["half_sangam"],
        "dp_motor": RATE_MAP["double_panna"],
        "sp_motor": RATE_MAP["single_panna"],
        "sp_dp_tp": RATE_MAP["triple_panna"],
        "two_digit_pana": RATE_MAP["single_panna"],
        "sp_common": RATE_MAP["single_panna"],
        "odd_even": RATE_MAP["jodi"],
        "dp_common": RATE_MAP["double_panna"],
        "red_jodi": RATE_MAP["jodi"],
        "pana_family": RATE_MAP["single_panna"],
        "digit_based_jodi": RATE_MAP["jodi"],
        "cycle_jodi": RATE_MAP["jodi"],
        "jodi_family": RATE_MAP["jodi"],
    })
    RATE_MAP.update({
        "single_bulk": RATE_MAP["single"],
        "jodi_bulk": RATE_MAP["jodi"],
        "single_panna_bulk": RATE_MAP["single_panna"],
        "double_panna_bulk": RATE_MAP["double_panna"],
        "half_sangam_a": RATE_MAP["half_sangam"],
        "half_sangam_b": RATE_MAP["half_sangam"],
        "dp_motor": RATE_MAP["double_panna"],
        "sp_motor": RATE_MAP["single_panna"],
        "sp_dp_tp": RATE_MAP["triple_panna"],
        "two_digit_pana": RATE_MAP["single_panna"],
        "sp_common": RATE_MAP["single_panna"],
        "odd_even": RATE_MAP["jodi"],
        "dp_common": RATE_MAP["double_panna"],
        "red_jodi": RATE_MAP["jodi"],
        "pana_family": RATE_MAP["single_panna"],
        "digit_based_jodi": RATE_MAP["jodi"],
        "cycle_jodi": RATE_MAP["jodi"],
        "jodi_family": RATE_MAP["jodi"],
    })

    open_digit = result_obj.open_digit
    close_digit = result_obj.close_digit
    open_panna = result_obj.open_panna
    close_panna = result_obj.close_panna

    bids = Bid.objects(
        market_id=market_id,
        session=session,
        is_settled=False
    )

    for bid in bids:
        win = bid_wins(bid, result_obj, session=session)

        # ---------------- PAYOUT ----------------
        if win:
            rate = RATE_MAP.get(bid.game_type, RATE_MAP.get(rate_key(bid.game_type), 0))
            amount = bid.points * rate

            wallet = Wallet.objects(user_id=bid.user_id).first()
            if wallet:
                wallet.update(inc__balance=amount)

                Transaction(
                    tx_id=str(uuid.uuid4()),
                    user_id=str(bid.user_id),
                    bid_id=str(bid.id),
                    amount=amount,
                    payment_method="Win",
                    status="Approved",
                    created_at=datetime.utcnow(),
                    
                ).save()

        # Mark bid as settled (win or lose both)
        bid.update(set__is_settled=True)
@router.post("/result/declare")
def declare_result(payload: ResultDeclare, admin=Depends(require_admin)):

    session = payload.session.lower()

    market = Market.objects(id=payload.game_id).first()
    if not market:
        raise HTTPException(404, "Market not found")

    result = Result.objects(
        market_id=payload.game_id,
        date=payload.date
    ).first()

    if not result:
        result = Result(
            market_id=payload.game_id,
            date=payload.date,
            open_digit="-",
            close_digit="-",
            open_panna="-",
            close_panna="-",
        )

    now = datetime.utcnow()

    if session == "open":
        result.open_digit = payload.open_digit or result.open_digit
        result.open_panna = payload.open_panna or result.open_panna
        result.open_declared_at = now

    elif session == "close":
        result.close_digit = payload.close_digit or result.close_digit
        result.close_panna = payload.close_panna or result.close_panna
        result.close_declared_at = now

    else:
        raise HTTPException(400, "Session must be open or close")

    result.save()

    # 🔥 Settlement with session control
    settle_results(payload.game_id, result, session)

    return {"message": f"{session.capitalize()} result declared & settled successfully"}

# -----------------------------
# GET RESULTS BY DATE
# -----------------------------
@router.get("/results")
def get_results(date: str, admin=Depends(require_admin)):
    results = Result.objects(date=date)
    output = []

    for r in results:
        # fetch market name using the existing market schema
        market = Market.objects(id=r.market_id).first()

        output.append({
            "_id": str(r.id),
            "market_id": r.market_id,
            "game_name": market.name if market else "-",
            "date": r.date,
            "open_panna": r.open_panna,
            "open_digit": r.open_digit,
            "close_panna": r.close_panna,
            "close_digit": r.close_digit,
            "open_declared_at": getattr(r, "open_declared_at", None),
            "close_declared_at": getattr(r, "close_declared_at", None),
            "close_timne": market.close_time if market else "-",
            "open_time": market.open_time if market else "-",
        })

    return {"data": output}



# -----------------------------
# GET RESULT FOR GO BUTTON
# -----------------------------
@router.get("/result/find")
def find_result(date: str, game_id: str, session: str, admin=Depends(require_admin)):
    session = session.lower()
    r = Result.objects(market_id=game_id, date=date).first()

    if not r:
        return {"data": None}

    if session == "open":
        return {
            "data": {
                "open_panna": r.open_panna,
                "open_digit": r.open_digit
            }
        }

    elif session == "close":
        return {
            "data": {
                "close_panna": r.close_panna,
                "close_digit": r.close_digit
            }
        }

    else:
        raise HTTPException(400, "Invalid session")


@router.delete("/result/{result_id}")
def delete_result(result_id: str, admin=Depends(require_admin)):
    r = Result.objects(id=result_id).first()
    if not r:
        raise HTTPException(404, "Result not found")

    r.delete()
    return {"message": "Result deleted"}




from datetime import datetime

@router.get("/win-history")
def win_history(user=Depends(get_current_user)):

    chart = RateChart.objects().first()
    if not chart:
        raise HTTPException(status_code=500, detail="Rate chart not found")

    RATE_MAP = {
        "single": chart.single_digit_x,
        "jodi": chart.jodi_digit_x,
        "single_panna": chart.single_pana_x,
        "double_panna": chart.double_pana_x,
        "triple_panna": chart.tripple_pana_x,
        "half_sangam": chart.half_sangam_x,
        "full_sangam": chart.full_sangam_x,
    }

    bids = Bid.objects(user_id=str(user.id))
    win_data = []

    for bid in bids:

        market = Market.objects(id=bid.market_id).first()
        if not market:
            continue

        # -------- EXACT DATE MATCH USING bid_date --------
        start_of_day = datetime.combine(bid.bid_date.date(), datetime.min.time())
        end_of_day = datetime.combine(bid.bid_date.date(), datetime.max.time())

        result = Result.objects(
            market_id=bid.market_id,
            date__gte=start_of_day,
            date__lte=end_of_day
        ).first()

        if not result:
            continue

        win = bid_wins(bid, result)

        if not win:
            continue

        rate = RATE_MAP.get(bid.game_type, RATE_MAP.get(rate_key(bid.game_type), 0))
        win_amount = bid.points * rate

        # Fetch exact transaction (Win type only recommended)
        tx = Transaction.objects(
            user_id=str(user.id),
            amount=win_amount,
            payment_method="Win"
        ).order_by('-created_at').first()

        win_data.append({
            "game_name": market.name,
            "game_type": bid.game_type,
            "points": bid.points,
            "digit_or_panna": bid.digit,
            "win_amount": win_amount,
            "bid_date": bid.bid_date,
            "session": bid.session,
            "declared_result": {
                "open_digit": result.open_digit,
                "open_panna": result.open_panna,
                "close_digit": result.close_digit,
                "close_panna": result.close_panna
            },
            "result_declared_at": result.date,
            "tx_id": tx.tx_id if tx else None
        })

    return {"wins": win_data}

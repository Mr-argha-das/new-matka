import re
from fastapi import HTTPException


VALID_GAMES = [
    "single",
    "single_bulk",
    "jodi",
    "jodi_bulk",
    "single_panna",
    "single_panna_bulk",
    "double_panna",
    "double_panna_bulk",
    "triple_panna",
    "sp",
    "dp",
    "tp",
    "half_sangam",
    "half_sangam_a",
    "half_sangam_b",
    "full_sangam",
    "dp_motor",
    "sp_motor",
    "sp_dp_tp",
    "two_digit_pana",
    "sp_common",
    "odd_even",
    "dp_common",
    "red_jodi",
    "pana_family",
    "digit_based_jodi",
    "cycle_jodi",
    "jodi_family",
]

SINGLE_GAMES = {"single", "single_bulk"}
JODI_GAMES = {
    "jodi",
    "jodi_bulk",
    "odd_even",
    "red_jodi",
    "digit_based_jodi",
    "cycle_jodi",
    "jodi_family",
}
PANNA_GAMES = {
    "single_panna",
    "single_panna_bulk",
    "double_panna",
    "double_panna_bulk",
    "triple_panna",
    "sp",
    "dp",
    "tp",
    "dp_motor",
    "sp_motor",
    "sp_dp_tp",
    "two_digit_pana",
    "sp_common",
    "dp_common",
    "pana_family",
}
SANGAM_GAMES = {"half_sangam", "half_sangam_a", "half_sangam_b", "full_sangam"}

RATE_ALIAS = {
    "single_bulk": "single",
    "jodi_bulk": "jodi",
    "single_panna_bulk": "single_panna",
    "double_panna_bulk": "double_panna",
    "half_sangam_a": "half_sangam",
    "half_sangam_b": "half_sangam",
    "dp_motor": "double_panna",
    "sp_motor": "single_panna",
    "sp_dp_tp": "tp",
    "two_digit_pana": "single_panna",
    "sp_common": "single_panna",
    "odd_even": "jodi",
    "dp_common": "double_panna",
    "red_jodi": "jodi",
    "pana_family": "single_panna",
    "digit_based_jodi": "jodi",
    "cycle_jodi": "jodi",
    "jodi_family": "jodi",
}


def split_entries(value: str):
    return [part for part in re.split(r"[\s,]+", value.strip()) if part]


def rate_key(game_type: str):
    return RATE_ALIAS.get(game_type, game_type)


def validate_digit(game_type, digit):
    if not digit:
        raise HTTPException(400, "Digit is required for this game type")

    entries = split_entries(digit)

    if game_type in SINGLE_GAMES:
        if any((not entry.isdigit() or len(entry) != 1) for entry in entries):
            raise HTTPException(400, "Single digit entries must be 0-9")
        return

    if game_type in JODI_GAMES:
        if any((not entry.isdigit() or len(entry) != 2) for entry in entries):
            raise HTTPException(400, "Jodi entries must be exactly 2 digits")
        return

    if game_type in PANNA_GAMES:
        if any((not entry.isdigit() or len(entry) != 3) for entry in entries):
            raise HTTPException(400, "Panna entries must be exactly 3 digits")
        return

    if game_type in {"half_sangam", "half_sangam_a", "half_sangam_b"}:
        if len(entries) != 1 or "-" not in entries[0]:
            raise HTTPException(400, "Half Sangam must be in format 123-4")

        panna, single_digit = entries[0].split("-", 1)

        if not panna.isdigit() or len(panna) != 3:
            raise HTTPException(400, "Half Sangam Panna must be 3 digits")

        if not single_digit.isdigit() or len(single_digit) != 1:
            raise HTTPException(400, "Half Sangam Digit must be 1 digit")
        return

    if game_type == "full_sangam":
        if len(entries) != 1 or "-" not in entries[0]:
            raise HTTPException(400, "Full Sangam must be 123-456")

        open_panna, close_panna = entries[0].split("-", 1)

        if not open_panna.isdigit() or len(open_panna) != 3:
            raise HTTPException(400, "Full Sangam OPEN PANNA must be 3 digits")

        if not close_panna.isdigit() or len(close_panna) != 3:
            raise HTTPException(400, "Full Sangam CLOSE PANNA must be 3 digits")
        return

    raise HTTPException(400, "Invalid Game Type")


def bid_wins(bid, result_obj, session=None):
    open_digit = result_obj.open_digit
    close_digit = result_obj.close_digit
    open_panna = result_obj.open_panna
    close_panna = result_obj.close_panna
    current_session = session or bid.session
    entries = split_entries(bid.digit or "")

    if bid.game_type in SINGLE_GAMES:
        result_digit = open_digit if current_session == "open" else close_digit
        return result_digit in entries

    if bid.game_type in JODI_GAMES:
        return open_digit != "-" and close_digit != "-" and (open_digit + close_digit) in entries

    if bid.game_type in PANNA_GAMES:
        result_panna = open_panna if current_session == "open" else close_panna
        return result_panna in entries

    if bid.game_type in {"half_sangam", "half_sangam_a", "half_sangam_b"}:
        if not entries or "-" not in entries[0]:
            return False
        panna, digit = entries[0].split("-", 1)
        return (panna == open_panna and digit == close_digit) or (
            panna == close_panna and digit == open_digit
        )

    if bid.game_type == "full_sangam":
        if not entries or "-" not in entries[0]:
            return False
        op, cp = entries[0].split("-", 1)
        return op == open_panna and cp == close_panna

    return False

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
    "pana_family",
}

MOTOR_GAMES = {"sp_motor", "dp_motor"}
SP_DP_TP_GAMES = {"sp_dp_tp"}
TWO_DIGIT_PANA_GAMES = {"two_digit_pana"}
SP_COMMON_GAMES = {"sp_common", "dp_common"}
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


def extract_motor_digits(value: str):
    value = value.strip()
    if not value:
        return []
    if "," in value or " " in value:
        parts = split_entries(value)
        digits = []
        for part in parts:
            if len(part) == 1 and part.isdigit():
                digits.append(part)
            elif len(part) > 1 and part.isdigit():
                digits.extend(list(part))
            else:
                return None
        return digits
    else:
        if not value.isdigit():
            return None
        return list(value)


def extract_sp_dp_tp_info(value: str):
    value = value.strip()
    if not value:
        return None
    if "|" in value:
        parts = value.split("|", 1)
        digit_part = parts[0].strip()
        types_part = parts[1].strip().lower()
        if not digit_part.isdigit() or len(digit_part) != 1:
            return None
        types = [t.strip() for t in types_part.split(",") if t.strip()]
        valid_types = {"sp", "dp", "tp"}
        if not types or any(t not in valid_types for t in types):
            return None
        return (digit_part, types)
    else:
        if value.isdigit() and len(value) == 1:
            return (value, [])
        if value.isdigit() and len(value) == 3:
            return (value, [])
        return None


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
    if game_type in MOTOR_GAMES:
        motor_digits = extract_motor_digits(digit)
        if motor_digits is None:
            raise HTTPException(400, "Motor: Only digits 0-9 allowed")
        if len(motor_digits) < 1 or len(motor_digits) > 10:
            raise HTTPException(400, "Motor: Length must be 1 to 10 digits")
        if len(motor_digits) != len(set(motor_digits)):
            raise HTTPException(400, "Motor: Duplicate digits not allowed. e.g. 1234567890 is valid, 1123456789 is invalid")
        if any(not d.isdigit() for d in motor_digits):
            raise HTTPException(400, "Motor: Only digits 0-9 allowed")
        return
    if game_type in SP_DP_TP_GAMES:
        info = extract_sp_dp_tp_info(digit)
        if info is None:
            raise HTTPException(400, "SP DP TP: Enter single digit 0-9, e.g. 5 or 5|sp,dp,tp with checkbox selection")
        return
    if game_type in TWO_DIGIT_PANA_GAMES:
        if any((not entry.isdigit() or len(entry) != 2) for entry in entries):
            raise HTTPException(400, "Two Digit Pana: Enter exactly 2 digits like 12, 32, 34")
        return
    if game_type in SP_COMMON_GAMES:
        if any((not entry.isdigit() or len(entry) != 1) for entry in entries):
            raise HTTPException(400, "SP/DP Common: Enter single digit 0-9")
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


def get_panna_type(panna: str):
    if not panna or len(panna) != 3 or not panna.isdigit():
        return None
    if panna[0] == panna[1] == panna[2]:
        return "tp"
    if panna[0] == panna[1] or panna[1] == panna[2] or panna[0] == panna[2]:
        return "dp"
    return "sp"


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

    if bid.game_type in MOTOR_GAMES:
        motor_digits = extract_motor_digits(bid.digit or "")
        if not motor_digits:
            return False
        result_panna = open_panna if current_session == "open" else close_panna
        if not result_panna or result_panna == "-":
            return False
        return any(d in result_panna for d in motor_digits)

    if bid.game_type in SP_DP_TP_GAMES:
        info = extract_sp_dp_tp_info(bid.digit or "")
        if not info:
            return False
        digit_part, selected_types = info
        result_panna = open_panna if current_session == "open" else close_panna
        result_digit = open_digit if current_session == "open" else close_digit
        if not result_panna or result_panna == "-":
            return False
        if len(digit_part) == 3:
            return result_panna == digit_part
        panna_type = get_panna_type(result_panna)
        if selected_types:
            if panna_type not in selected_types:
                return False
        return digit_part == result_digit or digit_part in result_panna

    if bid.game_type in TWO_DIGIT_PANA_GAMES:
        result_panna = open_panna if current_session == "open" else close_panna
        if not result_panna or result_panna == "-":
            return False
        for entry in entries:
            if len(entry) != 2:
                continue
            if entry in result_panna:
                return True
            from collections import Counter
            panna_counter = Counter(result_panna)
            entry_counter = Counter(entry)
            if all(panna_counter[d] >= entry_counter[d] for d in entry_counter):
                return True
            if entry[0] in result_panna and entry[1] in result_panna:
                return True
        return False

    if bid.game_type in SP_COMMON_GAMES:
        result_panna = open_panna if current_session == "open" else close_panna
        result_digit = open_digit if current_session == "open" else close_digit
        if not result_panna or result_panna == "-":
            return False
        for entry in entries:
            if len(entry) != 1:
                continue
            if entry == result_digit or entry in result_panna:
                return True
        return False

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

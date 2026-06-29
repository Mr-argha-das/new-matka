import argparse
import sys
from pathlib import Path

from mongoengine import connect, disconnect

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.config import settings  # noqa: E402
from app.models import User, Wallet  # noqa: E402
from app.utils import hash_password  # noqa: E402


def create_or_update_admin(username: str, mobile: str, password: str) -> User:
    user = User.objects(mobile=mobile).first()
    password_hash = hash_password(password)

    if user:
        user.update(
            username=username,
            password_hash=password_hash,
            role="admin",
            status=True,
            is_bet=True,
        )
        user.reload()
    else:
        user = User(
            username=username,
            mobile=mobile,
            password_hash=password_hash,
            role="admin",
            balance=0,
            status=True,
            is_bet=True,
        ).save()

    wallet = Wallet.objects(user_id=str(user.id)).first()
    if not wallet:
        Wallet(user_id=str(user.id), balance=0).save()

    return user


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or update an admin user.")
    parser.add_argument("--username", default="admin")
    parser.add_argument("--mobile", default="9999999999")
    parser.add_argument("--password", default="Admin@12345")
    args = parser.parse_args()

    connect(host=settings.MONGO_URI)
    try:
        user = create_or_update_admin(args.username, args.mobile, args.password)
        print(f"Admin ready: id={user.id} username={user.username} mobile={user.mobile} role={user.role}")
    finally:
        disconnect()


if __name__ == "__main__":
    main()

"""Small helper to push an in-app notification to a user (bell icon)."""

from datetime import datetime

from app.models import User, UserNotification


def notify_user(user_id, title, message):
    """Save a UserNotification for user_id. Never raises (settlement must not break)."""
    try:
        user = User.objects(id=str(user_id)).first()
        if not user:
            return
        UserNotification(
            user=user,
            title=title,
            message=message,
            created_at=datetime.utcnow(),
        ).save()
    except Exception as e:
        print(f"notify_user failed: {e}")


def notify_win(user_id, amount, game_name, detail=""):
    """Standard 'you won' notification."""
    msg = f"Congratulations! Aap ₹{amount} jeet gaye — {game_name}"
    if detail:
        msg += f" ({detail})"
    msg += ". Winning amount aapke wallet me add ho gaya hai. 🎉"
    notify_user(user_id, "🎉 You Won!", msg)

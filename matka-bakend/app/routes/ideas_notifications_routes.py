from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime

from app.auth import get_current_user, require_admin
from app.models import User, UserIdea, UserNotification

router = APIRouter(tags=["User Ideas & User Notifications"])


# ---------- Schemas ----------
class IdeaIn(BaseModel):
    text: str


class SendNotificationIn(BaseModel):
    user_id: str  # single user id, or "all" to send to every player
    title: str = "Notification"
    message: str


# =========================================================
#                    USER IDEA (suggestions)
# =========================================================

@router.post("/user/ideas")
def submit_idea(payload: IdeaIn, user=Depends(get_current_user)):
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(400, "Idea text is required")
    if len(text) > 2000:
        raise HTTPException(400, "Idea text too long (max 2000 chars)")

    idea = UserIdea(user=user, text=text, created_at=datetime.utcnow())
    idea.save()
    return {"status": "success", "message": "Idea submitted successfully"}


@router.get("/user/ideas")
def my_ideas(user=Depends(get_current_user)):
    data = []
    for i in UserIdea.objects(user=user).order_by("-created_at"):
        data.append({
            "id": str(i.id),
            "text": i.text,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        })
    return {"status": "success", "ideas": data}


@router.get("/admin/ideas")
def all_ideas(admin=Depends(require_admin)):
    data = []
    for i in UserIdea.objects().order_by("-created_at"):
        u = None
        try:
            u = i.user
        except Exception:
            pass
        data.append({
            "id": str(i.id),
            "text": i.text,
            "username": u.username if u else "Deleted User",
            "mobile": u.mobile if u else "-",
            "user_id": str(u.id) if u else None,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        })
    return {"status": "success", "ideas": data}


@router.delete("/admin/ideas/{idea_id}")
def delete_idea(idea_id: str, admin=Depends(require_admin)):
    idea = UserIdea.objects(id=idea_id).first()
    if not idea:
        raise HTTPException(404, "Idea not found")
    idea.delete()
    return {"status": "success", "message": "Idea deleted"}


# =========================================================
#              ADMIN -> USER NOTIFICATIONS
# =========================================================

@router.post("/admin/user-notifications/send")
def send_notification(payload: SendNotificationIn, admin=Depends(require_admin)):
    message = (payload.message or "").strip()
    title = (payload.title or "Notification").strip() or "Notification"
    if not message:
        raise HTTPException(400, "Message is required")

    now = datetime.utcnow()

    if payload.user_id == "all":
        users = User.objects(role="player")
        count = 0
        for u in users:
            UserNotification(user=u, title=title, message=message, created_at=now).save()
            count += 1
        return {"status": "success", "message": f"Notification sent to {count} users"}

    user = User.objects(id=payload.user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    UserNotification(user=user, title=title, message=message, created_at=now).save()
    return {"status": "success", "message": f"Notification sent to {user.username}"}


@router.get("/admin/user-notifications")
def sent_notifications(admin=Depends(require_admin)):
    data = []
    for n in UserNotification.objects().order_by("-created_at")[:200]:
        u = None
        try:
            u = n.user
        except Exception:
            pass
        data.append({
            "id": str(n.id),
            "title": n.title,
            "message": n.message,
            "username": u.username if u else "Deleted User",
            "mobile": u.mobile if u else "-",
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        })
    return {"status": "success", "notifications": data}


@router.delete("/admin/user-notifications/{notif_id}")
def delete_notification(notif_id: str, admin=Depends(require_admin)):
    n = UserNotification.objects(id=notif_id).first()
    if not n:
        raise HTTPException(404, "Notification not found")
    n.delete()
    return {"status": "success", "message": "Notification deleted"}


# =========================================================
#                 USER -> MY NOTIFICATIONS
# =========================================================

@router.get("/user/notifications")
def my_notifications(user=Depends(get_current_user)):
    data = []
    unread = 0
    for n in UserNotification.objects(user=user).order_by("-created_at")[:100]:
        if not n.is_read:
            unread += 1
        data.append({
            "id": str(n.id),
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        })
    return {"status": "success", "unread": unread, "notifications": data}


@router.post("/user/notifications/mark-read")
def mark_all_read(user=Depends(get_current_user)):
    UserNotification.objects(user=user, is_read=False).update(set__is_read=True)
    return {"status": "success", "message": "All notifications marked as read"}

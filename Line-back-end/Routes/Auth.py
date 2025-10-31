import os
import msal
from fastapi import APIRouter, Request, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
AUTHORITY = os.getenv("AUTHORITY")
REDIRECT_URI = os.getenv("REDIRECT_URI")
SCOPE = os.getenv("SCOPE", "").split()

async def get_current_user(request: Request):
    user = request.session.get('user')
    if not user:
        # ถ้าไม่ล็อกอิน โยน Error หรือ Redirect
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

#auth object 
msal_app = msal.ConfidentialClientApplication(
    CLIENT_ID, 
    authority=AUTHORITY, 
    client_credential=CLIENT_SECRET
)

@router.get("/login")
def login_start(request: Request):
    auth_url = msal_app.get_authorization_request_url(
        scopes=SCOPE,
        redirect_uri=REDIRECT_URI
    )
    return RedirectResponse(url=auth_url)

@router.get("/getAToken")
def get_token_callback(request: Request, code: str):
    token_result = msal_app.acquire_token_by_authorization_code(
        code,
        scopes=SCOPE,
        redirect_uri=REDIRECT_URI
    )

    if "error" in token_result:
        return {"error": token_result.get("error_description", "Login failed.")}

    request.session['user'] = token_result.get('id_token_claims')
    
    return RedirectResponse(url="/auth/profile")

@router.get("/profile")
def show_profile(request: Request):
    user = request.session.get('user')
    
    if not user:
        return RedirectResponse(url="/auth/login")
        
    return {
        "message": f"Hello, {user.get('name')}",
        "email": user.get('preferred_username'),
        "all_data": user
    }

@router.get("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/")

@router.get("/my_protected_data")
async def get_my_data(
    current_user: dict = Depends(get_current_user)
):
    # ถ้ามาถึงตรงนี้ได้ แปลว่าล็อกอินแล้ว
    # "current_user" จะมีข้อมูลจาก session
    return {
        "message": "This is secret data!",
        "user_name": current_user.get('name')
    }
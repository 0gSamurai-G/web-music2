import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Header, HTTPException, status
from pathlib import Path

# Path to service account key from environment variable (JSON string or filepath)
FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
FIREBASE_SERVICE_ACCOUNT_JSON = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

firebase_app = None

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    try:
        if FIREBASE_SERVICE_ACCOUNT_JSON:
            cred_dict = json.loads(FIREBASE_SERVICE_ACCOUNT_JSON)
            cred = credentials.Certificate(cred_dict)
            firebase_app = firebase_admin.initialize_app(cred)
        elif FIREBASE_SERVICE_ACCOUNT_PATH and Path(FIREBASE_SERVICE_ACCOUNT_PATH).exists():
            cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
            firebase_app = firebase_admin.initialize_app(cred)
        else:
            firebase_app = firebase_admin.initialize_app()
    except Exception as e:
        print(f"Warning: Firebase Admin SDK initialization failed: {e}.")

async def verify_firebase_token(authorization: str = Header(None)) -> str:
    """
    Verifies Firebase ID token from Authorization header and returns user's email.
    Throws HTTP exceptions for invalid/unauthorized tokens.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header. Expected Bearer token."
        )

    token = authorization.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        email = decoded_token.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No email found in token payload."
            )

        # Strict email enforcement
        if email != "srdeshpande1122@gmail.com":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User unauthorized. Restricted to srdeshpande1122@gmail.com."
            )

        return email
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired.")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is invalid.")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Authentication failed: {str(e)}")

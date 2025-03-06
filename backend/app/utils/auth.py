from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..database.base import get_db
from ..services.user_service import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = UserService.verify_token(token)
    if token_data is None:
        raise credentials_exception
    
    user = UserService.get_user_by_username(db, token_data.username)
    if user is None:
        raise credentials_exception
    
    return user 
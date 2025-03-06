from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database.base import get_db
from ..services.todo_service import TodoService
from ..schemas.todo import Todo, TodoCreate, TodoUpdate, SubTaskCreate, TagCreate
from ..utils.auth import get_current_user
from ..schemas.user import User

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/", response_model=List[Todo])
def get_todos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all todos for the current user"""
    return TodoService.get_todos(db, current_user.id, skip, limit)

@router.post("/", response_model=Todo)
def create_todo(
    todo: TodoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new todo"""
    return TodoService.create_todo(db, todo, current_user.id)

@router.get("/{todo_id}", response_model=Todo)
def get_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific todo by ID"""
    todo = TodoService.get_todo(db, todo_id, current_user.id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@router.put("/{todo_id}", response_model=Todo)
def update_todo(
    todo_id: int,
    todo_update: TodoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a todo"""
    todo = TodoService.update_todo(db, todo_id, todo_update, current_user.id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@router.delete("/{todo_id}")
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a todo"""
    success = TodoService.delete_todo(db, todo_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted successfully"}

@router.post("/{todo_id}/subtasks", response_model=Todo)
def create_subtask(
    todo_id: int,
    subtask: SubTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a subtask to a todo"""
    result = TodoService.create_subtask(db, todo_id, subtask, current_user.id)
    if result is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return TodoService.get_todo(db, todo_id, current_user.id)

@router.post("/{todo_id}/tags")
def add_tag_to_todo(
    todo_id: int,
    tag: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a tag to a todo"""
    result = TodoService.add_tag_to_todo(db, todo_id, tag, current_user.id)
    if result is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Tag added successfully"}

@router.delete("/{todo_id}/tags/{tag_id}")
def remove_tag_from_todo(
    todo_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a tag from a todo"""
    success = TodoService.remove_tag_from_todo(db, todo_id, tag_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Todo or tag not found")
    return {"message": "Tag removed successfully"}

@router.get("/tags/{tag_name}", response_model=List[Todo])
def get_todos_by_tag(
    tag_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all todos with a specific tag"""
    return TodoService.get_todos_by_tag(db, tag_name, current_user.id) 
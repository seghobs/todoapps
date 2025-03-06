from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..models.todo import Todo, SubTask, Tag, TodoTags
from ..schemas.todo import TodoCreate, TodoUpdate, SubTaskCreate, TagCreate

class TodoService:
    @staticmethod
    def get_todos(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Todo]:
        return db.query(Todo).filter(Todo.user_id == user_id).offset(skip).limit(limit).all()

    @staticmethod
    def get_todo(db: Session, todo_id: int, user_id: int) -> Optional[Todo]:
        return db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == user_id).first()

    @staticmethod
    def create_todo(db: Session, todo: TodoCreate, user_id: int) -> Todo:
        db_todo = Todo(**todo.model_dump(), user_id=user_id)
        db.add(db_todo)
        db.commit()
        db.refresh(db_todo)
        return db_todo

    @staticmethod
    def update_todo(db: Session, todo_id: int, todo_update: TodoUpdate, user_id: int) -> Optional[Todo]:
        db_todo = TodoService.get_todo(db, todo_id, user_id)
        if db_todo:
            update_data = todo_update.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_todo, field, value)
            db_todo.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_todo)
        return db_todo

    @staticmethod
    def delete_todo(db: Session, todo_id: int, user_id: int) -> bool:
        db_todo = TodoService.get_todo(db, todo_id, user_id)
        if db_todo:
            db.delete(db_todo)
            db.commit()
            return True
        return False

    @staticmethod
    def create_subtask(db: Session, todo_id: int, subtask: SubTaskCreate, user_id: int) -> Optional[SubTask]:
        db_todo = TodoService.get_todo(db, todo_id, user_id)
        if db_todo:
            db_subtask = SubTask(**subtask.model_dump(), todo_id=todo_id)
            db.add(db_subtask)
            db.commit()
            db.refresh(db_subtask)
            return db_subtask
        return None

    @staticmethod
    def add_tag_to_todo(db: Session, todo_id: int, tag: TagCreate, user_id: int) -> Optional[Tag]:
        db_todo = TodoService.get_todo(db, todo_id, user_id)
        if not db_todo:
            return None

        # Get or create tag
        db_tag = db.query(Tag).filter(Tag.name == tag.name).first()
        if not db_tag:
            db_tag = Tag(**tag.model_dump())
            db.add(db_tag)
            db.commit()
            db.refresh(db_tag)

        # Add association if it doesn't exist
        if not db.query(TodoTags).filter_by(todo_id=todo_id, tag_id=db_tag.id).first():
            db.execute(TodoTags.__table__.insert().values(todo_id=todo_id, tag_id=db_tag.id))
            db.commit()

        return db_tag

    @staticmethod
    def remove_tag_from_todo(db: Session, todo_id: int, tag_id: int, user_id: int) -> bool:
        db_todo = TodoService.get_todo(db, todo_id, user_id)
        if not db_todo:
            return False

        db.query(TodoTags).filter_by(todo_id=todo_id, tag_id=tag_id).delete()
        db.commit()
        return True

    @staticmethod
    def get_todos_by_tag(db: Session, tag_name: str, user_id: int) -> List[Todo]:
        return (
            db.query(Todo)
            .join(TodoTags)
            .join(Tag)
            .filter(Tag.name == tag_name, Todo.user_id == user_id)
            .all()
        ) 
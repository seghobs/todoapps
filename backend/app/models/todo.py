from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database.base import Base

class StageEnum(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

class PriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class CategoryEnum(str, enum.Enum):
    work = "work"
    personal = "personal"
    shopping = "shopping"
    health = "health"
    other = "other"

class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(500), nullable=False)
    description = Column(String(1000), nullable=True)
    completed = Column(Boolean, default=False)
    stage = Column(Enum(StageEnum), default=StageEnum.todo)
    category = Column(Enum(CategoryEnum), default=CategoryEnum.other)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User", back_populates="todos")
    subtasks = relationship("SubTask", back_populates="todo", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary="todo_tags", back_populates="todos")

class SubTask(Base):
    __tablename__ = "subtasks"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(500), nullable=False)
    completed = Column(Boolean, default=False)
    todo_id = Column(Integer, ForeignKey("todos.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    todo = relationship("Todo", back_populates="subtasks")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    todos = relationship("Todo", secondary="todo_tags", back_populates="tags")

class TodoTags(Base):
    __tablename__ = "todo_tags"

    todo_id = Column(Integer, ForeignKey("todos.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True) 
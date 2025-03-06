from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class StageEnum(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

class CategoryEnum(str, Enum):
    work = "work"
    personal = "personal"
    shopping = "shopping"
    health = "health"
    other = "other"

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SubTaskBase(BaseModel):
    text: str
    completed: bool = False

class SubTaskCreate(SubTaskBase):
    pass

class SubTask(SubTaskBase):
    id: int
    todo_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TodoBase(BaseModel):
    text: str
    description: Optional[str] = None
    category: CategoryEnum
    priority: PriorityEnum = PriorityEnum.medium
    stage: StageEnum = StageEnum.todo
    due_date: Optional[datetime] = None

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    text: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    category: Optional[CategoryEnum] = None
    priority: Optional[PriorityEnum] = None
    stage: Optional[StageEnum] = None
    due_date: Optional[datetime] = None

class Todo(TodoBase):
    id: int
    completed: bool
    created_at: datetime
    updated_at: datetime
    user_id: int
    subtasks: List[SubTask] = []
    tags: List[Tag] = []

    class Config:
        from_attributes = True

class TodoWithUser(Todo):
    user: "UserBase"

    class Config:
        from_attributes = True 
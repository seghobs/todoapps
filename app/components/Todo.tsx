"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toaster, toast } from "sonner"
import { todoService } from "@/app/services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faListCheck,
  faSpinner,
  faCheck,
  faBriefcase,
  faUser,
  faCartShopping,
  faHospital,
  faThumbtack,
  faStar,
  faCalendarDays,
  faTag,
  faPencil,
  faTrash,
  faSave,
} from "@fortawesome/free-solid-svg-icons"

interface Todo {
  id: number
  text: string
  description?: string
  completed: boolean
  category: "work" | "personal" | "shopping" | "health" | "other"
  priority: "low" | "medium" | "high"
  stage: "todo" | "in_progress" | "done"
  due_date?: string
  subtasks: SubTask[]
  tags: Tag[]
}

interface SubTask {
  id: number
  text: string
  completed: boolean
}

interface Tag {
  id: number
  name: string
}

const STAGES = [
  { value: "todo", label: "Yapılacak", icon: faListCheck, color: "bg-gray-100 text-gray-700 border-gray-500" },
  { value: "in_progress", label: "Devam Ediyor", icon: faSpinner, color: "bg-yellow-100 text-yellow-700 border-yellow-500" },
  { value: "done", label: "Tamamlandı", icon: faCheck, color: "bg-green-100 text-green-700 border-green-500" },
]

const CATEGORIES = [
  { value: "work", label: "İş", icon: faBriefcase, color: "bg-blue-100 text-blue-700 border-blue-500" },
  { value: "personal", label: "Kişisel", icon: faUser, color: "bg-purple-100 text-purple-700 border-purple-500" },
  { value: "shopping", label: "Alışveriş", icon: faCartShopping, color: "bg-orange-100 text-orange-700 border-orange-500" },
  { value: "health", label: "Sağlık", icon: faHospital, color: "bg-green-100 text-green-700 border-green-500" },
  { value: "other", label: "Diğer", icon: faThumbtack, color: "bg-gray-100 text-gray-700 border-gray-500" },
]

const PRIORITIES = [
  { value: "low", label: "Düşük", icon: faStar, color: "bg-green-100 text-green-700 border-green-500" },
  { value: "medium", label: "Orta", icon: faStar, iconCount: 2, color: "bg-yellow-100 text-yellow-700 border-yellow-500" },
  { value: "high", label: "Yüksek", icon: faStar, iconCount: 3, color: "bg-red-100 text-red-700 border-red-500" },
]

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [category, setCategory] = useState<"work" | "personal" | "shopping" | "health" | "other">("other")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [stage, setStage] = useState<"todo" | "in_progress" | "done">("todo")
  const [dueDate, setDueDate] = useState<string>("")
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      const data = await todoService.getAllTodos()
      setTodos(data)
    } catch (error) {
      toast.error("Görevler yüklenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async () => {
    if (newTodo.trim()) {
      try {
        console.log("Adding todo:", {
          text: newTodo.trim(),
          description: newDescription.trim() || undefined,
          category,
          priority,
          stage,
          due_date: dueDate || undefined,
        })
        
        const todo = await todoService.createTodo({
          text: newTodo.trim(),
          description: newDescription.trim() || undefined,
          category,
          priority,
          stage,
          due_date: dueDate || undefined,
        })
        
        console.log("Server response:", todo)
        
        if (!todo || !todo.id) {
          throw new Error("Invalid server response")
        }
        
        setTodos([...todos, todo])
        setNewTodo("")
        setNewDescription("")
        toast.success("Görev eklendi!")
      } catch (error) {
        console.error("Error adding todo:", error)
        toast.error("Görev eklenirken bir hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"))
      }
    }
  }

  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const updatedTodo = await todoService.updateTodo(id, { 
        completed: !completed,
        stage: !completed ? "done" : "todo"
      })
      setTodos(
        todos.map((todo) => (todo.id === id ? updatedTodo : todo))
      )
      toast(completed ? "Görev tekrar açıldı" : "Görev tamamlandı! 🎉")
    } catch (error) {
      toast.error("Görev güncellenirken bir hata oluştu")
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      await todoService.deleteTodo(id)
      setTodos(todos.filter((todo) => todo.id !== id))
      toast.error("Görev silindi")
    } catch (error) {
      toast.error("Görev silinirken bir hata oluştu")
    }
  }

  const updateTodo = async (todo: Todo) => {
    try {
      const updatedTodo = await todoService.updateTodo(todo.id, {
        text: todo.text,
        category: todo.category,
        priority: todo.priority,
        stage: todo.stage,
        due_date: todo.due_date,
      })
      setTodos(todos.map((t) => (t.id === todo.id ? updatedTodo : t)))
      setEditingTodo(null)
      toast.success("Görev güncellendi!")
    } catch (error) {
      toast.error("Görev güncellenirken bir hata oluştu")
    }
  }

  const addSubtask = async (todoId: number, text: string) => {
    try {
      const updatedTodo = await todoService.addSubtask(todoId, text)
      setTodos(todos.map((todo) => (todo.id === todoId ? updatedTodo : todo)))
      toast.success("Alt görev eklendi!")
    } catch (error) {
      toast.error("Alt görev eklenirken bir hata oluştu")
    }
  }

  const addTag = async (todoId: number, tagName: string) => {
    try {
      await todoService.addTag(todoId, tagName)
      await loadTodos() // Reload todos to get updated tags
      toast.success("Etiket eklendi!")
    } catch (error) {
      toast.error("Etiket eklenirken bir hata oluştu")
    }
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true
    if (filter === "active") return !todo.completed
    if (filter === "completed") return todo.completed
    return todo.category === filter
  })

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    pending: todos.filter((t) => !t.completed).length,
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Yükleniyor...</div>
  }

  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      <div className="container mx-auto px-4 py-6 min-h-screen">
        <Card className="max-w-[1200px] mx-auto shadow-lg">
          <CardHeader className="border-b pb-6 space-y-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Akıllı Görev Yöneticisi
            </CardTitle>
            <CardDescription className="text-center text-base sm:text-lg mt-2">
              Görevlerinizi organize edin, önceliklendirin ve takip edin
            </CardDescription>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-2xl font-bold text-gray-700">{stats.total}</span>
                <span className="text-sm text-gray-600">Toplam Görev</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-green-50 border border-green-200">
                <span className="text-2xl font-bold text-green-700">{stats.completed}</span>
                <span className="text-sm text-green-600">Tamamlanan</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-red-50 border border-red-200">
                <span className="text-2xl font-bold text-red-700">{stats.pending}</span>
                <span className="text-sm text-red-600">Bekleyen</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Add Todo Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex gap-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex-1 space-y-3">
                <Input
                  placeholder="Yeni görev ekle..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTodo()}
                  className="min-w-0"
                />
                <Input
                  placeholder="Görev açıklaması (opsiyonel)..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTodo()}
                  className="min-w-0"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex gap-3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full lg:w-[160px]">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={cat.icon} className="mr-2" />
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={stage} onValueChange={(value: "todo" | "in_progress" | "done") => setStage(value)}>
                  <SelectTrigger className="w-full lg:w-[160px]">
                    <SelectValue placeholder="Aşama" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={s.icon} className="mr-2" />
                          <span>{s.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={priority} 
                  onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}
                >
                  <SelectTrigger className="w-full lg:w-[140px]">
                    <SelectValue placeholder="Öncelik" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-2">
                          {Array(p.iconCount || 1)
                            .fill(null)
                            .map((_, i) => (
                              <FontAwesomeIcon key={i} icon={faStar} className="mr-1" />
                            ))}
                          <span>{p.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full lg:w-[160px]"
                />
                <Button 
                  onClick={addTodo} 
                  className="w-full sm:col-span-3 lg:w-auto bg-gradient-to-r from-purple-600 to-blue-500 px-6"
                >
                  <span className="hidden sm:inline">Görev</span> Ekle
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="grid grid-cols-2 sm:flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  size="sm"
                  className="w-full sm:w-auto min-w-[100px]"
                >
                  <FontAwesomeIcon icon={faListCheck} className="mr-2" /> Tümü
                </Button>
                <Button
                  variant={filter === "active" ? "default" : "outline"}
                  onClick={() => setFilter("active")}
                  size="sm"
                  className="w-full sm:w-auto min-w-[100px]"
                >
                  ⏳ Aktif
                </Button>
                <Button
                  variant={filter === "completed" ? "default" : "outline"}
                  onClick={() => setFilter("completed")}
                  size="sm"
                  className="w-full sm:w-auto min-w-[100px]"
                >
                  ✅ Tamamlanan
                </Button>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={filter === cat.value ? "default" : "outline"}
                    onClick={() => setFilter(cat.value)}
                    size="sm"
                    className="w-full sm:w-auto min-w-[100px]"
                  >
                    <FontAwesomeIcon icon={cat.icon} className="mr-2" /> {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Todo Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STAGES.map((s) => (
                <div key={s.value} className="space-y-3">
                  <div className={`p-3 rounded-lg ${s.color} flex items-center justify-between`}>
                    <h3 className="font-semibold flex items-center gap-2">
                      <FontAwesomeIcon icon={s.icon} className="mr-2" />
                      <span>{s.label}</span>
                    </h3>
                    <Badge variant="secondary">
                      {todos.filter(t => t.stage === s.value).length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {filteredTodos
                      .filter(todo => todo.stage === s.value)
                      .map((todo) => (
                        <div
                          key={todo.id}
                          className={`group flex flex-col gap-3 p-4 rounded-lg border transition-all duration-200 ${
                            todo.completed 
                              ? 'bg-gray-50/80 border-gray-200' 
                              : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-lg'
                          }`}
                        >
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                <span
                                  className={`block text-base font-medium break-words ${
                                    todo.completed ? "text-gray-500" : "text-gray-900"
                                  }`}
                                >
                                  {todo.text}
                                </span>
                                {todo.description && (
                                  <p className="text-sm text-gray-600 break-words">
                                    {todo.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-1.5 items-center">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${CATEGORIES.find(c => c.value === todo.category)?.color}`}
                                  >
                                    <FontAwesomeIcon icon={CATEGORIES.find(c => c.value === todo.category)?.icon || faThumbtack} className="mr-1.5" />
                                    {CATEGORIES.find(c => c.value === todo.category)?.label || todo.category}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-2 py-0.5 ${PRIORITIES.find(p => p.value === todo.priority)?.color}`}
                                  >
                                    {Array(PRIORITIES.find(p => p.value === todo.priority)?.iconCount || 1)
                                      .fill(null)
                                      .map((_, i) => (
                                        <FontAwesomeIcon key={i} icon={faStar} className="mr-0.5" />
                                      ))}
                                    {PRIORITIES.find(p => p.value === todo.priority)?.label}
                                  </Badge>
                                  {todo.due_date && (
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-500"
                                    >
                                      <FontAwesomeIcon icon={faCalendarDays} className="mr-1.5" />
                                      {new Date(todo.due_date).toLocaleDateString()}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Select
                                value={todo.stage}
                                onValueChange={(value: "todo" | "in_progress" | "done") =>
                                  updateTodo({
                                    ...todo,
                                    stage: value,
                                  })
                                }
                              >
                                <SelectTrigger className="w-[140px] h-8 text-xs bg-white shadow-sm truncate">
                                  <div className="flex items-center gap-1.5">
                                    <FontAwesomeIcon 
                                      icon={STAGES.find(s => s.value === todo.stage)?.icon || faListCheck} 
                                      className="shrink-0" 
                                    />
                                    <span className="truncate">
                                      {STAGES.find(s => s.value === todo.stage)?.label}
                                    </span>
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  {STAGES.map((s) => (
                                    <SelectItem key={s.value} value={s.value} className="text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={s.icon} className="shrink-0" />
                                        <span>{s.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {todo.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 items-center border-t border-gray-100 pt-2">
                                {todo.tags.map((tag) => (
                                  <Badge 
                                    key={tag.id} 
                                    variant="outline" 
                                    className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-500"
                                  >
                                    <FontAwesomeIcon icon={faTag} className="mr-1.5" />
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {todo.subtasks.length > 0 && (
                              <div className="space-y-1.5 border-t border-gray-100 pt-2">
                                {todo.subtasks.map((subtask) => (
                                  <div key={subtask.id} className="flex items-center gap-2 pl-4">
                                    <Checkbox
                                      checked={subtask.completed}
                                      onCheckedChange={() =>
                                        updateTodo({
                                          ...todo,
                                          subtasks: todo.subtasks.map((st) =>
                                            st.id === subtask.id
                                              ? { ...st, completed: !st.completed }
                                              : st
                                          ),
                                        })
                                      }
                                      className="h-3.5 w-3.5"
                                    />
                                    <span
                                      className={`text-sm break-words ${
                                        subtask.completed ? "line-through text-gray-500" : "text-gray-700"
                                      }`}
                                    >
                                      {subtask.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 justify-end border-t border-gray-100 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2.5 text-xs"
                                  onClick={() => setEditingTodo(todo)}
                                >
                                  <FontAwesomeIcon icon={faPencil} className="mr-1.5" /> Düzenle
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md mx-4">
                                <DialogHeader>
                                  <DialogTitle>Görevi Düzenle</DialogTitle>
                                </DialogHeader>
                                {editingTodo && (
                                  <div className="space-y-4 py-4">
                                    <Input
                                      value={editingTodo.text}
                                      onChange={(e) =>
                                        setEditingTodo({
                                          ...editingTodo,
                                          text: e.target.value,
                                        })
                                      }
                                      placeholder="Görev başlığı"
                                    />
                                    <Input
                                      value={editingTodo.description || ""}
                                      onChange={(e) =>
                                        setEditingTodo({
                                          ...editingTodo,
                                          description: e.target.value,
                                        })
                                      }
                                      placeholder="Görev açıklaması (opsiyonel)"
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <Select
                                        value={editingTodo.category}
                                        onValueChange={(value) =>
                                          setEditingTodo({
                                            ...editingTodo,
                                            category: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                              <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={cat.icon} className="mr-2" />
                                                <span>{cat.label}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Select
                                        value={editingTodo.stage}
                                        onValueChange={(value: "todo" | "in_progress" | "done") =>
                                          setEditingTodo({
                                            ...editingTodo,
                                            stage: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Aşama" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {STAGES.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                              <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={s.icon} className="mr-2" />
                                                <span>{s.label}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Select
                                        value={editingTodo.priority}
                                        onValueChange={(value: "low" | "medium" | "high") =>
                                          setEditingTodo({
                                            ...editingTodo,
                                            priority: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Öncelik" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {PRIORITIES.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>
                                              <div className="flex items-center gap-2">
                                                {Array(p.iconCount || 1)
                                                  .fill(null)
                                                  .map((_, i) => (
                                                    <FontAwesomeIcon key={i} icon={faStar} className="mr-1" />
                                                  ))}
                                                <span>{p.label}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Input
                                      type="date"
                                      value={editingTodo.due_date || ""}
                                      onChange={(e) =>
                                        setEditingTodo({
                                          ...editingTodo,
                                          due_date: e.target.value,
                                        })
                                      }
                                    />
                                    <div className="space-y-2">
                                      <Input
                                        placeholder="Alt görev ekle... (Enter'a basın)"
                                        onKeyPress={(e) => {
                                          if (e.key === "Enter") {
                                            const input = e.target as HTMLInputElement;
                                            if (input.value.trim()) {
                                              addSubtask(editingTodo.id, input.value.trim());
                                              input.value = "";
                                            }
                                          }
                                        }}
                                      />
                                      <Input
                                        placeholder="Etiket ekle... (Enter'a basın)"
                                        onKeyPress={(e) => {
                                          if (e.key === "Enter") {
                                            const input = e.target as HTMLInputElement;
                                            if (input.value.trim()) {
                                              addTag(editingTodo.id, input.value.trim());
                                              input.value = "";
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                    <Button
                                      onClick={() => updateTodo(editingTodo)}
                                      className="w-full bg-gradient-to-r from-purple-600 to-blue-500"
                                    >
                                      <FontAwesomeIcon icon={faSave} className="mr-2" /> Kaydet
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 px-2.5 text-xs"
                              onClick={() => deleteTodo(todo.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-1.5" /> Sil
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
} 
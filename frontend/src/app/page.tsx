'use client'

import { useEffect, useState } from 'react'
import { PlusCircle, X, CheckCircle, Edit } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TabsContent } from '@radix-ui/react-tabs'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import axios from "axios";

interface Todo {
  id?: number
  title: string
  description: string
  completed: boolean
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const refreshList = () => {
    axios
      .get("/api/todos/")
      .then((res) => {
        setTodos(res.data)
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    refreshList()
  }, [])

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() === '') return
    const newTodo: Todo = {
      title: title.trim(),
      description: description.trim(),
      completed: false
    }

    axios
      .post(`/api/todos/`, newTodo)
      .then(() => refreshList())
      .catch((err) => console.log(err))

    setTitle('')
    setDescription('')
  }

  const removeTodo = (id: number) => {
    const deletedTodo = todos.find(todo => todo.id === id)

    axios
      .delete(`/api/todos/${id}/`)
      .then(() => {
        refreshList()

        toast(`Deleted ${deletedTodo!.title}`, {
          description: deletedTodo!.description.length > 40 ? deletedTodo!.description.substring(0, 37) + "..." : deletedTodo!.description,
          action: {
            label: "Undo",
            onClick: () => {
              axios
                .post(`/api/todos/`, deletedTodo)
                .then(() => refreshList())
                .catch((err) => console.log(err))
            },
          },
        })
      })
      .catch((err) => console.log(err))
  }

  const editTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTodo) return
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const newTitle = formData.get('title') as string
    const newDescription = formData.get('description') as string

    const editedTodo: Todo = {
      id: editingTodo.id,
      title: newTitle,
      description: newDescription,
      completed: false
    }

    axios
      .put(`/api/todos/${editingTodo.id}/`, editedTodo)
      .then(() => refreshList())
      .catch((err) => console.log(err))

    setIsDialogOpen(false)
    setEditingTodo(null)
  }

  const toggleTodoCompletion = (id: number) => {
    const toggledTodo = todos.find(todo => todo.id === id)
    toggledTodo!.completed = !toggledTodo!.completed

    axios
      .put(`/api/todos/${id}/`, toggledTodo)
      .then(() => {
        refreshList()

        if (toggledTodo!.completed) {
          toast(`Completed ${toggledTodo!.title}`, {
            description: toggledTodo!.description.length > 40 ? toggledTodo!.description.substring(0, 37) + "..." : toggledTodo!.description,
            action: {
              label: "Undo",
              onClick: () => toggleTodoCompletion(toggledTodo!.id!),
            },
          })
        }
      })
      .catch((err) => console.log(err))
  }

  const activeTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)

  function TodoList({ title, todos }: { title: string, todos: Todo[] }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{todos.length} {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {todos.length === 0 ? (
              <div className="text-center text-gray-500">
                <CheckCircle className="mx-auto h-12 w-12 mb-2" />
                <p>{"It's empty out here."}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todos.map(todo => (
                  <Card key={todo.id} className="p-4">
                    <div className="grid grid-cols-4 items-start">
                      <div className="flex items-start space-x-2 col-span-3">
                        <Checkbox
                          className='mt-1'
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodoCompletion(todo.id!)}
                        />
                        <div>
                          <h3 className={"font-semibold" + (todo.completed ? " line-through" : "")}>{todo.title}</h3>
                          <p className="text-sm text-gray-500">{todo.description.length >= 50 ? todo.description.substring(0, 47) + "..." : todo.description}</p>
                        </div>
                      </div>
                      <div className='flex justify-end'>
                        <Dialog open={isDialogOpen && editingTodo?.id === todo.id} onOpenChange={(open) => {
                          setIsDialogOpen(open)
                          if (!open) setEditingTodo(null)
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Edit todo"
                              onClick={() => setEditingTodo(todo)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xl">
                            <form onSubmit={editTodo} className="grid gap-4">
                              <div className="space-y-2">
                                <h4 className="font-medium leading-none">Edit</h4>
                                <p className="text-sm text-muted-foreground">
                                  Modify the todo details below.
                                </p>
                              </div>
                              <div className="flex-col space-y-2">
                                <div className="flex-col space-y-1.5">
                                  <Label htmlFor="title">Title</Label>
                                  <Input
                                    required
                                    id="title"
                                    name="title"
                                    defaultValue={editingTodo?.title}
                                    className="col-span-2 h-8"
                                  />
                                </div>
                                <div className="flex-col space-y-1.5">
                                  <Label htmlFor="description">Description</Label>
                                  <Textarea
                                    required
                                    id="description"
                                    name="description"
                                    defaultValue={editingTodo?.description}
                                    className="col-span-2 h-20"
                                  />
                                </div>
                              </div>
                              <div className='grid justify-end'>
                                <div className='flex space-x-2'>
                                  <Button type="button" className="w-full col-span-2" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit" className="w-full col-span-2" variant="default">
                                    Save changes
                                  </Button>
                                </div>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTodo(todo.id!)}
                          aria-label="Remove todo"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  function TodoListTabItem({ title, count }: { title: string, count: number }) {
    return (
      <div className='flex space-x-2'>
        <span>{title}</span>
        {
          count > 0 &&
          <Badge>{count}</Badge>
        }
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 flex-col space-y-8">
      <div>
        <ModeToggle />
      </div>
      <div className='flex-col space-y-2'>
        <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>
          Ginagawamu na ba?! 💤
        </h1>
        <p className='text-muted-foreground'>
          To do list for procrastinators
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTodo} className="space-y-4">
            <Input
              required
              type="text"
              placeholder="Todo title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              required
              placeholder="Todo description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Todo
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            <TodoListTabItem title='Active' count={activeTodos.length} />
          </TabsTrigger>
          <TabsTrigger value="completed">
            <TodoListTabItem title='Completed' count={completedTodos.length} />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className='mt-4'>
          <TodoList title="Active Todos" todos={activeTodos} />
        </TabsContent>
        <TabsContent value="completed" className='mt-4'>
          <TodoList title="Completed Todos" todos={completedTodos} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useState, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import Column from './PrepColumn'

const COLUMN_KEYS = ['todo', 'cooking', 'done']

const initialData = {
  todo: [
    { id: uuid(), text: 'Chop onions' },
    { id: uuid(), text: 'Peel garlic' },
  ],
  cooking: [],
  done: [],
}

export default function DragDropBoard() {
  const [tasks, setTasks] = useState(() => {
    return JSON.parse(localStorage.getItem('recipe-board')) || initialData
  })

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    localStorage.setItem('recipe-board', JSON.stringify(tasks))
  }, [tasks])

  const findColumn = (taskId) =>
    COLUMN_KEYS.find((col) => tasks[col].some((t) => t.id === taskId))

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return

    const fromCol = findColumn(active.id)
    const toCol = COLUMN_KEYS.includes(over.id) ? over.id : findColumn(over.id)
    if (!fromCol || !toCol) return

    const activeItem = tasks[fromCol].find((t) => t.id === active.id)

    if (fromCol === toCol) {
      const oldIndex = tasks[toCol].findIndex((t) => t.id === active.id)
      const newIndex = tasks[toCol].findIndex((t) => t.id === over.id)
      if (oldIndex !== newIndex) {
        const newList = arrayMove(tasks[toCol], oldIndex, newIndex)
        setTasks((prev) => ({ ...prev, [toCol]: newList }))
      }
    } else {
      const insertIndex = tasks[toCol].findIndex((t) => t.id === over.id)
      const newTo = [...tasks[toCol]]
      insertIndex === -1
        ? newTo.push(activeItem)
        : newTo.splice(insertIndex, 0, activeItem)
      const newFrom = tasks[fromCol].filter((t) => t.id !== active.id)

      setTasks((prev) => ({
        ...prev,
        [fromCol]: newFrom,
        [toCol]: newTo,
      }))
    }
  }

  const updateCard = (col, id, newText) => {
    setTasks((prev) => ({
      ...prev,
      [col]: prev[col].map((t) =>
        t.id === id ? { ...t, text: newText } : t
      ),
    }))
  }

  const deleteCard = (col, id) => {
    setTasks((prev) => ({
      ...prev,
      [col]: prev[col].filter((t) => t.id !== id),
    }))
  }

  const addCard = (col, text) => {
    const newCard = { id: uuid(), text }
    setTasks((prev) => ({
      ...prev,
      [col]: [newCard, ...prev[col]],
    }))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {COLUMN_KEYS.map((col) => (
          <SortableContext
            key={col}
            items={tasks[col].map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <Column
              id={col}
              title={formatTitle(col)}
              tasks={tasks[col]}
              onEdit={updateCard}
              onDelete={(id) => deleteCard(col, id)}
              onAdd={addCard}
            />
          </SortableContext>
        ))}
      </div>
    </DndContext>
  )
}

function formatTitle(key) {
  return key === 'todo' ? 'To Prep' : key.charAt(0).toUpperCase() + key.slice(1)
}

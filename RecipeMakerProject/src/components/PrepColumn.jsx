import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { MdDragHandle, MdDelete, MdEdit } from 'react-icons/md'

function SortableCard({ task, onEdit, onDelete }) {
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      layout
      className="bg-white dark:bg-gray-800 p-3 mb-2 rounded shadow flex justify-between items-start"
      initial={{ opacity: 0.5, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      role="listitem"
    >
      <div className="flex-1 text-sm text-gray-800 dark:text-gray-100">{task.text}</div>
      <div className="flex space-x-2 items-center text-gray-500">
        <button onClick={() => onEdit(task)} aria-label="Edit"><MdEdit /></button>
        <button onClick={() => onDelete(task.id)} aria-label="Delete"><MdDelete /></button>
        <div {...listeners} className="cursor-grab" aria-label="Drag Handle"><MdDragHandle /></div>
      </div>
    </motion.div>
  )
}

export default function PrepColumn({ id, title, tasks, onAdd, onEdit, onDelete }) {
  const [input, setInput] = useState('')
  const [editing, setEditing] = useState(null)

  const handleSubmit = () => {
    if (!input.trim()) return
    if (editing) {
      onEdit(id, editing.id, input)
      setEditing(null)
    } else {
      onAdd(id, input)
    }
    setInput('')
  }

  return (
    <div id={id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow flex flex-col" role="region" aria-label={title}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h2>
      <div className="flex mb-4 space-x-2">
        <input
          className="flex-1 px-2 py-1 text-sm rounded border dark:bg-gray-800 dark:border-gray-600"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="New task..."
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded"
        >
          {editing ? 'Update' : 'Add'}
        </button>
      </div>
      <div className="overflow-y-auto" role="list">
        <AnimatePresence>
          {tasks.map(task => (
            <SortableCard
              key={task.id}
              task={task}
              onEdit={(t) => {
                setEditing(t)
                setInput(t.text)
              }}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

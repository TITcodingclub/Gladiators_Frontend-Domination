import { useDroppable } from '@dnd-kit/core'
import PrepItem from './PrepItem'

export default function Column({ id, title, items }) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2">
      <h2 className="font-semibold text-lg text-green-600">{title}</h2>
      {items.map((item) => (
        <PrepItem key={item} id={item} />
      ))}
    </div>
  )
}

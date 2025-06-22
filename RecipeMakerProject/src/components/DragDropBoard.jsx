export default function DragDropBoard() {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <h2 className="font-semibold mb-2">Prep Tasks</h2>
      {/* TODO: integrate @dnd-kit here */}
      <div className="h-32 flex items-center justify-center text-gray-400">Drag‑drop board</div>
    </div>
  )
}

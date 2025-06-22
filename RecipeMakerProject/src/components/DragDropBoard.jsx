import { DndContext, closestCenter } from '@dnd-kit/core'

import { useState } from 'react'

import Column from './PrepColumn'



const initialData = {

  todo: ['Chop onions', 'Wash tomatoes', 'Peel garlic'],

  prepped: [],

  cooking: [],

}



export default function DragDropBoard() {

  const [tasks, setTasks] = useState(initialData)



  const handleDragEnd = (event) => {

    const { active, over } = event

    if (!over || active.id === over.id) return



    const sourceColumn = Object.keys(tasks).find((col) =>

      tasks[col].includes(active.id)

    )

    const destinationColumn = over.id



    if (sourceColumn && destinationColumn && sourceColumn !== destinationColumn) {

      setTasks(prev => {

        const sourceList = [...prev[sourceColumn]].filter(item => item !== active.id)

        const destinationList = [...prev[destinationColumn], active.id]

        return { ...prev, [sourceColumn]: sourceList, [destinationColumn]: destinationList }

      })

    }

  }



  return (

    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

        <Column id="todo" title="To Prep" items={tasks.todo} />

        <Column id="prepped" title="Prepped" items={tasks.prepped} />

        <Column id="cooking" title="Cooking" items={tasks.cooking} />

      </div>

    </DndContext>

  )

}
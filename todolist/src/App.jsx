import { useMemo, useRef, useState } from 'react'
import './App.css'

function App() {
  const [taskInput, setTaskInput] = useState('')
  const [tasks, setTasks] = useState([
    { id: crypto.randomUUID(), text: 'Prepare slides' },
    { id: crypto.randomUUID(), text: 'Write demo tasks' },
    { id: crypto.randomUUID(), text: 'Practice drag & drop' },
  ])

  const inputRef = useRef(null)
  const draggingIdRef = useRef(null)

  const isAddDisabled = useMemo(() => taskInput.trim().length === 0, [taskInput])

  function handleAddTask() {
    const value = taskInput.trim()
    if (!value) return
    setTasks(prev => [{ id: crypto.randomUUID(), text: value }, ...prev])
    setTaskInput('')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function handleDeleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function swapTasks(sourceId, targetId) {
    if (sourceId === targetId) return
    setTasks(prev => {
      const srcIndex = prev.findIndex(t => t.id === sourceId)
      const tgtIndex = prev.findIndex(t => t.id === targetId)
      if (srcIndex === -1 || tgtIndex === -1) return prev
      const next = [...prev]
      const tmp = next[srcIndex]
      next[srcIndex] = next[tgtIndex]
      next[tgtIndex] = tmp
      return next
    })
  }

  function onDragStart(e, id) {
    draggingIdRef.current = id
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  function onDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function onDrop(e, targetId) {
    e.preventDefault()
    const sourceId = draggingIdRef.current || e.dataTransfer.getData('text/plain')
    swapTasks(sourceId, targetId)
    draggingIdRef.current = null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
        <header className="flex items-baseline justify-between gap-3 mb-4">
          <h1 className="text-2xl tracking-tight">To‑Do List</h1>
          <p className="text-slate-400 text-sm">Add, delete, and drag to reorder</p>
        </header>

        <div className="flex gap-3 my-4">
          <input
            ref={inputRef}
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-slate-100 placeholder-slate-400 outline-none focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/20"
            placeholder="Add a new task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask()
            }}
            aria-label="Task input"
          />
          <button className="px-4 py-3 rounded-xl border border-cyan-300/40 bg-gradient-to-br from-cyan-400/20 to-violet-400/20 text-slate-100 transition hover:brightness-110 hover:-translate-y-px disabled:opacity-50" onClick={handleAddTask} disabled={isAddDisabled}>Add</button>
        </div>

        <ul className="list-none p-0 m-0 flex flex-col gap-2" onDragOver={onDragOver}>
          {tasks.map((task) => (
            <li
              key={task.id}
              className="grid [grid-template-columns:28px_1fr_auto] items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl transition hover:bg-white/10 hover:border-cyan-300/30 hover:shadow-lg active:[transform:scale(0.995)]"
              draggable
              onDragStart={(e) => onDragStart(e, task.id)}
              onDrop={(e) => onDrop(e, task.id)}
            >
              <span className="text-slate-400 text-lg select-none cursor-grab active:cursor-grabbing" aria-hidden>⋮⋮</span>
              <span className="truncate">{task.text}</span>
              <button className="border border-rose-400/40 bg-rose-400/20 text-rose-100 rounded-xl px-3 py-2 transition hover:brightness-110 hover:-translate-y-px" onClick={() => handleDeleteTask(task.id)} aria-label={`Delete ${task.text}`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App

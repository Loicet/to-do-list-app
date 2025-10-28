import { useMemo, useRef, useState } from 'react'
import './App.css'

function App() {
  const [taskInput, setTaskInput] = useState('')
  const [availableTasks, setAvailableTasks] = useState([
    { id: crypto.randomUUID(), text: 'Prepare slides' },
    { id: crypto.randomUUID(), text: 'Write demo tasks' },
    { id: crypto.randomUUID(), text: 'Practice drag & drop' },
    { id: crypto.randomUUID(), text: 'Review code' },
    { id: crypto.randomUUID(), text: 'Update documentation' },
  ])
  const [completedTasks, setCompletedTasks] = useState([
    { id: crypto.randomUUID(), text: 'Setup project' },
  ])

  const inputRef = useRef(null)
  const draggingIdRef = useRef(null)
  const [draggedOver, setDraggedOver] = useState(null)

  const isAddDisabled = useMemo(() => taskInput.trim().length === 0, [taskInput])

  function handleAddTask() {
    const value = taskInput.trim()
    if (!value) return
    setAvailableTasks(prev => [{ id: crypto.randomUUID(), text: value }, ...prev])
    setTaskInput('')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function handleDeleteTask(id, fromCompleted = false) {
    if (fromCompleted) {
      setCompletedTasks(prev => prev.filter(t => t.id !== id))
    } else {
      setAvailableTasks(prev => prev.filter(t => t.id !== id))
    }
  }

  function moveTaskToCompleted(taskId) {
    const task = availableTasks.find(t => t.id === taskId)
    if (task) {
      setAvailableTasks(prev => prev.filter(t => t.id !== taskId))
      setCompletedTasks(prev => [task, ...prev])
    }
  }

  function moveTaskToAvailable(taskId) {
    const task = completedTasks.find(t => t.id === taskId)
    if (task) {
      setCompletedTasks(prev => prev.filter(t => t.id !== taskId))
      setAvailableTasks(prev => [task, ...prev])
    }
  }

  function swapTasks(sourceId, targetId, listType) {
    if (sourceId === targetId) return
    
    if (listType === 'available') {
      setAvailableTasks(prev => {
        const srcIndex = prev.findIndex(t => t.id === sourceId)
        const tgtIndex = prev.findIndex(t => t.id === targetId)
        if (srcIndex === -1 || tgtIndex === -1) return prev
        const next = [...prev]
        const tmp = next[srcIndex]
        next[srcIndex] = next[tgtIndex]
        next[tgtIndex] = tmp
        return next
      })
    } else if (listType === 'completed') {
      setCompletedTasks(prev => {
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
  }

  function onDragStart(e, id) {
    draggingIdRef.current = id
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    e.target.style.opacity = '0.5'
  }

  function onDragEnd(e) {
    e.target.style.opacity = '1'
    draggingIdRef.current = null
    setDraggedOver(null)
  }

  function onDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function onDrop(e, targetId, listType) {
    e.preventDefault()
    const sourceId = draggingIdRef.current || e.dataTransfer.getData('text/plain')
    
    // Check if dropping on a drop zone
    if (targetId === 'completed-zone') {
      moveTaskToCompleted(sourceId)
    } else if (targetId === 'available-zone') {
      moveTaskToAvailable(sourceId)
    } else {
      // Regular task-to-task swap within the same list
      swapTasks(sourceId, targetId, listType)
    }
    
    draggingIdRef.current = null
    setDraggedOver(null)
  }

  function onDragEnter(e, zoneId) {
    e.preventDefault()
    setDraggedOver(zoneId)
  }

  function onDragLeave(e) {
    e.preventDefault()
    setDraggedOver(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-950 to-pink-700 bg-clip-text text-transparent mb-2">
            To-Do Tasks Manager
          </h1>
          <p className="text-slate-100 text-lg">Drag tasks between zones to organize your workflow</p>
        </header>

        {/* Add Task Section */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-slate-100 placeholder-slate-400 outline-none focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/20 transition-all"
              placeholder="Add a new task..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask()
              }}
              aria-label="Task input"
            />
            <button 
              className="px-6 py-3 rounded-xl border border-cyan-300/40 bg-gradient-to-br from-cyan-400/20 to-violet-400/20 text-slate-100 transition-all hover:brightness-110 hover:-translate-y-px hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handleAddTask} 
              disabled={isAddDisabled}
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Main Drag and Drop Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Tasks Section */}
          <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-cyan-400">Available Tasks</h2>
              <span className="bg-cyan-400/20 text-cyan-300 px-2 py-1 rounded-full text-sm">
                {availableTasks.length}
              </span>
            </div>

            {/* Drop Zone for Completed Tasks */}
            <div 
              className={`mb-4 p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
                draggedOver === 'completed-zone' 
                  ? 'border-green-400 bg-green-400/10 scale-105' 
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onDragOver={onDragOver}
              onDragEnter={(e) => onDragEnter(e, 'completed-zone')}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, 'completed-zone')}
            >
              <div className="text-center text-slate-400">
                <div className="text-2xl mb-2"></div>
                <p className="font-medium">Drop here to complete</p>
                <p className="text-sm opacity-75">Drag tasks from completed section</p>
              </div>
            </div>

            {/* Available Tasks List */}
            <div className="space-y-2" onDragOver={onDragOver}>
              {availableTasks.map((task) => (
                <div
                  key={task.id}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-white/10 rounded-xl transition-all hover:bg-gradient-to-r hover:from-cyan-900/30 hover:to-blue-900/30 hover:border-cyan-300/30 hover:shadow-lg hover:-translate-y-1"
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  onDragEnd={onDragEnd}
                  onDrop={(e) => onDrop(e, task.id, 'available')}
                >
                  <span className="text-slate-400 text-lg select-none cursor-grab active:cursor-grabbing group-hover:text-cyan-300 transition-colors" aria-hidden>
                    ⋮⋮
                  </span>
                  <span className="truncate text-slate-200">{task.text}</span>
                  <button 
                    className="opacity-0 group-hover:opacity-100 border border-rose-400/40 bg-rose-400/20 text-rose-100 rounded-lg px-3 py-1 transition-all hover:brightness-110 hover:scale-105" 
                    onClick={() => handleDeleteTask(task.id, false)} 
                    aria-label={`Delete ${task.text}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Tasks Section */}
          <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-green-400">Completed Tasks</h2>
              <span className="bg-green-400/20 text-green-300 px-2 py-1 rounded-full text-sm">
                {completedTasks.length}
              </span>
            </div>

            {/* Drop Zone for Available Tasks */}
            <div 
              className={`mb-4 p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
                draggedOver === 'available-zone' 
                  ? 'border-blue-400 bg-blue-400/10 scale-105' 
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onDragOver={onDragOver}
              onDragEnter={(e) => onDragEnter(e, 'available-zone')}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, 'available-zone')}
            >
              <div className="text-center text-slate-400">
                <div className="text-2xl mb-2"></div>
                <p className="font-medium">Drop here to make available</p>
                <p className="text-sm opacity-75">Drag tasks from available section</p>
              </div>
            </div>

            {/* Completed Tasks List */}
            <div className="space-y-2" onDragOver={onDragOver}>
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-white/10 rounded-xl transition-all hover:bg-gradient-to-r hover:from-green-900/30 hover:to-emerald-900/30 hover:border-green-300/30 hover:shadow-lg hover:-translate-y-1 opacity-75"
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  onDragEnd={onDragEnd}
                  onDrop={(e) => onDrop(e, task.id, 'completed')}
                >
                  <span className="text-slate-400 text-lg select-none cursor-grab active:cursor-grabbing group-hover:text-green-300 transition-colors" aria-hidden>
                    ⋮⋮
                  </span>
                  <span className="truncate text-slate-300 line-through">{task.text}</span>
                  <button 
                    className="opacity-0 group-hover:opacity-100 border border-rose-400/40 bg-rose-400/20 text-rose-100 rounded-lg px-3 py-1 transition-all hover:brightness-110 hover:scale-105" 
                    onClick={() => handleDeleteTask(task.id, true)} 
                    aria-label={`Delete ${task.text}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-8 text-center text-slate-100">
          <p>Total: {availableTasks.length + completedTasks.length} tasks • Available: {availableTasks.length} • Completed: {completedTasks.length}</p>
        </div>
      </div>
    </div>
  )
}

export default App

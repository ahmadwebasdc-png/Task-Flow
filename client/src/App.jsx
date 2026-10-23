
import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api/tasks'

function App() {
  const [tasks, setTasks] = useState([])
  const [taskInput, setTaskInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Could not load tasks')
        }

        const data = await response.json()
        setTasks(data)
      } catch (err) {
        setError('Unable to connect to the backend. Check your server.')
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  async function addTask(e) {
    e.preventDefault()

    const title = taskInput.trim()
    if (!title) return

    try {
      setError('')

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      })

      if (!response.ok) {
        throw new Error('Could not add task')
      }

      const newTask = await response.json()
      setTasks((currentTasks) => [...currentTasks, newTask])
      setTaskInput('')
    } catch (err) {
      setError(err.message || 'Unable to add task')
    }
  }

  async function toggleTask(id) {
    const task = tasks.find((item) => item.id === id)
    if (!task) return

    try {
      setError('')

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completed: !task.completed
        })
      })

      if (!response.ok) {
        throw new Error('Could not update task')
      }

      const updatedTask = await response.json()

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === id ? updatedTask : item
        )
      )
    } catch (err) {
      setError(err.message || 'Unable to update task')
    }
  }

  async function deleteTask(id) {
    try {
      setError('')

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Could not delete task')
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      )
    } catch (err) {
      setError(err.message || 'Unable to delete task')
    }
  }

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length

  return (
    <main className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-icon">T</span>
          <span>TaskFlow</span>
        </div>
        <span className="header-label">MY WORKSPACE</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">YOUR PERSONAL TASK MANAGER</p>
        <h1>Make today <span>count.</span></h1>
        <p className="subtitle">
          Organize your tasks, focus on what matters, and get things done.
        </p>
      </section>

      <section className="task-panel">
        <div className="panel-heading">
          <div>
            <h2>My tasks</h2>
            <p>A little progress every day adds up.</p>
          </div>
          <div className="task-count">
            {tasks.length} {tasks.length === 1 ? 'TASK' : 'TASKS'}
          </div>
        </div>

        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="What needs to get done?"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            aria-label="New task"
          />
          <button type="submit">+ Add task</button>
        </form>

        {error && <p role="alert">{error}</p>}

        <div className="progress-info">
          <span>YOUR PROGRESS</span>
          <span>{completedCount} of {tasks.length} completed</span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: tasks.length
                ? `${(completedCount / tasks.length) * 100}%`
                : '0%'
            }}
          />
        </div>

        <div className="task-list">
          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>Your space to get things done</h3>
              <p>Add your first task above to get started.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div className="task-item" key={task.id}>
                <label className="task-details">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className={task.completed ? 'completed' : ''}>
                    {task.title}
                  </span>
                </label>

                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete ${task.title}`}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <footer>
        Built with React. One task at a time.
      </footer>
    </main>
  )
}

export default App

import { useMemo, useState } from 'react'
import { lessons } from './lessons'
import './App.css'

function App() {
  const [activeLessonId, setActiveLessonId] = useState(lessons[0].id)
  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0],
    [activeLessonId],
  )
  const ActiveComponent = activeLesson.Component

  return (
    <div className="app">
      <header className="top">
        <h1>React Beginner Course Workspace</h1>
        <p>
          Original practice project covering the same beginner topics from the
          course flow.
        </p>
      </header>

      <aside className="lesson-nav">
        {lessons.map((lesson, index) => (
          <button
            key={lesson.id}
            className={lesson.id === activeLessonId ? 'active' : ''}
            onClick={() => setActiveLessonId(lesson.id)}
          >
            {index + 1}. {lesson.title}
          </button>
        ))}
      </aside>

      <main className="lesson-stage">
        <h2>{activeLesson.title}</h2>
        <p className="lesson-description">{activeLesson.description}</p>
        <section className="demo-card">
          <ActiveComponent />
        </section>
      </main>
    </div>
  )
}

export default App

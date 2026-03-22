import { createContext, useContext, useEffect, useRef, useState } from 'react'

function CardComponentsLesson() {
  const cards = [
    { id: 1, title: 'Learn JSX', text: 'Combine JavaScript and HTML-like syntax.' },
    { id: 2, title: 'Use Components', text: 'Split UI into reusable pieces.' },
    { id: 3, title: 'Manage State', text: 'React to user actions and updates.' },
  ]

  return (
    <div className="grid">
      {cards.map((card) => (
        <article key={card.id} className="simple-card">
          <h3>{card.title}</h3>
          <p>{card.text}</p>
        </article>
      ))}
    </div>
  )
}

function StylesLesson() {
  return (
    <div className="stack">
      <p>This box uses app-level CSS classes.</p>
      <div className="pill">Styled with className</div>
      <div style={{ background: '#2563eb', color: '#fff' }} className="pill">
        Styled with inline style
      </div>
    </div>
  )
}

function ProfileCard({ name = 'Guest User', skill = 'React basics' }) {
  return (
    <article className="simple-card">
      <h3>{name}</h3>
      <p>Learning: {skill}</p>
    </article>
  )
}

function PropsLesson() {
  return (
    <div className="grid">
      <ProfileCard name="Anita" skill="Components and props" />
      <ProfileCard name="Ravi" skill="Hooks and events" />
      <ProfileCard />
    </div>
  )
}

function ConditionalRenderingLesson() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div className="stack">
      <button onClick={() => setIsLoggedIn((prev) => !prev)}>
        {isLoggedIn ? 'Log out' : 'Log in'}
      </button>
      <p>{isLoggedIn ? 'Welcome back! You can view your dashboard.' : 'Please log in to continue.'}</p>
    </div>
  )
}

function RenderListsLesson() {
  const skills = ['JSX', 'Props', 'State', 'Effects', 'Context']
  return (
    <ul>
      {skills.map((skill) => (
        <li key={skill}>{skill}</li>
      ))}
    </ul>
  )
}

function ClickEventsLesson() {
  const [message, setMessage] = useState('Click a button')
  return (
    <div className="stack">
      <div className="row">
        <button onClick={() => setMessage('Primary action clicked')}>Primary</button>
        <button onClick={() => setMessage('Secondary action clicked')}>Secondary</button>
      </div>
      <p>{message}</p>
    </div>
  )
}

function UseStateLesson() {
  const [count, setCount] = useState(0)
  return (
    <div className="stack">
      <p>Count: {count}</p>
      <div className="row">
        <button onClick={() => setCount((prev) => prev - 1)}>-</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount((prev) => prev + 1)}>+</button>
      </div>
    </div>
  )
}

function OnChangeLesson() {
  const [form, setForm] = useState({ name: '', topic: 'useState' })
  return (
    <div className="stack">
      <input
        placeholder="Your name"
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
      />
      <select
        value={form.topic}
        onChange={(event) => setForm((prev) => ({ ...prev, topic: event.target.value }))}
      >
        <option value="useState">useState</option>
        <option value="useEffect">useEffect</option>
        <option value="useContext">useContext</option>
      </select>
      <p>
        {form.name || 'Student'} selected <strong>{form.topic}</strong>.
      </p>
    </div>
  )
}

function ColorPickerLesson() {
  const [color, setColor] = useState('#22c55e')
  return (
    <div className="stack">
      <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
      <div className="color-box" style={{ background: color }}>
        {color}
      </div>
    </div>
  )
}

function UpdaterFunctionsLesson() {
  const [points, setPoints] = useState(0)
  return (
    <div className="stack">
      <p>Points: {points}</p>
      <div className="row">
        <button onClick={() => setPoints((prev) => prev + 1)}>+1</button>
        <button onClick={() => setPoints((prev) => prev + 5)}>+5</button>
      </div>
    </div>
  )
}

function ObjectStateLesson() {
  const [car, setCar] = useState({ brand: 'Tesla', model: 'Model 3', year: 2024 })
  return (
    <div className="stack">
      <p>
        {car.brand} {car.model} ({car.year})
      </p>
      <button onClick={() => setCar((prev) => ({ ...prev, year: prev.year + 1 }))}>
        Next model year
      </button>
    </div>
  )
}

function ArrayStateLesson() {
  const [items, setItems] = useState(['Apple', 'Banana', 'Orange'])
  const [newItem, setNewItem] = useState('')

  return (
    <div className="stack">
      <div className="row">
        <input value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="Add fruit" />
        <button
          onClick={() => {
            if (!newItem.trim()) return
            setItems((prev) => [...prev, newItem.trim()])
            setNewItem('')
          }}
        >
          Add
        </button>
      </div>
      <ul>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function ArrayOfObjectsLesson() {
  const [students, setStudents] = useState([
    { id: 1, name: 'Asha', score: 82 },
    { id: 2, name: 'Vikram', score: 91 },
  ])

  return (
    <div className="stack">
      <button
        onClick={() =>
          setStudents((prev) => [
            ...prev,
            {
              id: Date.now(),
              name: `Student ${prev.length + 1}`,
              score: 70 + prev.length,
            },
          ])
        }
      >
        Add student
      </button>
      <ul>
        {students.map((student) => (
          <li key={student.id}>
            {student.name}: {student.score}
          </li>
        ))}
      </ul>
    </div>
  )
}

function TodoListLesson() {
  const [todos, setTodos] = useState([{ id: 1, text: 'Study hooks', done: false }])
  const [text, setText] = useState('')

  const addTodo = () => {
    if (!text.trim()) return
    setTodos((prev) => [...prev, { id: Date.now(), text: text.trim(), done: false }])
    setText('')
  }

  return (
    <div className="stack">
      <div className="row">
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="New task" />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() =>
                  setTodos((prev) =>
                    prev.map((item) => (item.id === todo.id ? { ...item, done: !item.done } : item)),
                  )
                }
              />
              <span className={todo.done ? 'line-through' : ''}>{todo.text}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

function UseEffectLesson() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return <p>Component has been active for {seconds} seconds.</p>
}

function DigitalClockLesson() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return <h3>{now.toLocaleTimeString()}</h3>
}

const ThemeContext = createContext()

function Toolbar() {
  const { dark, setDark } = useContext(ThemeContext)
  return (
    <div className="stack">
      <p>Current theme: {dark ? 'Dark' : 'Light'}</p>
      <button onClick={() => setDark((prev) => !prev)}>Toggle theme</button>
    </div>
  )
}

function UseContextLesson() {
  const [dark, setDark] = useState(false)
  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      <div className={dark ? 'theme-dark demo-block' : 'theme-light demo-block'}>
        <Toolbar />
      </div>
    </ThemeContext.Provider>
  )
}

function UseRefLesson() {
  const inputRef = useRef(null)
  const renderCount = useRef(0)
  const [value, setValue] = useState('')
  renderCount.current += 1

  return (
    <div className="stack">
      <button onClick={() => inputRef.current?.focus()}>Focus input</button>
      <input ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} />
      <p>Render count tracked by ref: {renderCount.current}</p>
    </div>
  )
}

function StopwatchLesson() {
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return undefined
    const id = setInterval(() => setTime((prev) => prev + 0.1), 100)
    return () => clearInterval(id)
  }, [running])

  return (
    <div className="stack">
      <h3>{time.toFixed(1)}s</h3>
      <div className="row">
        <button onClick={() => setRunning(true)}>Start</button>
        <button onClick={() => setRunning(false)}>Stop</button>
        <button
          onClick={() => {
            setRunning(false)
            setTime(0)
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export const lessons = [
  {
    id: 'card-components',
    title: 'Card Components',
    description: 'Render reusable UI blocks from an array.',
    Component: CardComponentsLesson,
  },
  {
    id: 'styles',
    title: 'Add CSS Styles',
    description: 'Compare class-based and inline styles.',
    Component: StylesLesson,
  },
  {
    id: 'props',
    title: 'Props and Defaults',
    description: 'Pass data to components with default values.',
    Component: PropsLesson,
  },
  {
    id: 'conditional-rendering',
    title: 'Conditional Rendering',
    description: 'Show different UI based on state.',
    Component: ConditionalRenderingLesson,
  },
  {
    id: 'render-lists',
    title: 'Render Lists',
    description: 'Map arrays into dynamic JSX lists.',
    Component: RenderListsLesson,
  },
  {
    id: 'click-events',
    title: 'Click Events',
    description: 'Handle button clicks and event-driven changes.',
    Component: ClickEventsLesson,
  },
  {
    id: 'use-state',
    title: 'useState Hook',
    description: 'Store and update component state.',
    Component: UseStateLesson,
  },
  {
    id: 'on-change',
    title: 'onChange Handler',
    description: 'Build controlled input and select fields.',
    Component: OnChangeLesson,
  },
  {
    id: 'color-picker',
    title: 'Color Picker App',
    description: 'Create a mini app using controlled color input.',
    Component: ColorPickerLesson,
  },
  {
    id: 'updater-functions',
    title: 'Updater Functions',
    description: 'Update state safely from previous state values.',
    Component: UpdaterFunctionsLesson,
  },
  {
    id: 'object-state',
    title: 'Update Objects in State',
    description: 'Use spread syntax to update nested object fields.',
    Component: ObjectStateLesson,
  },
  {
    id: 'array-state',
    title: 'Update Arrays in State',
    description: 'Append new items to an array state value.',
    Component: ArrayStateLesson,
  },
  {
    id: 'array-of-objects',
    title: 'Update Array of Objects',
    description: 'Manage list data with object entries and ids.',
    Component: ArrayOfObjectsLesson,
  },
  {
    id: 'todo-list',
    title: 'Todo List App',
    description: 'Build a complete list with add and toggle actions.',
    Component: TodoListLesson,
  },
  {
    id: 'use-effect',
    title: 'useEffect Hook',
    description: 'Run side effects and cleanup timers.',
    Component: UseEffectLesson,
  },
  {
    id: 'digital-clock',
    title: 'Digital Clock App',
    description: 'Keep UI in sync with real time using effects.',
    Component: DigitalClockLesson,
  },
  {
    id: 'use-context',
    title: 'useContext Hook',
    description: 'Share theme state through context provider.',
    Component: UseContextLesson,
  },
  {
    id: 'use-ref',
    title: 'useRef Hook',
    description: 'Access DOM elements and persist mutable values.',
    Component: UseRefLesson,
  },
  {
    id: 'stopwatch',
    title: 'Stopwatch App',
    description: 'Track elapsed time with start, stop, and reset.',
    Component: StopwatchLesson,
  },
]

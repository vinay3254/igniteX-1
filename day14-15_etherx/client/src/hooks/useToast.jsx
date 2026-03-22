import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext({ showToast: () => {} })

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('')
  const [type, setType] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const showToast = useCallback((message, toastType = 'default') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMsg(message)
    setType(toastType)
    setVisible(true)
    timerRef.current = setTimeout(() => setVisible(false), 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`toast ${visible ? 'show' : ''} ${type !== 'default' ? type : ''}`}>
        {msg}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

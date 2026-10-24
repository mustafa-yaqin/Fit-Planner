// Like useState, but the value is also saved in localStorage (stays after reload / offline).
import { useEffect, useState } from 'react'

export default function useStored(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      return
    }
  }, [key, value])

  return [value, setValue]
}

import { createContext, useContext, useState } from 'react'
import { INITIAL_ATTRIBUTES } from '../data/mockAttributes'

const AttributesContext = createContext(null)

// Single shared attribute list for the whole CMS — mounted once in AppShell
// so both /attributes and Competitor Pricing's Spec Matching tab read and
// write the same state, and edits made in either place show up in the other.
export function AttributesProvider({ children }) {
  const [attributes, setAttributes] = useState(INITIAL_ATTRIBUTES)

  const addAttribute = (attr) => {
    const newAttr = { ...attr, id: Date.now() }
    setAttributes(prev => [...prev, newAttr])
    return newAttr
  }

  const updateAttribute = (id, patch) => {
    setAttributes(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)))
  }

  const deleteAttribute = (id) => {
    setAttributes(prev => prev.filter(a => a.id !== id))
  }

  const addValue = (id, value) => {
    setAttributes(prev => prev.map(a => (a.id === id && !a.values.includes(value) ? { ...a, values: [...a.values, value] } : a)))
  }

  const removeValue = (id, value) => {
    setAttributes(prev => prev.map(a => (a.id === id ? { ...a, values: a.values.filter(v => v !== value) } : a)))
  }

  return (
    <AttributesContext.Provider value={{ attributes, setAttributes, addAttribute, updateAttribute, deleteAttribute, addValue, removeValue }}>
      {children}
    </AttributesContext.Provider>
  )
}

export function useAttributes() {
  const ctx = useContext(AttributesContext)
  if (!ctx) throw new Error('useAttributes must be used within AttributesProvider')
  return ctx
}

import { createContext, useContext, useState } from 'react'
import { INITIAL_COST_VARIABLES } from '../data/mockCostVariables'

const CostVariablesContext = createContext(null)

// Shared, editable cost variable rate card — mounted once in AppShell so any
// page referencing packaging/material/labour rates (Cost Variables page,
// Product Cost tab, etc.) reads and writes the same state.
export function CostVariablesProvider({ children }) {
  const [costVariables, setCostVariables] = useState(INITIAL_COST_VARIABLES)

  const addCostVariable = (variable) => {
    const newVariable = { ...variable, id: Date.now() }
    setCostVariables(prev => [...prev, newVariable])
    return newVariable
  }

  const updateCostVariable = (id, patch) => {
    setCostVariables(prev => prev.map(v => (v.id === id ? { ...v, ...patch } : v)))
  }

  const deleteCostVariable = (id) => {
    setCostVariables(prev => prev.filter(v => v.id !== id))
  }

  return (
    <CostVariablesContext.Provider value={{ costVariables, setCostVariables, addCostVariable, updateCostVariable, deleteCostVariable }}>
      {children}
    </CostVariablesContext.Provider>
  )
}

export function useCostVariables() {
  const ctx = useContext(CostVariablesContext)
  if (!ctx) throw new Error('useCostVariables must be used within CostVariablesProvider')
  return ctx
}

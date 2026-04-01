"use client"

import { useState, useEffect, useCallback } from "react"

interface ConfigState {
  configUrl: string | null
  isLoading: boolean
  isConfigured: boolean
}

export function usePiConfig() {
  const [state, setState] = useState<ConfigState>({
    configUrl: null,
    isLoading: true,
    isConfigured: false,
  })

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config/session')
        const data = await response.json()
        
        setState({
          configUrl: data.configUrl,
          isLoading: false,
          isConfigured: !!data.configUrl,
        })
      } catch {
        setState({
          configUrl: null,
          isLoading: false,
          isConfigured: false,
        })
      }
    }
    
    fetchConfig()
  }, [])

  const clearConfig = useCallback(async () => {
    try {
      await fetch('/api/config/session', { method: 'DELETE' })
      setState({
        configUrl: null,
        isLoading: false,
        isConfigured: false,
      })
    } catch (error) {
      console.error('Failed to clear config:', error)
    }
  }, [])

  return {
    ...state,
    clearConfig,
  }
}

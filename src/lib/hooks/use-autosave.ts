"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { SaveState } from "@/components/tracking/save-status"

type SaveFunction<T> = (data: T) => Promise<void>

export function useAutosave<T>(saveFn: SaveFunction<T>, delay = 400) {
  const [saveStatus, setSaveStatus] = useState<SaveState>("saved")
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingDataRef = useRef<T | null>(null)
  const isSavingRef = useRef(false)

  // Listen for online/offline events
  useEffect(() => {
    function handleOnline() {
      if (pendingDataRef.current) {
        triggerSave(pendingDataRef.current)
      } else {
        setSaveStatus("saved")
      }
    }
    function handleOffline() {
      setSaveStatus("offline")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const triggerSave = useCallback(
    async (data: T) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setSaveStatus("offline")
        return
      }

      setSaveStatus("saving")
      isSavingRef.current = true

      try {
        await saveFn(data)
        setSaveStatus("saved")
        pendingDataRef.current = null
      } catch (err) {
        console.error("Autosave failed:", err)
        setSaveStatus("failed")
      } finally {
        isSavingRef.current = false
      }
    },
    [saveFn]
  )

  const scheduleSave = useCallback(
    (data: T, customDelay = delay) => {
      pendingDataRef.current = data

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        triggerSave(data)
      }, customDelay)
    },
    [delay, triggerSave]
  )

  const retry = useCallback(() => {
    if (pendingDataRef.current) {
      triggerSave(pendingDataRef.current)
    }
  }, [triggerSave])

  return {
    saveStatus,
    scheduleSave,
    retry,
    isSaving: isSavingRef.current,
  }
}

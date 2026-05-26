import type React from 'react'

export type DeviceStatus = 'active' | 'idle' | 'warning' | 'error' | 'offline'

export interface DeviceBase {
  id: string
  label: string
  parentId: string | null
  status: DeviceStatus
  codiceStato?: string
  codiceErrori?: string[]
}

export interface DeviceMeta {
  id: string
  label: string
  parentId: string | null
  icon?: React.ComponentType<{ className?: string }>
  meshNames?: string[]
  status?: DeviceStatus
  /**
   * Pure organisational containers (e.g. Baie, Impianti, Sicurezza) are
   * not selectable on their own — they only group the actual devices.
   * Defaults to true; set to false on group rows that have no state of
   * their own. Tree rows with selectable=false ignore selection clicks
   * and just toggle expand/collapse instead.
   */
  selectable?: boolean
  /**
   * False when the device has no state to display in the right panel —
   * e.g. Tool stand only has commands, so selecting it shows the bottom
   * toolbar but no panel. Defaults to true.
   */
  hasData?: boolean
  /**
   * False when the device has no commands — e.g. Vassoio, Fotocellule,
   * Elettroserrature are read-only. Defaults to true.
   */
  hasCommands?: boolean
}

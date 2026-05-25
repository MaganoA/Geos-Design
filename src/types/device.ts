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
}

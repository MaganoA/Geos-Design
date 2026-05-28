export type Role = 'operatore' | 'admin' | 'superadmin'

export interface CommandCtx {
  deviceId: string
  role: Role
  mode: 'auto' | 'manuale'
  /**
   * Numeric value supplied by a `requiresValueInput` command after the
   * operator confirms the NumberInputDialog. Undefined otherwise.
   */
  value?: number
}

/**
 * Numeric setpoint entry for commands that need a value (gripper angle,
 * UV intensity %). When present, CommandButton renders a NumberInputDialog
 * instead of a plain AlertDialog confirm; the confirmed value flows into
 * the handler via CommandCtx.value.
 */
export interface CommandValueInput {
  min: number
  max: number
  step?: number
  unit?: string
  /**
   * Reads the current value from the device state to pre-populate the
   * dialog. Receives the full state slice for the command's device.
   */
  initial?: (state: unknown) => number
}

export interface Command {
  id: string
  label: string
  description?: string
  requiredRole: Role
  requiresConfirm?: boolean
  requiresValueInput?: CommandValueInput
  destructive?: boolean
  guidedProcedure?: boolean
  hotkey?: string
  manualOnly?: boolean
  handler: (ctx: CommandCtx) => Promise<void> | void
}

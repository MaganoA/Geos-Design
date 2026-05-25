export type Role = 'operatore' | 'admin' | 'superadmin'

export interface CommandCtx {
  deviceId: string
  role: Role
  mode: 'auto' | 'manuale'
}

export interface Command {
  id: string
  label: string
  description?: string
  requiredRole: Role
  requiresConfirm?: boolean
  destructive?: boolean
  guidedProcedure?: boolean
  hotkey?: string
  manualOnly?: boolean
  handler: (ctx: CommandCtx) => Promise<void> | void
}

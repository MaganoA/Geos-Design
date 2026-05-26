import type React from 'react'
import * as _stubMeta from './_stub/meta'
import * as portaleMeta from './portale/meta'
import * as portaleTesta1Meta from './portale-testa-1/meta'
import * as portaleTesta2Meta from './portale-testa-2/meta'
import * as dispenserMeta from './dispenser-distanziali/meta'
import * as robotMeta from './robot/meta'
import * as baiaGrezziMeta from './baia-grezzi/meta'
import * as baiaLavoratiMeta from './baia-lavorati/meta'
import * as piano1Meta from './piano-aspirato-1/meta'
import * as piano2Meta from './piano-aspirato-2/meta'
import * as speedMeta from './speed/meta'
import * as vuotoMeta from './impianto-vuoto/meta'
import * as acquaMeta from './impianto-acqua/meta'
import * as ariaMeta from './impianto-aria/meta'
import * as resinaMeta from './erogazione-resina/meta'
import * as sicurezzaMeta from './sicurezza/meta'
import { Panel as StubPanel } from './_stub/panel'
import { Toolbar as StubToolbar } from './_stub/toolbar'
import type { DeviceMeta } from '@/types'

export interface RegisteredDevice {
  meta: DeviceMeta
  Panel: React.ComponentType<{ label: string }>
  Toolbar: React.ComponentType
}

const stubDevice: RegisteredDevice = {
  meta: _stubMeta.meta,
  Panel: StubPanel,
  Toolbar: StubToolbar,
}

const registry: Record<string, RegisteredDevice> = {
  portale:                 { meta: portaleMeta.meta,       Panel: StubPanel, Toolbar: StubToolbar },
  'portale-testa-1':       { meta: portaleTesta1Meta.meta, Panel: StubPanel, Toolbar: StubToolbar },
  'portale-testa-2':       { meta: portaleTesta2Meta.meta, Panel: StubPanel, Toolbar: StubToolbar },
  'dispenser-distanziali': { meta: dispenserMeta.meta,     Panel: StubPanel, Toolbar: StubToolbar },
  robot:                   { meta: robotMeta.meta,         Panel: StubPanel, Toolbar: StubToolbar },
  'baia-grezzi':           { meta: baiaGrezziMeta.meta,    Panel: StubPanel, Toolbar: StubToolbar },
  'baia-lavorati':         { meta: baiaLavoratiMeta.meta,  Panel: StubPanel, Toolbar: StubToolbar },
  'piano-aspirato-1':      { meta: piano1Meta.meta,        Panel: StubPanel, Toolbar: StubToolbar },
  'piano-aspirato-2':      { meta: piano2Meta.meta,        Panel: StubPanel, Toolbar: StubToolbar },
  speed:                   { meta: speedMeta.meta,         Panel: StubPanel, Toolbar: StubToolbar },
  'impianto-vuoto':        { meta: vuotoMeta.meta,         Panel: StubPanel, Toolbar: StubToolbar },
  'impianto-acqua':        { meta: acquaMeta.meta,         Panel: StubPanel, Toolbar: StubToolbar },
  'impianto-aria':         { meta: ariaMeta.meta,          Panel: StubPanel, Toolbar: StubToolbar },
  'erogazione-resina':     { meta: resinaMeta.meta,        Panel: StubPanel, Toolbar: StubToolbar },
  sicurezza:               { meta: sicurezzaMeta.meta,     Panel: StubPanel, Toolbar: StubToolbar },
}

export function getDevice(id: string): RegisteredDevice {
  return registry[id] ?? stubDevice
}

export function allDevices(): RegisteredDevice[] {
  return Object.values(registry)
}

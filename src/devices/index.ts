import type React from 'react'
import * as _stubMeta from './_stub/meta'

// Portale (Teste del portale)
import * as portaleMeta from './portale/meta'
import * as portaleTesta1Meta from './portale-testa-1/meta'
import * as portaleTesta1TenutaMeta from './portale-testa-1-tenuta/meta'
import * as portaleTesta1ErogatoreMeta from './portale-testa-1-erogatore/meta'
import * as portaleTesta2Meta from './portale-testa-2/meta'
import * as portaleTesta2GripperPinMeta from './portale-testa-2-gripper-pin/meta'
import * as portaleTesta2LampadeUvMeta from './portale-testa-2-lampade-uv/meta'

// Robot, Dispenser
import * as robotMeta from './robot/meta'
import * as dispenserMeta from './dispenser-distanziali/meta'

// Tool stand
import * as toolStandMeta from './tool-stand/meta'
import * as toolStandGripperPiccoloMeta from './tool-stand-gripper-piccolo/meta'
import * as toolStandGripperMedioMeta from './tool-stand-gripper-medio/meta'
import * as toolStandGripperGrandeMeta from './tool-stand-gripper-grande/meta'
import * as toolStandGripperDistanzialiMeta from './tool-stand-gripper-distanziali/meta'

// Sistema di erogazione resina
import * as resinaMeta from './erogazione-resina/meta'
import * as resinaSerbatoioMeta from './erogazione-resina-serbatoio/meta'
import * as resinaErogatoreMeta from './erogazione-resina-erogatore/meta'
import * as resinaAlimentatoreMeta from './erogazione-resina-alimentatore-inserti/meta'

// Baie
import * as baieMeta from './baie/meta'
import * as baiaGrezziMeta from './baia-grezzi/meta'
import * as baiaGrezziVassoioMeta from './baia-grezzi-vassoio/meta'
import * as baiaGrezziFotocelluleMeta from './baia-grezzi-fotocellule/meta'
import * as baiaGrezziTastatoreMeta from './baia-grezzi-tastatore/meta'
import * as baiaLavoratiMeta from './baia-lavorati/meta'
import * as baiaLavoratiVassoioMeta from './baia-lavorati-vassoio/meta'

// Piani aspirati
import * as pianiAspiratiMeta from './piani-aspirati/meta'
import * as piano1Meta from './piano-aspirato-1/meta'
import * as piano2Meta from './piano-aspirato-2/meta'

// Speed
import * as speedMeta from './speed/meta'
import * as speedSoffiatoreMeta from './speed-soffiatore/meta'
import * as speedBarraMeta from './speed-barra-lavaggio/meta'

// Impianti
import * as impiantiMeta from './impianti/meta'
import * as vuotoMeta from './impianto-vuoto/meta'
import * as acquaMeta from './impianto-acqua/meta'
import * as ariaMeta from './impianto-aria/meta'

// Sicurezza
import * as sicurezzaMeta from './sicurezza/meta'
import * as elettroserratureMeta from './sicurezza-elettroserrature/meta'

import { Panel as StubPanel } from './_stub/panel'
import { Toolbar as StubToolbar } from './_stub/toolbar'
import { Panel as PortaleTesta1Panel } from './portale-testa-1/panel'
import { Toolbar as PortaleTesta1Toolbar } from './portale-testa-1/toolbar'
import { Panel as PortaleTesta1TenutaPanel } from './portale-testa-1-tenuta/panel'
import { Toolbar as PortaleTesta1TenutaToolbar } from './portale-testa-1-tenuta/toolbar'
import { Panel as PortaleTesta1ErogatorePanel } from './portale-testa-1-erogatore/panel'
import { Toolbar as PortaleTesta1ErogatoreToolbar } from './portale-testa-1-erogatore/toolbar'
import { Panel as PortaleTesta2Panel } from './portale-testa-2/panel'
import { Toolbar as PortaleTesta2Toolbar } from './portale-testa-2/toolbar'
import { Panel as PortaleTesta2GripperPinPanel } from './portale-testa-2-gripper-pin/panel'
import { Toolbar as PortaleTesta2GripperPinToolbar } from './portale-testa-2-gripper-pin/toolbar'
import { Panel as PortaleTesta2LampadeUvPanel } from './portale-testa-2-lampade-uv/panel'
import { Toolbar as PortaleTesta2LampadeUvToolbar } from './portale-testa-2-lampade-uv/toolbar'
import { Panel as SpeedPanel } from './speed/panel'
import { Toolbar as SpeedToolbar } from './speed/toolbar'
import { Panel as SpeedSoffiatorePanel } from './speed-soffiatore/panel'
import { Toolbar as SpeedSoffiatoreToolbar } from './speed-soffiatore/toolbar'
import { Panel as SpeedBarraLavaggioPanel } from './speed-barra-lavaggio/panel'
import { Toolbar as SpeedBarraLavaggioToolbar } from './speed-barra-lavaggio/toolbar'
import { Panel as SicurezzaElettroserraturePanel } from './sicurezza-elettroserrature/panel'
import { Panel as PianoAspirato1Panel } from './piano-aspirato-1/panel'
import { Toolbar as PianoAspirato1Toolbar } from './piano-aspirato-1/toolbar'
import { Panel as PianoAspirato2Panel } from './piano-aspirato-2/panel'
import { Toolbar as PianoAspirato2Toolbar } from './piano-aspirato-2/toolbar'
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

function entry(meta: DeviceMeta): RegisteredDevice {
  return { meta, Panel: StubPanel, Toolbar: StubToolbar }
}

const registry: Record<string, RegisteredDevice> = {
  // Portale → Testa 1 / Testa 2
  portale:                       entry(portaleMeta.meta),
  'portale-testa-1': {
    meta: portaleTesta1Meta.meta,
    Panel: PortaleTesta1Panel as React.ComponentType<{ label: string }>,
    Toolbar: PortaleTesta1Toolbar,
  },
  'portale-testa-1-tenuta': {
    meta: portaleTesta1TenutaMeta.meta,
    Panel: PortaleTesta1TenutaPanel as React.ComponentType<{ label: string }>,
    Toolbar: PortaleTesta1TenutaToolbar,
  },
  'portale-testa-1-erogatore': {
    meta: portaleTesta1ErogatoreMeta.meta,
    Panel: PortaleTesta1ErogatorePanel as React.ComponentType<{ label: string }>,
    Toolbar: PortaleTesta1ErogatoreToolbar,
  },
  'portale-testa-2': {
    meta: portaleTesta2Meta.meta,
    Panel: PortaleTesta2Panel as React.ComponentType<{ label: string }>,
    Toolbar: PortaleTesta2Toolbar,
  },
  'portale-testa-2-gripper-pin': {
    meta: portaleTesta2GripperPinMeta.meta,
    Panel: PortaleTesta2GripperPinPanel as React.ComponentType<{ label: string }>,
    Toolbar: PortaleTesta2GripperPinToolbar,
  },
  'portale-testa-2-lampade-uv': {
    meta: portaleTesta2LampadeUvMeta.meta,
    Panel: PortaleTesta2LampadeUvPanel as React.ComponentType<{ label: string }>,
    Toolbar: PortaleTesta2LampadeUvToolbar,
  },

  // Robot, Dispenser (root)
  robot:                         entry(robotMeta.meta),
  'dispenser-distanziali':       entry(dispenserMeta.meta),

  // Tool stand → 4 gripper presets
  'tool-stand':                          entry(toolStandMeta.meta),
  'tool-stand-gripper-piccolo':          entry(toolStandGripperPiccoloMeta.meta),
  'tool-stand-gripper-medio':            entry(toolStandGripperMedioMeta.meta),
  'tool-stand-gripper-grande':           entry(toolStandGripperGrandeMeta.meta),
  'tool-stand-gripper-distanziali':      entry(toolStandGripperDistanzialiMeta.meta),

  // Sistema di erogazione resina → serbatoio / erogatore / alimentatore inserti
  'erogazione-resina':                       entry(resinaMeta.meta),
  'erogazione-resina-serbatoio':             entry(resinaSerbatoioMeta.meta),
  'erogazione-resina-erogatore':             entry(resinaErogatoreMeta.meta),
  'erogazione-resina-alimentatore-inserti':  entry(resinaAlimentatoreMeta.meta),

  // Baie → grezzi (vassoio, fotocellule, tastatore) / lavorati (vassoio)
  baie:                          entry(baieMeta.meta),
  'baia-grezzi':                 entry(baiaGrezziMeta.meta),
  'baia-grezzi-vassoio':         entry(baiaGrezziVassoioMeta.meta),
  'baia-grezzi-fotocellule':     entry(baiaGrezziFotocelluleMeta.meta),
  'baia-grezzi-tastatore':       entry(baiaGrezziTastatoreMeta.meta),
  'baia-lavorati':               entry(baiaLavoratiMeta.meta),
  'baia-lavorati-vassoio':       entry(baiaLavoratiVassoioMeta.meta),

  // Piani aspirati → piano 1 / piano 2
  'piani-aspirati':              entry(pianiAspiratiMeta.meta),
  'piano-aspirato-1': {
    meta: piano1Meta.meta,
    Panel: PianoAspirato1Panel as React.ComponentType<{ label: string }>,
    Toolbar: PianoAspirato1Toolbar,
  },
  'piano-aspirato-2': {
    meta: piano2Meta.meta,
    Panel: PianoAspirato2Panel as React.ComponentType<{ label: string }>,
    Toolbar: PianoAspirato2Toolbar,
  },

  // Speed → soffiatore / barra di lavaggio
  speed: {
    meta: speedMeta.meta,
    Panel: SpeedPanel as React.ComponentType<{ label: string }>,
    Toolbar: SpeedToolbar,
  },
  'speed-soffiatore': {
    meta: speedSoffiatoreMeta.meta,
    Panel: SpeedSoffiatorePanel as React.ComponentType<{ label: string }>,
    Toolbar: SpeedSoffiatoreToolbar,
  },
  'speed-barra-lavaggio': {
    meta: speedBarraMeta.meta,
    Panel: SpeedBarraLavaggioPanel as React.ComponentType<{ label: string }>,
    Toolbar: SpeedBarraLavaggioToolbar,
  },

  // Impianti → vuoto / acqua / aria
  impianti:                      entry(impiantiMeta.meta),
  'impianto-vuoto':              entry(vuotoMeta.meta),
  'impianto-acqua':              entry(acquaMeta.meta),
  'impianto-aria':               entry(ariaMeta.meta),

  // Sicurezza → elettroserrature
  sicurezza:                     entry(sicurezzaMeta.meta),
  'sicurezza-elettroserrature': {
    meta: elettroserratureMeta.meta,
    Panel: SicurezzaElettroserraturePanel as React.ComponentType<{ label: string }>,
    Toolbar: StubToolbar,
  },
}

export function getDevice(id: string): RegisteredDevice {
  return registry[id] ?? stubDevice
}

export function allDevices(): RegisteredDevice[] {
  return Object.values(registry)
}

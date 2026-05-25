import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ChevronDown } from 'lucide-react'

export function LeftPanel() {
  return (
    <div
      className="w-[348px] bg-[var(--bg-default)] rounded-[var(--radius-md)]"
      style={{ boxShadow: 'var(--shadow-base)' }}
    >
      <header className="px-5 pt-6 pb-3">
        <button type="button" className="flex items-center gap-2 text-left">
          <span className="text-[30px] font-medium leading-9 tracking-[-0.033em]">FlexPin</span>
          <ChevronDown size={20} className="text-[var(--icon-default)]" />
        </button>
        <Badge className="mt-2 bg-[var(--bg-badge-green)] text-[var(--text-success)] hover:bg-[var(--bg-badge-green)]">
          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-[var(--status-active)]" />
          Attivo
        </Badge>
      </header>
      <ScrollArea className="h-[440px] px-5 pb-5">
        <div className="text-[var(--text-muted)] text-sm">Tree will render here</div>
      </ScrollArea>
    </div>
  )
}

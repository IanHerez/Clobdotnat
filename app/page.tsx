import { HudNavbar } from "@/components/hud-navbar"
import { PriceChart } from "@/components/price-chart"
import { OrderBook } from "@/components/order-book"
import { TradeTerminal } from "@/components/trade-terminal"

export default function TradingPage() {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#0E0E12]">
      {/* HUD Navigation */}
      <HudNavbar />

      {/* Main Trading Grid */}
      <main className="flex-1 grid grid-cols-[1fr_280px_300px] gap-1 p-1 min-h-0">
        {/* Left: Price Chart (60%) */}
        <PriceChart />

        {/* Center: Order Book (20%) */}
        <OrderBook />

        {/* Right: Trade Terminal (20%) */}
        <TradeTerminal />
      </main>

      {/* Bottom Status Bar */}
      <footer className="flex items-center justify-between px-4 h-6 border-t border-[#2A2A3A]/50 bg-[#0E0E12] text-[9px] text-muted-foreground uppercase tracking-wider shrink-0">
        <div className="flex items-center gap-4">
          <span>clob.nad v0.1.0-alpha</span>
          <span className="text-[#836EF9]/60">|</span>
          <span>Motor de Matching: ACTIVO</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Latencia: {"<"}1ms</span>
          <span className="text-[#836EF9]/60">|</span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-[#00FF9D] pulse-dot" />
            <span>Conectado a Monad Testnet</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

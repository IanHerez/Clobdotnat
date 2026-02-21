"use client"

import { useState, useEffect, useRef } from "react"
import { Zap, Terminal, ChevronDown } from "lucide-react"

interface LogEntry {
  id: number
  text: string
  time: string
}

let logId = 0

function generateLog(): LogEntry {
  const orderNum = Math.floor(Math.random() * 9000) + 1000
  const block = Math.floor(Math.random() * 5000) + 900
  const timeAgo = (Math.random() * 2).toFixed(1)
  const types = [
    `> Orden #${orderNum} completada en bloque ${block} (hace ${timeAgo}s)`,
    `> Swap MON/USDC ejecutado @ ${(142 + Math.random() * 2).toFixed(2)} (hace ${timeAgo}s)`,
    `> Llenado parcial #${orderNum} - ${(Math.random() * 50).toFixed(1)} MON (hace ${timeAgo}s)`,
    `> Orden limite #${orderNum} colocada @ ${(141 + Math.random() * 3).toFixed(2)} (hace ${timeAgo}s)`,
  ]
  return {
    id: logId++,
    text: types[Math.floor(Math.random() * types.length)],
    time: new Date().toLocaleTimeString("es-ES", { hour12: false }),
  }
}

export function TradeTerminal() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy")
  const [limitPrice, setLimitPrice] = useState("142.50")
  const [amount, setAmount] = useState("")
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    Array.from({ length: 5 }, () => generateLog())
  )
  const logContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLogs = [...prev, generateLog()]
        if (newLogs.length > 20) return newLogs.slice(-20)
        return newLogs
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const isBuy = activeTab === "buy"

  const percentages = [25, 50, 75, 100]

  return (
    <div className="flex flex-col h-full border border-[#836EF9]/20 rounded-sm bg-[#0E0E12]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2A2A3A]">
        <Terminal className="w-3.5 h-3.5 text-[#836EF9]" />
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
          Terminal
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2A2A3A]">
        <button
          onClick={() => setActiveTab("buy")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            isBuy
              ? "text-[#00FF9D] border-b-2 border-[#00FF9D] bg-[#00FF9D]/5 text-glow-green"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Comprar MON
        </button>
        <button
          onClick={() => setActiveTab("sell")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            !isBuy
              ? "text-[#FF00E5] border-b-2 border-[#FF00E5] bg-[#FF00E5]/5 text-glow-magenta"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Vender MON
        </button>
      </div>

      {/* Trade Form */}
      <div className="flex-1 flex flex-col p-3 gap-3 min-h-0">
        {/* Order type */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider border border-[#836EF9]/40 rounded-sm text-[#836EF9] bg-[#836EF9]/5 cursor-pointer">
            Limite
            <ChevronDown className="w-3 h-3" />
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider border border-[#2A2A3A] rounded-sm text-muted-foreground hover:border-[#836EF9]/30 transition-colors cursor-pointer">
            Mercado
          </button>
        </div>

        {/* Price input */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
            Precio Limite
          </label>
          <div className="relative">
            <input
              type="text"
              value={limitPrice}
              onChange={e => setLimitPrice(e.target.value)}
              className={`w-full px-3 py-2 text-sm bg-[#1A1A24] border rounded-sm text-foreground font-mono tabular-nums focus:outline-none transition-colors ${
                isBuy
                  ? "border-[#00FF9D]/30 focus:border-[#00FF9D]/60"
                  : "border-[#FF00E5]/30 focus:border-[#FF00E5]/60"
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
              USDC
            </span>
          </div>
        </div>

        {/* Amount input */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
            Cantidad
          </label>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full px-3 py-2 text-sm bg-[#1A1A24] border rounded-sm text-foreground font-mono tabular-nums placeholder:text-muted-foreground/40 focus:outline-none transition-colors ${
                isBuy
                  ? "border-[#00FF9D]/30 focus:border-[#00FF9D]/60"
                  : "border-[#FF00E5]/30 focus:border-[#FF00E5]/60"
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
              MON
            </span>
          </div>
        </div>

        {/* Quick percentage buttons */}
        <div className="flex gap-1.5">
          {percentages.map(p => (
            <button
              key={p}
              className="flex-1 py-1 text-[10px] uppercase tracking-wider border border-[#2A2A3A] rounded-sm text-muted-foreground hover:border-[#836EF9]/40 hover:text-foreground transition-colors cursor-pointer"
            >
              {p}%
            </button>
          ))}
        </div>

        {/* Wallet Balance */}
        <div className="px-2 py-2 border border-[#2A2A3A]/60 rounded-sm bg-[#1A1A24]/50">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Saldo Wallet
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#00FF9D] font-semibold tabular-nums">420.69 MON</span>
            <span className="text-[10px] text-muted-foreground">/</span>
            <span className="text-xs text-foreground font-semibold tabular-nums">50,000 USDC</span>
          </div>
        </div>

        {/* Total estimate */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Total Est.</span>
          <span className="text-foreground font-semibold tabular-nums">
            {amount && limitPrice
              ? (parseFloat(amount || "0") * parseFloat(limitPrice || "0")).toFixed(2)
              : "0.00"}{" "}
            USDC
          </span>
        </div>

        {/* Execute button */}
        <button
          className={`w-full py-3 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
            isBuy
              ? "bg-[#00FF9D]/15 border border-[#00FF9D]/50 text-[#00FF9D] glow-green hover:bg-[#00FF9D]/25"
              : "bg-[#FF00E5]/15 border border-[#FF00E5]/50 text-[#FF00E5] glow-magenta hover:bg-[#FF00E5]/25"
          }`}
        >
          <Zap className="w-4 h-4" />
          Ejecutar Swap Instantaneo
        </button>

        {/* Activity Log */}
        <div className="flex-1 flex flex-col border border-[#2A2A3A]/60 rounded-sm bg-[#0A0A0F] min-h-0 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-1 border-b border-[#2A2A3A]/40">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] pulse-dot" />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Log de Actividad
            </span>
          </div>
          <div ref={logContainerRef} className="flex-1 overflow-y-auto p-1.5 min-h-0">
            {logs.map(log => (
              <div key={log.id} className="text-[10px] leading-relaxed py-0.5">
                <span className="text-muted-foreground/60">[{log.time}]</span>{" "}
                <span className="text-[#836EF9]/80">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

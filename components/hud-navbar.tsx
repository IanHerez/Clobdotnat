"use client"

import { useEffect, useRef, useState } from "react"
import { Wifi } from "lucide-react"
import { useMonadStats } from "@/hooks/use-monad-stats"

function GlitchLogo() {
  return (
    <div className="relative">
      <span
        className="glitch-text text-xl font-bold tracking-tight text-[#836EF9] text-glow-purple"
        data-text="clob.nad"
      >
        clob.nad
      </span>
    </div>
  )
}

function StatusIndicator({ label, value, color = "text-foreground" }: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground uppercase tracking-wider">{label}:</span>
      <span className={`${color} font-semibold tabular-nums`}>
        {value}
      </span>
    </div>
  )
}

function TpsDisplay({ tps }: { tps: number }) {
  const [flash, setFlash] = useState(false)
  const prevTps = useRef(tps)

  useEffect(() => {
    if (tps !== prevTps.current) {
      prevTps.current = tps
      setFlash(true)
      const timeout = setTimeout(() => setFlash(false), 400)
      return () => clearTimeout(timeout)
    }
  }, [tps])

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground uppercase tracking-wider">TPS:</span>
      <span
        className={`text-[#00FF9D] font-semibold tabular-nums text-glow-green ${flash ? "tps-flash" : ""}`}
      >
        {tps.toLocaleString()}
      </span>
    </div>
  )
}

export function HudNavbar() {
  const stats = useMonadStats()

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-[#836EF9]/30 bg-[#0E0E12]/90 backdrop-blur-sm shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <GlitchLogo />
        <div className="h-4 w-px bg-[#2A2A3A]" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          high-freq CLOB
        </span>
      </div>

      {/* Center: Status Metrics */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground uppercase tracking-wider">NET:</span>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${stats.isLive ? "bg-[#00FF9D] pulse-dot" : "bg-yellow-500 pulse-dot"}`} />
            <span className={`font-semibold tabular-nums ${stats.isLive ? "text-[#00FF9D]" : "text-yellow-500"}`}>
              {stats.isLive ? "MONAD TESTNET" : "DEMO MODE"}
            </span>
          </div>
        </div>
        <div className="h-4 w-px bg-[#2A2A3A]" />
        <TpsDisplay tps={stats.tps} />
        <div className="h-4 w-px bg-[#2A2A3A]" />
        <StatusIndicator
          label="BLOCK"
          value={stats.blockHeight > 0 ? `#${stats.blockHeight.toLocaleString()}` : "---"}
          color="text-foreground"
        />
        <div className="h-4 w-px bg-[#2A2A3A]" />
        <StatusIndicator label="BLOCK TIME" value={stats.blockTime} color="text-foreground" />
        <div className="h-4 w-px bg-[#2A2A3A]" />
        <StatusIndicator
          label="GAS"
          value={`${stats.gasPrice} Gwei`}
          color="text-muted-foreground"
        />
      </div>

      {/* Right: Connect Wallet */}
      <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider border border-[#836EF9] text-[#836EF9] bg-[#836EF9]/10 rounded-sm glow-purple hover:bg-[#836EF9]/20 transition-colors cursor-pointer">
        <Wifi className="w-3.5 h-3.5" />
        Connect Wallet
      </button>
    </header>
  )
}

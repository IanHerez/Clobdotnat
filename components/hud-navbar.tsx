"use client"

import { useEffect, useState } from "react"
import { Wifi, Zap } from "lucide-react"

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

function StatusIndicator({ label, value, color = "text-foreground", flicker = false }: {
  label: string
  value: string
  color?: string
  flicker?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground uppercase tracking-wider">{label}:</span>
      <span className={`${color} ${flicker ? "flicker" : ""} font-semibold`}>
        {value}
      </span>
    </div>
  )
}

function TpsCounter() {
  const [tps, setTps] = useState(9450)

  useEffect(() => {
    const interval = setInterval(() => {
      setTps(prev => {
        const delta = Math.floor(Math.random() * 200) - 100
        return Math.max(8800, Math.min(10200, prev + delta))
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <StatusIndicator
      label="TPS"
      value={tps.toLocaleString()}
      color="text-[#00FF9D]"
      flicker
    />
  )
}

export function HudNavbar() {
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
          <span className="text-muted-foreground uppercase tracking-wider">RED:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] pulse-dot" />
            <span className="text-[#00FF9D] font-semibold">MONAD TESTNET</span>
          </div>
        </div>
        <div className="h-4 w-px bg-[#2A2A3A]" />
        <TpsCounter />
        <div className="h-4 w-px bg-[#2A2A3A]" />
        <StatusIndicator label="TIEMPO BLOQUE" value="1s" color="text-foreground" />
        <div className="h-4 w-px bg-[#2A2A3A]" />
        <StatusIndicator label="GAS PROM" value="$0.0001" color="text-muted-foreground" />
      </div>

      {/* Right: Connect Wallet */}
      <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider border border-[#836EF9] text-[#836EF9] bg-[#836EF9]/10 rounded-sm glow-purple hover:bg-[#836EF9]/20 transition-colors cursor-pointer">
        <Wifi className="w-3.5 h-3.5" />
        Conectar Wallet
      </button>
    </header>
  )
}

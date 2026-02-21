"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Activity } from "lucide-react"

interface Order {
  price: number
  size: number
  total: number
  isNew: boolean
  id: number
}

let orderId = 0

function generateOrders(basePrice: number, side: "ask" | "bid", count: number): Order[] {
  const orders: Order[] = []
  let total = 0
  for (let i = 0; i < count; i++) {
    const offset = (i + 1) * (0.01 + Math.random() * 0.08)
    const price = side === "ask" ? basePrice + offset : basePrice - offset
    const size = Math.round((Math.random() * 500 + 10) * 100) / 100
    total += size
    orders.push({ price: Math.round(price * 100) / 100, size, total, isNew: false, id: orderId++ })
  }
  return orders
}

function OrderRow({ order, side, maxTotal }: { order: Order; side: "ask" | "bid"; maxTotal: number }) {
  const fillPercent = (order.total / maxTotal) * 100
  const isAsk = side === "ask"
  const bgColor = isAsk ? "rgba(255, 0, 229, 0.08)" : "rgba(0, 255, 157, 0.08)"
  const fillColor = isAsk ? "rgba(255, 0, 229, 0.12)" : "rgba(0, 255, 157, 0.12)"

  return (
    <div
      className={`relative flex items-center justify-between px-2 py-[3px] text-[11px] font-mono transition-colors hover:bg-[#1A1A24] ${order.isNew ? (isAsk ? "flash-magenta" : "flash-green") : ""}`}
      style={{ background: `linear-gradient(to ${isAsk ? "left" : "right"}, ${fillColor} ${fillPercent}%, ${bgColor} ${fillPercent}%)` }}
    >
      <span className={`w-[38%] text-left tabular-nums ${isAsk ? "text-[#FF00E5]" : "text-[#00FF9D]"}`}>
        {order.price.toFixed(2)}
      </span>
      <span className="w-[32%] text-right tabular-nums text-foreground">
        {order.size.toFixed(2)}
      </span>
      <span className="w-[30%] text-right tabular-nums text-muted-foreground">
        {order.total.toFixed(0)}
      </span>
    </div>
  )
}

export function OrderBook() {
  const basePrice = useRef(142.5)
  const [asks, setAsks] = useState<Order[]>([])
  const [bids, setBids] = useState<Order[]>([])
  const [spread, setSpread] = useState(0.05)
  const [midPrice, setMidPrice] = useState(basePrice.current)

  // Generate initial orders on client only to avoid hydration mismatch
  useEffect(() => {
    setAsks(generateOrders(basePrice.current, "ask", 14))
    setBids(generateOrders(basePrice.current, "bid", 14))
  }, [])

  const updateOrders = useCallback(() => {
    // Randomly mutate existing orders and occasionally add/remove
    setAsks(prev => {
      const updated = prev.map(order => {
        if (Math.random() > 0.6) {
          const sizeChange = (Math.random() - 0.4) * 50
          return {
            ...order,
            size: Math.max(5, order.size + sizeChange),
            isNew: Math.random() > 0.8,
          }
        }
        return { ...order, isNew: false }
      })
      // Recalculate totals
      let total = 0
      return updated.map(o => {
        total += o.size
        return { ...o, total }
      })
    })

    setBids(prev => {
      const updated = prev.map(order => {
        if (Math.random() > 0.6) {
          const sizeChange = (Math.random() - 0.4) * 50
          return {
            ...order,
            size: Math.max(5, order.size + sizeChange),
            isNew: Math.random() > 0.8,
          }
        }
        return { ...order, isNew: false }
      })
      let total = 0
      return updated.map(o => {
        total += o.size
        return { ...o, total }
      })
    })

    // Slightly move mid price
    const drift = (Math.random() - 0.49) * 0.06
    basePrice.current += drift
    setMidPrice(basePrice.current)
    setSpread(Math.round((Math.random() * 0.08 + 0.02) * 100) / 100)
  }, [])

  useEffect(() => {
    const interval = setInterval(updateOrders, 200)
    return () => clearInterval(interval)
  }, [updateOrders])

  const maxAskTotal = asks.length > 0 ? asks[asks.length - 1].total : 1
  const maxBidTotal = bids.length > 0 ? bids[bids.length - 1].total : 1

  return (
    <div className="flex flex-col h-full border border-[#836EF9]/20 rounded-sm bg-[#0E0E12]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2A2A3A]">
        <Activity className="w-3.5 h-3.5 text-[#836EF9]" />
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
          CLOB en vivo
        </span>
        <span className="text-[10px] text-muted-foreground ml-auto">(Profundidad)</span>
      </div>

      {/* Column Labels */}
      <div className="flex items-center justify-between px-2 py-1 text-[9px] uppercase tracking-wider text-muted-foreground border-b border-[#2A2A3A]/50">
        <span className="w-[38%] text-left">Precio</span>
        <span className="w-[32%] text-right">Cantidad</span>
        <span className="w-[30%] text-right">Total</span>
      </div>

      {/* Asks (reversed so highest ask is at top) */}
      <div className="flex-1 overflow-hidden flex flex-col justify-end min-h-0">
        <div className="overflow-hidden">
          {[...asks].reverse().map(order => (
            <OrderRow key={order.id} order={order} side="ask" maxTotal={maxAskTotal} />
          ))}
        </div>
      </div>

      {/* Spread / Mid Price */}
      <div className="flex items-center justify-between px-3 py-2 border-y border-[#836EF9]/30 bg-[#836EF9]/5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold price-blink tabular-nums">
            {midPrice.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">USDC</span>
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <span className="text-muted-foreground">Spread:</span>
          <span className="text-[#836EF9] font-semibold">{spread.toFixed(2)}</span>
        </div>
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="overflow-hidden">
          {bids.map(order => (
            <OrderRow key={order.id} order={order} side="bid" maxTotal={maxBidTotal} />
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { TrendingUp, Clock, BarChart3 } from "lucide-react"

interface Candle {
  open: number
  close: number
  high: number
  low: number
  volume: number
}

function generateCandles(count: number): Candle[] {
  const candles: Candle[] = []
  let price = 142
  for (let i = 0; i < count; i++) {
    const open = price
    const change = (Math.random() - 0.48) * 3
    const close = open + change
    const high = Math.max(open, close) + Math.random() * 1.5
    const low = Math.min(open, close) - Math.random() * 1.5
    const volume = 50 + Math.random() * 200
    candles.push({ open, close, high, low, volume })
    price = close
  }
  return candles
}

function generateMA(candles: Candle[], period: number): number[] {
  const ma: number[] = []
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      ma.push(candles[i].close)
    } else {
      const slice = candles.slice(i - period + 1, i + 1)
      const avg = slice.reduce((s, c) => s + c.close, 0) / period
      ma.push(avg)
    }
  }
  return ma
}

export function PriceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [candles, setCandles] = useState<Candle[]>(() => generateCandles(60))
  const [currentPrice, setCurrentPrice] = useState(142.5)
  const [priceChange, setPriceChange] = useState(2.34)

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.scale(dpr, dpr)
    const w = rect.width
    const h = rect.height

    // Clear
    ctx.fillStyle = "#0E0E12"
    ctx.fillRect(0, 0, w, h)

    // Grid
    ctx.strokeStyle = "rgba(42, 42, 58, 0.4)"
    ctx.lineWidth = 0.5
    const gridRows = 8
    const gridCols = 12
    for (let i = 0; i <= gridRows; i++) {
      const y = (h / gridRows) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
    for (let i = 0; i <= gridCols; i++) {
      const x = (w / gridCols) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }

    // Compute price range
    const allPrices = candles.flatMap(c => [c.high, c.low])
    const minPrice = Math.min(...allPrices) - 2
    const maxPrice = Math.max(...allPrices) + 2
    const priceRange = maxPrice - minPrice

    const padding = 60
    const chartW = w - padding
    const candleW = chartW / candles.length
    const gap = candleW * 0.3

    // Price labels on right
    ctx.fillStyle = "#8888A0"
    ctx.font = "10px monospace"
    ctx.textAlign = "right"
    for (let i = 0; i <= gridRows; i++) {
      const price = maxPrice - (priceRange / gridRows) * i
      const y = (h / gridRows) * i
      ctx.fillText(price.toFixed(2), w - 4, y + 3)
    }

    // Draw candles
    candles.forEach((candle, i) => {
      const x = i * candleW + gap / 2
      const isGreen = candle.close >= candle.open
      const color = isGreen ? "#00FF9D" : "#FF00E5"

      // Wick
      const wickX = x + (candleW - gap) / 2
      const wickTop = h - ((candle.high - minPrice) / priceRange) * h
      const wickBot = h - ((candle.low - minPrice) / priceRange) * h
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(wickX, wickTop)
      ctx.lineTo(wickX, wickBot)
      ctx.stroke()

      // Body
      const bodyTop = h - ((Math.max(candle.open, candle.close) - minPrice) / priceRange) * h
      const bodyBot = h - ((Math.min(candle.open, candle.close) - minPrice) / priceRange) * h
      const bodyH = Math.max(bodyBot - bodyTop, 1)
      ctx.fillStyle = isGreen ? "rgba(0, 255, 157, 0.85)" : "rgba(255, 0, 229, 0.85)"
      ctx.fillRect(x, bodyTop, candleW - gap, bodyH)

      // Glow
      ctx.shadowColor = color
      ctx.shadowBlur = 3
      ctx.fillRect(x, bodyTop, candleW - gap, bodyH)
      ctx.shadowBlur = 0
    })

    // MA lines
    const ma7 = generateMA(candles, 7)
    const ma25 = generateMA(candles, 25)

    const drawLine = (data: number[], color: string, glow: string) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.shadowColor = glow
      ctx.shadowBlur = 6
      ctx.beginPath()
      data.forEach((val, i) => {
        const x = i * candleW + candleW / 2
        const y = h - ((val - minPrice) / priceRange) * h
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    drawLine(ma7, "rgba(131, 110, 249, 0.9)", "#836EF9")
    drawLine(ma25, "rgba(131, 110, 249, 0.4)", "#836EF9")

    // Current price line
    const lastCandle = candles[candles.length - 1]
    const priceY = h - ((lastCandle.close - minPrice) / priceRange) * h
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = lastCandle.close >= lastCandle.open ? "rgba(0, 255, 157, 0.6)" : "rgba(255, 0, 229, 0.6)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, priceY)
    ctx.lineTo(w, priceY)
    ctx.stroke()
    ctx.setLineDash([])

    // Volume bars at bottom
    const maxVol = Math.max(...candles.map(c => c.volume))
    const volH = h * 0.12
    candles.forEach((candle, i) => {
      const x = i * candleW + gap / 2
      const barH = (candle.volume / maxVol) * volH
      const isGreen = candle.close >= candle.open
      ctx.fillStyle = isGreen ? "rgba(0, 255, 157, 0.15)" : "rgba(255, 0, 229, 0.15)"
      ctx.fillRect(x, h - barH, candleW - gap, barH)
    })
  }, [candles])

  // Animate candles over time
  useEffect(() => {
    const interval = setInterval(() => {
      setCandles(prev => {
        const updated = [...prev]
        const last = { ...updated[updated.length - 1] }
        const change = (Math.random() - 0.48) * 0.8
        last.close += change
        last.high = Math.max(last.high, last.close)
        last.low = Math.min(last.low, last.close)
        updated[updated.length - 1] = last
        setCurrentPrice(last.close)
        setPriceChange(((last.close - last.open) / last.open) * 100)
        return updated
      })
    }, 500)

    // Add new candle periodically
    const newCandleInterval = setInterval(() => {
      setCandles(prev => {
        const lastClose = prev[prev.length - 1].close
        const change = (Math.random() - 0.48) * 2
        const newCandle: Candle = {
          open: lastClose,
          close: lastClose + change,
          high: lastClose + Math.abs(change) + Math.random(),
          low: lastClose - Math.abs(change) - Math.random(),
          volume: 50 + Math.random() * 200,
        }
        return [...prev.slice(1), newCandle]
      })
    }, 4000)

    return () => {
      clearInterval(interval)
      clearInterval(newCandleInterval)
    }
  }, [])

  // Redraw on candle changes and resize
  useEffect(() => {
    drawChart()
    const handleResize = () => drawChart()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [candles, drawChart])

  const isUp = priceChange >= 0

  return (
    <div className="flex flex-col h-full border border-[#836EF9]/20 rounded-sm bg-[#0E0E12]">
      {/* Chart Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2A2A3A]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-[#836EF9]" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              MON/USDC
            </span>
          </div>
          <div className="h-3 w-px bg-[#2A2A3A]" />
          <div className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Intervalo 1s</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${isUp ? "text-[#00FF9D] text-glow-green" : "text-[#FF00E5] text-glow-magenta"}`}>
              {currentPrice.toFixed(2)}
            </span>
            <span className={`text-[10px] ${isUp ? "text-[#00FF9D]" : "text-[#FF00E5]"}`}>
              {isUp ? "+" : ""}{priceChange.toFixed(2)}%
            </span>
          </div>
          <TrendingUp className={`w-3.5 h-3.5 ${isUp ? "text-[#00FF9D]" : "text-[#FF00E5] rotate-180"}`} />
        </div>
      </div>

      {/* Chart Indicators */}
      <div className="flex items-center gap-4 px-3 py-1 border-b border-[#2A2A3A]/50 text-[10px]">
        <span className="text-muted-foreground">MA(7)</span>
        <span className="text-[#836EF9]">{currentPrice.toFixed(2)}</span>
        <span className="text-muted-foreground">MA(25)</span>
        <span className="text-[#836EF9]/60">{(currentPrice - 0.8).toFixed(2)}</span>
        <span className="text-muted-foreground">VOL</span>
        <span className="text-foreground">{(Math.random() * 500 + 100).toFixed(0)}K</span>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative min-h-0">
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
    </div>
  )
}

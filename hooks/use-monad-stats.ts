"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createPublicClient, defineChain, http, formatGwei } from "viem"

const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://testnet.monadexplorer.com" },
  },
})

const client = createPublicClient({
  chain: monadTestnet,
  transport: http("https://testnet-rpc.monad.xyz", {
    timeout: 5_000,
    retryCount: 1,
  }),
})

export interface MonadStats {
  tps: number
  blockHeight: number
  gasPrice: string
  blockTime: string
  isLive: boolean
}

function generateFallbackStats(prev: MonadStats | null): MonadStats {
  const baseTps = prev?.tps ?? 5000
  const delta = Math.floor(Math.random() * 800) - 400
  const tps = Math.max(2000, Math.min(10000, baseTps + delta))

  const baseBlock = prev?.blockHeight ?? 48_000_000
  const blockHeight = prev ? prev.blockHeight + 1 : baseBlock

  const gasOptions = ["0.50", "0.75", "1.00", "1.25", "0.30"]
  const gasPrice = gasOptions[Math.floor(Math.random() * gasOptions.length)]

  return {
    tps,
    blockHeight,
    gasPrice,
    blockTime: "1s",
    isLive: false,
  }
}

export function useMonadStats(): MonadStats {
  const [stats, setStats] = useState<MonadStats>({
    tps: 0,
    blockHeight: 0,
    gasPrice: "0.00",
    blockTime: "1s",
    isLive: false,
  })

  const failCount = useRef(0)
  const lastBlockNumber = useRef<bigint | null>(null)
  const prevStats = useRef<MonadStats | null>(null)

  const fetchStats = useCallback(async () => {
    // After 3 consecutive failures, switch to demo mode permanently for this session
    if (failCount.current >= 3) {
      const fallback = generateFallbackStats(prevStats.current)
      prevStats.current = fallback
      setStats(fallback)
      return
    }

    try {
      const [block, gasPriceWei] = await Promise.all([
        client.getBlock({ blockTag: "latest" }),
        client.getGasPrice(),
      ])

      const blockNumber = block.number
      const txCount = block.transactions.length

      // Monad has ~1s block time, so tx count per block ~ TPS
      // If we already had a block, only update TPS if it's a new block
      let tps = txCount
      if (lastBlockNumber.current !== null && blockNumber === lastBlockNumber.current) {
        // Same block, keep previous TPS
        tps = prevStats.current?.tps ?? txCount
      }
      lastBlockNumber.current = blockNumber

      const gasFormatted = parseFloat(formatGwei(gasPriceWei)).toFixed(2)

      const newStats: MonadStats = {
        tps,
        blockHeight: Number(blockNumber),
        gasPrice: gasFormatted,
        blockTime: "1s",
        isLive: true,
      }

      prevStats.current = newStats
      failCount.current = 0
      setStats(newStats)
    } catch {
      failCount.current++

      // Generate fallback data so UI stays alive
      const fallback = generateFallbackStats(prevStats.current)
      prevStats.current = fallback
      setStats(fallback)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 2000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return stats
}

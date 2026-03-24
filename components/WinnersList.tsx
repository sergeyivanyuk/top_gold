'use client'

import { useRouletteStore } from '@/lib/store/roulette'
import { Trophy } from 'lucide-react'

export function WinnersList() {
  const winners = useRouletteStore(state => state.winners)

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-gold" />
        <h2 className="text-lg font-bold">Последние победители</h2>
      </div>

      {winners.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>Пока никто не выигрывал</p>
          <p className="text-sm">Будь первым!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {winners.slice(0, 10).map((winner, index) => (
            <div
              key={winner.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  index === 0 ? "bg-gold text-black" : "bg-gray-700 text-gray-400"
                )}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium">{winner.username}</p>
                  <p className="text-xs text-gray-500">{formatTime(winner.timestamp)}</p>
                </div>
              </div>
              <div className="text-gold font-bold">
                +{winner.gold} 🪙
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Нужно добавить импорт cn
import { cn } from '@/lib/utils'

'use client'

import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  className?: string
}

export function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
  const [isShown, setIsShown] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsShown(true)
    } else {
      const timer = setTimeout(() => setIsShown(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isShown) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto',
          'transform transition-all duration-300',
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

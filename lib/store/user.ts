import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserStore {
	nickname: string | null
	setNickname: (nickname: string) => void
	clearNickname: () => void
}

export const useUserStore = create<UserStore>()(
	persist(
		set => ({
			nickname: null,
			setNickname: nickname => set({ nickname }),
			clearNickname: () => set({ nickname: null })
		}),
		{
			name: 'user-storage',
			version: 1
		}
	)
)

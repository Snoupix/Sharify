import { useEffect, useState } from "react"

export type SpotifyTokensStorage = {
    at: string
    rt: string
    ein: number
    date: number
}

type LocalStorage = {
    st: SpotifyTokensStorage
    SpotifyDevice: string
}

type LocalStorageValues = "st" | "SpotifyDevice"

export const SetStorageValue = (value: Partial<LocalStorage>): Partial<LocalStorage> => {
	if (!localStorage) return SetStorageValue(value)

    const Storage = localStorage.getItem('Sharify')

    if (Storage == null) {
        localStorage.setItem('Sharify', JSON.stringify(value))
        return value
    }

    const ParsedStorage = JSON.parse(Storage)

    localStorage.setItem('Sharify', JSON.stringify({ ...ParsedStorage, ...value }))

    return value
}

export const GetStorageValue = (value: LocalStorageValues) => {
	if (!localStorage) return null

    const storageObject = JSON.parse(localStorage.getItem('Sharify') || '{}') as LocalStorage

	return storageObject[value] || null
}


export const useDebounce = (value: any, delay: number = 500) => {
	const [debouncedValue, setDebouncedValue] = useState(value)

	useEffect(() => {
		const handler = setTimeout(() => setDebouncedValue(value), delay)

		return () => clearTimeout(handler)
	}, [value, delay])

	return debouncedValue
}

export const FormatTime = (progress: number, duration: number) => {
    const [p, m] = [new Date(progress), new Date(duration)]

    const FormatNumber = (int: number): string => {
        if (int < 10) {
            return `0${int}`
        }
    
        return `${int}`
    }

    return `${FormatNumber(p.getMinutes())}:${FormatNumber(p.getSeconds())} / ${FormatNumber(m.getMinutes())}:${FormatNumber(m.getSeconds())}`
}

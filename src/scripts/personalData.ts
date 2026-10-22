import f2pData from '@/data/personal/f2p.json'
import usefulData from '@/data/personal/useful.json'
import type { GameObject } from '@/types/gameDataTypes'

export interface PersonalF2PEntry {
    name: string
    methods: string[]
}

export interface PersonalUsefulEntry {
    name: string
    roles: string[]
}

export function normalizePersonalName(value: string): string {
    return value
        .replaceAll('ё', 'е')
        .replaceAll('Ё', 'Е')
        .replaceAll('’', "'")
        .replaceAll('‘', "'")
        .replaceAll('–', '-')
        .replaceAll('—', '-')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
}

const f2p = (f2pData as { ponies: Record<string, PersonalF2PEntry> }).ponies
const useful = (usefulData as { ponies: Record<string, PersonalUsefulEntry> }).ponies

function englishName(value: GameObject): string {
    return value?.name?.english ?? ''
}

export function getPersonalF2P(value: GameObject | string): PersonalF2PEntry | null {
    const key = normalizePersonalName(typeof value === 'string' ? value : englishName(value))
    return f2p[key] ?? null
}

export function getPersonalUseful(value: GameObject | string): PersonalUsefulEntry | null {
    const names = typeof value === 'string'
        ? [value]
        : Object.values(value?.name ?? {})
    for (const name of names) {
        const entry = useful[normalizePersonalName(name)]
        if (entry) {
            return { ...entry, roles: Array.from(new Set(entry.roles.map(canonicalUsefulRole))) }
        }
    }
    return null
}

export function canonicalUsefulRole(role: string): string {
    const normalized = role.trim().toLocaleLowerCase('ru')
    if (normalized === 'жетоносборщики для отеля' || normalized === 'жетоносборщик для отеля') {
        return 'Жетоносборщики для отеля'
    }
    return role.trim()
}

export function hasPersonalF2P(value: GameObject | string): boolean {
    return Boolean(getPersonalF2P(value))
}

export function hasPersonalUseful(value: GameObject | string): boolean {
    return Boolean(getPersonalUseful(value))
}

export function getPersonalUsefulCategories(): string[] {
    return Array.from(new Set(Object.values(useful).flatMap(item => item.roles.map(canonicalUsefulRole))))
        .sort((a, b) => a.localeCompare(b, 'ru'))
}

import f2pData from '@/data/personal/f2p.json'
import usefulData from '@/data/personal/useful.json'

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
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
}

const f2p = (f2pData as { ponies: Record<string, PersonalF2PEntry> }).ponies
const useful = (usefulData as { ponies: Record<string, PersonalUsefulEntry> }).ponies

export function getPersonalF2P(name: string): PersonalF2PEntry | null {
    return f2p[normalizePersonalName(name)] ?? null
}

export function getPersonalUseful(name: string): PersonalUsefulEntry | null {
    const entry = useful[normalizePersonalName(name)]
    if (!entry) return null
    return { ...entry, roles: entry.roles.map(canonicalUsefulRole) }
}

export function canonicalUsefulRole(role: string): string {
    const normalized = role.trim().toLocaleLowerCase('ru')
    if (normalized === 'жетоносборщики для отеля' || normalized === 'жетоносборщик для отеля') {
        return 'Жетоносборщики для отеля'
    }
    return role
}

export function hasPersonalF2P(name: string): boolean {
    return Boolean(getPersonalF2P(name))
}

export function hasPersonalUseful(name: string): boolean {
    return Boolean(getPersonalUseful(name))
}

export function getPersonalUsefulCategories(): string[] {
    return Array.from(new Set(Object.values(useful).flatMap(item => item.roles.map(canonicalUsefulRole))))
        .sort((a, b) => a.localeCompare(b, 'ru'))
}

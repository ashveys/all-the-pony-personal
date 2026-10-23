import { shopStore } from '@/stores/shopManager'
import { getCollectionData, getObject, translateName } from '@/scripts/gameData'
import type { CollectionType, GameObjectId } from '@/types/gameDataTypes'

export interface WhatsHotShopItem {
    id: GameObjectId
    name: string
    tags: string[]
    inShop: boolean
}

export interface WhatsHotCollectionMatch {
    collection: CollectionType
    ponyIds: GameObjectId[]
    matchedPonyIds: GameObjectId[]
    matchedShopItems: GameObjectId[]
    matchType: 'full' | 'partial'
    missingPonyIds: GameObjectId[]
}

export interface WhatsHotDiagnosticResult {
    shopItems: WhatsHotShopItem[]
    collectionMatches: WhatsHotCollectionMatch[]
    unmatchedShopItems: WhatsHotShopItem[]
}

/**
 * Diagnostic only: follows the original ATP `whthot` marker from /shop
 * and checks whether those object IDs map cleanly to collection_data.json.
 */
export async function diagnoseWhatsHot(): Promise<WhatsHotDiagnosticResult> {
    const shop = await shopStore.shop
    const collectionData = getCollectionData()

    if (!shop) {
        throw new Error('Данные магазина ещё не загружены. Диагностика запускается только в браузере.')
    }
    if (!collectionData?.collections) {
        throw new Error('Данные коллекций ещё не загружены.')
    }

    const shopItems: WhatsHotShopItem[] = Object.values(shop)
        .filter(entry => entry.tags?.includes('whthot'))
        .map(entry => {
            const object = getObject(entry.id)
            return {
                id: entry.id,
                name: object ? (translateName(object).value || entry.id) : entry.id,
                tags: entry.tags,
                inShop: entry.in_shop,
            }
        })
        .sort((a, b) => a.name.localeCompare(b.name))

    const whIds = new Set(shopItems.map(item => item.id))
    const collectionMatches: WhatsHotCollectionMatch[] = []

    for (const collection of Object.values(collectionData.collections)) {
        const ponyIds = [...new Set(collection.ponies.flatMap(item => [item.item, ...(item.alt ? [item.alt] : [])]))]
        const matchedPonyIds = ponyIds.filter(id => whIds.has(id))
        const missingPonyIds = ponyIds.filter(id => !whIds.has(id))

        if (matchedPonyIds.length > 0) {
            collectionMatches.push({
                collection,
                ponyIds,
                matchedPonyIds,
                matchedShopItems: matchedPonyIds,
                missingPonyIds,
                matchType: missingPonyIds.length === 0 ? 'full' : 'partial',
            })
        }
    }

    const matchedIds = new Set(collectionMatches.flatMap(match => match.matchedShopItems))
    const unmatchedShopItems = shopItems.filter(item => !matchedIds.has(item.id))

    return {
        shopItems,
        collectionMatches: collectionMatches.sort((a, b) => a.collection.id.localeCompare(b.collection.id)),
        unmatchedShopItems,
    }
}

import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { Achado } from '../types'
import { achadoRepository } from '../storage/AchadoRepository'

// Lê os achados do AsyncStorage toda vez que a TELA ganha foco.
// (useEffect só roda na montagem, e as abas não são remontadas ao trocar.)
export function useAchados() {
    const [achados, setAchados] = useState<Achado[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        // try/catch/finally: se o storage falhar, o loading termina do mesmo jeito
        // e a tela não fica girando para sempre.
        try {
            setError(null)
            const data = await achadoRepository.getAll()
            // Mais recente primeiro (createdAt é ISO string: ordem alfabética = cronológica).
            setAchados([...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
        } catch {
            setError('Não foi possível carregar o álbum.')
        } finally {
            setLoading(false)
        }
    }, [])

    useFocusEffect(
        useCallback(() => {
            load()
        }, [load])
    )

    async function removeAchado(id: string) {
        try {
            await achadoRepository.remove(id)
            await load() // recarrega do storage: a tela mostra o que está salvo de verdade
        } catch {
            setError('Não foi possível excluir o achado.')
        }
    }

    return { achados, loading, error, removeAchado }
}

import { useState } from 'react'
import * as Location from 'expo-location'

export type Coords = { latitude: number; longitude: number }

// Um status em vez de vários booleanos evita combinações impossíveis.
export type LocationStatus = 'idle' | 'loading' | 'ready' | 'denied' | 'error'

// Sem sinal de GPS, getCurrentPositionAsync pode NUNCA responder e a tela ficaria
// presa em "Obtendo localização…". Por isso a espera tem prazo de 20 segundos.
const TEMPO_LIMITE_MS = 20000
const TEMPO_ESGOTADO = 'tempo esgotado'

function comTempoLimite<T>(promessa: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(TEMPO_ESGOTADO)), ms)
        promessa.then(
            (valor) => {
                clearTimeout(timer)
                resolve(valor)
            },
            (erro) => {
                clearTimeout(timer)
                reject(erro)
            }
        )
    })
}

// O MOTOR DE GPS: toda a lógica aqui; a tela só chama getLocation().
export function useCurrentLocation() {
    const [coords, setCoords] = useState<Coords | null>(null)
    const [status, setStatus] = useState<LocationStatus>('idle')
    const [message, setMessage] = useState<string | null>(null)

    async function getLocation() {
        setStatus('loading')
        setMessage(null)
        try {
            // Permissão em RUNTIME. Se já foi concedida, o sistema não pergunta de novo.
            const permission = await Location.requestForegroundPermissionsAsync()
            if (!permission.granted) {
                setStatus('denied')
                setMessage(
                    permission.canAskAgain
                        ? 'Precisamos da localização. Toque em "Obter localização" e permita o acesso.'
                        : 'A permissão de localização foi negada. Libere nas configurações do aparelho.'
                )
                return
            }
            // High usa o GPS de verdade e funciona no emulador depois de definir uma posição.
            const position = await comTempoLimite(
                Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
                TEMPO_LIMITE_MS
            )
            setCoords({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            })
            setStatus('ready')
        } catch (e) {
            // GPS desligado, sem sinal, emulador sem posição definida, prazo estourado...
            setStatus('error')
            setMessage(
                e instanceof Error && e.message === TEMPO_ESGOTADO
                    ? 'A localização demorou demais. Vá para perto de uma janela e tente de novo, ou salve só com a foto.'
                    : 'Não foi possível obter a localização. Verifique se o GPS está ligado e tente de novo.'
            )
        }
    }

    // Volta ao estado inicial (usado depois de salvar um achado).
    function reset() {
        setCoords(null)
        setStatus('idle')
        setMessage(null)
    }

    return { coords, status, message, getLocation, reset }
}

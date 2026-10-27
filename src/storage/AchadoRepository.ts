import { Achado } from '../types'
import { AsyncStorageRepository } from './AsyncStorageRepository'

// Erro PRÓPRIO do domínio: a tela reconhece com instanceof e mostra a mensagem certa.
export class InvalidAchadoError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'InvalidAchadoError'
    }
}

// O que a tela informa. O id e o createdAt são responsabilidade do repositório.
export type NewAchado = Omit<Achado, 'id' | 'createdAt'>

// HERANÇA: AchadoRepository É UM AsyncStorageRepository<Achado>.
// Já nasce com getAll(), add() e remove().
export class AchadoRepository extends AsyncStorageRepository<Achado> {
    constructor() {
        // Chave ÚNICA deste app. Se fosse a do Agudos Connect, os dados se misturariam.
        super('@album-de-achados:achados')
    }

    // A REGRA DE NEGÓCIO mora aqui, não na tela:
    // 1) precisa de título; 2) vale foto OU localização, mas não os dois ausentes.
    async create(data: NewAchado): Promise<Achado> {
        if (data.title.trim() === '') {
            throw new InvalidAchadoError('Dê um nome ao achado.')
        }

        const semFoto = data.photoUri === null
        // Compara com null, NÃO usa "!data.latitude": a latitude 0 (Linha do Equador)
        // é um valor válido, mas 0 é falsy em JavaScript.
        const semLocalizacao = data.latitude === null || data.longitude === null
        if (semFoto && semLocalizacao) {
            throw new InvalidAchadoError('Tire a foto OU obtenha a localização.')
        }

        return this.add({
            ...data,
            title: data.title.trim(),
            // Date.now() + um pedacinho aleatório: evita ids repetidos no mesmo milissegundo.
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: new Date().toISOString(),
        })
    }
}

// Uma instância só para o app inteiro.
export const achadoRepository = new AchadoRepository()

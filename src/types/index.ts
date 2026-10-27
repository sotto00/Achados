// O CONTRATO DE DADOS: o que cada registro do álbum guarda.
// Formulário, repositório e lista conversam todos usando este tipo.
export type Achado = {
    id: string
    title: string // nome do achado (obrigatório)
    note: string // comentário livre (pode ficar vazio)
    // Foto e coordenadas são null porque a câmera e o GPS podem falhar
    // de forma independente. O registro vale com pelo menos um dos dois.
    photoUri: string | null
    latitude: number | null
    longitude: number | null
    createdAt: string // ISO string — Date não sobrevive ao JSON.stringify
}

// As duas telas do app (React Navigation).
export type TabParamList = {
    Novo: undefined
    Album: undefined
}

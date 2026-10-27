# 📸 Álbum de Achados

Aplicativo mobile feito com **React Native + Expo (TypeScript)** para registrar "achados" do dia a dia (uma pena, uma moeda, uma pedra diferente...) com **foto** e **localização GPS**. Tudo fica salvo **no próprio celular** e continua lá depois de fechar o app.

> Projeto da Aula 17 — Unidade Curricular de Programação para Dispositivos Móveis
> SENAI Agudos-SP · Turma 2 (TECDVS2-AG-2025) · Docente: Rodolfo Oliveira
> Aluno(a): **SEU NOME AQUI**

## Prints

| Novo achado | Álbum |
| --- | --- |
| ![Tela Novo achado](docs/novo-achado.png) | ![Tela Álbum](docs/album.png) |

## O que o app faz

- Cadastra um achado com **nome**, **comentário**, **foto** (câmera) e **coordenadas** (GPS).
- Lista todos os achados salvos, do mais recente para o mais antigo.
- Permite **excluir** um achado do álbum.
- Os dados sobrevivem ao fechamento do app (AsyncStorage).

## Canvas do projeto (planejamento)

**Q1 — O que cada registro guarda?**
`id`, `title` (nome do achado), `note` (comentário), `photoUri`, `latitude`, `longitude` e `createdAt`.
Foto e coordenadas aceitam `null`, porque câmera e GPS podem falhar de forma independente.

**Q2 — Quais telas existem?**
Duas telas, com React Navigation (abas): **Novo achado** (formulário) e **Meu álbum** (lista).

**Q3 — Qual a regra de aceite?**
O achado precisa de um **nome** e de **foto OU localização** (pelo menos um dos dois). A regra mora no repositório, não na tela.

**Q4 — O que foi reaproveitado do Agudos Connect e para quê?**

| Arquivo | Função | O que mudou |
| --- | --- | --- |
| `src/storage/AsyncStorageRepository.ts` | Classe genérica que lê/grava no AsyncStorage | Nada (é genérica) |
| `src/hooks/useCurrentLocation.ts` | Hook do GPS: permissão, coordenadas e limite de 20 s | Só as mensagens de texto |
| Padrão do `CheckInRepository` | Repositório com herança e regra "foto OU localização" | Virou `AchadoRepository`, com **chave nova** (`@album-de-achados:achados`), tipo `Achado` e validação do título |
| Padrão do `useSchedules` | Hook que recarrega a lista a cada foco da tela | Virou `useAchados` |

## Tecnologias

- Expo + React Native + TypeScript
- `expo-camera` — câmera
- `expo-location` — GPS
- `@react-native-async-storage/async-storage` — persistência local
- `@react-navigation/native` + `bottom-tabs` — navegação entre as duas telas

## Estrutura de pastas

```
album-de-achados/
├── App.tsx                      # monta a navegação
├── app.json                     # plugins de câmera e GPS (permissões nativas)
└── src/
    ├── types/index.ts           # contrato de dados (Achado)
    ├── storage/
    │   ├── AsyncStorageRepository.ts   # repositório genérico
    │   └── AchadoRepository.ts         # regra de negócio + chave própria
    ├── hooks/
    │   ├── useCurrentLocation.ts       # motor do GPS (prazo de 20 s)
    │   └── useAchados.ts               # carrega e exclui achados
    ├── components/
    │   ├── AchadoForm.tsx              # formulário: campos + câmera + GPS + salvar
    │   └── AchadoCard.tsx              # cartão de um achado na lista
    ├── screens/
    │   ├── NovoAchadoScreen.tsx
    │   └── AlbumScreen.tsx
    └── navigation/TabNavigator.tsx
```

Fluxo dos dados: **Tela → Hook / Repositório → AsyncStorage**. A tela não toma decisões sobre dados.

## Como rodar

Pré-requisitos: Node.js, npm e o app **Expo Go** no celular (ou um emulador Android).

```bash
git clone URL_DO_SEU_REPOSITORIO
cd album-de-achados
npm install
npx expo start -c
```

Escaneie o QR Code com o Expo Go. O `-c` limpa o cache e evita tela preta e permissões "fantasmas".

Se for recriar o projeto do zero:

```bash
npx create-expo-app@latest album-de-achados --template blank-typescript
npx expo install expo-camera expo-location @react-native-async-storage/async-storage
npx expo install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
```

## Testando no emulador Android

- **Câmera:** a foto sai preta com a data em amarelo. É o comportamento esperado do emulador.
- **GPS:** fica travado até você definir uma posição (longitude primeiro, depois latitude):

```bash
adb emu geo fix -48.9936 -22.4068
```

Se não definir, o app avisa após 20 segundos e ainda permite salvar só com a foto.

## Pontos importantes do código

- **Permissões** são pedidas em tempo de execução (câmera e GPS) e as recusas viram mensagens na tela.
- **GPS com prazo:** `getCurrentPositionAsync` é envolvido em um limite de 20 s, para a tela nunca ficar presa em "Obtendo localização…".
- **Comparação com `null`:** a validação usa `=== null` e não `!latitude`, porque a coordenada `0` (Linha do Equador) é válida, mas é *falsy* em JavaScript.
- **Trava anti-duplo-toque:** o botão de salvar fica desabilitado enquanto grava (`saving`), e o `finally` sempre o libera.
- **Câmera fechada ao sair da aba**, pois só uma pré-visualização pode estar ativa por vez.

## Limitações conhecidas

- A foto é guardada pelo caminho (`uri`) que o `expo-camera` devolve, que fica na pasta de cache do app. Se o sistema limpar o cache, o card mostra "Foto indisponível" em vez de quebrar. Uma melhoria futura seria copiar a foto para uma pasta permanente com `expo-file-system`.

## Checklist de entrega

- [x] Tema escolhido e Canvas preenchido no README
- [x] App Expo (TypeScript) com pacotes instalados via `npx expo install`
- [x] `app.json` com os plugins de câmera e GPS
- [x] Câmera pede permissão e mostra a foto
- [x] GPS captura coordenadas e tem limite de tempo
- [x] Repositório com chave própria e regra "foto OU localização"
- [x] Dados continuam na lista depois de fechar e reabrir o app
- [x] Exclusão de registro, duas telas e código organizado em pastas

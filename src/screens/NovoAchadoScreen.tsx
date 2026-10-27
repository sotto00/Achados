import { ScrollView, StyleSheet, Text } from 'react-native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { TabParamList } from '../types'
import AchadoForm from '../components/AchadoForm'
import { colors, spacing } from '../theme'

type Props = BottomTabScreenProps<TabParamList, 'Novo'>

// Tela 1: o formulário de novo achado.
export default function NovoAchadoScreen({ navigation }: Props) {
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.eyebrow}>PEQUENAS DESCOBERTAS, BOAS MEMÓRIAS</Text>
            <Text style={styles.title}>Álbum de Achados</Text>
            <Text style={styles.subtitle}>Guarde o que você encontra pelo caminho</Text>
            {/* Depois de salvar, leva o usuário direto para o álbum. */}
            <AchadoForm onSaved={() => navigation.navigate('Album')} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, width: '100%', maxWidth: 720, alignSelf: 'center' },
    eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6, color: colors.primary, marginBottom: spacing.md },
    title: { fontSize: 32, fontWeight: '700', color: colors.heading },
    subtitle: { fontSize: 15, lineHeight: 23, color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.xl },
})

import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { useAchados } from '../hooks/useAchados'
import AchadoCard from '../components/AchadoCard'
import { colors, spacing } from '../theme'

// Tela 2: a lista com tudo o que está salvo no aparelho.
export default function AlbumScreen() {
    const { achados, loading, error, removeAchado } = useAchados()

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.eyebrow}>SUAS MEMÓRIAS, BEM GUARDADAS</Text>
            <Text style={styles.title}>Meu álbum</Text>
            <Text style={styles.subtitle}>Guarde o que você encontra pelo caminho</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <FlatList
                data={achados}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                // Estado vazio "honesto": diz que não há nada em vez de tela em branco.
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyEmoji}>🍂</Text>
                        <Text style={styles.empty}>Seu álbum ainda está vazio. Que tal registrar o primeiro achado?</Text>
                    </View>
                }
                renderItem={({ item, index }) => <AchadoCard achado={item} onDelete={removeAchado} rotation={index % 2 === 0 ? '-1deg' : '1deg'} />}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 56, paddingHorizontal: spacing.xl, backgroundColor: colors.background, width: '100%', maxWidth: 720, alignSelf: 'center' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6, color: colors.primary, marginBottom: spacing.md },
    title: { fontSize: 32, fontWeight: '700', color: colors.heading },
    subtitle: { fontSize: 15, lineHeight: 23, color: colors.muted, marginTop: spacing.xs },
    list: { paddingTop: spacing.xl, paddingBottom: spacing.xl, gap: spacing.xl },
    errorText: { color: colors.error, fontSize: 14, marginTop: spacing.sm },
    emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: 56, marginTop: spacing.xl, backgroundColor: colors.soft, borderRadius: 28, borderWidth: 1, borderColor: colors.border },
    emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
    empty: { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 22 },
})

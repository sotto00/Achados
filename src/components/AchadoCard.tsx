import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Achado } from '../types'
import { colors, radius, spacing } from '../theme'

type Props = {
    achado: Achado
    onDelete: (id: string) => void
    rotation?: '-1deg' | '1deg'
}

// Um "cartão" do álbum: foto em cima, dados embaixo, botão de excluir.
export default function AchadoCard({ achado, onDelete, rotation = '-1deg' }: Props) {
    // A foto pode ter sumido do aparelho (cache limpo). Nesse caso mostramos
    // um quadro vazio em vez de deixar o card quebrado.
    const [photoFailed, setPhotoFailed] = useState(false)

    // Compara com null (a coordenada 0 é válida).
    const temLocal = achado.latitude !== null && achado.longitude !== null

    return (
        <View style={[styles.card, { transform: [{ rotate: rotation }] }]}>
            {achado.photoUri && !photoFailed ? (
                <Image
                    source={{ uri: achado.photoUri }}
                    style={styles.photo}
                    onError={() => setPhotoFailed(true)}
                />
            ) : (
                <View style={[styles.photo, styles.noPhoto]}>
                    <Text style={styles.noPhotoText}>{achado.photoUri ? 'Foto indisponível' : 'Sem foto'}</Text>
                </View>
            )}

            <View style={styles.body}>
                <Text style={styles.title}>{achado.title}</Text>
                {achado.note !== '' && <Text style={styles.note}>{achado.note}</Text>}
                <Text style={styles.pill}>
                    {temLocal
                        ? `📍 ${achado.latitude?.toFixed(5)}, ${achado.longitude?.toFixed(5)}`
                        : '📍 Local não registrado'}
                </Text>
                <Text style={styles.pill}>🕒 {new Date(achado.createdAt).toLocaleDateString('pt-BR')}</Text>

                <Pressable style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]} onPress={() => onDelete(achado.id)}>
                    <Text style={styles.deleteText}>Excluir</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        padding: spacing.sm,
        elevation: 1,
        shadowColor: colors.heading,
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 3 },
    },
    photo: { width: '100%', height: 220, borderRadius: radius.sm, backgroundColor: colors.soft },
    noPhoto: { alignItems: 'center', justifyContent: 'center' },
    noPhotoText: { color: colors.muted },
    body: { padding: spacing.md, paddingBottom: spacing.lg },
    title: { fontSize: 18, fontWeight: '700', color: colors.heading },
    note: { fontSize: 14, color: colors.text, marginTop: spacing.xs },
    pill: { alignSelf: 'flex-start', overflow: 'hidden', fontSize: 12, color: colors.muted, backgroundColor: colors.soft, borderRadius: 20, marginTop: spacing.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
    deleteButton: {
        alignSelf: 'flex-start',
        marginTop: 12,
        borderWidth: 1,
        borderColor: colors.error,
        borderRadius: radius.sm,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    deleteText: { color: colors.error, fontWeight: '700' },
    pressed: { opacity: 0.7 },
})

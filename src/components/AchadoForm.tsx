import { useCallback, useRef, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useFocusEffect } from '@react-navigation/native'
import { achadoRepository, InvalidAchadoError } from '../storage/AchadoRepository'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import { colors, radius, spacing } from '../theme'

type Props = {
    // Avisa a tela que o achado foi salvo (a tela decide o que fazer depois).
    onSaved: () => void
}

// A CENTRAL DE COMANDO: o formulário não tem regra de negócio.
// Ele só junta os campos, a câmera, o GPS e chama o repositório.
export default function AchadoForm({ onSaved }: Props) {
    // Campos do tema
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')

    // Câmera
    const [permission, requestPermission] = useCameraPermissions()
    const [cameraOpen, setCameraOpen] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const [photoUri, setPhotoUri] = useState<string | null>(null)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const cameraRef = useRef<CameraView>(null)

    // GPS
    const location = useCurrentLocation()

    // Salvar
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    // Só pode haver UMA pré-visualização de câmera ativa. Ao sair da aba,
    // a função de limpeza roda e a câmera é fechada.
    useFocusEffect(
        useCallback(() => {
            return () => setCameraOpen(false)
        }, [])
    )

    async function openCamera() {
        setCameraError(null)
        if (!permission?.granted) {
            const result = await requestPermission()
            if (!result.granted) {
                setCameraError(
                    result.canAskAgain
                        ? 'Precisamos da câmera. Toque em "Tirar foto" e permita o acesso.'
                        : 'A permissão da câmera foi negada. Libere nas configurações do aparelho.'
                )
                return
            }
        }
        setCameraReady(false)
        setCameraOpen(true)
    }

    async function takePicture() {
        try {
            const photo = await cameraRef.current?.takePictureAsync()
            if (photo) {
                setPhotoUri(photo.uri)
                setCameraOpen(false)
            }
        } catch {
            setCameraError('Não foi possível tirar a foto. Tente novamente.')
        }
    }

    async function saveAchado() {
        setSaving(true) // trava o botão: sem isso, dois toques salvam dois achados
        setSaveError(null)
        try {
            await achadoRepository.create({
                title,
                note: note.trim(),
                photoUri,
                // `?? null`: sem GPS grava null (undefined seria descartado pelo JSON)
                latitude: location.coords?.latitude ?? null,
                longitude: location.coords?.longitude ?? null,
            })
            // Limpa o formulário para o próximo achado
            setTitle('')
            setNote('')
            setPhotoUri(null)
            location.reset()
            onSaved()
        } catch (e) {
            setSaveError(
                e instanceof InvalidAchadoError
                    ? e.message
                    : 'Não foi possível salvar o achado. Tente novamente.'
            )
        } finally {
            setSaving(false) // sempre libera o botão, com sucesso ou com erro
        }
    }

    return (
        <View>
            {/* ---------- Campos do tema ---------- */}
            <View style={styles.paperCard}>
            <Text style={styles.sectionTitle}>📝 Detalhes</Text>
            <Text style={styles.label}>Nome do achado</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={colors.muted}
                placeholder="Ex.: Pena azul, moeda antiga..."
            />

            <Text style={styles.label}>Comentário</Text>
            <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={note}
                onChangeText={setNote}
                placeholderTextColor={colors.muted}
                placeholder="Onde você achou? Como era?"
                multiline
            />
            </View>

            {/* ---------- Foto ---------- */}
            <View style={styles.paperCard}>
            <Text style={styles.sectionTitle}>📸 Foto</Text>
            {cameraOpen ? (
                <View>
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing="back"
                        onCameraReady={() => setCameraReady(true)}
                        onMountError={() => {
                            setCameraOpen(false)
                            setCameraError('Câmera indisponível neste aparelho.')
                        }}
                    />
                    <View style={styles.row}>
                        <Pressable
                            style={({ pressed }) => [styles.button, styles.flex, !cameraReady && styles.disabled, pressed && cameraReady && styles.pressed]}
                            onPress={takePicture}
                            disabled={!cameraReady}
                        >
                            <Text style={styles.buttonText}>Capturar</Text>
                        </Pressable>
                        <Pressable style={({ pressed }) => [styles.buttonOutline, styles.flex, pressed && styles.pressed]} onPress={() => setCameraOpen(false)}>
                            <Text style={styles.buttonOutlineText}>Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            ) : (
                <View>
                    {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}
                    <Pressable style={({ pressed }) => [styles.buttonOutline, pressed && styles.pressed]} onPress={openCamera}>
                        <Text style={styles.buttonOutlineText}>{photoUri ? 'Tirar outra foto' : 'Tirar foto'}</Text>
                    </Pressable>
                </View>
            )}
            {cameraError && <Text style={styles.errorText}>{cameraError}</Text>}
            </View>

            {/* ---------- Localização ---------- */}
            {!cameraOpen && (
                <View style={styles.paperCard}>
                    <Text style={styles.sectionTitle}>📍 Local</Text>
                    {location.status === 'loading' && <Text style={styles.info}>Obtendo localização…</Text>}
                    {location.coords && (
                        <Text style={styles.info}>
                            Latitude {location.coords.latitude.toFixed(5)} · Longitude {location.coords.longitude.toFixed(5)}
                        </Text>
                    )}
                    <Pressable
                        style={({ pressed }) => [styles.buttonOutline, location.status === 'loading' && styles.disabled, pressed && location.status !== 'loading' && styles.pressed]}
                        onPress={location.getLocation}
                        disabled={location.status === 'loading'}
                    >
                        <Text style={styles.buttonOutlineText}>
                            {location.coords ? 'Atualizar localização' : 'Obter localização'}
                        </Text>
                    </Pressable>
                    {location.message && <Text style={styles.errorText}>{location.message}</Text>}
                </View>
            )}

            {/* ---------- Salvar ---------- */}
            {!cameraOpen && (
                <View style={styles.saveBlock}>
                    <Pressable
                        style={({ pressed }) => [styles.button, styles.saveButton, saving && styles.disabled, pressed && !saving && styles.pressed]}
                        onPress={saveAchado}
                        disabled={saving}
                    >
                        <Text style={styles.buttonText}>{saving ? 'Salvando…' : 'Guardar no álbum'}</Text>
                    </Pressable>
                    <Text style={styles.hint}>Vale ter a foto OU a localização (ou os dois).</Text>
                    {saveError && <Text style={styles.errorText}>{saveError}</Text>}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    paperCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.lg, elevation: 1, shadowColor: colors.heading, shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 2 } },
    label: { fontSize: 14, color: colors.muted, marginBottom: 6, marginTop: spacing.md },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        borderRadius: radius.sm,
        paddingHorizontal: 12,
        paddingVertical: 14,
        fontSize: 15,
        color: colors.text,
    },
    inputMultiline: { minHeight: 104, textAlignVertical: 'top' },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.heading, marginBottom: spacing.md },
    camera: { width: '100%', height: 320, borderRadius: 12, overflow: 'hidden' },
    preview: { width: '100%', height: 220, borderRadius: radius.md, backgroundColor: colors.border, marginBottom: spacing.md },
    row: { flexDirection: 'row', gap: 12, marginTop: 12 },
    flex: { flex: 1 },
    button: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center' },
    buttonText: { color: colors.surface, fontWeight: '700', fontSize: 15 },
    buttonOutline: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.soft, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center' },
    buttonOutlineText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
    disabled: { opacity: 0.45 },
    info: { color: colors.text, marginBottom: spacing.sm },
    hint: { marginTop: spacing.sm, color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
    errorText: { marginTop: spacing.md, color: colors.error },
    saveBlock: { marginTop: spacing.md, marginBottom: spacing.xl },
    saveButton: { paddingVertical: spacing.lg },
    pressed: { opacity: 0.82 },
})

import ActionDrawer from '@/src/shared/components/ui/ActionDrawer';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import ConfirmModal from '@/src/shared/components/ui/ConfirmModal';
import { AppColors } from '@/src/shared/theme/colors';
import { useTheme } from '@/src/shared/theme/useTheme';
import { isNetworkError } from '@/src/shared/api/apiClient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RequestDetailHeader from '../components/detail/RequestDetailHeader';
import RequestDetailSection from '../components/detail/RequestDetailSection';
import RequestInfoRow from '../components/detail/RequestInfoRow';
import { requestService } from '../services/requestService';
import { RequestAttachment, RequestItem, RequestOperation } from '../types';

function getAttachmentIcon(fileName: string): { name: string; color: string } {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return { name: 'file-pdf-box', color: '#F44336' };
    case 'xls':
    case 'xlsx':
    case 'csv':
      return { name: 'file-excel-box', color: '#217346' };
    case 'doc':
    case 'docx':
      return { name: 'file-word-box', color: '#2B579A' };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return { name: 'file-image', color: '#FF9800' };
    case 'zip':
    case 'rar':
    case '7z':
      return { name: 'folder-zip', color: '#795548' };
    default:
      return { name: 'file-outline', color: '#9E9E9E' };
  }
}

function getAttachmentMimeType(fileName: string) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith('.pdf')) {
    return 'application/pdf';
  }

  if (lowerName.endsWith('.png')) {
    return 'image/png';
  }

  if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  if (lowerName.endsWith('.doc')) {
    return 'application/msword';
  }

  if (lowerName.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  if (lowerName.endsWith('.xls')) {
    return 'application/vnd.ms-excel';
  }

  if (lowerName.endsWith('.xlsx')) {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  return 'application/octet-stream';
}

function supportsInlinePreview(fileName: string) {
  const mimeType = getAttachmentMimeType(fileName);
  return mimeType === 'application/pdf' || mimeType.startsWith('image/');
}

function createPreviewHtml(fileName: string, base64Content: string) {
  const mimeType = getAttachmentMimeType(fileName);
  const dataUri = `data:${mimeType};base64,${base64Content}`;

  if (mimeType.startsWith('image/')) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #111827;
      }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    </style>
  </head>
  <body>
    <img src="${dataUri}" alt="${fileName}" />
  </body>
</html>`;
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #f3f4f6;
      }
      iframe {
        width: 100%;
        height: 100%;
        border: 0;
        background: #ffffff;
      }
    </style>
  </head>
  <body>
    <iframe src="${dataUri}"></iframe>
  </body>
</html>`;
}

export default function RequestDetailScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(null);
  const [request, setRequest] = useState<RequestItem | null>(null);
  const isHistoryView = source === 'history';

  const loadRequest = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    try {
      const nextRequest = await requestService.getRequestById(
        id,
        source === 'history' ? 'history' : 'request',
      );
      setRequest(nextRequest);
    } catch (error) {
      if (isNetworkError(error)) {
        Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanılamıyor.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, source]);

  useFocusEffect(
    useCallback(() => {
      loadRequest();
    }, [loadRequest]),
  );

  const handleActionComplete = async (operation: RequestOperation) => {
    if (!request) {
      return;
    }

    setIsLoading(true);
    try {
      await requestService.processAction([request.id], operation);
      router.back();
    } catch (error) {
      if (isNetworkError(error)) {
        Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanılamıyor.');
      } else {
        Alert.alert('Hata', error instanceof Error ? error.message : 'İşlem gerçekleştirilemedi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachmentPress = useCallback(
    async (attachment: RequestAttachment) => {
      try {
        const cacheDirectory = FileSystem.cacheDirectory;
        if (!cacheDirectory) {
          Alert.alert('Ek Açılamadı', 'Cihaz geçici dosya alanına erişemedi.');
          return;
        }

        const safeFileName = attachment.name.replace(/[<>:"/\\|?*]+/g, '_');
        const fileUri = `${cacheDirectory}${safeFileName}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (!fileInfo.exists) {
          setActiveAttachmentId(attachment.id);
          const attachmentContent = await requestService.getAttachmentContent(attachment.id);
          if (!attachmentContent?.content) {
            Alert.alert('Ek Açılamadı', 'Ek içeriği alınamadı.');
            return;
          }
          await FileSystem.writeAsStringAsync(fileUri, attachmentContent.content, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }

        if (Platform.OS === 'android') {
          const contentUri = await FileSystem.getContentUriAsync(fileUri);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,
            type: getAttachmentMimeType(attachment.name),
          });
          return;
        }

        if (supportsInlinePreview(attachment.name)) {
          const previewFileUri = `${cacheDirectory}${safeFileName}.html`;
          const previewFileInfo = await FileSystem.getInfoAsync(previewFileUri);

          if (!previewFileInfo.exists) {
            const base64Content = await FileSystem.readAsStringAsync(fileUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const previewHtml = createPreviewHtml(attachment.name, base64Content);
            await FileSystem.writeAsStringAsync(previewFileUri, previewHtml);
          }

          router.push({
            pathname: '/request/attachment-preview',
            params: { title: attachment.name, uri: previewFileUri },
          });
          return;
        }

        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) {
          Alert.alert('Ek Açılamadı', 'Bu dosya türü uygulama içinde önizlenemedi.');
          return;
        }
        await Sharing.shareAsync(fileUri, {
          mimeType: getAttachmentMimeType(attachment.name),
          dialogTitle: attachment.name,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ek açılırken hata oluştu.';
        Alert.alert('Ek Açılamadı', message);
      } finally {
        setActiveAttachmentId(null);
      }
    },
    [router],
  );

  if (!request && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Talep detayı bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RequestDetailHeader
        title="Talep Detay"
        topInset={insets.top}
        onBack={() => router.back()}
        onDelete={!isHistoryView ? () => setIsDeleteModalVisible(true) : undefined}
        disabled={isLoading}
      />

      {request && (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + (isHistoryView ? 24 : 130) },
            ]}
          >
            <View
              style={[
                styles.statusBar,
                {
                  backgroundColor: isDark || !request.statusBackgroundColor
                    ? 'transparent'
                    : request.statusBackgroundColor,
                  borderColor: request.statusTextColor
                    ? (isDark ? request.statusTextColor : 'transparent')
                    : (isDark ? '#FFFFFF' : colors.border),
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: request.statusTextColor ?? (isDark ? '#FFFFFF' : colors.textPrimary) },
                ]}
              >
                {request.statusLabel || request.statu}
              </Text>
            </View>

            <View style={styles.headerRow}>
              <Text style={styles.nameText}>{request.isim ?? request.gonderen}</Text>
              <Text style={styles.dateText}>{request.tarih ?? request.baslangic}</Text>
            </View>

            <Text style={styles.belgeNoText}>
              Belge No: {request.belgeNo ?? `BEL-${request.istekNo}`}
            </Text>

            <RequestDetailSection title={request.kategori ?? 'Talep Bilgileri'}>
              <RequestInfoRow label="İstek No" value={request.istekNo} />
              <RequestInfoRow label="Şirket" value={request.sirket} />
              <RequestInfoRow label="Statü" value={request.statu} />
              <RequestInfoRow label="Açılış Tarihi" value={request.acilis ?? request.baslangic} />
              <RequestInfoRow label="Bitiş Tarihi" value={request.bitis} />
              <RequestInfoRow label="Modül" value={request.modul ?? 'SAP Workflow'} />
              <RequestInfoRow label="Kategori" value={request.kategori ?? '-'} />
              {request.approver ? <RequestInfoRow label="Onaylayan" value={request.approver} /> : null}
              {request.responseDate ? (
                <RequestInfoRow label="Yanıt Tarihi" value={request.responseDate} />
              ) : null}
            </RequestDetailSection>

            {request.detailSections?.length ? (
              request.detailSections.map((section, sectionIndex) => (
                <RequestDetailSection key={`${section.title}-${sectionIndex}`} title={section.title}>
                  {section.lines.map((line, lineIndex) =>
                    line.kind === 'pair' && line.label ? (
                      <RequestInfoRow
                        key={`${section.title}-${line.label}-${lineIndex}`}
                        label={line.label}
                        value={line.value}
                      />
                    ) : (
                      <Text key={`${section.title}-text-${lineIndex}`} style={styles.descriptionText}>
                        {line.value}
                      </Text>
                    ),
                  )}
                </RequestDetailSection>
              ))
            ) : (
              <RequestDetailSection title="İstek Açıklaması">
                <Text style={styles.descriptionText}>
                  {request.aciklama ?? 'Açıklama bulunmuyor.'}
                </Text>
              </RequestDetailSection>
            )}

            <RequestDetailSection title="Kişiler">
              <RequestInfoRow label="İstek Sahibi" value={request.gonderen} />
              {request.requesterUsername ? (
                <RequestInfoRow label="Kullanıcı Adı" value={request.requesterUsername} />
              ) : null}
              <RequestInfoRow label="Şirket" value={request.sirket} />
              <RequestInfoRow label="Onay Durumu" value={request.onayDurumu} />
            </RequestDetailSection>

            {request.attachments?.length ? (
              <RequestDetailSection title="Ekler">
                {request.attachments.map((attachment) => (
                  <Pressable
                    key={attachment.id}
                    style={styles.attachmentButton}
                    onPress={() => handleAttachmentPress(attachment)}
                  >
                    <View style={styles.attachmentContent}>
                      <MaterialCommunityIcons
                        name={getAttachmentIcon(attachment.name).name as any}
                        size={22}
                        color={getAttachmentIcon(attachment.name).color}
                        style={styles.attachmentIcon}
                      />
                      <Text style={styles.attachmentButtonText}>{attachment.name}</Text>
                    </View>
                    {activeAttachmentId === attachment.id ? (
                      <Text style={styles.attachmentLoadingText}>Hazırlanıyor...</Text>
                    ) : null}
                  </Pressable>
                ))}
              </RequestDetailSection>
            ) : null}
          </ScrollView>

          {!isHistoryView && (
            <>
              <ConfirmModal
                visible={isDeleteModalVisible}
                title="Uyarı"
                message="İstek yalnızca bu cihazdaki listeden kaldırılacak. Talep oluşturan kişiye iletilmeyecektir."
                onCancel={() => setIsDeleteModalVisible(false)}
                onConfirm={() => {
                  setIsDeleteModalVisible(false);
                  router.back();
                }}
              />

              <ActionDrawer
                selectedIds={[request.id]}
                operations={request.operations}
                onActionComplete={handleActionComplete}
              />
            </>
          )}
        </>
      )}

      <AppLoader visible={isLoading} />
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyText: { fontSize: 16, color: colors.textMuted },
  scrollContent: { padding: 20, paddingTop: 12 },
  statusBar: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: { color: colors.textPrimary, fontWeight: 'bold', fontSize: 14 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  nameText: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  dateText: { fontSize: 14, color: colors.textMuted },
  belgeNoText: { fontSize: 14, color: colors.textPlaceholder, marginBottom: 20 },
  descriptionText: { fontSize: 14, color: colors.textBody, lineHeight: 20, marginBottom: 8 },
  attachmentButton: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.primaryLightBorder,
  },
  attachmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentIcon: {
    marginRight: 10,
  },
  attachmentButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textDecorationLine: 'underline',
  },
  attachmentLoadingText: {
    marginTop: 8,
    color: colors.attachmentLoadingText,
    fontSize: 12,
    fontWeight: '500',
  },
});

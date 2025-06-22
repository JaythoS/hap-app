export async function saveProjectImageToDatabase(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Base64 formatına çevir
    const base64String = buffer.toString('base64')
    
    // MIME type'ı belirle
    const mimeType = file.type || 'image/jpeg'
    
    // Data URL formatında döndür (veritabanında bu şekilde saklayacağız)
    const dataUrl = `data:${mimeType};base64,${base64String}`
    
    return dataUrl
    
  } catch (error) {
    console.error('Image conversion error:', error)
    throw new Error('Resim dönüştürülürken hata oluştu')
  }
}

export function validateImageFile(file: File): boolean {
  // Dosya boyutu kontrolü (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return false
  }
  
  // Dosya tipi kontrolü
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return false
  }
  
  return true
} 
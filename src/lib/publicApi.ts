const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export type PublicDocumentPayload = {
  kind: string
  label: string
  name: string
  dataUrl: string
}

export async function publicApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, options)
  const payload = await response.json().catch(() => null) as { message?: string } | null
  if (!response.ok) {
    const message = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message
    throw new Error(message || `Request failed with status ${response.status}`)
  }
  return payload as T
}

export function postPublic<T>(path: string, body: Record<string, unknown>) {
  return publicApi<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function fileToDocument(file: File, kind: string, label: string): Promise<PublicDocumentPayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ kind, label, name: file.name, dataUrl: String(reader.result) })
    reader.onerror = () => reject(new Error(`${label} could not be read`))
    reader.readAsDataURL(file)
  })
}

/**
 * API клиент для работы с бекендом
 * 
 * Настройки тестирования:
 * - ENABLE_TEST_DELAY: добавляет случайную задержку 500-2500ms для имитации работы сервера
 * - ENABLE_TEST_ERRORS: имитирует случайные ошибки сети (10% вероятность)
 * 
 * Переменные окружения:
 * - NEXT_PUBLIC_API_URL: базовый URL API (по умолчанию '/api')
 * - NEXT_PUBLIC_ENABLE_TEST_DELAY: принудительно включить тестовые задержки
 * - NEXT_PUBLIC_ENABLE_TEST_ERRORS: принудительно включить тестовые ошибки
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

export interface Note {
  id: string
  title: string
  content: string
  date: string
  topic: string
  isFavorite?: boolean
  image?: string
  files?: NoteFile[]
  link?: string
  color?: string
  showPreview?: boolean
}

export interface NoteFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

// Базовый URL для API (можно настроить через переменные окружения)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Настройки для тестирования (можно отключить в продакшене)
const ENABLE_TEST_DELAY = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_TEST_DELAY === 'true'
const ENABLE_TEST_ERRORS = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_TEST_ERRORS === 'true'

// Универсальная функция для выполнения HTTP запросов
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Логирование запроса для отладки
    if (ENABLE_TEST_DELAY) {
      console.log(`[API] Making request to ${endpoint}`, {
        method: options.method || 'GET',
        testDelay: ENABLE_TEST_DELAY,
        testErrors: ENABLE_TEST_ERRORS,
      })
    }
    
    // Тестовое ожидание для имитации работы с сервером
    if (ENABLE_TEST_DELAY) {
      const delay = Math.random() * 2000 + 500 // 500-2500ms
      console.log(`[API] Simulating ${delay.toFixed(0)}ms delay...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    // Имитация случайных ошибок для тестирования (10% вероятность)
    if (ENABLE_TEST_ERRORS && Math.random() < 0.1) {
      console.log('[API] Simulating network error for testing')
      throw new Error('Simulated network error for testing')
    }
    
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// API для работы с заметками
export const notesApi = {
  // Получить все заметки
  getAll: async (): Promise<ApiResponse<Note[]>> => {
    return apiRequest<Note[]>('/notes')
  },

  // Получить заметку по ID
  getById: async (id: string): Promise<ApiResponse<Note>> => {
    return apiRequest<Note>(`/notes/${id}`)
  },

  // Создать новую заметку
  create: async (note: Omit<Note, 'id' | 'date'>): Promise<ApiResponse<Note>> => {
    return apiRequest<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    })
  },

  // Обновить заметку
  update: async (id: string, note: Partial<Note>): Promise<ApiResponse<Note>> => {
    return apiRequest<Note>(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(note),
    })
  },

  // Удалить заметку
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/notes/${id}`, {
      method: 'DELETE',
    })
  },

  // Переключить статус избранного
  toggleFavorite: async (id: string, isFavorite: boolean): Promise<ApiResponse<Note>> => {
    return apiRequest<Note>(`/notes/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ isFavorite }),
    })
  },

  // Загрузить файл к заметке
  uploadFile: async (noteId: string, file: File): Promise<ApiResponse<NoteFile>> => {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiRequest<NoteFile>(`/notes/${noteId}/files`, {
      method: 'POST',
      headers: {}, // Убираем Content-Type для FormData
      body: formData,
    })
  },

  // Удалить файл из заметки
  deleteFile: async (noteId: string, fileId: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/notes/${noteId}/files/${fileId}`, {
      method: 'DELETE',
    })
  },
}

// API для работы с темами
export const topicsApi = {
  // Получить все темы
  getAll: async (): Promise<ApiResponse<string[]>> => {
    return apiRequest<string[]>('/topics')
  },

  // Создать новую тему
  create: async (name: string): Promise<ApiResponse<string>> => {
    return apiRequest<string>('/topics', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  // Удалить тему
  delete: async (name: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/topics/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    })
  },

  // Переименовать тему
  rename: async (oldName: string, newName: string): Promise<ApiResponse<string>> => {
    return apiRequest<string>(`/topics/${encodeURIComponent(oldName)}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: newName }),
    })
  },
}

// API для поиска
export const searchApi = {
  // Поиск заметок
  searchNotes: async (query: string): Promise<ApiResponse<Note[]>> => {
    return apiRequest<Note[]>(`/search/notes?q=${encodeURIComponent(query)}`)
  },

  // Поиск по темам
  searchTopics: async (query: string): Promise<ApiResponse<string[]>> => {
    return apiRequest<string[]>(`/search/topics?q=${encodeURIComponent(query)}`)
  },
}

// Экспорт всех API для удобства
export const api = {
  notes: notesApi,
  topics: topicsApi,
  search: searchApi,
}

// Утилиты для тестирования
export const testUtils = {
  // Получить текущие настройки тестирования
  getTestSettings: () => ({
    delayEnabled: ENABLE_TEST_DELAY,
    errorsEnabled: ENABLE_TEST_ERRORS,
  }),
  
  // Логировать информацию о запросе (для отладки)
  logRequest: (endpoint: string, options: RequestInit) => {
    if (ENABLE_TEST_DELAY) {
      console.log(`[API] Making request to ${endpoint}`, {
        method: options.method || 'GET',
        testDelay: ENABLE_TEST_DELAY,
        testErrors: ENABLE_TEST_ERRORS,
      })
    }
  },
}

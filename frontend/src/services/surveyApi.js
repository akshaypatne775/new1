import { apiUrl } from '../apiConfig'

async function requestJson(path, payload) {
  const response = await fetch(apiUrl(path), {
    method: payload == null ? 'GET' : 'POST',
    headers: payload == null ? undefined : { 'Content-Type': 'application/json' },
    body: payload == null ? undefined : JSON.stringify(payload),
  })
  if (!response.ok) {
    let detail = `Request failed: ${path}`
    try {
      const errJson = await response.json()
      detail = errJson?.detail || detail
    } catch {
      // ignore parse failure
    }
    throw new Error(detail)
  }
  return response.json().catch(() => ({}))
}

export const getSurveys = () => requestJson('/get-surveys')
export const getShapes = () => requestJson('/get-shapes')
export const saveSurvey = (payload) => requestJson('/save-survey', payload)
export const saveShape = (payload) => requestJson('/save-shape', payload)
export const updateShape = (payload) => requestJson('/update-shape', payload)
export const deleteShape = (id) => requestJson('/delete-shape', { id })
export const updateShapeAssignment = (payload) => requestJson('/update-shape-assignment', payload)
export const updateSurvey = (payload) => requestJson('/update-survey', payload)
export const deleteSurvey = (id) => requestJson('/delete-survey', { id })

import { useState } from 'react'
import toast from 'react-hot-toast'
import FieldMapModal from './FieldMapModal'
import StructureTypeSelector from './shared/StructureTypeSelector'
import SurveyCoreFields from './shared/SurveyCoreFields'
import DocumentTrackingSection from './shared/DocumentTrackingSection'
import { PHOTO_DOC_DEF } from '../utils/documentRegistry'
import { encodeSurveyFileInputs } from '../utils/fileEncoding'
import * as surveyApi from '../services/surveyApi'
import { buildShapePayload, buildSurveyCreatePayload } from '../services/surveyPayloads'
import './FieldApp.css'

const initialState = {
  propertyId: '',
  ownerName: '',
  structureTypes: [],
  acquisitionStage: 'Notice 37(2) Distribution',
  noticeSent: 'No',
  moneyDistributed: 0,
  areaSqft: '',
  numberOfTrees: 0,
  totalDistribution: 0,
  samarpanReceipt: false,
  fieldSurveyDone: false,
  ownerVerification: false,
  aadharCollected: false,
  panCollected: false,
  bankDetailsCollected: false,
  aadharFile: null,
  panFile: null,
  bankFile: null,
  ownerVerifFile: null,
  samarpanFile: null,
  surveyFile: null,
  photoFile: null,
}

function FieldApp() {
  const [formData, setFormData] = useState(initialState)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [capturedShapes, setCapturedShapes] = useState([])
  const [coordinates, setCoordinates] = useState(null)

  const toggleStructure = (value) => {
    setFormData((prev) => {
      const found = prev.structureTypes.includes(value)
      return {
        ...prev,
        structureTypes: found
          ? prev.structureTypes.filter((s) => s !== value)
          : [...prev.structureTypes, value],
      }
    })
  }

  const pushDataToServer = async (lat, lng) => {
    const totalArea = capturedShapes.reduce((sum, s) => sum + (s.areaSqft || 0), 0)
    const encodedFiles = await encodeSurveyFileInputs(formData)
    const payload = buildSurveyCreatePayload({
      formData,
      encodedFiles,
      lat,
      lng,
      totalArea,
      defaults: { state: 'Field', district: 'Field' },
    })
    await surveyApi.saveSurvey(payload)

    if (capturedShapes.length > 0) {
      for (const shape of capturedShapes) {
        await surveyApi.saveShape(buildShapePayload(shape, formData.propertyId))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.photoFile) {
      toast.error('Please select a site photograph.')
      return
    }
    if (!coordinates && !navigator.geolocation) {
      toast.error('GPS unavailable. Please capture location from map modal.')
      return
    }

    try {
      let lat
      let lng
      if (coordinates) {
        lat = coordinates.lat
        lng = coordinates.lng
      } else {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 0,
            })
          })
          lat = position.coords.latitude
          lng = position.coords.longitude
        } catch (geoErr) {
          const code = geoErr?.code
          if (code === 1) {
            toast.error('Location access denied. Please select location from the map manually.')
          } else if (code === 2) {
            toast.error('GPS position unavailable. Please set your location on the map.')
          } else if (code === 3) {
            toast.error('Location request timed out. Please try again or pick a point on the map.')
          } else {
            toast.error('Could not read your location. Please select location from the map manually.')
          }
          return
        }
      }

      await pushDataToServer(lat, lng)

      setFormData(initialState)
      setCapturedShapes([])
      setCoordinates(null)
      toast.success('Survey data saved successfully.')
    } catch (err) {
      toast.error(err?.message || 'Failed to save survey. Please try again.')
    }
  }

  return (
    <div className="field-page">
      <div className="field-card">
        <div className="field-header">
          <h2>
            <i className="fas fa-clipboard-list"></i> Add Survey Data
          </h2>
          <span>Fill details, draw boundaries, then save</span>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" value={coordinates?.lat ?? ''} readOnly />
          <input type="hidden" value={coordinates?.lng ?? ''} readOnly />

          <SurveyCoreFields
            formData={formData}
            setFormData={setFormData}
            capturedShapesCount={capturedShapes.length}
            onBoundaryClick={() => setIsMapOpen(true)}
            canStartBoundary
          />
          <StructureTypeSelector selected={formData.structureTypes} onToggle={toggleStructure} />
          <DocumentTrackingSection formData={formData} setFormData={setFormData} />

          <div className="field-group">
            <label>Site Photo (Optional)</label>
            <div className="upload-box">
              <div className="upload-title">{PHOTO_DOC_DEF.label}</div>
              <input
                type="file"
                accept={PHOTO_DOC_DEF.accept}
                onChange={(e) => setFormData((p) => ({ ...p, photoFile: e.target.files?.[0] || null }))}
                required
              />
            </div>
          </div>

          <div className="field-actions">
            <button type="submit" className="btn-save">
              <i className="fas fa-save"></i> Save Data
            </button>
            <button type="button" className="btn-edit" onClick={() => setIsMapOpen(true)}>
              <i className="fas fa-edit"></i> Edit Shape Boundaries
            </button>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setFormData(initialState)
                setCapturedShapes([])
                setCoordinates(null)
              }}
            >
              Close
            </button>
          </div>
        </form>
      </div>
      <FieldMapModal
        isOpen={isMapOpen}
        selectedStructures={formData.structureTypes}
        onClose={() => setIsMapOpen(false)}
        onDone={({ coordinates: point, capturedShapes: shapes }) => {
          if (point) setCoordinates(point)
          setCapturedShapes(shapes || [])
          setFormData((prev) => ({
            ...prev,
            areaSqft: (shapes || []).reduce((sum, s) => sum + (s.areaSqft || 0), 0).toFixed(2),
          }))
          setIsMapOpen(false)
        }}
      />
    </div>
  )
}

export default FieldApp

import React, { useState } from 'react'
import { X, Plus, Trash2, Loader2, Save, FileText, CheckCircle } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { api } from '@/lib/api'

interface CriteriaItem {
  heading: string
  description: string
}

interface SetCriteriaModalProps {
  projectId: number
  existingCriteria: any | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SetCriteriaModal({
  projectId,
  existingCriteria,
  isOpen,
  onClose,
  onSuccess
}: SetCriteriaModalProps) {
  // If we already have custom_criteria, it means it's set and should be read-only.
  const isReadOnly = !!existingCriteria
  const [criteria, setCriteria] = useState<CriteriaItem[]>(() => {
    if (isReadOnly && existingCriteria?.criteriaBreakdown) {
      // Map the backend structure back to our list of items
      const breakdown = existingCriteria.criteriaBreakdown
      return Object.keys(breakdown).map(key => {
        // Extract the original description by removing the "string - " prefix if present
        let desc = breakdown[key].detailedReasoning || ''
        if (desc.startsWith('string - ')) {
          desc = desc.substring(9)
        }
        
        // Convert camelCase key back to a readable heading, or just use the key
        const heading = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        return {
          heading: heading,
          description: desc
        }
      })
    }
    return [{ heading: '', description: '' }]
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleAddCriteria = () => {
    setCriteria([...criteria, { heading: '', description: '' }])
  }

  const handleRemoveCriteria = (index: number) => {
    if (criteria.length <= 1) return // Must have at least one
    const newCriteria = [...criteria]
    newCriteria.splice(index, 1)
    setCriteria(newCriteria)
  }

  const handleChange = (index: number, field: keyof CriteriaItem, value: string) => {
    const newCriteria = [...criteria]
    newCriteria[index][field] = value
    setCriteria(newCriteria)
  }

  const handleSave = async () => {
    // Validate
    const invalid = criteria.some(c => !c.heading.trim() || !c.description.trim())
    if (invalid) {
      setError('Please fill out all headings and descriptions before saving.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      await api.updateProjectCustomCriteria(projectId, criteria)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to save custom criteria')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-background rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {isReadOnly ? 'Project Criteria' : 'Set Custom Criteria'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isReadOnly
                ? 'These are the evaluation criteria set for this project.'
                : 'Define the compliances you want to check for this project.'}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {!isReadOnly && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-200">
              <strong>Note:</strong> Once saved, these criteria are permanently attached to this project and cannot be changed.
            </div>
          )}

          <div className="space-y-6">
            {criteria.map((item, index) => (
              <div key={index} className="p-4 bg-muted/30 border rounded-lg relative group">
                {!isReadOnly && criteria.length > 1 && (
                  <button
                    onClick={() => handleRemoveCriteria(index)}
                    className="absolute -top-3 -right-3 p-1.5 bg-background border rounded-full text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Remove criteria"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Heading (Compliance Name)</label>
                    <input
                      type="text"
                      value={item.heading}
                      onChange={(e) => handleChange(index, 'heading', e.target.value)}
                      placeholder="e.g., Technical Feasibility"
                      className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description (Detailed Reasoning)</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleChange(index, 'description', e.target.value)}
                      placeholder="e.g., Does the proposed engineering solution or technology match the specific requirements..."
                      className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-y"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isReadOnly && (
            <Button
              variant="outline"
              onClick={handleAddCriteria}
              className="w-full mt-6 border-dashed border-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Criteria
            </Button>
          )}
        </div>

        <div className="p-6 border-t bg-muted/10 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Criteria
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

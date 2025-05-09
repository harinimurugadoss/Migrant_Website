import React, { useState } from 'react'
import { uploadDocument } from '../utils/api'

const DocumentUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null)
  const [docType, setDocType] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const documentTypes = [
    { value: 'aadhar', label: 'Aadhar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'voter', label: 'Voter ID' },
    { value: 'driving', label: 'Driving License' },
    { value: 'passport', label: 'Passport' },
    { value: 'education', label: 'Education Certificate' },
    { value: 'work', label: 'Work Experience Certificate' },
    { value: 'other', label: 'Other' },
  ]

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    
    if (!selectedFile) {
      setFile(null)
      return
    }
    
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or Image file (JPEG, PNG)')
      setFile(null)
      return
    }
    
    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB')
      setFile(null)
      return
    }
    
    setError('')
    setFile(selectedFile)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file || !docType) {
      setError('Please select a file and document type')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', docType)
      formData.append('description', description)
      
      const response = await uploadDocument(formData)
      
      if (response.data && response.data.success) {
        setFile(null)
        setDocType('')
        setDescription('')
        if (onUploadSuccess) {
          onUploadSuccess(response.data.document)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading document. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-medium text-gray-900">Upload Document</h3>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="docType" className="mb-1 block text-sm font-medium text-gray-700">
            Document Type*
          </label>
          <select
            id="docType"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            required
          >
            <option value="">Select Document Type</option>
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Brief description of the document"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="file" className="mb-1 block text-sm font-medium text-gray-700">
            Select File*
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Accepted formats: PDF, JPEG, PNG (Max 5MB)
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading || !file || !docType}
          className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {loading ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </>
          ) : (
            'Upload Document'
          )}
        </button>
      </form>
    </div>
  )
}

export default DocumentUpload

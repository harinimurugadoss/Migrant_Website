import React from 'react'
import { format } from 'date-fns'

const WorkerCard = ({ worker, onApprove, onDelete, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return format(new Date(dateString), 'dd MMM yyyy')
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{worker.name}</h3>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
              worker.status
            )}`}
          >
            {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
          </span>
        </div>

        <div className="mt-2">
          <p className="text-sm font-medium text-gray-500">Worker ID</p>
          <p className="text-sm text-gray-900">{worker.workerId}</p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="overflow-hidden overflow-ellipsis text-sm text-gray-900">
              {worker.email}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="text-sm text-gray-900">{worker.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Registration Date</p>
            <p className="text-sm text-gray-900">{formatDate(worker.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Documents</p>
            <p className="text-sm text-gray-900">
              {worker.documents ? worker.documents.length : 0} Uploaded
            </p>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => onViewDetails(worker._id)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            View Details
          </button>
          {worker.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(worker._id)}
                className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => onDelete(worker._id)}
                className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-700"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkerCard

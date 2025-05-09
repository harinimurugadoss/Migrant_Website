import React from 'react'
import { format } from 'date-fns'

const TaskCard = ({ task, isAdmin, onMarkComplete, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return format(new Date(dateString), 'dd MMM yyyy')
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
          <div className="flex space-x-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                task.status
              )}`}
            >
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityBadgeClass(
                task.priority
              )}`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600">{task.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Due Date</p>
            <p className="text-sm text-gray-900">{formatDate(task.dueDate)}</p>
          </div>

          {isAdmin ? (
            <div>
              <p className="text-sm font-medium text-gray-500">Assigned To</p>
              <p className="text-sm text-gray-900">
                {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-500">Assigned By</p>
              <p className="text-sm text-gray-900">
                {task.assignedBy ? task.assignedBy.name : 'System'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex space-x-2">
          {!isAdmin && task.status !== 'completed' && (
            <button
              onClick={() => onMarkComplete(task._id)}
              className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-700"
            >
              Mark as Complete
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => onDelete(task._id)}
              className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard

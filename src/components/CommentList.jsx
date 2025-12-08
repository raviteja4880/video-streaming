import React, { memo } from 'react'

function CommentList({ comments, onDelete, meId }) {
  return (
    <div className="list-group">
      {comments.map(c => (
        <div key={c._id} className="list-group-item bg-transparent text-light d-flex justify-content-between align-items-start">
          <div>
            <strong>{c.user?.name || 'User'}</strong>
            <div className="small text-secondary">{c.text}</div>
          </div>
          {meId === c.user?._id && (
            <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(c._id)}>Delete</button>
          )}
        </div>
      ))}
    </div>
  )
}
export default memo(CommentList)

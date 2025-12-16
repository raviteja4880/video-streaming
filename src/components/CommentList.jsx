import React, { memo } from "react";
import { FaTrashAlt } from "react-icons/fa";

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

function CommentList({ comments = [], onDelete, meId }) {
  return (
    <div className="comment-list">
      {comments.map((c) => {
        const avatar =
          c.user?.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            c.user?.name || "User"
          )}`;

        return (
          <div key={c._id} className="comment-item">
            {/* Avatar */}
            <img
              src={avatar}
              alt={c.user?.name}
              className="comment-avatar"
            />

            {/* Body */}
            <div className="comment-body flex-grow-1">
              <div className="comment-header">
                <div className="comment-info">
                  <span className="comment-author">
                    {c.user?.name || "Unknown"}
                  </span>
                  <span className="comment-timestamp">
                    {c.createdAt ? timeAgo(c.createdAt) : ""}
                  </span>
                </div>

                {meId === c.user?._id && (
                  <button
                    className="icon-delete-btn"
                    onClick={() => onDelete(c._id)}
                    title="Delete comment"
                  >
                    <FaTrashAlt size={13} />
                  </button>
                )}
              </div>

              <p className="comment-text">{c.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(CommentList);

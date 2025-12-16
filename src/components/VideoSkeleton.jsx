import React from "react";
import "./videoSkeleton.css";

export default function VideoCardSkeleton() {
  return (
    <div className="vcard skeleton-card">
      {/* Thumbnail Skeleton */}
      <div className="vcard-thumbnail">
        <div className="skeleton-thumb shimmer"></div>
      </div>

      {/* Info Skeleton */}
      <div className="vcard-info">
        <div className="skeleton-title shimmer"></div>

        <div className="vcard-meta">
          <div className="vcard-author">
            <div className="skeleton-avatar shimmer"></div>
            <div className="skeleton-author shimmer"></div>
          </div>

          <div className="vcard-meta-right">
            <div className="skeleton-meta shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

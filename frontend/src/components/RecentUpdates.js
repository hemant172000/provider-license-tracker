import React from 'react';

const RecentUpdates = () => {
  const updates = [
    { text: 'Renewal submitted for Dr. Emily Clark', color: 'dot-blue' },
    { text: 'Document uploaded for Dr. John Smith', color: 'dot-blue' },
    { text: 'License expired for Dr. Mark Lee', color: 'dot-yellow' },
  ];

  return (
    <div className="recent-updates">
      <h3>Recent Updates</h3>
      {updates.map((u, i) => (
        <div className="update-item" key={i}>
          <div className={`update-dot ${u.color}`}></div>
          <span>{u.text}</span>
        </div>
      ))}
    </div>
  );
};

export default RecentUpdates;

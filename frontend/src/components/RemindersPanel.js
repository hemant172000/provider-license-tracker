import React from 'react';

const RemindersPanel = ({ providers }) => {
  const reminders = [
    { text: 'License for Dr. Mark Lee has expired!', checked: true },
    { text: 'Reminder: Update provider profiles', checked: true },
    { text: 'New provider assigned to you', checked: true },
  ];

  return (
    <div className="reminders-panel">
      <h3>Reminders</h3>
      {reminders.map((r, i) => (
        <div className="reminder-item" key={i}>
          <input type="checkbox" defaultChecked={r.checked} readOnly />
          <span>{r.text}</span>
        </div>
      ))}
    </div>
  );
};
export default RemindersPanel;

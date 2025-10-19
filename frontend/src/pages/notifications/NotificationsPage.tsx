import React from 'react';

const NotificationsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600">You have no new notifications.</p>
      </div>
    </div>
  );
};

export default NotificationsPage;
import React from 'react';

const Badge = ({ status, className = '' }) => {
  let colorClass = '';
  
  const labelMap = {
    'ACTIVE': 'Hoạt động',
    'PRESENT': 'Có mặt',
    'COMPLETED': 'Hoàn thành',
    'UPCOMING': 'Sắp diễn ra',
    'SCHEDULED': 'Đã lên lịch',
    'EXCUSED': 'Có phép',
    'LATE': 'Muộn',
    'ABSENT': 'Vắng mặt',
    'CANCELLED': 'Đã hủy',
    'FINISHED': 'Đã kết thúc',
    'ONGOING': 'Đang diễn ra',
    'ENROLLED': 'Đang học',
    'DROPPED': 'Đã thôi học',
  };

  const displayLabel = labelMap[status?.toUpperCase()] || status || 'Không xác định';

  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'PRESENT':
    case 'COMPLETED':
    case 'ONGOING':
    case 'ENROLLED':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case 'UPCOMING':
    case 'SCHEDULED':
    case 'EXCUSED':
      colorClass = 'bg-blue-100 text-blue-800';
      break;
    case 'LATE':
      colorClass = 'bg-yellow-100 text-yellow-800';
      break;
    case 'ABSENT':
    case 'CANCELLED':
    case 'DROPPED':
      colorClass = 'bg-red-100 text-red-800';
      break;
    case 'FINISHED':
      colorClass = 'bg-gray-100 text-gray-800';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {displayLabel}
    </span>
  );
};

export default Badge;

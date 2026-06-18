export const formatDate = (dateString) => {
  if (!dateString) return 'Không có';
  
  const date = new Date(dateString);
  
  // Check for invalid date
  if (isNaN(date.getTime())) return 'Không có';
  
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return 'Không có';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return 'Không có';
  
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

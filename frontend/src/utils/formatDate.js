export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check for invalid date
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

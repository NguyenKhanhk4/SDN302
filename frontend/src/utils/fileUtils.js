/**
 * Tải file từ URL về máy tính (hỗ trợ cross-origin)
 * @param {string} fileUrl - URL đầy đủ của file
 * @param {string} fileName - Tên file khi tải về (tùy chọn)
 */
export const downloadFile = async (fileUrl, fileName) => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Không thể tải file. Server trả về lỗi: ' + response.status);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || fileUrl.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Lỗi tải file:', err);
    alert('Không thể tải file: ' + err.message);
  }
};

/**
 * Lấy tên file từ đường dẫn
 * @param {string} pathStr - đường dẫn file
 */
export const getFileName = (pathStr) => {
  if (!pathStr) return '';
  const parts = pathStr.split(/[/\\]/);
  return parts[parts.length - 1];
};

/**
 * Chuyển đường dẫn backend thành URL HTTP đầy đủ
 * @param {string} filePath - đường dẫn file từ DB (uploads/sessions/...)
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const cleaned = filePath.replace(/\\/g, '/');
  return `${baseUrl}/${cleaned}`;
};

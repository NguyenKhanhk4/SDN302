export const getCurrentYear = () => {
  return new Date().getFullYear();
};

const getFirstMonday = (year) => {
  const d = new Date(year, 0, 1);
  const day = d.getDay();
  // If Jan 1 is Monday (1), diff is 0
  // If Jan 1 is Sunday (0), diff is 1
  // If Jan 1 is Tuesday (2), diff is 6
  const diff = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

export const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

export const toISODate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWeekOptions = (year) => {
  const options = [];
  const firstMonday = getFirstMonday(year);
  let d = new Date(firstMonday);
  let week = 1;

  while (d.getFullYear() === year || (d.getFullYear() === year + 1 && d.getDate() < 4)) {
    const start = new Date(d);
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    
    const label = `${formatDate(start)} - ${formatDate(end)}`;
    options.push({ value: week, label, startDate: start, endDate: end });
    
    d.setDate(d.getDate() + 7);
    week++;
  }
  return options;
};

export const getWeekDates = (year, weekNumber) => {
  const firstMonday = getFirstMonday(year);
  const startOfWeek = new Date(firstMonday);
  startOfWeek.setDate(startOfWeek.getDate() + (weekNumber - 1) * 7);
  
  const dates = [];
  const dayLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  const backendDays = [1, 2, 3, 4, 5, 6, 0]; // Monday=1, Sunday=0 in backend

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    dates.push({
      label: dayLabels[i],
      date: d,
      dayOfWeek: backendDays[i],
      displayDate: formatDate(d),
      isoDate: toISODate(d)
    });
  }
  return dates;
};

export const getCurrentWeekNumber = () => {
  const now = new Date();
  const firstMonday = getFirstMonday(now.getFullYear());
  
  if (now < firstMonday) return 1;
  
  // Reset hours to avoid daylight saving issues
  now.setHours(0, 0, 0, 0);
  firstMonday.setHours(0, 0, 0, 0);
  
  const diffTime = now.getTime() - firstMonday.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
};

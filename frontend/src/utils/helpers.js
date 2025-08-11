import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE'); // Monday, Tuesday, etc.
  }
  
  if (isThisYear(dateObj)) {
    return format(dateObj, 'MMM d'); // Jan 15
  }
  
  return format(dateObj, 'MMM d, yyyy'); // Jan 15, 2023
}

export function formatDateForInput(date) {
  if (!date) return '';
  return format(new Date(date), 'yyyy-MM-dd');
}

export function getDifficultyColor(difficulty) {
  const colors = {
    Easy: 'text-green-600',
    Medium: 'text-yellow-600',
    Hard: 'text-red-600'
  };
  return colors[difficulty] || 'text-gray-600';
}

export function getDifficultyBadgeClasses(difficulty) {
  const classes = {
    Easy: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Hard: 'bg-red-100 text-red-800 border-red-200'
  };
  return classes[difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateHeatmapData(heatmapData, startDate, endDate) {
  const data = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    data.push({
      date: dateStr,
      count: heatmapData[dateStr] || 0
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
}

export function getHeatmapColor(count) {
  if (count === 0) return 'bg-gray-200 dark:bg-gray-700';
  if (count === 1) return 'bg-green-200 dark:bg-green-800';
  if (count === 2) return 'bg-green-300 dark:bg-green-700';
  if (count >= 3 && count <= 4) return 'bg-green-400 dark:bg-green-600';
  if (count >= 5 && count <= 7) return 'bg-green-500 dark:bg-green-500';
  return 'bg-green-600 dark:bg-green-400'; // For 8+ questions per day
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Theme utility functions for consistent theming across components

export const getThemeColor = (colorVar) => {
  return `var(--${colorVar})`;
};

export const getThemeStyle = (property, colorVar) => {
  return { [property]: `var(--${colorVar})` };
};

// Common theme-aware styles
export const themeStyles = {
  // Text colors
  textPrimary: { color: 'var(--text-primary)' },
  textSecondary: { color: 'var(--text-secondary)' },
  textTertiary: { color: 'var(--text-tertiary)' },
  textMuted: { color: 'var(--text-muted)' },
  
  // Background colors
  bgPrimary: { backgroundColor: 'var(--bg-primary)' },
  bgSecondary: { backgroundColor: 'var(--bg-secondary)' },
  bgElevated: { backgroundColor: 'var(--bg-elevated)' },
  
  // Border colors
  borderPrimary: { borderColor: 'var(--border-primary)' },
  borderSecondary: { borderColor: 'var(--border-secondary)' },
};

// Theme-aware class names for commonly used combinations
export const themeClasses = {
  card: 'card',
  input: 'input',
  label: 'label',
  btnPrimary: 'btn-primary',
  btnSecondary: 'btn-secondary',
  sidebarItem: 'sidebar-item',
  topicItem: 'topic-item',
  themeToggle: 'theme-toggle',
};


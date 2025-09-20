/**
 * Frontend ID Formatter Utility
 * Formats numeric IDs with prefixes for display in the frontend
 */

// Table prefixes for display
const TABLE_PREFIXES = {
  'purchase_orders': 'PO',
  'orders': 'ORD',
  'invoices': 'INV',
  'customers': 'CUST',
  'products': 'PROD',
  'suppliers': 'SUPP',
  'employees': 'EMP',
  'payments': 'PAY',
  'refunds': 'REF',
  'warranties': 'WAR',
  'categories': 'CAT',
  'users': 'USER',
  'expenses': 'EXP',
  'activities': 'ACT',
  'settings': 'SET',
  'company': 'COMP',
  'company_settings': 'CS',
  'order_items': 'OI',
  'purchase_order_items': 'POI'
};

/**
 * Format a numeric ID with its table prefix
 * @param {string} tableName - The table name
 * @param {number} id - The numeric ID
 * @returns {string} - Formatted ID (e.g., "PO1001")
 */
export function formatId(tableName, id) {
  if (!id) return '';
  
  const prefix = TABLE_PREFIXES[tableName] || 'ID';
  return `${prefix}${id}`;
}

/**
 * Parse a prefixed ID back to numeric ID
 * @param {string} prefixedId - The prefixed ID (e.g., "PO1001")
 * @returns {number} - The numeric ID
 */
export function parseId(prefixedId) {
  if (!prefixedId || typeof prefixedId !== 'string') return null;
  
  // Extract numeric part
  const match = prefixedId.match(/\d+$/);
  return match ? parseInt(match[0]) : null;
}

/**
 * Format an ID for display with # prefix
 * @param {string} tableName - The table name
 * @param {number} id - The numeric ID
 * @returns {string} - Formatted ID with # (e.g., "#PO1001")
 */
export function formatDisplayId(tableName, id) {
  if (!id) return '';
  return `#${formatId(tableName, id)}`;
}

/**
 * Get the appropriate prefix for a table
 * @param {string} tableName - The table name
 * @returns {string} - The prefix for the table
 */
export function getPrefix(tableName) {
  return TABLE_PREFIXES[tableName] || 'ID';
}

/**
 * Format multiple items in an array with display IDs
 * @param {Array} items - Array of items with numeric IDs
 * @param {string} tableName - The table name
 * @param {string} idField - The ID field name (default: 'id')
 * @returns {Array} - Items with added display_id field
 */
export function formatItemsWithDisplayId(items, tableName, idField = 'id') {
  if (!Array.isArray(items)) return items;
  
  return items.map(item => ({
    ...item,
    display_id: formatDisplayId(tableName, item[idField])
  }));
}

/**
 * Get a short display ID (without table prefix)
 * @param {number} id - The numeric ID
 * @returns {string} - Short ID (e.g., "#1001")
 */
export function formatShortId(id) {
  if (!id) return '';
  return `#${id}`;
}

/**
 * Validate if an ID follows the expected format
 * @param {string} prefixedId - The prefixed ID to validate
 * @returns {boolean} - True if valid format
 */
export function isValidIdFormat(prefixedId) {
  if (!prefixedId || typeof prefixedId !== 'string') return false;
  
  // Remove # if present
  const cleanId = prefixedId.replace(/^#/, '');
  
  // Check if it matches pattern: PREFIX + 4+ digits
  const pattern = /^[A-Z]+\d{4,}$/;
  return pattern.test(cleanId);
}

/**
 * Get display color for different ID types
 * @param {string} tableName - The table name
 * @returns {string} - CSS color class or hex color
 */
export function getIdColor(tableName) {
  const colors = {
    'purchase_orders': 'text-blue-600',
    'orders': 'text-green-600',
    'invoices': 'text-purple-600',
    'customers': 'text-orange-600',
    'products': 'text-indigo-600',
    'suppliers': 'text-teal-600',
    'employees': 'text-pink-600',
    'payments': 'text-emerald-600',
    'refunds': 'text-red-600',
    'warranties': 'text-yellow-600'
  };
  
  return colors[tableName] || 'text-gray-600';
}

/**
 * Get display badge style for different ID types
 * @param {string} tableName - The table name
 * @returns {string} - CSS classes for badge styling
 */
export function getIdBadgeStyle(tableName) {
  const styles = {
    'purchase_orders': 'bg-blue-100 text-blue-800 border-blue-200',
    'orders': 'bg-green-100 text-green-800 border-green-200',
    'invoices': 'bg-purple-100 text-purple-800 border-purple-200',
    'customers': 'bg-orange-100 text-orange-800 border-orange-200',
    'products': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'suppliers': 'bg-teal-100 text-teal-800 border-teal-200',
    'employees': 'bg-pink-100 text-pink-800 border-pink-200',
    'payments': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'refunds': 'bg-red-100 text-red-800 border-red-200',
    'warranties': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };
  
  return styles[tableName] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * React component for displaying formatted IDs
 * @param {Object} props - Component props
 * @param {string} props.tableName - The table name
 * @param {number} props.id - The numeric ID
 * @param {boolean} props.showBadge - Whether to show as badge
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Formatted ID component
 */
export function IdDisplay({ tableName, id, showBadge = false, className = '' }) {
  if (!id) return null;
  
  const displayId = formatDisplayId(tableName, id);
  
  if (showBadge) {
    const badgeStyle = getIdBadgeStyle(tableName);
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${badgeStyle} ${className}`}>
        {displayId}
      </span>
    );
  }
  
  const colorStyle = getIdColor(tableName);
  return (
    <span className={`font-mono font-medium ${colorStyle} ${className}`}>
      {displayId}
    </span>
  );
}

// Default export with all functions
export default {
  formatId,
  parseId,
  formatDisplayId,
  getPrefix,
  formatItemsWithDisplayId,
  formatShortId,
  isValidIdFormat,
  getIdColor,
  getIdBadgeStyle,
  IdDisplay,
  TABLE_PREFIXES
};

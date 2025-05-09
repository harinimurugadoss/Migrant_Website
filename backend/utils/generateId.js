/**
 * Generate a unique worker ID based on home state and timestamp
 * Format: TN-[STATE_CODE]-[YEAR]-[SEQUENCE]
 * @param {string} homeState - The worker's home state
 * @returns {string} The generated worker ID
 */
const generateId = (homeState) => {
  // State code mapping (simplified for major states)
  const stateCodes = {
    'Andhra Pradesh': 'AP',
    'Arunachal Pradesh': 'AR',
    'Assam': 'AS',
    'Bihar': 'BR',
    'Chhattisgarh': 'CG',
    'Goa': 'GA',
    'Gujarat': 'GJ',
    'Haryana': 'HR',
    'Himachal Pradesh': 'HP',
    'Jharkhand': 'JH',
    'Karnataka': 'KA',
    'Kerala': 'KL',
    'Madhya Pradesh': 'MP',
    'Maharashtra': 'MH',
    'Manipur': 'MN',
    'Meghalaya': 'ML',
    'Mizoram': 'MZ',
    'Nagaland': 'NL',
    'Odisha': 'OD',
    'Punjab': 'PB',
    'Rajasthan': 'RJ',
    'Sikkim': 'SK',
    'Tamil Nadu': 'TN',
    'Telangana': 'TG',
    'Tripura': 'TR',
    'Uttar Pradesh': 'UP',
    'Uttarakhand': 'UK',
    'West Bengal': 'WB'
  };

  // Get state code or default to "XX" if not found
  const stateCode = stateCodes[homeState] || 'XX';
  
  // Get current year
  const year = new Date().getFullYear().toString().substr(2, 2);
  
  // Generate a random 6-digit sequence
  const sequence = Math.floor(100000 + Math.random() * 900000);
  
  // Combine to form the worker ID
  return `TN-${stateCode}-${year}-${sequence}`;
};

module.exports = generateId;

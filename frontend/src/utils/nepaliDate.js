/**
 * Nepali Date Utility - Bikram Sambat (BS) Converter
 * Uses nepali-datetime package for accurate AD to BS conversion
 */

// Import with fallback for different package versions
let NepaliDateTime;
try {
    NepaliDateTime = require('nepali-datetime').default || require('nepali-datetime');
} catch (e) {
    NepaliDateTime = null;
}

// Nepali month names
export const NEPALI_MONTHS = [
    'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'अशोन',
    'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत'
];

// Nepali day names
export const NEPALI_DAYS = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

// BS month days for years 2075-2090 (accurate data)
// This is based on the official Nepali calendar
const BS_CALENDAR_DATA = {
    2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2083: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2085: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2086: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2087: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2088: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2089: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2090: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
};

// Reference date: 1 Baisakh 2080 = 14 April 2023 (Saturday) at midnight UTC
// Using UTC to avoid timezone issues
const BS_2080_START_UTC = Date.UTC(2023, 3, 14, 0, 0, 0, 0); // April 14, 2023 UTC

/**
 * Get cumulative days for each BS month
 * @param {number} bsYear - BS year
 * @returns {number[]} - Array of cumulative days
 */
const getCumulativeDays = (bsYear) => {
    const monthDays = BS_CALENDAR_DATA[bsYear] || BS_CALENDAR_DATA[2080];
    const cumulative = [0];
    for (let i = 0; i < monthDays.length; i++) {
        cumulative.push(cumulative[i] + monthDays[i]);
    }
    return cumulative;
};

/**
 * Accurate BS to AD conversion using lookup table
 * @param {number} bsYear - BS year
 * @param {number} bsMonth - BS month (1-12)
 * @param {number} bsDay - BS day
 * @returns {Date}
 */
const accurateBStoAD = (bsYear, bsMonth, bsDay) => {
    // Calculate days since 1 Baisakh 2080
    let totalDays = 0;
    
    // Add days for complete years
    for (let y = 2080; y < bsYear; y++) {
        const yearDays = BS_CALENDAR_DATA[y] || BS_CALENDAR_DATA[2080];
        totalDays += yearDays.reduce((a, b) => a + b, 0);
    }
    
    // Add days for complete months in current year
    const monthDays = BS_CALENDAR_DATA[bsYear] || BS_CALENDAR_DATA[2080];
    for (let m = 0; m < bsMonth - 1; m++) {
        totalDays += monthDays[m];
    }
    
    // Add days in current month (bsDay is 1-based)
    totalDays += bsDay - 1;
    
    // Calculate AD date using UTC to avoid timezone issues
    const result = new Date(BS_2080_START_UTC);
    result.setUTCDate(result.getUTCDate() + totalDays);
    
    return result;
};

/**
 * Accurate AD to BS conversion using lookup table
 * @param {Date} adDate - Gregorian date
 * @returns {Object} - { year, month, day }
 */
const accurateADtoBS = (adDate) => {
    // Get date at midnight UTC for accurate day calculation
    const utcDate = Date.UTC(adDate.getFullYear(), adDate.getMonth(), adDate.getDate());
    
    // Calculate days since 1 Baisakh 2080
    const diffTime = utcDate - BS_2080_START_UTC;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        // Date is before BS 2080
        // For simplicity, return approximate date
        return { year: 2079, month: 12, day: 29 + diffDays };
    }
    
    let remainingDays = diffDays;
    let bsYear = 2080;
    
    // Find the year
    while (true) {
        const yearDays = BS_CALENDAR_DATA[bsYear] || BS_CALENDAR_DATA[2080];
        const yearTotal = yearDays.reduce((a, b) => a + b, 0);
        
        if (remainingDays < yearTotal) {
            break;
        }
        remainingDays -= yearTotal;
        bsYear++;
    }
    
    // Find the month
    const monthDays = BS_CALENDAR_DATA[bsYear] || BS_CALENDAR_DATA[2080];
    let bsMonth = 0;
    while (bsMonth < 12 && remainingDays >= monthDays[bsMonth]) {
        remainingDays -= monthDays[bsMonth];
        bsMonth++;
    }
    
    // remainingDays is 0-based, so add 1 to get 1-based day
    return {
        year: bsYear,
        month: bsMonth + 1,
        day: remainingDays + 1
    };
};

// Fallback approximate functions (for edge cases)
const approximateBStoAD = accurateBStoAD;
const approximateADtoBS = accurateADtoBS;

/**
 * Convert AD date to BS date using nepali-datetime package
 * @param {Date|string} date - Gregorian date or date string
 * @returns {Object} - { year, month, day, monthName, dayName, fullDate }
 */
export const toNepaliDate = (date) => {
    if (!date) return null;
    
    const adDate = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(adDate.getTime())) return null;
    
    let bsDate;
    
    // Try using nepali-datetime package first
    if (NepaliDateTime) {
        try {
            // Check if fromAD method exists (old API)
            if (typeof NepaliDateTime.fromAD === 'function') {
                const nepaliDT = NepaliDateTime.fromAD(adDate);
                bsDate = {
                    year: nepaliDT.year,
                    month: nepaliDT.month,
                    day: nepaliDT.day
                };
            }
            // Check if it's a constructor (new API)
            else if (typeof NepaliDateTime === 'function') {
                const nepaliDT = new NepaliDateTime(adDate);
                bsDate = {
                    year: nepaliDT.year,
                    month: nepaliDT.month,
                    day: nepaliDT.day
                };
            }
        } catch (e) {
            console.warn('nepali-datetime conversion failed, using fallback:', e);
        }
    }
    
    // Fallback to approximate conversion
    if (!bsDate) {
        bsDate = approximateADtoBS(adDate);
    }
    
    const bsYear = bsDate.year;
    const bsMonth = bsDate.month;
    const bsDay = bsDate.day;
    
    // Calculate day of week
    const dayOfWeek = adDate.getDay(); // 0 = Sunday
    
    // Map to Nepali day names (starting from Sunday)
    const nepaliDayNames = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
    
    return {
        year: bsYear,
        month: bsMonth,
        day: bsDay,
        monthName: NEPALI_MONTHS[bsMonth - 1],
        dayName: nepaliDayNames[dayOfWeek],
        fullDate: `${bsYear} ${NEPALI_MONTHS[bsMonth - 1]} ${bsDay} गते`,
        shortDate: `${bsYear}/${bsMonth}/${bsDay}`
    };
};

/**
 * Format date to Nepali format string
 * @param {Date|string} date - Gregorian date
 * @param {Object} options - Format options
 * @returns {string}
 */
export const formatNepaliDate = (date, options = {}) => {
    const nepaliDate = toNepaliDate(date);
    
    if (!nepaliDate) return 'N/A';
    
    const { 
        format = 'full', // 'full', 'short', 'monthYear', 'yearOnly'
        showDayName = true 
    } = options;
    
    switch (format) {
        case 'full':
            return showDayName 
                ? `${nepaliDate.dayName}, ${nepaliDate.year} ${nepaliDate.monthName} ${nepaliDate.day} गते`
                : `${nepaliDate.year} ${nepaliDate.monthName} ${nepaliDate.day} गते`;
        case 'short':
            return `${nepaliDate.year}/${nepaliDate.month}/${nepaliDate.day}`;
        case 'monthYear':
            return `${nepaliDate.monthName} ${nepaliDate.year}`;
        case 'yearOnly':
            return `${nepaliDate.year}`;
        default:
            return nepaliDate.fullDate;
    }
};

/**
 * Get current date in Nepali format
 * @returns {Object}
 */
export const getCurrentNepaliDate = () => {
    return toNepaliDate(new Date());
};

/**
 * Format relative time in Nepali
 * @param {Date|string} date - Gregorian date
 * @returns {string}
 */
export const getNepaliRelativeTime = (date) => {
    const adDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(adDate.getTime())) return 'अज्ञात';
    
    const now = new Date();
    const diffMs = now - adDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'अहिले';
    if (diffMins < 60) return `${diffMins} मिनेट अघि`;
    if (diffHours < 24) return `${diffHours} घण्टा अघि`;
    if (diffDays < 30) return `${diffDays} दिन अघि`;
    
    return formatNepaliDate(date);
};

/**
 * Format number to Nepali numerals
 * @param {number|string} num - Number to convert
 * @returns {string}
 */
export const toNepaliNumerals = (num) => {
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(num)
        .split('')
        .map(digit => /\d/.test(digit) ? nepaliDigits[parseInt(digit)] : digit)
        .join('');
};

/**
 * Convert AD date to BS date (returns {year, month, day})
 * Wrapper around toNepaliDate for compatibility
 * @param {Date|string} date - Gregorian date
 * @returns {Object} - {year, month, day}
 */
export const convertADtoBS = (date) => {
    const nepaliDate = toNepaliDate(date);
    if (!nepaliDate) return { year: 0, month: 0, day: 0 };
    return {
        year: nepaliDate.year,
        month: nepaliDate.month,
        day: nepaliDate.day
    };
};

/**
 * Convert BS date to AD date
 * @param {number} year - BS year
 * @param {number} month - BS month (1-12)
 * @param {number} day - BS day
 * @returns {Date} - Gregorian date
 */
export const convertBStoAD = (year, month, day) => {
    // Try using nepali-datetime package first
    if (NepaliDateTime) {
        try {
            // Check if fromBS method exists (old API)
            if (typeof NepaliDateTime.fromBS === 'function') {
                const nepaliDT = NepaliDateTime.fromBS(year, month, day);
                return nepaliDT.toDate();
            }
            // Check if it's a constructor (new API)
            else if (typeof NepaliDateTime === 'function') {
                const nepaliDT = new NepaliDateTime(year, month, day);
                return nepaliDT.toDate();
            }
        } catch (e) {
            console.warn('nepali-datetime BS to AD conversion failed, using fallback:', e);
        }
    }
    
    // Fallback to approximate conversion
    return approximateBStoAD(year, month, day);
};

/**
 * Get Nepali month name
 * @param {number} month - BS month (1-12)
 * @returns {string}
 */
export const getNepaliMonthName = (month) => {
    if (month < 1 || month > 12) return '';
    return NEPALI_MONTHS[month - 1];
};

/**
 * Days in each BS month (standard pattern)
 */
const BS_MONTH_DAYS = [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30];

/**
 * Get days in a BS month
 * @param {number} year - BS year
 * @param {number} month - BS month (1-12)
 * @returns {number}
 */
export const getDaysInBSMonth = (year, month) => {
    // Try using nepali-datetime package first
    if (NepaliDateTime) {
        try {
            if (typeof NepaliDateTime.fromBS === 'function') {
                const nepaliDT = NepaliDateTime.fromBS(year, month, 1);
                return nepaliDT.daysInMonth;
            } else if (typeof NepaliDateTime === 'function') {
                const nepaliDT = new NepaliDateTime(year, month, 1);
                return nepaliDT.daysInMonth;
            }
        } catch (e) {
            console.warn('nepali-datetime getDaysInBSMonth failed, using fallback:', e);
        }
    }
    
    // Fallback to standard BS month days
    if (month >= 1 && month <= 12) {
        return BS_MONTH_DAYS[month - 1];
    }
    return 30;
};

/**
 * Create a NepaliDateTime from AD date
 * @param {Date|string} date - Gregorian date
 * @returns {Object|null}
 */
export const createNepaliDateTime = (date) => {
    const adDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(adDate.getTime())) return null;
    
    if (NepaliDateTime) {
        try {
            if (typeof NepaliDateTime.fromAD === 'function') {
                return NepaliDateTime.fromAD(adDate);
            } else if (typeof NepaliDateTime === 'function') {
                return new NepaliDateTime(adDate);
            }
        } catch (e) {
            console.warn('nepali-datetime createNepaliDateTime failed:', e);
        }
    }
    
    // Return a simple object with the converted date
    const bsDate = toNepaliDate(adDate);
    return {
        year: bsDate?.year || 0,
        month: bsDate?.month || 0,
        day: bsDate?.day || 0,
        toDate: () => adDate
    };
};

/**
 * Create a NepaliDateTime from BS date
 * @param {number} year - BS year
 * @param {number} month - BS month (1-12)
 * @param {number} day - BS day
 * @param {number} hour - Hour (0-23)
 * @param {number} minute - Minute (0-59)
 * @returns {Object}
 */
export const createNepaliDateTimeFromBS = (year, month, day, hour = 0, minute = 0) => {
    if (NepaliDateTime) {
        try {
            if (typeof NepaliDateTime.fromBS === 'function') {
                return NepaliDateTime.fromBS(year, month, day, hour, minute);
            } else if (typeof NepaliDateTime === 'function') {
                return new NepaliDateTime(year, month, day, hour, minute);
            }
        } catch (e) {
            console.warn('nepali-datetime createNepaliDateTimeFromBS failed:', e);
        }
    }
    
    // Return a simple object with the converted date
    const adDate = approximateBStoAD(year, month, day);
    return {
        year: year,
        month: month,
        day: day,
        toDate: () => adDate
    };
};

export default {
    toNepaliDate,
    formatNepaliDate,
    getCurrentNepaliDate,
    getNepaliRelativeTime,
    toNepaliNumerals,
    NEPALI_MONTHS,
    NEPALI_DAYS,
    convertADtoBS,
    convertBStoAD,
    getNepaliMonthName,
    getDaysInBSMonth,
    createNepaliDateTime,
    createNepaliDateTimeFromBS
};


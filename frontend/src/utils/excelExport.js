import * as XLSX from 'xlsx';

// Export data to Excel file
export const exportToExcel = (data, fileName, sheetName = 'Sheet1') => {
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file and download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// Format date for display
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

// Get current date string for filename
export const getCurrentDateString = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}_${month}_${year}`;
};

// Months list for dropdown
export const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Get current year
export const getCurrentYear = () => new Date().getFullYear();

// Generate month-year options for the current year and next year
export const getMonthYearOptions = () => {
    const currentYear = getCurrentYear();
    const options = [];
    
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
        monthsList.forEach((month, index) => {
            options.push({
                value: `${month} ${year}`,
                label: `${month} ${year}`
            });
        });
    }
    
    return options;
};


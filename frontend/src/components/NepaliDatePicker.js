import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Button, TextField, Popover, Typography, Grid,
    IconButton, Paper
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { formatNepaliDate, convertADtoBS, convertBStoAD, getDaysInBSMonth } from '../utils/nepaliDate';

// Convert Nepali number to Arabic/Hindu-Arabic numeral
const toNepaliNumeral = (num) => {
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().split('').map(d => {
        if (d >= '0' && d <= '9') return nepaliDigits[parseInt(d)];
        return d;
    }).join('');
};

// Nepali months data from nepali-datetime
const NEPALI_MONTHS = [
    'बैशाख', 'जेष्ठ', 'असार', 'साउन', 'भदौ', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
];

// Days of week in Nepali (starting from Saturday)
const NEPALI_DAYS = ['शनि', 'आइ', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र'];

// Current BS year range
const MIN_BS_YEAR = 2070;
const MAX_BS_YEAR = 2100;

const NepaliDatePicker = ({
    label = 'Select Date',
    value = '',
    onChange,
    required = false,
    disabled = false,
    inputFormat = 'full', // 'full', 'short', 'monthYear'
    placeholder = 'YYYY-MM-DD',
    error = false,
    helperText = '',
    fullWidth = true,
    size = 'medium',
    sx = {}
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentYear, setCurrentYear] = useState(2081);
    const [currentMonth, setCurrentMonth] = useState(0); // 0-indexed (0 = बैशाख)
    const [selectedDate, setSelectedDate] = useState(null);
    const [displayDate, setDisplayDate] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    const buttonRef = useRef(null);

    // Initialize from prop value
    useEffect(() => {
        if (value && !isInitialized) {
            try {
                const adDate = new Date(value);
                if (!isNaN(adDate.getTime())) {
                    const bsDate = convertADtoBS(adDate);
                    setSelectedDate({
                        year: bsDate.year,
                        month: bsDate.month - 1, // Convert to 0-indexed
                        day: bsDate.day
                    });
                    setCurrentYear(bsDate.year);
                    setCurrentMonth(bsDate.month - 1);
                    setIsInitialized(true);
                }
            } catch (e) {
                console.log('Date parse error:', e);
            }
        }
    }, [value, isInitialized]);

    // Update display text when selection changes
    useEffect(() => {
        if (selectedDate) {
            const adDate = convertBStoAD(selectedDate.year, selectedDate.month + 1, selectedDate.day);
            const display = formatNepaliDate(adDate, { format: inputFormat, showDayName: false });
            setDisplayDate(display);
        } else {
            setDisplayDate('');
        }
    }, [selectedDate, inputFormat]);

    const handleOpen = (event) => {
        if (!disabled) {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDateSelect = (day) => {
        const newDate = {
            year: currentYear,
            month: currentMonth,
            day: day
        };
        setSelectedDate(newDate);

        // Convert to AD for backend
        const adDate = convertBStoAD(currentYear, currentMonth + 1, day);
        
        // Format as YYYY-MM-DD for the onChange callback
        const formattedAD = adDate.toISOString().split('T')[0];
        
        onChange?.(formattedAD);
        handleClose();
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentYear(prev => prev - 1);
            setCurrentMonth(11);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentYear(prev => prev + 1);
            setCurrentMonth(0);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const handleToday = () => {
        const today = new Date();
        const bsToday = convertADtoBS(today);
        const todayDate = {
            year: bsToday.year,
            month: bsToday.month - 1,
            day: bsToday.day
        };
        setSelectedDate(todayDate);
        setCurrentYear(bsToday.year);
        setCurrentMonth(bsToday.month - 1);

        const formattedAD = today.toISOString().split('T')[0];
        onChange?.(formattedAD);
        handleClose();
    };

    const handleClear = () => {
        setSelectedDate(null);
        setDisplayDate('');
        onChange?.('');
        handleClose();
    };

    // Get number of days in current BS month
    const getDaysInMonth = () => {
        // Use the utility function from nepaliDate.js
        return getDaysInBSMonth(currentYear, currentMonth + 1);
    };

    // Get first day of month
    const getFirstDayOfMonth = () => {
        // Calculate the first day of the month using AD conversion
        const adDate = convertBStoAD(currentYear, currentMonth + 1, 1);
        // Get day of week: 0 = Saturday in nepali-datetime convention
        // JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        // We need: 0 = Saturday, 1 = Sunday, 2 = Monday, ...
        const jsDay = adDate.getDay();
        // Convert: Sunday(0)->1, Monday(1)->2, ..., Friday(5)->6, Saturday(6)->0
        return jsDay === 0 ? 1 : jsDay === 6 ? 0 : jsDay + 1;
    };

    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const daysArray = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
        daysArray.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        daysArray.push(day);
    }

    // Check if a date is today
    const isTodayDate = (day) => {
        const today = new Date();
        const bsToday = convertADtoBS(today);
        return day === bsToday.day && currentMonth === bsToday.month - 1 && currentYear === bsToday.year;
    };

    const open = Boolean(anchorEl);
    const id = open ? 'nepali-date-picker' : undefined;

    return (
        <>
            <TextField
                fullWidth={fullWidth}
                label={label}
                value={displayDate}
                placeholder={placeholder}
                onClick={handleOpen}
                readOnly
                required={required}
                disabled={disabled}
                error={error}
                helperText={helperText}
                size={size}
                sx={sx}
                InputProps={{
                    endAdornment: (
                        <CalendarTodayIcon 
                            sx={{ cursor: disabled ? 'default' : 'pointer', color: disabled ? 'action.disabled' : 'primary.main' }}
                        />
                    )
                }}
            />

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: { p: 2, borderRadius: 2 }
                }}
            >
                {/* Calendar Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={handlePrevMonth} size="small">
                        <ChevronLeftIcon />
                    </IconButton>
                    
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {toNepaliNumeral(currentYear)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {NEPALI_MONTHS[currentMonth]}
                        </Typography>
                    </Box>

                    <IconButton onClick={handleNextMonth} size="small">
                        <ChevronRightIcon />
                    </IconButton>
                </Box>

                {/* Year Quick Select */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                    <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => setCurrentYear(currentYear - 1)}
                    >
                        ← {toNepaliNumeral(currentYear - 1)}
                    </Button>
                    <Button 
                        size="small" 
                        variant="contained"
                        onClick={handleToday}
                        sx={{ minWidth: 80 }}
                    >
                        आज
                    </Button>
                    <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => setCurrentYear(currentYear + 1)}
                    >
                        {toNepaliNumeral(currentYear + 1)} →
                    </Button>
                </Box>

                {/* Days of Week Header */}
                <Grid container spacing={0} sx={{ mb: 1 }}>
                    {NEPALI_DAYS.map((day, index) => (
                        <Grid item xs={12/7} key={index} sx={{ textAlign: 'center' }}>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    fontWeight: 'bold',
                                    color: index === 0 ? 'error.main' : 'text.secondary'
                                }}
                            >
                                {day}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>

                {/* Calendar Grid */}
                <Grid container spacing={0}>
                    {daysArray.map((day, index) => {
                        const isSelected = day && selectedDate?.day === day && 
                                          selectedDate?.month === currentMonth && 
                                          selectedDate?.year === currentYear;
                        const today = isTodayDate(day);

                        return (
                            <Grid item xs={12/7} key={index} sx={{ textAlign: 'center', p: 0.5 }}>
                                <Button
                                    disabled={!day}
                                    onClick={() => day && handleDateSelect(day)}
                                    sx={{
                                        minWidth: 36,
                                        height: 36,
                                        p: 0,
                                        borderRadius: '50%',
                                        backgroundColor: isSelected ? 'primary.main' : 'transparent',
                                        color: isSelected ? 'white' : 'text.primary',
                                        '&:hover': {
                                            backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                                        },
                                        ...(today && !isSelected && {
                                            border: '2px solid',
                                            borderColor: 'primary.main',
                                        }),
                                        ...(day === null && {
                                            visibility: 'hidden',
                                        })
                                    }}
                                >
                                    {day ? toNepaliNumeral(day) : ''}
                                </Button>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button size="small" onClick={handleClear}>
                        Clear
                    </Button>
                    <Button size="small" onClick={handleClose}>
                        Close
                    </Button>
                </Box>
            </Popover>
        </>
    );
};

export default NepaliDatePicker;


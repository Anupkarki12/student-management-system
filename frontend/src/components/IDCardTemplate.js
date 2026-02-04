import React from 'react';
import './IDCardStyles.css';

/**
 * Professional ID Card Component
 * Displays comprehensive student information
 */
const IDCardTemplate = ({ 
    student, 
    school, 
    cardSize = 'standard'
}) => {
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    // Calculate validity (1 year from now)
    const getValidityDate = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return formatDate(date);
    };

    // Generate barcode number
    const generateBarcode = (id) => {
        if (!id) return '000000000000';
        return id.toString().slice(-12).padStart(12, '0');
    };

    const sizeClass = cardSize === 'compact' ? 'id-card-compact' : 
                     cardSize === 'large' ? 'id-card-large' : 'id-card-standard';

    return (
        <div className={`id-card-container ${sizeClass}`}>
            <div className="id-card" id={`id-card-${student?._id}`}>
                {/* Header with School Info */}
                <div className="id-card-header">
                    <div className="school-logo">
                        {school?.photo ? (
                            <img src={school.photo} alt="School Logo" />
                        ) : (
                            <div className="logo-placeholder">
                                <span className="logo-text">{school?.schoolName?.charAt(0) || 'S'}</span>
                            </div>
                        )}
                    </div>
                    <div className="school-info">
                        <h2 className="school-name">{school?.schoolName || 'School Name'}</h2>
                        <p className="school-tagline">Student Identity Card</p>
                    </div>
                    <div className="card-type-badge">STUDENT</div>
                </div>

                {/* Main Content */}
                <div className="id-card-body">
                    {/* Photo Section */}
                    <div className="photo-section">
                        <div className="photo-frame">
                            {student?.photo ? (
                                <img 
                                    src={student.photo} 
                                    alt={`${student.name}'s Photo`} 
                                    className="student-photo"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/100x120?text=No+Photo';
                                    }}
                                />
                            ) : (
                                <div className="photo-placeholder">
                                    <span className="photo-initial">{student?.name?.charAt(0) || 'S'}</span>
                                </div>
                            )}
                        </div>
                        <div className="blood-group">Blood: N/A</div>
                    </div>

                    {/* Student Information */}
                    <div className="student-info">
                        <div className="info-header">
                            <h3 className="student-name">{student?.name || 'N/A'}</h3>
                            <span className="roll-number">Roll No: {student?.rollNum || 'N/A'}</span>
                        </div>

                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Class</span>
                                <span className="info-value">{student?.sclassName?.sclassName || 'N/A'}</span>
                            </div>
                            
                            <div className="info-item">
                                <span className="info-label">Date of Birth</span>
                                <span className="info-value">{formatDate(student?.dob)}</span>
                            </div>
                            
                            <div className="info-item">
                                <span className="info-label">Gender</span>
                                <span className="info-value">N/A</span>
                            </div>
                            
                            <div className="info-item">
                                <span className="info-label">Email</span>
                                <span className="info-value email">{student?.email || 'N/A'}</span>
                            </div>
                            
                            <div className="info-item">
                                <span className="info-label">Phone</span>
                                <span className="info-value">{student?.phone || 'N/A'}</span>
                            </div>
                            
                            <div className="info-item full-width">
                                <span className="info-label">Address</span>
                                <span className="info-value">{student?.address || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="id-card-footer">
                    <div className="barcode-section">
                        <div className="barcode-visual">
                            {generateBarcode(student?._id).split('').map((digit, index) => (
                                <div 
                                    key={index} 
                                    className="barcode-line"
                                    style={{ 
                                        height: digit === '0' ? '10px' : '24px',
                                        width: `${15 + parseInt(digit || 0) * 4}%`
                                    }}
                                />
                            ))}
                        </div>
                        <span className="barcode-number">{generateBarcode(student?._id)}</span>
                    </div>
                    <div className="id-info">
                        <span className="id-label">Student ID</span>
                        <span className="id-value">{student?._id?.slice(-8).toUpperCase() || 'N/A'}</span>
                    </div>
                </div>

                {/* Validity */}
                <div className="validity-badge">
                    <span>Valid Until: {getValidityDate()}</span>
                </div>

                {/* Signature Line */}
                <div className="signature-section">
                    <div className="signature-line">
                        <span>Student's Signature</span>
                    </div>
                    <div className="signature-line">
                        <span>Principal's Signature</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IDCardTemplate;

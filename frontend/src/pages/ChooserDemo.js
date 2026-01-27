import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Grid, Card, CardContent, Alert, Divider } from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ParentChooser from '../components/ParentChooser';
import AccountTypeChooser from '../components/AccountTypeChooser';

const ChooserDemo = () => {
    const navigate = useNavigate();
    const [parentChooserOpen, setParentChooserOpen] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [selectedAccountType, setSelectedAccountType] = useState(null);

    // Mock school ID for demo
    const schoolId = "mock-school-id";

    const handleParentSelect = (parent) => {
        setSelectedParent(parent);
        console.log("Selected parent:", parent);
    };

    const handleAccountTypeSelect = (type) => {
        setSelectedAccountType(type);
        console.log("Selected account type:", type);
    };

    return (
        <Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
                Chooser Components Demo
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', mb: 4 }}>
                Showcase of reusable chooser components for parent and account type selection
            </Typography>

            {/* Parent Chooser Demo */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <PersonSearchIcon color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h5" fontWeight={600}>
                        ParentChooser Component
                    </Typography>
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    A modal-based component that allows users to search and select an existing parent from a list,
                    or create a new parent. Useful for linking students to their parents/guardians.
                </Typography>

                {/* Demo Selection Display */}
                <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f9f9ff' }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Current Selection:
                        </Typography>
                        {selectedParent ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h6" color="primary">
                                    ✓ {selectedParent.fatherName || 'Parent Selected'}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setSelectedParent(null)}
                                >
                                    Clear
                                </Button>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                No parent selected yet
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                <Button
                    variant="contained"
                    size="large"
                    startIcon={<PersonSearchIcon />}
                    onClick={() => setParentChooserOpen(true)}
                >
                    Open Parent Chooser
                </Button>

                {/* Parent Chooser Dialog */}
                <ParentChooser
                    open={parentChooserOpen}
                    onClose={() => setParentChooserOpen(false)}
                    onSelect={handleParentSelect}
                    onCreateNew={() => {
                        console.log("Create new parent clicked");
                        // Navigate to parent creation page
                        // navigate("/Admin/addparent");
                    }}
                    schoolId={schoolId}
                    title="Select Parent / Guardian"
                    buttonText="Select Parent"
                    selectedParent={selectedParent}
                    showCreateNew={true}
                />

                <Divider sx={{ my: 4 }} />

                {/* Component Features */}
                <Typography variant="h6" gutterBottom>
                    Features:
                </Typography>
                <Grid container spacing={2}>
                    {[
                        'Searchable parent list by name, email, or phone',
                        'Display parent details (father name, phone, linked students)',
                        'Option to create new parent instead',
                        'Modal-based selection for better UX',
                        'Visual feedback for selected parent',
                        'Responsive design'
                    ].map((feature, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ArrowForwardIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="body2">{feature}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* AccountTypeChooser Demo */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <AccountTreeIcon color="secondary" sx={{ fontSize: 32 }} />
                    <Typography variant="h5" fontWeight={600}>
                        AccountTypeChooser Component
                    </Typography>
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    A card-based visual selector for choosing account types. Can be customized with different
                    account types, colors, and descriptions. Perfect for login/registration flows.
                </Typography>

                {/* Demo Selection Display */}
                <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f9f9ff' }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Current Selection:
                        </Typography>
                        {selectedAccountType ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h6" color="secondary">
                                    ✓ {selectedAccountType}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setSelectedAccountType(null)}
                                >
                                    Clear
                                </Button>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                No account type selected yet - Click a card below
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                <Box sx={{ mt: 3 }}>
                    <AccountTypeChooser
                        onSelect={handleAccountTypeSelect}
                        selectedType={selectedAccountType}
                        availableTypes={['Admin', 'Student', 'Teacher', 'Parent']}
                        title="Choose Your Account Type"
                        subtitle="Select the type of account you want to access"
                        columns={4}
                    />
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Component Features */}
                <Typography variant="h6" gutterBottom>
                    Features:
                </Typography>
                <Grid container spacing={2}>
                    {[
                        'Card-based visual selection with icons',
                        '4 account types: Admin, Student, Teacher, Parent',
                        'Customizable colors and gradients',
                        'Responsive grid layout (adjustable columns)',
                        'Hover animations and visual feedback',
                        'Easy to integrate in login/registration flows'
                    ].map((feature, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ArrowForwardIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="body2">{feature}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Usage Examples */}
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Usage Examples
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2">Integration in AddStudent.js</Typography>
                    <Typography variant="body2">
                        The ParentChooser is now integrated in AddStudent.js, allowing admins to link students
                        to existing parents during student registration.
                    </Typography>
                </Alert>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Code Snippets:
                </Typography>

                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            Using ParentChooser:
                        </Typography>
                        <pre style={{ 
                            background: '#f5f5f5', 
                            padding: 12, 
                            borderRadius: 8, 
                            overflow: 'auto',
                            fontSize: 12
                        }}>
{`import ParentChooser from '../components/ParentChooser';

// In your component:
<ParentChooser
    open={chooserOpen}
    onClose={() => setChooserOpen(false)}
    onSelect={handleParentSelect}
    onCreateNew={() => navigate("/Admin/addparent")}
    schoolId={schoolId}
    title="Select Parent"
    selectedParent={selectedParent}
/>`}
                        </pre>
                    </CardContent>
                </Card>

                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="subtitle2" color="secondary" gutterBottom>
                            Using AccountTypeChooser:
                        </Typography>
                        <pre style={{ 
                            background: '#f5f5f5', 
                            padding: 12, 
                            borderRadius: 8, 
                            overflow: 'auto',
                            fontSize: 12
                        }}>
{`import AccountTypeChooser from '../components/AccountTypeChooser';

// In your component:
<AccountTypeChooser
    onSelect={handleAccountTypeSelect}
    selectedType={selectedType}
    availableTypes={['Admin', 'Student', 'Teacher', 'Parent']}
    title="Choose Account Type"
    columns={4}
/>`}
                        </pre>
                    </CardContent>
                </Card>
            </Paper>
        </Box>
    );
};

export default ChooserDemo;


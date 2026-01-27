import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Box,
    Chip,
    IconButton,
    CircularProgress,
    Paper,
    Grid,
    Divider
} from '@mui/material';
import {
    Search as SearchIcon,
    Person as PersonIcon,
    Add as AddIcon,
    Close as CloseIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Group as GroupIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';

const ParentChooser = ({
    open,
    onClose,
    onSelect,
    onCreateNew,
    schoolId,
    title = "Select Parent / Guardian",
    buttonText = "Select Parent",
    selectedParent = null,
    showCreateNew = true
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteredParents, setFilteredParents] = useState([]);

    // Fetch parents when dialog opens
    useEffect(() => {
        if (open && schoolId) {
            fetchParents();
        }
    }, [open, schoolId]);

    // Filter parents based on search term
    useEffect(() => {
        if (parents.length > 0) {
            const search = searchTerm.toLowerCase();
            const filtered = parents.filter(parent =>
                parent.fatherName?.toLowerCase().includes(search) ||
                parent.motherName?.toLowerCase().includes(search) ||
                parent.email?.toLowerCase().includes(search) ||
                parent.phone?.includes(search) ||
                parent.fatherPhone?.includes(search)
            );
            setFilteredParents(filtered);
        }
    }, [searchTerm, parents]);

    const fetchParents = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Parents/${schoolId}`);
            if (result.data && Array.isArray(result.data)) {
                setParents(result.data);
                setFilteredParents(result.data);
            }
        } catch (error) {
            console.error("Error fetching parents:", error);
            setParents([]);
            setFilteredParents([]);
        }
        setLoading(false);
    };

    const handleSelectParent = (parent) => {
        if (onSelect) {
            onSelect(parent);
        }
        onClose();
    };

    const handleCreateNew = () => {
        if (onCreateNew) {
            onCreateNew();
        }
        onClose();
    };

    const getParentDisplayName = (parent) => {
        if (parent.fatherName) return parent.fatherName;
        if (parent.motherName) return parent.motherName;
        if (parent.guardianName) return parent.guardianName;
        return 'Unknown';
    };

    const getParentPhone = (parent) => {
        return parent.phone || parent.fatherPhone || parent.motherPhone || 'N/A';
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
            PaperProps={{
                sx: { maxHeight: '80vh' }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">{title}</Typography>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* Search Bar */}
                <TextField
                    fullWidth
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2, mt: 1 }}
                    variant="outlined"
                    size="small"
                />

                {/* Create New Parent Button */}
                {showCreateNew && (
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleCreateNew}
                        fullWidth
                        sx={{ mb: 2 }}
                        color="secondary"
                    >
                        Create New Parent Instead
                    </Button>
                )}

                <Divider sx={{ mb: 2 }} />

                {/* Parents List */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredParents.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                        <PersonIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                        <Typography color="textSecondary">
                            {searchTerm ? 'No parents found matching your search' : 'No parents available'}
                        </Typography>
                        {showCreateNew && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreateNew}
                                sx={{ mt: 2 }}
                            >
                                Create New Parent
                            </Button>
                        )}
                    </Paper>
                ) : (
                    <List sx={{ bgcolor: 'background.paper' }}>
                        {filteredParents.map((parent) => {
                            const isSelected = selectedParent?._id === parent._id;
                            return (
                                <Paper
                                    key={parent._id}
                                    variant="outlined"
                                    sx={{
                                        mb: 1,
                                        cursor: 'pointer',
                                        border: isSelected ? '2px solid' : '1px solid',
                                        borderColor: isSelected ? 'primary.main' : 'divider',
                                        bgcolor: isSelected ? 'rgba(127, 86, 218, 0.05)' : 'background.paper',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            bgcolor: 'rgba(127, 86, 218, 0.05)'
                                        }
                                    }}
                                    onClick={() => handleSelectParent(parent)}
                                >
                                    <ListItem
                                        secondaryAction={
                                            isSelected && (
                                                <CheckCircleIcon color="primary" />
                                            )
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                <PersonIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {getParentDisplayName(parent)}
                                                    </Typography>
                                                    {isSelected && (
                                                        <Chip
                                                            label="Selected"
                                                            size="small"
                                                            color="primary"
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Grid container spacing={1}>
                                                        <Grid item xs={12}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {getParentPhone(parent)}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        {parent.email && (
                                                            <Grid item xs={12}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {parent.email}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        )}
                                                        <Grid item xs={12}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <GroupIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {parent.students?.length || 0} student(s) linked
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                </Paper>
                            );
                        })}
                    </List>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                {selectedParent && (
                    <Button
                        onClick={() => {
                            if (onSelect) onSelect(selectedParent);
                            onClose();
                        }}
                        variant="contained"
                        color="primary"
                    >
                        Confirm Selection
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ParentChooser;


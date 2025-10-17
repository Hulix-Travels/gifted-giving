import React, { useState, useEffect, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Menu as MenuIcon, AccountCircle, ExpandMore, Home, Info, VolunteerActivism, Article, AdminPanelSettings } from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import { Link, useNavigate } from 'react-router-dom';

const navLinks = [
  { label: 'About', href: '#about', icon: Info },
  { label: 'Programs', href: '#programs', icon: Home },
  { label: 'Stories', href: '#stories', icon: Article },
  { label: 'Volunteer', href: '#volunteer', icon: VolunteerActivism },
];

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [navMenuAnchor, setNavMenuAnchor] = useState(null);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [initialLoginEmail, setInitialLoginEmail] = useState('');

  // Expose a global function to open the login modal and pre-fill email
  useEffect(() => {
    window.openLoginModal = (email) => {
      setInitialLoginEmail(email || '');
      setAuthModalOpen(true);
    };
    return () => { delete window.openLoginModal; };
  }, []);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleAuthModalOpen = () => setAuthModalOpen(true);
  const handleAuthModalClose = () => setAuthModalOpen(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavMenuOpen = (event) => {
    setNavMenuAnchor(event.currentTarget);
  };

  const handleNavMenuClose = () => {
    setNavMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const _handleProfile = () => {
    scrollToSection('#user-dashboard');
    handleClose();
  };

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'var(--primary-green)', 
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between',
          maxWidth: '1200px',
          width: '100%',
          mx: 'auto',
          px: { xs: 2, md: 3 },
          minHeight: { xs: '70px', sm: '80px', md: '90px' },
          height: { xs: '70px', sm: '80px', md: '90px' }
        }}>
          <Box display="flex" alignItems="center" sx={{ flex: 1 }}>
            <Box 
              display="flex" 
              alignItems="center" 
              gap={0.5}
              sx={{
                height: { xs: '70px', sm: '80px', md: '90px' }, 
                overflow: 'visible',
                position: 'relative'
              }}
            >
              <Box
                component="img"
                src="/gifted_logo.png"
                alt="Gifted Giving"
                sx={{
                  height: { xs: '100px', sm: '120px', md: '140px' },
                  width: 'auto',
                  maxWidth: { xs: '180px', sm: '220px', md: '260px' },
                  objectFit: 'contain',
                  objectPosition: 'center',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 10,
                  transform: 'translateY(-5px)',
                  '&:hover': {
                    transform: 'translateY(-5px) scale(1.05)'
                  }
                }}
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 400, 
                  color: 'var(--primary-green)',
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                  ml: -0.5,
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  textTransform: 'lowercase',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                gifted<Box component="span" sx={{ fontWeight: 900, color: 'var(--dark-green)', fontSize: '1.1em' }}>giving</Box>
              </Typography>
            </Box>
          </Box>
          
          {isMobile ? (
            <>
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={handleDrawerToggle}
                sx={{ color: 'var(--primary-green)' }}
              >
                <MenuIcon />
              </IconButton>
              <Drawer 
                anchor="right" 
                open={drawerOpen} 
                onClose={handleDrawerToggle}
                PaperProps={{
                  sx: {
                    width: 280,
                    background: 'var(--white)',
                    boxShadow: 'var(--shadow-lg)'
                  }
                }}
              >
                <List sx={{ pt: 2 }}>
                  {navLinks.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <ListItem key={item.label} disablePadding>
                        <ListItemButton 
                          onClick={() => scrollToSection(item.href)}
                          sx={{
                            py: 2,
                            px: 3,
                            '&:hover': {
                              background: 'var(--light-green)',
                              color: 'var(--primary-green)'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40, color: 'var(--primary-green)' }}>
                            <IconComponent />
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.label} 
                            sx={{ 
                              fontWeight: 600,
                              color: 'var(--primary-green)'
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                  <Box sx={{ borderTop: '1px solid var(--light-gray)', mt: 2, pt: 2 }}>
                    {isAuthenticated ? (
                      <>
                        <ListItem disablePadding>
                          <ListItemButton component={Link} to="/dashboard" onClick={handleClose}>
                            <ListItemText 
                              primary="My Dashboard" 
                              sx={{ fontWeight: 600 }}
                            />
                          </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemButton onClick={handleLogout}>
                            <ListItemText 
                              primary="Logout" 
                              sx={{ fontWeight: 600 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      </>
                    ) : (
                      <ListItem disablePadding>
                        <ListItemButton onClick={handleAuthModalOpen}>
                          <ListItemText 
                            primary="Login/Register" 
                            sx={{ 
                              color: 'var(--accent-green)', 
                              fontWeight: 700 
                            }} 
                          />
                        </ListItemButton>
                      </ListItem>
                    )}
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => scrollToSection('#donate')}>
                        <ListItemText 
                          primary="Donate Now" 
                          sx={{ 
                            color: 'var(--accent-green)', 
                            fontWeight: 700 
                          }} 
                        />
                      </ListItemButton>
                    </ListItem>
                  </Box>
                </List>
              </Drawer>
            </>
          ) : (
            <Box display="flex" alignItems="center" gap={2} sx={{ ml: 'auto' }}>
              {/* Navigation Menu Dropdown */}
              <Button
                onClick={handleNavMenuOpen}
                endIcon={<ExpandMore />}
                sx={{
                  color: 'var(--primary-green)',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    background: 'var(--light-green)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Menu
              </Button>
              <Menu
                anchorEl={navMenuAnchor}
                open={Boolean(navMenuAnchor)}
                onClose={handleNavMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: 2,
                    border: '1px solid var(--light-gray)',
                    minWidth: 200
                  }
                }}
              >
                {navLinks.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <MenuItem 
                      key={item.label}
                      onClick={() => {
                        scrollToSection(item.href);
                        handleNavMenuClose();
                      }}
                      sx={{ 
                        fontWeight: 600,
                        py: 1.5,
                        px: 2
                      }}
                    >
                      <IconComponent sx={{ mr: 2, color: 'var(--primary-green)' }} />
                      {item.label}
                    </MenuItem>
                  );
                })}
              </Menu>
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Button 
                      variant="contained" 
                      component={Link}
                      to="/admin"
                      startIcon={<AdminPanelSettings />}
                      sx={{ 
                        background: '#ff9800',
                        color: 'white',
                        '&:hover': { background: '#f57c00' }
                      }}
                    >
                      Admin
                    </Button>
                  )}
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    sx={{ 
                      color: 'var(--primary-green)',
                      '&:hover': {
                        background: 'var(--light-green)'
                      }
                    }}
                  >
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        boxShadow: 'var(--shadow-lg)',
                        borderRadius: 2,
                        border: '1px solid var(--light-gray)'
                      }
                    }}
                  >
                    <MenuItem component={Link} to="/dashboard" sx={{ fontWeight: 600 }}>
                      My Dashboard
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ fontWeight: 600 }}>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button 
                  onClick={handleAuthModalOpen} 
                  sx={{ 
                    color: 'var(--primary-green)', 
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    border: '2px solid var(--primary-green)',
                    '&:hover': {
                      background: 'var(--primary-green)',
                      color: 'var(--white)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Login/Register
                </Button>
              )}
              
              <Button 
                onClick={() => scrollToSection('#donate')}
                variant="contained" 
                sx={{
                  background: 'linear-gradient(135deg, var(--accent-green), #00cc6a)',
                  color: 'var(--primary-green)',
                  borderRadius: 3,
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  boxShadow: 'var(--shadow-md)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #00cc6a, var(--accent-green))',
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow-lg)'
                  }
                }}
              >
                Donate Now
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <AuthModal open={authModalOpen} onClose={handleAuthModalClose} initialLoginEmail={initialLoginEmail} setLoginEmail={setInitialLoginEmail} />
    </>
  );
} 
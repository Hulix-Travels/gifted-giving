import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Programs', href: '#programs' },
  { label: 'Stories', href: '#stories' },
  { label: 'Volunteer', href: '#volunteer' },
];

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, isAuthenticated } = useAuth();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleAuthModalOpen = () => setAuthModalOpen(true);
  const handleAuthModalClose = () => setAuthModalOpen(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleProfile = () => {
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
                  height: { xs: '120px', sm: '140px', md: '160px' },
                  width: 'auto',
                  maxWidth: { xs: '200px', sm: '250px', md: '300px' },
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
                  fontWeight: 700, 
                  color: 'var(--primary-green)',
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  ml: -0.5
                }}
              >
                Gifted Giving 
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
                  {navLinks.map((item) => (
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
                        <ListItemText 
                          primary={item.label} 
                          sx={{ 
                            fontWeight: 600,
                            color: 'var(--primary-green)'
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  <Box sx={{ borderTop: '1px solid var(--light-gray)', mt: 2, pt: 2 }}>
                    {isAuthenticated ? (
                      <>
                        <ListItem disablePadding>
                          <ListItemButton onClick={() => scrollToSection('#user-dashboard')}>
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
            <Box display="flex" alignItems="center" gap={1} sx={{ ml: 'auto' }}>
              {navLinks.map((item) => (
                <Button 
                  key={item.label} 
                  onClick={() => scrollToSection(item.href)}
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
                  {item.label}
                </Button>
              ))}
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Button 
                      variant="contained" 
                      href="#admin-dashboard"
                      sx={{ 
                        background: '#ff9800',
                        color: 'white',
                        mr: 2,
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
                      ml: 2,
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
                    <MenuItem onClick={() => scrollToSection('#user-dashboard')} sx={{ fontWeight: 600 }}>
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
                    ml: 2,
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
                  ml: 2,
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

      <AuthModal open={authModalOpen} onClose={handleAuthModalClose} />
    </>
  );
} 
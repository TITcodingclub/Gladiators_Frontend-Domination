// Navigation Fix Utility
export const navigationFix = {
  // Clear any stuck navigation states
  clearNavigationCache: () => {
    try {
      // Clear any cached navigation states
      sessionStorage.removeItem('navigationState');
      sessionStorage.removeItem('lastRoute');
      
      // Clear React Router cache if it exists
      if (window.__REACT_ROUTER_CACHE__) {
        window.__REACT_ROUTER_CACHE__ = null;
      }
      
      console.log('✅ Navigation cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear navigation cache:', error);
    }
  },

  // Reset navigation to home
  resetToHome: () => {
    try {
      window.location.href = '/';
      console.log('✅ Navigation reset to home');
    } catch (error) {
      console.error('❌ Failed to reset navigation:', error);
    }
  },

  // Debug navigation state
  debugNavigation: () => {
    const info = {
      currentUrl: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      title: document.title,
      readyState: document.readyState,
      timestamp: new Date().toISOString()
    };
    
    console.log('🔍 Navigation Debug Info:', info);
    return info;
  },

  // Check if navigation is stuck
  isNavigationStuck: () => {
    const lastRoute = sessionStorage.getItem('lastRoute');
    const currentRoute = window.location.pathname;
    const lastCheck = sessionStorage.getItem('lastNavigationCheck');
    const now = Date.now();
    
    if (lastCheck && (now - parseInt(lastCheck)) < 1000) {
      return lastRoute === currentRoute;
    }
    
    sessionStorage.setItem('lastRoute', currentRoute);
    sessionStorage.setItem('lastNavigationCheck', now.toString());
    return false;
  },

  // Force page refresh if needed
  forceRefreshIfStuck: () => {
    if (navigationFix.isNavigationStuck()) {
      console.log('⚠️ Navigation appears stuck, forcing refresh...');
      window.location.reload();
    }
  }
};

// Auto-run navigation check on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      navigationFix.forceRefreshIfStuck();
    }, 2000);
  });
  
  // Make navigation fix available globally for debugging
  window.navigationFix = navigationFix;
}

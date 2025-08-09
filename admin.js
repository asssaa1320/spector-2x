// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyChp9qtcOf5Jeu9pnm_dOd6yY3XbU_5m4A",
    authDomain: "zues-dc021.firebaseapp.com",
    projectId: "zues-dc021",
    storageBucket: "zues-dc021.firebasestorage.app",
    messagingSenderId: "639820467835",
    appId: "1:639820467835:web:8b2b35e333f83eb71f9cde",
    measurementId: "G-GK6PT78151"
};

// Initialize Firebase
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    
    // Test Firebase connection
    console.log('Admin: Firebase initialized successfully');
    console.log('Admin: Project ID:', firebaseConfig.projectId);
    
} catch (error) {
    console.error('Admin: Firebase initialization error:', error);
}

// Admin credentials will be fetched from Firebase
let ADMIN_CREDENTIALS = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    setupEventListeners();
    checkAuthStatus();
}

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.addEventListener('click', loadDashboardData);
}

function checkAuthStatus() {
    const isAuthenticated = sessionStorage.getItem('admin_authenticated');
    if (isAuthenticated === 'true') {
        showAdminPanel();
        loadDashboardData();
    } else {
        showLoginForm();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    errorMessage.style.display = 'none';
    
    try {
        // Fetch credentials from Firebase if not already loaded
        if (!ADMIN_CREDENTIALS) {
            await loadAdminCredentials();
        }
        
        // Verify credentials
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // Store authentication state with expiration (24 hours)
            const expirationTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
            const sessionData = {
                authenticated: true,
                loginTime: new Date().getTime(),
                expirationTime: expirationTime,
                username: username
            };
            
            // Store in both sessionStorage and localStorage for persistence
            sessionStorage.setItem('admin_session', JSON.stringify(sessionData));
            localStorage.setItem('admin_session', JSON.stringify(sessionData));
            
            console.log('✅ Admin session created, expires:', new Date(expirationTime).toLocaleString());
            showAdminPanel();
            await loadDashboardData();
        } else {
            // Authentication failed
            throw new Error('Invalid username or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = error.message || 'Authentication failed. Please try again.';
        errorMessage.style.display = 'block';
    } finally {
        // Reset button state
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}

function handleLogout() {
    // Clear all session data
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_session');
    localStorage.removeItem('admin_session');
    
    console.log('🚪 Admin logged out, session cleared');
    showLoginForm();
}

function showLoginForm() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadDashboardData();
    startClock(); // Start the real-time clock
}

// Real-time clock and date display
function startClock() {
    function updateTime() {
        const now = new Date();
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        const dateOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        const timeElement = document.getElementById('currentTime');
        const dateElement = document.getElementById('currentDate');
        
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
        }
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
        }
    }
    
    updateTime(); // Initial call
    setInterval(updateTime, 1000); // Update every second
}

// Create floating particles animation
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    // Create 15 particles
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        
        particlesContainer.appendChild(particle);
    }
}

// Initialize particles on page load
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    
    // Add refresh button functionality
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async function() {
            console.log('🔄 Manual refresh requested');
            
            // Show loading state
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحديث...';
            
            try {
                await loadDashboardData();
                
                // Show success state briefly
                refreshBtn.innerHTML = '<i class="fas fa-check"></i> تم التحديث!';
                setTimeout(() => {
                    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
                    refreshBtn.disabled = false;
                }, 2000);
            } catch (error) {
                console.error('Manual refresh failed:', error);
                refreshBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> فشل التحديث';
                setTimeout(() => {
                    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
                    refreshBtn.disabled = false;
                }, 3000);
            }
        });
    }
});

async function loadDashboardData() {
    try {
        console.log('🔄 Loading dashboard data...');
        
        // Show loading indicator
        const loadingIndicator = document.getElementById('loadingIndicator');
        const visitsTable = document.getElementById('visitsTable');
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        if (visitsTable) {
            visitsTable.style.display = 'none';
        }
        
        if (!db) {
            throw new Error('Firebase database not initialized');
        }
        
        console.log('🔥 Firebase db object:', db);
        
        // Load user visits
        console.log('📊 Fetching user visits...');
        const visitsSnapshot = await db.collection('user-visits')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        
        const visits = [];
        visitsSnapshot.forEach(doc => {
            const data = doc.data();
            console.log('📋 Visit document:', doc.id, data);
            visits.push({ id: doc.id, ...data });
        });
        console.log('✅ Loaded visits:', visits.length);
        
        // Load download attempts
        console.log('📥 Fetching user downloads...');
        let downloads = [];
        try {
            const downloadsSnapshot = await db.collection('user-downloads')
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();
            
            downloadsSnapshot.forEach(doc => {
                const data = doc.data();
                console.log('📥 Download document:', doc.id, data);
                downloads.push({ id: doc.id, ...data });
            });
            console.log('✅ Loaded downloads:', downloads.length);
        } catch (downloadError) {
            console.warn('⚠️ Could not load downloads (collection may not exist):', downloadError.message);
            downloads = [];
        }
        
        // Update dashboard statistics and tables
        console.log('📊 Updating statistics...');
        updateStatistics(visits, downloads);
        
        console.log('📋 Updating visits table...');
        updateVisitsTable(visits);
        
        console.log('📥 Updating downloads table...');
        updateDownloadsTable(downloads);
        
        console.log('✅ Dashboard updated successfully!');
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Show error in dashboard
        const errorHtml = `
            <div class="error-message" style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
                <h3>خطأ في تحميل البيانات</h3>
                <p><strong>الخطأ:</strong> ${error.message}</p>
                <p><strong>الكود:</strong> ${error.code || 'غير معروف'}</p>
                <p>يرجى التحقق من وحدة التحكم في المتصفح للمزيد من التفاصيل.</p>
                <button onclick="loadDashboardData()" style="background: #ff6b35; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                    <i class="fas fa-redo"></i> إعادة المحاولة
                </button>
            </div>
        `;
        
        // Update statistics with error state
        document.getElementById('totalVisits').textContent = '0';
        document.getElementById('totalDownloads').textContent = '0';
        document.getElementById('uniqueCountries').textContent = '0';
        document.getElementById('todayVisits').textContent = '0';
        
        // Show error in visits table
        const visitsTableBody = document.getElementById('visitsTableBody');
        if (visitsTableBody) {
            visitsTableBody.innerHTML = `
                <tr><td colspan="6">${errorHtml}</td></tr>
            `;
        }
        
        // Hide loading and show table even on error
        const loadingIndicator = document.getElementById('loadingIndicator');
        const visitsTable = document.getElementById('visitsTable');
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        if (visitsTable) {
            visitsTable.style.display = 'table';
        }
    }
}

// Add missing updateDownloadsTable function
function updateDownloadsTable(downloads) {
    console.log('📥 Updating downloads table with', downloads.length, 'downloads');
    // For now, just log the downloads. You can add a downloads table to HTML later if needed
    if (downloads.length > 0) {
        console.log('Recent downloads:', downloads.slice(0, 5));
    }
}

function updateStatistics(visits, downloads) {
    console.log('📊 Updating statistics...');
    console.log('Visits count:', visits.length);
    console.log('Downloads count:', downloads.length);
    
    // Total visits
    const totalVisitsElement = document.getElementById('totalVisits');
    if (totalVisitsElement) {
        totalVisitsElement.textContent = visits.length;
    }
    
    // Total downloads
    const totalDownloadsElement = document.getElementById('totalDownloads');
    if (totalDownloadsElement) {
        totalDownloadsElement.textContent = downloads.length;
    }
    
    // Unique countries
    const countries = new Set();
    visits.forEach(visit => {
        if (visit.location && visit.location !== 'Unknown' && visit.location !== 'Location access denied' && visit.location !== 'Detecting...' && visit.location.trim() !== '') {
            const locationParts = visit.location.split(',');
            if (locationParts.length > 1) {
                const country = locationParts[locationParts.length - 1].trim();
                if (country && country !== 'Unknown Country') {
                    countries.add(country);
                }
            }
        }
    });
    
    const uniqueCountriesElement = document.getElementById('uniqueCountries');
    if (uniqueCountriesElement) {
        uniqueCountriesElement.textContent = countries.size;
    }
    
    console.log('Unique countries:', Array.from(countries));
    
    // Today's visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisits = visits.filter(visit => {
        try {
            let visitDate;
            if (visit.timestamp && visit.timestamp.toDate) {
                // Firestore Timestamp
                visitDate = visit.timestamp.toDate();
            } else if (visit.timestamp) {
                // ISO string or other format
                visitDate = new Date(visit.timestamp);
            } else if (visit.createdAt) {
                visitDate = new Date(visit.createdAt);
            } else {
                return false;
            }
            
            return visitDate >= today;
        } catch (error) {
            console.warn('Error parsing visit timestamp:', visit.timestamp, error);
            return false;
        }
    });
    
    const todayVisitsElement = document.getElementById('todayVisits');
    if (todayVisitsElement) {
        todayVisitsElement.textContent = todayVisits.length;
    }
    
    console.log('Today visits count:', todayVisits.length);
}

function updateVisitsTable(visits) {
    console.log('📋 Updating visits table with', visits.length, 'visits');
    
    // Hide loading indicator and show table
    const loadingIndicator = document.getElementById('loadingIndicator');
    const visitsTable = document.getElementById('visitsTable');
    const tableBody = document.getElementById('visitsTableBody');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    if (visitsTable) {
        visitsTable.style.display = 'table';
    }
    
    if (!tableBody) {
        console.error('visitsTableBody element not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (visits.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="text-align: center; padding: 40px; color: #718096;">
                <i class="fas fa-inbox" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                <div style="font-size: 16px; margin-bottom: 5px;">لا توجد زيارات مسجلة</div>
                <div style="font-size: 14px; opacity: 0.7;">ستظهر الزيارات هنا عند دخول المستخدمين للموقع</div>
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    console.log('🔍 Processing', visits.length, 'visits for table display');
    
    visits.forEach((visit, index) => {
        console.log(`📋 Processing visit ${index + 1}:`, visit);
        
        const row = document.createElement('tr');
        
        // Format timestamp
        let timestampStr = 'غير محدد';
        try {
            if (visit.timestamp && visit.timestamp.toDate) {
                // Firestore Timestamp
                const date = visit.timestamp.toDate();
                timestampStr = date.toLocaleString('ar-SA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            } else if (visit.timestamp) {
                // ISO string or other format
                const date = new Date(visit.timestamp);
                timestampStr = date.toLocaleString('ar-SA');
            } else if (visit.createdAt) {
                const date = new Date(visit.createdAt);
                timestampStr = date.toLocaleString('ar-SA');
            }
        } catch (error) {
            console.warn('Error formatting timestamp for visit', index, error);
        }
        
        // Clean up data display with better fallbacks
        const location = visit.location && visit.location !== 'Unknown' && visit.location !== 'Detecting...' && visit.location.trim() !== '' ? visit.location : 'غير محدد';
        const language = visit.language && visit.language.trim() !== '' ? visit.language : 'غير محدد';
        const platform = visit.platform && visit.platform.trim() !== '' ? visit.platform : 'غير محدد';
        const screenRes = visit.screenResolution && visit.screenResolution.trim() !== '' ? visit.screenResolution : 'غير محدد';
        const timezone = visit.timezone && visit.timezone.trim() !== '' ? visit.timezone : 'غير محدد';
        
        console.log(`📊 Visit ${index + 1} data:`, {
            timestamp: timestampStr,
            location,
            language,
            platform,
            screenRes,
            timezone
        });
        
        row.innerHTML = `
            <td style="font-size: 13px; padding: 12px 16px;">${timestampStr}</td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 12px 16px;" title="${location}">${location}</td>
            <td style="padding: 12px 16px;">${language}</td>
            <td style="padding: 12px 16px;">${platform}</td>
            <td style="padding: 12px 16px;">${screenRes}</td>
            <td style="padding: 12px 16px;">${timezone}</td>
        `;
        
        // Add hover effect with better styling
        row.style.transition = 'all 0.2s ease';
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(255, 138, 80, 0.08)';
            row.style.transform = 'translateX(2px)';
        });
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
            row.style.transform = 'translateX(0)';
        });
        
        tableBody.appendChild(row);
    });
    
    console.log('✅ Visits table updated successfully');
}

// Add downloads table update function
function updateDownloadsTable(downloads) {
    console.log('📥 Updating downloads table with', downloads.length, 'downloads');
    
    // For now, we'll just log the downloads since we don't have a downloads table in the HTML
    // You can add a downloads table to the admin panel HTML if needed
    if (downloads.length > 0) {
        console.log('Recent downloads:', downloads.slice(0, 5));
    }
    
    // If there's a downloads table element, update it
    const downloadsTableBody = document.getElementById('downloadsTableBody');
    if (downloadsTableBody) {
        downloadsTableBody.innerHTML = '';
        
        if (downloads.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="4" style="text-align: center; padding: 40px; color: #718096;">
                    <i class="fas fa-download" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                    <div>لا توجد تحميلات مسجلة</div>
                </td>
            `;
            downloadsTableBody.appendChild(row);
        } else {
            downloads.forEach(download => {
                const row = document.createElement('tr');
                
                let timestampStr = 'غير محدد';
                try {
                    if (download.timestamp && download.timestamp.toDate) {
                        const date = download.timestamp.toDate();
                        timestampStr = date.toLocaleString('ar-SA');
                    } else if (download.timestamp) {
                        const date = new Date(download.timestamp);
                        timestampStr = date.toLocaleString('ar-SA');
                    }
                } catch (error) {
                    console.warn('Error formatting download timestamp:', error);
                }
                
                row.innerHTML = `
                    <td>${timestampStr}</td>
                    <td>${download.deviceType || 'غير محدد'}</td>
                    <td>${download.downloadType || 'غير محدد'}</td>
                    <td>${download.success ? '✅ نجح' : '❌ فشل'}</td>
                `;
                
                downloadsTableBody.appendChild(row);
            });
        }
    }
}

// Auto-refresh data every 30 seconds when admin panel is active
setInterval(() => {
    try {
        const sessionData = sessionStorage.getItem('admin_session');
        const adminPanel = document.getElementById('adminPanel');
        
        if (sessionData && adminPanel && adminPanel.style.display !== 'none') {
            const session = JSON.parse(sessionData);
            const currentTime = new Date().getTime();
            
            // Check if session is still valid
            if (session.authenticated && session.expirationTime > currentTime) {
                loadDashboardData();
            } else {
                console.log('⏰ Session expired during auto-refresh, logging out...');
                handleLogout();
            }
        }
    } catch (error) {
        console.error('Error during auto-refresh:', error);
    }
}, 30000);

// Load admin credentials from Firebase
async function loadAdminCredentials() {
    try {
        console.log('Loading admin credentials from Firebase...');
        
        if (!db) {
            throw new Error('Firebase database not initialized');
        }
        
        const doc = await db.collection('admin-zues-oun').doc('credentials').get();
        
        if (doc.exists) {
            ADMIN_CREDENTIALS = doc.data();
            console.log('Admin credentials loaded from Firebase:', ADMIN_CREDENTIALS.username);
        } else {
            console.log('No existing credentials found, creating new ones...');
            // If credentials don't exist, create them
            ADMIN_CREDENTIALS = {
                username: 'admin-zues-oun',
                password: 'admin-zues-password'
            };
            
            await db.collection('admin-zues-oun').doc('credentials').set({
                ...ADMIN_CREDENTIALS,
                created: firebase.firestore.Timestamp.now()
            });
            
            console.log('Admin credentials created and stored in Firebase');
        }
    } catch (error) {
        console.error('Error loading admin credentials:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Fallback to default credentials
        console.log('Using fallback admin credentials');
        ADMIN_CREDENTIALS = {
            username: 'admin-zues-oun',
            password: 'admin-zues-password'
        };
    }
}

// Initialize credentials on app start
loadAdminCredentials();

// Check if already authenticated on page load
function checkExistingSession() {
    try {
        // Check sessionStorage first (current session)
        let sessionData = sessionStorage.getItem('admin_session');
        
        // If not in sessionStorage, check localStorage (persistent)
        if (!sessionData) {
            sessionData = localStorage.getItem('admin_session');
        }
        
        if (sessionData) {
            const session = JSON.parse(sessionData);
            const currentTime = new Date().getTime();
            
            // Check if session is still valid
            if (session.authenticated && session.expirationTime > currentTime) {
                console.log('✅ Valid admin session found, auto-login');
                console.log('Session expires:', new Date(session.expirationTime).toLocaleString());
                
                // Restore session to sessionStorage if it was from localStorage
                if (!sessionStorage.getItem('admin_session')) {
                    sessionStorage.setItem('admin_session', JSON.stringify(session));
                }
                
                showAdminPanel();
                return;
            } else {
                console.log('⏰ Admin session expired, clearing...');
                // Clear expired session
                sessionStorage.removeItem('admin_session');
                localStorage.removeItem('admin_session');
            }
        }
        
        // No valid session found
        console.log('🔐 No valid admin session, showing login form');
        showLoginForm();
        
    } catch (error) {
        console.error('Error checking admin session:', error);
        showLoginForm();
    }
}

// Call session check on page load
document.addEventListener('DOMContentLoaded', function() {
    checkExistingSession();
});

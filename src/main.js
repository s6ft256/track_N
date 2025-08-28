import { SupabaseService } from './services/supabase.js';
import { AuthService } from './services/auth.js';
import { ValidationService } from './services/validation.js';
import { OfflineService } from './services/offline.js';
import { RealtimeService } from './services/realtime.js';
import { UIManager } from './ui/ui-manager.js';
import { DashboardManager } from './ui/dashboard.js';

class HSEApp {
    constructor() {
        this.supabase = new SupabaseService();
        this.auth = new AuthService(this.supabase);
        this.validation = new ValidationService();
        this.offline = new OfflineService();
        this.realtime = new RealtimeService(this.supabase);
        this.ui = new UIManager(this);
        this.dashboard = new DashboardManager(this.supabase);
        
        this.currentUser = null;
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    async init() {
        // Initialize offline support
        await this.offline.init();
        
        // Check authentication state
        const session = await this.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            this.showMainApp();
        } else {
            this.showAuthScreen();
        }

        // Set up auth state listener
        this.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.showMainApp();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.showAuthScreen();
            }
        });

        // Set up online/offline listeners
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.ui.showNotification('Connection restored', 'success');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.ui.showNotification('Working offline', 'warning');
        });

        // Initialize real-time subscriptions when authenticated
        if (this.currentUser) {
            this.realtime.init();
        }
    }

    showAuthScreen() {
        this.ui.renderAuthScreen();
    }

    showMainApp() {
        this.ui.renderMainApp();
        this.realtime.init();
    }

    async syncOfflineData() {
        if (this.isOnline) {
            await this.offline.syncPendingData();
        }
    }

    async signIn(email, password) {
        try {
            const result = await this.auth.signIn(email, password);
            if (result.error) {
                this.ui.showNotification(result.error.message, 'error');
            }
        } catch (error) {
            this.ui.showNotification('Sign in failed', 'error');
        }
    }

    async signUp(email, password, userData) {
        try {
            const result = await this.auth.signUp(email, password, userData);
            if (result.error) {
                this.ui.showNotification(result.error.message, 'error');
            } else {
                this.ui.showNotification('Account created successfully!', 'success');
            }
        } catch (error) {
            this.ui.showNotification('Sign up failed', 'error');
        }
    }

    async signOut() {
        await this.auth.signOut();
        this.realtime.cleanup();
    }
}

// Initialize the app
window.hseApp = new HSEApp();
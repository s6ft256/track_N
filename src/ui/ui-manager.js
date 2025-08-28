export class UIManager {
    constructor(app) {
        this.app = app;
        this.currentView = 'auth';
        this.notifications = [];
    }

    renderAuthScreen() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div class="max-w-md w-full space-y-8 p-8">
                    <div class="text-center">
                        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
                            HSE Inspection System
                        </h2>
                        <p class="mt-2 text-sm text-gray-600">
                            Health, Safety & Environment Management
                        </p>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <div class="flex space-x-1 mb-6">
                            <button id="signin-tab" class="flex-1 py-2 px-4 text-center rounded-md bg-indigo-600 text-white font-medium">
                                Sign In
                            </button>
                            <button id="signup-tab" class="flex-1 py-2 px-4 text-center rounded-md text-indigo-600 font-medium">
                                Sign Up
                            </button>
                        </div>

                        <form id="auth-form" class="space-y-4">
                            <div id="signup-fields" class="hidden space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input type="text" name="name" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Assessor ID</label>
                                    <input type="text" name="assessorId" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Department</label>
                                    <input type="text" name="department" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" name="password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                            
                            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <span id="auth-button-text">Sign In</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div id="notifications" class="fixed top-4 right-4 z-50"></div>
        `;

        this.setupAuthEventListeners();
    }

    setupAuthEventListeners() {
        const signinTab = document.getElementById('signin-tab');
        const signupTab = document.getElementById('signup-tab');
        const signupFields = document.getElementById('signup-fields');
        const authButtonText = document.getElementById('auth-button-text');
        const authForm = document.getElementById('auth-form');

        let isSignUp = false;

        signinTab.addEventListener('click', () => {
            isSignUp = false;
            signinTab.className = 'flex-1 py-2 px-4 text-center rounded-md bg-indigo-600 text-white font-medium';
            signupTab.className = 'flex-1 py-2 px-4 text-center rounded-md text-indigo-600 font-medium';
            signupFields.classList.add('hidden');
            authButtonText.textContent = 'Sign In';
        });

        signupTab.addEventListener('click', () => {
            isSignUp = true;
            signupTab.className = 'flex-1 py-2 px-4 text-center rounded-md bg-indigo-600 text-white font-medium';
            signinTab.className = 'flex-1 py-2 px-4 text-center rounded-md text-indigo-600 font-medium';
            signupFields.classList.remove('hidden');
            authButtonText.textContent = 'Sign Up';
        });

        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(authForm);
            const email = formData.get('email');
            const password = formData.get('password');

            if (isSignUp) {
                const userData = {
                    name: formData.get('name'),
                    assessor_id: formData.get('assessorId'),
                    department: formData.get('department')
                };
                await this.app.signUp(email, password, userData);
            } else {
                await this.app.signIn(email, password);
            }
        });

        // Setup validation
        this.app.validation.setupRealTimeValidation(authForm, ['email', 'password', 'name', 'assessorId']);
    }

    renderMainApp() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen bg-gray-50">
                <!-- Navigation -->
                <nav class="bg-white shadow-sm border-b">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between h-16">
                            <div class="flex items-center">
                                <h1 class="text-xl font-semibold text-gray-900">HSE Inspection System</h1>
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="flex space-x-2">
                                    <button id="nav-dashboard" class="px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white">Dashboard</button>
                                    <button id="nav-observations" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">Observations</button>
                                    <button id="nav-trainings" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">Trainings</button>
                                    <button id="nav-toolbox" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">Toolbox Talks</button>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <span id="online-status" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Online
                                    </span>
                                    <button id="signout-btn" class="text-gray-500 hover:text-gray-700">
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <!-- Main Content -->
                <main id="main-content" class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <!-- Content will be loaded here -->
                </main>
            </div>
            <div id="notifications" class="fixed top-4 right-4 z-50"></div>
        `;

        this.setupMainAppEventListeners();
        this.showDashboard(); // Show dashboard by default
    }

    setupMainAppEventListeners() {
        // Navigation
        document.getElementById('nav-dashboard').addEventListener('click', () => this.showDashboard());
        document.getElementById('nav-observations').addEventListener('click', () => this.showObservations());
        document.getElementById('nav-trainings').addEventListener('click', () => this.showTrainings());
        document.getElementById('nav-toolbox').addEventListener('click', () => this.showToolboxTalks());
        
        // Sign out
        document.getElementById('signout-btn').addEventListener('click', () => this.app.signOut());

        // Update online status
        this.updateOnlineStatus();
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());
    }

    updateOnlineStatus() {
        const statusElement = document.getElementById('online-status');
        if (navigator.onLine) {
            statusElement.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
            statusElement.textContent = 'Online';
        } else {
            statusElement.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800';
            statusElement.textContent = 'Offline';
        }
    }

    setActiveNavButton(activeId) {
        const navButtons = ['nav-dashboard', 'nav-observations', 'nav-trainings', 'nav-toolbox'];
        navButtons.forEach(id => {
            const button = document.getElementById(id);
            if (id === activeId) {
                button.className = 'px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white';
            } else {
                button.className = 'px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900';
            }
        });
    }

    showDashboard() {
        this.setActiveNavButton('nav-dashboard');
        this.app.dashboard.render();
    }

    showObservations() {
        this.setActiveNavButton('nav-observations');
        this.renderObservationsView();
    }

    showTrainings() {
        this.setActiveNavButton('nav-trainings');
        this.renderTrainingsView();
    }

    showToolboxTalks() {
        this.setActiveNavButton('nav-toolbox');
        this.renderToolboxTalksView();
    }

    renderObservationsView() {
        const content = document.getElementById('main-content');
        content.innerHTML = `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-900">Safety Observations</h2>
                    <button id="add-observation-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                        Add Observation
                    </button>
                </div>
                
                <div id="observations-list" class="space-y-4">
                    <div class="text-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p class="mt-2 text-gray-500">Loading observations...</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('add-observation-btn').addEventListener('click', () => {
            this.showObservationForm();
        });

        this.loadObservations();
    }

    async loadObservations() {
        try {
            const { data, error } = await this.app.supabase.getObservations();
            
            if (error) throw error;

            const listContainer = document.getElementById('observations-list');
            
            if (data && data.length > 0) {
                listContainer.innerHTML = data.map(obs => `
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center space-x-2 mb-2">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getRiskLevelClass(obs.risk_level)}">
                                        ${obs.risk_level} Risk
                                    </span>
                                    <span class="text-sm text-gray-500">${obs.location}</span>
                                </div>
                                <p class="text-gray-900 mb-2">${obs.observation}</p>
                                <div class="text-sm text-gray-500">
                                    <p>Action: ${obs.action_taken || 'Pending'}</p>
                                    <p>Responsible: ${obs.responsible || 'Not assigned'}</p>
                                    <p>Reported by: ${obs.assessors?.name || 'Unknown'}</p>
                                    <p>Date: ${new Date(obs.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                listContainer.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-500">No observations found</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading observations:', error);
            this.showNotification('Failed to load observations', 'error');
        }
    }

    getRiskLevelClass(riskLevel) {
        switch (riskLevel) {
            case 'High': return 'bg-red-100 text-red-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    showObservationForm() {
        // Implementation for observation form modal
        this.showNotification('Observation form coming soon!', 'info');
    }

    renderTrainingsView() {
        const content = document.getElementById('main-content');
        content.innerHTML = `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-900">Training Records</h2>
                    <button id="add-training-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                        Add Training
                    </button>
                </div>
                
                <div id="trainings-list" class="space-y-4">
                    <div class="text-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p class="mt-2 text-gray-500">Loading trainings...</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('add-training-btn').addEventListener('click', () => {
            this.showNotification('Training form coming soon!', 'info');
        });

        this.loadTrainings();
    }

    async loadTrainings() {
        try {
            const { data, error } = await this.app.supabase.getTrainings();
            
            if (error) throw error;

            const listContainer = document.getElementById('trainings-list');
            
            if (data && data.length > 0) {
                listContainer.innerHTML = data.map(training => `
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h3 class="text-lg font-medium text-gray-900 mb-2">${training.title}</h3>
                                <div class="text-sm text-gray-500 space-y-1">
                                    <p>Date: ${training.date ? new Date(training.date).toLocaleDateString() : 'Not scheduled'}</p>
                                    <p>Instructor: ${training.instructor || 'TBD'}</p>
                                    <p>Status: ${training.status || 'Pending'}</p>
                                    ${training.isCertification ? '<p class="text-indigo-600 font-medium">Certification Training</p>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                listContainer.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-500">No trainings found</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading trainings:', error);
            this.showNotification('Failed to load trainings', 'error');
        }
    }

    renderToolboxTalksView() {
        const content = document.getElementById('main-content');
        content.innerHTML = `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-900">Toolbox Talks</h2>
                    <button id="add-toolbox-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                        Schedule Talk
                    </button>
                </div>
                
                <div id="toolbox-list" class="space-y-4">
                    <div class="text-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p class="mt-2 text-gray-500">Loading toolbox talks...</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('add-toolbox-btn').addEventListener('click', () => {
            this.showNotification('Toolbox talk form coming soon!', 'info');
        });

        this.loadToolboxTalks();
    }

    async loadToolboxTalks() {
        try {
            const { data, error } = await this.app.supabase.getToolboxTalks();
            
            if (error) throw error;

            const listContainer = document.getElementById('toolbox-list');
            
            if (data && data.length > 0) {
                listContainer.innerHTML = data.map(talk => `
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h3 class="text-lg font-medium text-gray-900 mb-2">${talk.topic}</h3>
                                <div class="text-sm text-gray-500 space-y-1">
                                    <p>Date: ${new Date(talk.date).toLocaleDateString()}</p>
                                    <p>Time: ${talk.time}</p>
                                    <p>Location: ${talk.location}</p>
                                    <p>Presenter: ${talk.presenter}</p>
                                    <p>Attendees: ${talk.attendees?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                listContainer.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-500">No toolbox talks scheduled</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading toolbox talks:', error);
            this.showNotification('Failed to load toolbox talks', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notificationsContainer = document.getElementById('notifications');
        const notification = document.createElement('div');
        
        const typeClasses = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        notification.className = `${typeClasses[type]} text-white px-6 py-3 rounded-lg shadow-lg mb-2 transform transition-all duration-300 translate-x-full`;
        notification.textContent = message;

        notificationsContainer.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}
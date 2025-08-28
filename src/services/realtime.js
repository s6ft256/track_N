export class RealtimeService {
    constructor(supabaseService) {
        this.supabase = supabaseService;
        this.subscriptions = [];
        this.callbacks = {};
    }

    init() {
        this.setupSubscriptions();
    }

    setupSubscriptions() {
        // Subscribe to observations changes
        const observationsChannel = this.supabase.subscribeToTable('observations', (payload) => {
            this.handleRealtimeUpdate('observations', payload);
        });
        this.subscriptions.push(observationsChannel);

        // Subscribe to assessors changes
        const assessorsChannel = this.supabase.subscribeToTable('assessors', (payload) => {
            this.handleRealtimeUpdate('assessors', payload);
        });
        this.subscriptions.push(assessorsChannel);

        // Subscribe to trainings changes
        const trainingsChannel = this.supabase.subscribeToTable('trainings', (payload) => {
            this.handleRealtimeUpdate('trainings', payload);
        });
        this.subscriptions.push(trainingsChannel);

        // Subscribe to toolbox talks changes
        const toolboxChannel = this.supabase.subscribeToTable('toolbox_talks', (payload) => {
            this.handleRealtimeUpdate('toolbox_talks', payload);
        });
        this.subscriptions.push(toolboxChannel);
    }

    handleRealtimeUpdate(table, payload) {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        // Notify UI components about the update
        if (this.callbacks[table]) {
            this.callbacks[table].forEach(callback => {
                callback({ eventType, newRecord, oldRecord, table });
            });
        }

        // Show notification for new records
        if (eventType === 'INSERT') {
            this.showRealtimeNotification(table, newRecord);
        }

        // Update dashboard if it's visible
        if (window.hseApp && window.hseApp.dashboard) {
            window.hseApp.dashboard.handleRealtimeUpdate(table, payload);
        }
    }

    showRealtimeNotification(table, record) {
        let message = '';
        
        switch (table) {
            case 'observations':
                message = `New ${record.risk_level} risk observation reported at ${record.location}`;
                break;
            case 'assessors':
                message = `New assessor ${record.name} registered`;
                break;
            case 'trainings':
                message = `New training "${record.title}" added`;
                break;
            case 'toolbox_talks':
                message = `New toolbox talk "${record.topic}" scheduled`;
                break;
        }

        if (message && window.hseApp && window.hseApp.ui) {
            window.hseApp.ui.showNotification(message, 'info');
        }
    }

    subscribe(table, callback) {
        if (!this.callbacks[table]) {
            this.callbacks[table] = [];
        }
        this.callbacks[table].push(callback);
    }

    unsubscribe(table, callback) {
        if (this.callbacks[table]) {
            this.callbacks[table] = this.callbacks[table].filter(cb => cb !== callback);
        }
    }

    cleanup() {
        this.subscriptions.forEach(subscription => {
            if (subscription && subscription.unsubscribe) {
                subscription.unsubscribe();
            }
        });
        this.subscriptions = [];
        this.callbacks = {};
    }
}
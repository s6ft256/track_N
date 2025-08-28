export class OfflineService {
    constructor() {
        this.dbName = 'HSEInspectionDB';
        this.version = 1;
        this.db = null;
        this.pendingSync = [];
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('observations')) {
                    const observationStore = db.createObjectStore('observations', { keyPath: 'id', autoIncrement: true });
                    observationStore.createIndex('timestamp', 'timestamp', { unique: false });
                    observationStore.createIndex('synced', 'synced', { unique: false });
                }

                if (!db.objectStoreNames.contains('assessors')) {
                    const assessorStore = db.createObjectStore('assessors', { keyPath: 'id', autoIncrement: true });
                    assessorStore.createIndex('synced', 'synced', { unique: false });
                }

                if (!db.objectStoreNames.contains('trainings')) {
                    const trainingStore = db.createObjectStore('trainings', { keyPath: 'id', autoIncrement: true });
                    trainingStore.createIndex('synced', 'synced', { unique: false });
                }

                if (!db.objectStoreNames.contains('pendingUploads')) {
                    db.createObjectStore('pendingUploads', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async saveOfflineData(storeName, data) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const dataWithMeta = {
                ...data,
                timestamp: Date.now(),
                synced: false,
                offline: true
            };

            const request = store.add(dataWithMeta);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getOfflineData(storeName) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getUnsyncedData(storeName) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index('synced');
            const request = index.getAll(false);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async markAsSynced(storeName, id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const getRequest = store.get(id);
            
            getRequest.onsuccess = () => {
                const data = getRequest.result;
                if (data) {
                    data.synced = true;
                    const updateRequest = store.put(data);
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    resolve();
                }
            };
            
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async syncPendingData() {
        if (!navigator.onLine) return;

        try {
            // Sync observations
            const unsyncedObservations = await this.getUnsyncedData('observations');
            for (const observation of unsyncedObservations) {
                try {
                    const { data, error } = await window.hseApp.supabase.createObservation(observation);
                    if (!error) {
                        await this.markAsSynced('observations', observation.id);
                    }
                } catch (error) {
                    console.error('Failed to sync observation:', error);
                }
            }

            // Sync assessors
            const unsyncedAssessors = await this.getUnsyncedData('assessors');
            for (const assessor of unsyncedAssessors) {
                try {
                    const { data, error } = await window.hseApp.supabase.createAssessor(assessor);
                    if (!error) {
                        await this.markAsSynced('assessors', assessor.id);
                    }
                } catch (error) {
                    console.error('Failed to sync assessor:', error);
                }
            }

            // Sync trainings
            const unsyncedTrainings = await this.getUnsyncedData('trainings');
            for (const training of unsyncedTrainings) {
                try {
                    const { data, error } = await window.hseApp.supabase.createTraining(training);
                    if (!error) {
                        await this.markAsSynced('trainings', training.id);
                    }
                } catch (error) {
                    console.error('Failed to sync training:', error);
                }
            }

            console.log('Offline data sync completed');
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }

    async savePendingUpload(file, metadata) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pendingUploads'], 'readwrite');
            const store = transaction.objectStore('pendingUploads');
            
            const uploadData = {
                file: file,
                metadata: metadata,
                timestamp: Date.now()
            };

            const request = store.add(uploadData);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    isOnline() {
        return navigator.onLine;
    }
}
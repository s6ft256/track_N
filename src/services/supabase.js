import { createClient } from '@supabase/supabase-js';

export class SupabaseService {
    constructor() {
        // Replace with your actual Supabase credentials
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co';
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';
        
        this.client = createClient(supabaseUrl, supabaseKey);
    }

    // Auth methods
    get auth() {
        return this.client.auth;
    }

    // Database methods
    async getAssessors() {
        const { data, error } = await this.client
            .from('assessors')
            .select('*')
            .order('created_at', { ascending: false });
        
        return { data, error };
    }

    async createAssessor(assessorData) {
        const { data, error } = await this.client
            .from('assessors')
            .insert([assessorData])
            .select();
        
        return { data, error };
    }

    async getObservations() {
        const { data, error } = await this.client
            .from('observations')
            .select(`
                *,
                assessors (
                    name,
                    assessor_id
                )
            `)
            .order('created_at', { ascending: false });
        
        return { data, error };
    }

    async createObservation(observationData) {
        const { data, error } = await this.client
            .from('observations')
            .insert([observationData])
            .select();
        
        return { data, error };
    }

    async getTrainings() {
        const { data, error } = await this.client
            .from('trainings')
            .select('*')
            .order('created_at', { ascending: false });
        
        return { data, error };
    }

    async createTraining(trainingData) {
        const { data, error } = await this.client
            .from('trainings')
            .insert([trainingData])
            .select();
        
        return { data, error };
    }

    async getToolboxTalks() {
        const { data, error } = await this.client
            .from('toolbox_talks')
            .select('*')
            .order('created_at', { ascending: false });
        
        return { data, error };
    }

    async createToolboxTalk(talkData) {
        const { data, error } = await this.client
            .from('toolbox_talks')
            .insert([talkData])
            .select();
        
        return { data, error };
    }

    // Storage methods
    async uploadPhoto(file, path) {
        const { data, error } = await this.client.storage
            .from('inspection-photos')
            .upload(path, file);
        
        return { data, error };
    }

    getPhotoUrl(path) {
        const { data } = this.client.storage
            .from('inspection-photos')
            .getPublicUrl(path);
        
        return data.publicUrl;
    }

    // Real-time subscriptions
    subscribeToTable(table, callback) {
        return this.client
            .channel(`${table}_changes`)
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: table }, 
                callback
            )
            .subscribe();
    }

    // Analytics queries
    async getObservationStats() {
        const { data, error } = await this.client
            .from('observations')
            .select('risk_level, created_at')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        
        return { data, error };
    }

    async getTrainingStats() {
        const { data, error } = await this.client
            .from('trainings')
            .select('status, created_at, "isCertification"')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        
        return { data, error };
    }
}
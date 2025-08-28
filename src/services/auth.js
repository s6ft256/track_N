export class AuthService {
    constructor(supabaseService) {
        this.supabase = supabaseService;
    }

    async signUp(email, password, userData = {}) {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });

        // If sign up successful, create assessor profile
        if (data.user && !error) {
            await this.createAssessorProfile(data.user, userData);
        }

        return { data, error };
    }

    async signIn(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });

        return { data, error };
    }

    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        return { error };
    }

    async getSession() {
        const { data: { session } } = await this.supabase.auth.getSession();
        return session;
    }

    async getUser() {
        const { data: { user } } = await this.supabase.auth.getUser();
        return user;
    }

    onAuthStateChange(callback) {
        return this.supabase.auth.onAuthStateChange(callback);
    }

    async resetPassword(email) {
        const { data, error } = await this.supabase.auth.resetPasswordForEmail(email);
        return { data, error };
    }

    async updatePassword(newPassword) {
        const { data, error } = await this.supabase.auth.updateUser({
            password: newPassword
        });
        return { data, error };
    }

    async createAssessorProfile(user, userData) {
        const assessorData = {
            id: user.id,
            name: userData.name || user.email,
            assessor_id: userData.assessor_id || `ASS-${Date.now()}`,
            department: userData.department || '',
            certification: userData.certification || '',
            email: user.email
        };

        return await this.supabase.createAssessor(assessorData);
    }

    async updateProfile(updates) {
        const { data, error } = await this.supabase.auth.updateUser({
            data: updates
        });
        return { data, error };
    }
}
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

export class DashboardManager {
    constructor(supabaseService) {
        this.supabase = supabaseService;
        this.charts = {};
    }

    async render() {
        const content = document.getElementById('main-content');
        content.innerHTML = `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-900">Safety Dashboard</h2>
                    <div class="flex space-x-2">
                        <button id="refresh-dashboard" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                            Refresh
                        </button>
                        <button id="export-report" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                            Export Report
                        </button>
                    </div>
                </div>

                <!-- Key Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">High Risk</p>
                                <p id="high-risk-count" class="text-2xl font-semibold text-gray-900">-</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Medium Risk</p>
                                <p id="medium-risk-count" class="text-2xl font-semibold text-gray-900">-</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Low Risk</p>
                                <p id="low-risk-count" class="text-2xl font-semibold text-gray-900">-</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-500">Trainings</p>
                                <p id="trainings-count" class="text-2xl font-semibold text-gray-900">-</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Risk Level Distribution</h3>
                        <div class="h-64">
                            <canvas id="risk-chart"></canvas>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Observations Over Time</h3>
                        <div class="h-64">
                            <canvas id="timeline-chart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="bg-white rounded-lg shadow">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
                    </div>
                    <div id="recent-activity" class="divide-y divide-gray-200">
                        <div class="px-6 py-4 text-center text-gray-500">
                            Loading recent activity...
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        await this.loadDashboardData();
    }

    setupEventListeners() {
        document.getElementById('refresh-dashboard').addEventListener('click', () => {
            this.loadDashboardData();
        });

        document.getElementById('export-report').addEventListener('click', () => {
            this.exportReport();
        });
    }

    async loadDashboardData() {
        try {
            // Load observations stats
            const { data: observations } = await this.supabase.getObservationStats();
            this.updateMetrics(observations);
            this.updateCharts(observations);

            // Load recent activity
            await this.loadRecentActivity();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            window.hseApp.ui.showNotification('Failed to load dashboard data', 'error');
        }
    }

    updateMetrics(observations) {
        const riskCounts = {
            High: 0,
            Medium: 0,
            Low: 0
        };

        if (observations) {
            observations.forEach(obs => {
                if (riskCounts.hasOwnProperty(obs.risk_level)) {
                    riskCounts[obs.risk_level]++;
                }
            });
        }

        document.getElementById('high-risk-count').textContent = riskCounts.High;
        document.getElementById('medium-risk-count').textContent = riskCounts.Medium;
        document.getElementById('low-risk-count').textContent = riskCounts.Low;
    }

    updateCharts(observations) {
        this.createRiskChart(observations);
        this.createTimelineChart(observations);
    }

    createRiskChart(observations) {
        const ctx = document.getElementById('risk-chart').getContext('2d');
        
        if (this.charts.riskChart) {
            this.charts.riskChart.destroy();
        }

        const riskCounts = {
            High: 0,
            Medium: 0,
            Low: 0
        };

        if (observations) {
            observations.forEach(obs => {
                if (riskCounts.hasOwnProperty(obs.risk_level)) {
                    riskCounts[obs.risk_level]++;
                }
            });
        }

        this.charts.riskChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                datasets: [{
                    data: [riskCounts.High, riskCounts.Medium, riskCounts.Low],
                    backgroundColor: [
                        '#ef4444',
                        '#f59e0b',
                        '#10b981'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createTimelineChart(observations) {
        const ctx = document.getElementById('timeline-chart').getContext('2d');
        
        if (this.charts.timelineChart) {
            this.charts.timelineChart.destroy();
        }

        // Group observations by date
        const dateGroups = {};
        if (observations) {
            observations.forEach(obs => {
                const date = new Date(obs.created_at).toDateString();
                if (!dateGroups[date]) {
                    dateGroups[date] = 0;
                }
                dateGroups[date]++;
            });
        }

        const sortedDates = Object.keys(dateGroups).sort();
        const counts = sortedDates.map(date => dateGroups[date]);

        this.charts.timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: 'Observations',
                    data: counts,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    async loadRecentActivity() {
        try {
            const { data: observations } = await this.supabase.getObservations();
            const { data: trainings } = await this.supabase.getTrainings();
            
            // Combine and sort by date
            const activities = [];
            
            if (observations) {
                observations.slice(0, 5).forEach(obs => {
                    activities.push({
                        type: 'observation',
                        title: `${obs.risk_level} risk observation at ${obs.location}`,
                        date: obs.created_at,
                        riskLevel: obs.risk_level
                    });
                });
            }

            if (trainings) {
                trainings.slice(0, 3).forEach(training => {
                    activities.push({
                        type: 'training',
                        title: `Training: ${training.title}`,
                        date: training.created_at
                    });
                });
            }

            activities.sort((a, b) => new Date(b.date) - new Date(a.date));

            const activityContainer = document.getElementById('recent-activity');
            
            if (activities.length > 0) {
                activityContainer.innerHTML = activities.slice(0, 8).map(activity => `
                    <div class="px-6 py-4 flex items-center space-x-3">
                        <div class="flex-shrink-0">
                            ${activity.type === 'observation' ? 
                                `<div class="w-2 h-2 rounded-full ${this.getRiskDotClass(activity.riskLevel)}"></div>` :
                                `<div class="w-2 h-2 rounded-full bg-blue-400"></div>`
                            }
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm text-gray-900">${activity.title}</p>
                            <p class="text-xs text-gray-500">${new Date(activity.date).toLocaleString()}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                activityContainer.innerHTML = `
                    <div class="px-6 py-4 text-center text-gray-500">
                        No recent activity
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    getRiskDotClass(riskLevel) {
        switch (riskLevel) {
            case 'High': return 'bg-red-400';
            case 'Medium': return 'bg-yellow-400';
            case 'Low': return 'bg-green-400';
            default: return 'bg-gray-400';
        }
    }

    handleRealtimeUpdate(table, payload) {
        // Refresh dashboard when new data comes in
        this.loadDashboardData();
    }

    exportReport() {
        // Generate and download a CSV report
        this.generateCSVReport();
    }

    async generateCSVReport() {
        try {
            const { data: observations } = await this.supabase.getObservations();
            
            if (!observations || observations.length === 0) {
                window.hseApp.ui.showNotification('No data to export', 'warning');
                return;
            }

            const csvContent = this.convertToCSV(observations);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `hse-report-${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            window.hseApp.ui.showNotification('Report exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting report:', error);
            window.hseApp.ui.showNotification('Failed to export report', 'error');
        }
    }

    convertToCSV(data) {
        const headers = ['Date', 'Location', 'Risk Level', 'Observation', 'Action Taken', 'Responsible', 'Assessor'];
        const csvRows = [headers.join(',')];

        data.forEach(obs => {
            const row = [
                new Date(obs.created_at).toLocaleDateString(),
                `"${obs.location}"`,
                obs.risk_level,
                `"${obs.observation.replace(/"/g, '""')}"`,
                `"${obs.action_taken || ''}"`,
                `"${obs.responsible || ''}"`,
                `"${obs.assessors?.name || ''}"`
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }
}
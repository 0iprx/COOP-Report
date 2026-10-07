import { SavedPeriodicReport } from '@coop/shared';
import { api } from './api';

const STORAGE_KEY = 'coop_saved_periodic_reports_v1';
const ACTIVE_PERIODIC_ID_KEY = 'coop_active_periodic_id_v1';

export const periodicReportsService = {
  // Get all saved periodic reports from localStorage with server sync
  getSavedReports(): SavedPeriodicReport[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  // Save or update a periodic report
  saveReport(report: SavedPeriodicReport): SavedPeriodicReport[] {
    const list = this.getSavedReports();
    const existingIdx = list.findIndex(r => r.id === report.id);
    const now = new Date().toISOString();

    const updatedReport: SavedPeriodicReport = {
      ...report,
      updatedAt: now
    };

    let updatedList: SavedPeriodicReport[];
    if (existingIdx >= 0) {
      updatedList = [...list];
      updatedList[existingIdx] = updatedReport;
    } else {
      updatedList = [updatedReport, ...list];
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      localStorage.setItem(ACTIVE_PERIODIC_ID_KEY, updatedReport.id);
    } catch (e) {
      console.warn('Failed to save periodic report to localStorage:', e);
    }

    // Attempt background sync to server API if endpoint is available
    api.post('/reports/periodic', updatedReport).catch(() => {
      // Non-fatal if offline
    });

    return updatedList;
  },

  // Delete a periodic report
  deleteReport(id: string): SavedPeriodicReport[] {
    const list = this.getSavedReports();
    const filtered = list.filter(r => r.id !== id);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      if (localStorage.getItem(ACTIVE_PERIODIC_ID_KEY) === id) {
        if (filtered.length > 0) {
          localStorage.setItem(ACTIVE_PERIODIC_ID_KEY, filtered[0].id);
        } else {
          localStorage.removeItem(ACTIVE_PERIODIC_ID_KEY);
        }
      }
    } catch (e) {
      console.warn('Failed to delete periodic report from localStorage:', e);
    }

    api.delete(`/reports/periodic/${id}`).catch(() => {
      // Non-fatal if offline
    });

    return filtered;
  },

  // Get active periodic report ID
  getActiveReportId(): string | null {
    return localStorage.getItem(ACTIVE_PERIODIC_ID_KEY);
  },

  setActiveReportId(id: string): void {
    localStorage.setItem(ACTIVE_PERIODIC_ID_KEY, id);
  },

  // Create a default empty periodic report
  createDefaultReport(startDate: string = '', endDate: string = ''): SavedPeriodicReport {
    const now = new Date();
    const id = `periodic_${now.getTime()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id,
      title: 'تقرير التدريب الميداني للفترة المحددة',
      startDate: startDate || now.toISOString().split('T')[0],
      endDate: endDate || now.toISOString().split('T')[0],
      customNarrative: '',
      department: '',
      roleAssignment: 'موظف رسمي في بيئة العمل الميدانية',
      includeDailyTasks: true,
      includeEvidence: true,
      includeEndorsement: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
  }
};

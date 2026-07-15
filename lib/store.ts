export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface LeaveRequest {
  id: string;
  userId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  startFormat?: string;
  endFormat?: string;
  status: LeaveStatus;
  createdAt: string;
  approver?: string;
  approverReason?: string;
}

const API_URL = 'http://localhost:3001/leaves';

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch leave requests');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const addLeaveRequest = async (request: Omit<LeaveRequest, "id" | "status" | "createdAt">): Promise<LeaveRequest | null> => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!res.ok) throw new Error('Failed to add leave request');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateLeaveStatus = async (id: string, status: LeaveStatus, approverName?: string, approverReason?: string): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, approverName, approverReason })
    });
    if (!res.ok) throw new Error('Failed to update leave status');
  } catch (error) {
    console.error(error);
  }
};

export const deleteLeaveRequest = async (id: string): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete leave request');
  } catch (error) {
    console.error(error);
  }
};

export const updateLeaveRequest = async (id: string, data: Partial<LeaveRequest>): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update leave request');
  } catch (error) {
    console.error(error);
  }
};

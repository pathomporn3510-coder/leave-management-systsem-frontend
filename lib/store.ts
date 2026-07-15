export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface LeaveRequest {
  id: string;
  userId: string; // The username of the submitter
  type: string; // Annual, Sick, etc.
  startDate: string;
  endDate: string;
  reason: string;
  startFormat?: string;
  endFormat?: string;
  status: LeaveStatus;
  createdAt: string;
  approver?: string;
}

export const getLeaveRequests = (): LeaveRequest[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("leaveRequests");
  return data ? JSON.parse(data) : [];
};

export const saveLeaveRequests = (requests: LeaveRequest[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("leaveRequests", JSON.stringify(requests));
};

export const addLeaveRequest = (request: Omit<LeaveRequest, "id" | "status" | "createdAt">) => {
  const requests = getLeaveRequests();
  const newRequest: LeaveRequest = {
    ...request,
    id: Math.random().toString(36).substring(2, 9),
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  requests.push(newRequest);
  saveLeaveRequests(requests);
  return newRequest;
};

export const updateLeaveStatus = (id: string, status: LeaveStatus) => {
  const requests = getLeaveRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index !== -1) {
    requests[index].status = status;
    saveLeaveRequests(requests);
  }
};

export const deleteLeaveRequest = (id: string) => {
  const requests = getLeaveRequests();
  const filtered = requests.filter((r) => r.id !== id);
  saveLeaveRequests(filtered);
};

export const updateLeaveRequest = (id: string, data: Partial<LeaveRequest>) => {
  const requests = getLeaveRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...data };
    saveLeaveRequests(requests);
  }
};

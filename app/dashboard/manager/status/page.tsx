"use client";

import { useState, useEffect } from "react";
import { getLeaveRequests, LeaveRequest } from "@/lib/store";

const getLeaveDetails = (req: LeaveRequest) => {
  if (!req.startDate || !req.endDate) return '';
  const start = new Date(req.startDate);
  const end = new Date(req.endDate);
  const diffTime = end.getTime() - start.getTime();
  let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (days === 1) {
    if (req.startFormat === 'morning') return '(ครึ่งวันเช้า)';
    if (req.startFormat === 'afternoon') return '(ครึ่งวันบ่าย)';
    return '(1 วัน - เต็มวัน)';
  } else {
    let deduct = 0;
    if (req.startFormat === 'afternoon') deduct += 0.5;
    if (req.endFormat === 'morning') deduct += 0.5;
    return `(${days - deduct} วัน)`;
  }
};

export default function ManagerStatusPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [username, setUsername] = useState("xxxxx xxxxxx");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername && storedUsername !== "Manager") {
      setUsername(storedUsername);
    }
    const allRequests = getLeaveRequests();
    // Filter by username and where approver is explicitly set to CEO
    setRequests(allRequests.filter(r => r.userId === (storedUsername || "Manager") && r.approver === 'CEO').reverse());
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#E2E4E9] font-sans text-slate-800 flex flex-col">
      {/* Top Banner */}
      <div className="bg-white flex items-center justify-between px-8 py-5 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-black tracking-tight">ตรวจสอบสถานะการลา (Manager)</h1>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

          {requests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 font-medium">คุณยังไม่มีประวัติการยื่นคำขอลา</p>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

                  {/* Header Box */}
                  <div className="bg-[#F4F5F7] rounded-xl p-5 mb-10">
                    <h3 className="text-[17px] font-bold text-black">{req.type}</h3>
                    <p className="text-[13px] text-gray-500 mt-1 font-medium">
                      {req.startDate} ถึง {req.endDate} <span className="ml-1 text-blue-600 font-semibold">{getLeaveDetails(req)}</span>
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-7 md:pl-10">
                    {/* Vertical Line */}
                    <div className="absolute left-[15px] md:left-[27px] top-2 bottom-4 w-[2px] bg-gray-200 z-0"></div>

                    {/* Step 1: Submitted */}
                    <div className="relative mb-10">
                      <div className="absolute -left-[31px] md:-left-[43px] w-4 h-4 bg-[#00E676] rounded-full ring-[6px] ring-white z-10 top-0.5"></div>
                      <h4 className="font-bold text-black text-sm">ส่งคำขอสำเร็จ</h4>
                      <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                        {new Date(req.createdAt).toLocaleString('th-TH', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })} น.
                      </p>
                      <div className="bg-[#F4F5F7] text-gray-600 text-xs font-medium p-3 rounded-lg mt-3 w-full max-w-3xl">
                        คุณได้ยื่นคำขอลาเพื่อส่งให้ CEO พิจารณาเรียบร้อยแล้ว
                      </div>
                    </div>

                    {/* Step 2: CEO Approval */}
                    <div className="relative mb-10">
                      <div className={`absolute -left-[31px] md:-left-[43px] w-4 h-4 rounded-full ring-[6px] ring-white z-10 top-0.5 ${req.status === 'Approved' ? 'bg-[#00E676]' :
                          req.status === 'Rejected' ? 'bg-[#FF0000]' : 'bg-[#29B6F6]'
                        }`}></div>
                      <h4 className={`font-bold text-sm ${req.status === 'Pending' ? 'text-black' :
                          req.status === 'Rejected' ? 'text-red-600' : 'text-gray-800'
                        }`}>
                        {req.status === 'Approved' ? 'CEO อนุมัติแล้ว' :
                          req.status === 'Rejected' ? 'CEO ปฏิเสธคำขอ' : 'รอพิจารณาจาก CEO'}
                      </h4>
                      {req.reason && req.status !== 'Pending' && (
                        <div className={`text-xs font-medium p-3 rounded-lg mt-3 w-full max-w-3xl ${req.status === 'Approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                          หมายเหตุ: {req.reason}
                        </div>
                      )}
                    </div>

                    {/* Step 3: Completed */}
                    <div className="relative">
                      <div className={`absolute -left-[31px] md:-left-[43px] w-4 h-4 rounded-full ring-[6px] ring-white z-10 top-0.5 ${(req.status === 'Approved' || req.status === 'Rejected') ? 'bg-[#00E676]' : 'bg-[#E0E0E0]'
                        }`}></div>
                      <h4 className={`font-bold text-sm ${(req.status === 'Approved' || req.status === 'Rejected') ? 'text-black' : 'text-[#D1D5DB]'}`}>
                        เสร็จสิ้น (Completed)
                      </h4>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

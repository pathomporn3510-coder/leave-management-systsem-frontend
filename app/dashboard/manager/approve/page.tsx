"use client";

import { useState, useEffect } from "react";
import { getLeaveRequests, updateLeaveStatus, LeaveRequest } from "@/lib/store";
import { Calendar as CalendarIcon, X, User, Download } from "lucide-react";

// Mock data has been moved to the backend to avoid duplicate key errors.
export default function ManagerApprovePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedMonthRaw, setSelectedMonthRaw] = useState("2026-07");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempYear, setTempYear] = useState(2026);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approverReason, setApproverReason] = useState("");

  useEffect(() => {
    setApproverReason("");
  }, [selectedRequest]);

  const formatMonthYear = (yyyyMM: string) => {
    if (!yyyyMM) return "";
    const [year, month] = yyyyMM.split('-');
    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    return `${months[parseInt(month) - 1]} ${parseInt(year) + 543}`;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatShortDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getDayRange = (start: string, end: string) => {
    if (start === end) return formatShortDate(start);
    const d1 = new Date(start);
    const d2 = new Date(end);
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
      return `${d1.getDate()}-${d2.getDate()} ${months[d1.getMonth()]} ${d1.getFullYear()}`;
    }
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
  };

  const loadRequests = async () => {
    const allRequests = await getLeaveRequests();
    // Only pending requests that are not routed to CEO (so they belong to this manager)
    const realPending = allRequests.filter(r => r.status === 'Pending' && r.approver !== 'CEO' && r.userId !== 'Manager').reverse();
    
    // Filter by month
    const filtered = realPending.filter(r => r.startDate.startsWith(selectedMonthRaw));
    
    setRequests(filtered.map(r => ({
      ...r,
      dateRange: getDayRange(r.startDate, r.endDate)
    })));
  };

  useEffect(() => {
    loadRequests();
  }, [selectedMonthRaw]);

  const handleMonthSelect = (monthIndex: number) => {
    const mm = (monthIndex + 1).toString().padStart(2, '0');
    setSelectedMonthRaw(`${tempYear}-${mm}`);
    setIsPickerOpen(false);
  };

  const handleApprove = async (reqId: string, reason: string = "") => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะ อนุมัติ คำขอลานี้?")) {
      const storedUsername = sessionStorage.getItem("username") || "Manager";
      await updateLeaveStatus(reqId, "Approved", storedUsername, reason);
      await loadRequests();
      if (selectedRequest && selectedRequest.id === reqId) setSelectedRequest(null);
    }
  };

  const handleReject = async (reqId: string, reason: string = "") => {
    let finalReason = reason;
    if (!finalReason || finalReason.trim() === "") {
      const p = prompt("กรุณาระบุเหตุผลในการปฏิเสธคำขอลานี้ (จำเป็น):");
      if (p === null) return; // User cancelled
      if (p.trim() === "") {
        alert("การปฏิเสธคำขอลาจำเป็นต้องระบุเหตุผล");
        return;
      }
      finalReason = p.trim();
    }

    if (confirm("คุณแน่ใจหรือไม่ที่จะ ปฏิเสธ คำขอลานี้?")) {
      const storedUsername = sessionStorage.getItem("username") || "Manager";
      await updateLeaveStatus(reqId, "Rejected", storedUsername, finalReason);
      await loadRequests();
      if (selectedRequest && selectedRequest.id === reqId) setSelectedRequest(null);
    }
  };

  const onModalApprove = () => {
    handleApprove(selectedRequest.id, approverReason);
  };

  const onModalReject = () => {
    if (!approverReason.trim()) {
      alert("กรุณาระบุเหตุผลในการปฏิเสธคำขอลา");
      return;
    }
    handleReject(selectedRequest.id, approverReason);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#E2E4E9] font-sans text-slate-800 p-6 md:p-10 flex flex-col items-center">
      
      <div className="w-full max-w-[1200px] bg-white rounded-xl shadow-md border border-gray-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">รายการคำขอรออนุมัติ (Manager View)</h1>
          <p className="text-sm text-gray-400 font-medium">พิจารณาอนุมัติหรือปฏิเสธคำขอลาของพนักงานในแผนกของคุณ</p>
        </div>

        {/* Month Picker Button */}
        <div className="mb-8 relative inline-block">
          <button
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="border border-gray-300 text-gray-700 text-sm font-bold py-2 px-5 rounded-full shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-all active:scale-95"
          >
            {formatMonthYear(selectedMonthRaw)}
            <CalendarIcon className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
          </button>

          {isPickerOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsPickerOpen(false)}></div>
              <div className="absolute top-full left-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-[340px] z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-5 px-1">
                  <button onClick={() => setTempYear(y => y - 1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  </button>
                  <span className="font-bold text-lg text-black tracking-wide">{tempYear + 543}</span>
                  <button onClick={() => setTempYear(y => y + 1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."].map((m, i) => {
                    const isSelected = selectedMonthRaw === `${tempYear}-${(i + 1).toString().padStart(2, '0')}`;
                    return (
                      <button
                        key={m}
                        onClick={() => handleMonthSelect(i)}
                        className={`py-2.5 rounded-xl text-[14px] font-bold transition-all ${isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2F2F2] text-gray-500 text-[13px]">
                <th className="py-4 px-6 font-bold whitespace-nowrap rounded-l-md">ชื่อพนักงาน</th>
                <th className="py-4 px-6 font-bold whitespace-nowrap">ประเภทวันลา</th>
                <th className="py-4 px-6 font-bold whitespace-nowrap">วันเวลาที่ขอลา</th>
                <th className="py-4 px-6 font-bold whitespace-nowrap">เอกสารแนบ</th>
                <th className="py-4 px-6 font-bold whitespace-nowrap rounded-r-md text-right pr-12">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                    ไม่มีรายการคำขออนุมัติในเดือน {formatMonthYear(selectedMonthRaw)}
                  </td>
                </tr>
              ) : (
                requests.map((req, idx) => (
                  <tr key={req.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-6 px-6 text-[14px] font-bold text-gray-800 whitespace-nowrap">{req.userId}</td>
                    <td className="py-6 px-6 text-[14px] text-gray-500 whitespace-nowrap">{req.type}</td>
                    <td className="py-6 px-6 text-[14px] text-gray-500 whitespace-nowrap">{req.dateRange}</td>
                    <td className="py-6 px-6 text-[14px] text-gray-500 whitespace-nowrap">{req.attachment || '-'}</td>
                    <td className="py-6 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 pr-6">
                        <button 
                          onClick={() => setSelectedRequest(req)}
                          className="bg-[#FFA000] hover:bg-[#F57C00] text-black text-[11px] font-bold py-1.5 px-3 rounded shadow-sm transition-colors"
                        >
                          รายละเอียด
                        </button>
                        <button 
                          onClick={() => handleApprove(req.id)}
                          className="bg-[#00C853] hover:bg-[#00B04A] text-white text-[11px] font-bold py-1.5 px-3 rounded shadow-sm transition-colors"
                        >
                          อนุมัติ
                        </button>
                        <button 
                          onClick={() => handleReject(req.id)}
                          className="bg-[#FF0000] hover:bg-[#E50000] text-white text-[11px] font-bold py-1.5 px-3 rounded shadow-sm transition-colors"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Leave Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-[650px] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border-2 border-blue-500 overflow-hidden relative">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5">
              <h2 className="text-[20px] font-bold text-black">รายละเอียดคำขอลา (Leave Request Details)</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 flex items-center justify-center text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-sm"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pb-6 overflow-y-auto flex-1 space-y-4">

              {/* Employee Info */}
              <div className="border border-gray-300 rounded-xl p-5 flex gap-4 bg-white">
                <div className="w-[38px] h-[38px] rounded-full bg-fuchsia-100/50 border border-fuchsia-200 text-fuchsia-500 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[15px] text-black mb-3">ข้อมูลพนักงาน (Employee Info)</h3>
                  <div className="text-[14px] text-gray-800 space-y-2">
                    <p className="flex items-center gap-2"><span className="font-bold min-w-[90px]">ชื่อ:</span> {selectedRequest.userId}</p>
                    <p className="flex items-center gap-2"><span className="font-bold min-w-[90px]">แผนก|ตำแหน่ง:</span> Engineering | Software Engineer</p>
                  </div>
                </div>
              </div>

              {/* Leave Info */}
              <div className="border border-gray-300 rounded-xl p-5 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-[32px] h-[32px] rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                    <CalendarIcon className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-[15px] text-black">รายละเอียดการลา (Leave Information)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[14px] text-gray-800 pl-[44px]">
                  <div className="space-y-3">
                    <p className="flex gap-2"><span className="font-bold min-w-[80px]">ประเภทการลา:</span> {selectedRequest.type}</p>
                    <p className="flex gap-2"><span className="font-bold min-w-[80px]">ช่วงเวลา:</span> {selectedRequest.dateRange}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="flex items-center gap-2">
                      <span className="w-[26px] h-[26px] bg-green-100 text-green-600 flex items-center justify-center rounded-full shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                      </span>
                      <span className="font-bold min-w-[80px]">รูปแบบการลา:</span> เต็มวัน
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-[26px] h-[26px] bg-yellow-100 text-yellow-600 flex items-center justify-center rounded-full shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                      </span>
                      <span className="font-bold min-w-[80px]">เอกสารแนบ:</span> {selectedRequest.attachment || '-'}
                      <button className="ml-auto p-1.5 border border-gray-300 rounded-md hover:bg-gray-100 text-black">
                        <Download className="w-[14px] h-[14px]" strokeWidth={2.5} />
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h3 className="font-bold text-black text-[14px] mb-2">เหตุผลการลา</h3>
                <input
                  type="text"
                  readOnly
                  value={selectedRequest.reason}
                  className="w-full border border-gray-300 rounded-xl p-3 text-[14px] text-gray-500 bg-white outline-none cursor-default"
                />
              </div>

              {/* Approver Reason Section */}
              <div className="mt-4">
                <h3 className="font-bold text-[#00A859] flex items-center gap-2 text-[15px] mb-2">
                  <span className="font-extrabold text-black/50 tracking-tighter">NID</span> การอนุมัติ (Approval)
                </h3>
                <div className="flex flex-col md:flex-row items-stretch gap-4 bg-white border border-gray-200 rounded-xl p-4">
                  <div className="w-[160px] flex flex-col justify-center border-r border-gray-200 pr-4">
                    <span className="text-[12px] font-bold text-black mb-2">สถานะ:</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={onModalApprove} 
                        className="flex-1 bg-[#00E676] hover:bg-[#00C853] text-white text-[12px] font-bold py-1.5 px-2 rounded-full shadow-sm transition-colors"
                      >
                        อนุมัติ
                      </button>
                      <button 
                        onClick={onModalReject} 
                        className="flex-1 bg-[#FF0000] hover:bg-[#E50000] text-white text-[12px] font-bold py-1.5 px-2 rounded-full shadow-sm transition-colors"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-[12px] font-bold text-black mb-2">เหตุผลของผู้อนุมัติ (Manager)</span>
                    <input
                      type="text"
                      placeholder="กรุณาระบุเหตุผล (บังคับหากปฏิเสธ)"
                      value={approverReason}
                      onChange={(e) => setApproverReason(e.target.value)}
                      className="w-full bg-[#F4FDF8] border border-[#D1F2DF] rounded-xl p-2.5 text-[13px] outline-none text-black focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
               <span className="text-[12px] text-gray-400">วันที่ยื่นคำขอ : {selectedRequest.createdAt ? formatDate(selectedRequest.createdAt) : "15 ก.ค. 2569"}</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

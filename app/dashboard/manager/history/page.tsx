"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getLeaveRequests, deleteLeaveRequest, updateLeaveRequest } from "@/lib/store";
import { Calendar as CalendarIcon, X, User, Download, Edit3, Trash2, Upload, Check } from "lucide-react";



export default function LeaveHistoryPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [username, setUsername] = useState("xxxxx xxxxxx");
  const [selectedMonthRaw, setSelectedMonthRaw] = useState("2026-07");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempYear, setTempYear] = useState(2026);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"department" | "personal">("department");

  const router = useRouter();
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    type: "ลาพักร้อน (เหลือ 12 วัน)",
    startDate: "",
    endDate: "",
    reason: "",
    format: "full"
  });

  const formatMonthYear = (yyyyMM: string) => {
    if (!yyyyMM) return "";
    const [year, month] = yyyyMM.split('-');
    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    return `${months[parseInt(month) - 1]} ${parseInt(year) + 543}`;
  };

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

  const loadRequests = async () => {
    const storedUsername = sessionStorage.getItem("username") || "Manager";
    const allRequests = await getLeaveRequests();
    
    let targetRequests = [];
    if (viewMode === "personal") {
      // Personal mode: show all requests made by this user
      targetRequests = allRequests.filter(r => r.userId === storedUsername);
    } else {
      // Department mode: show all requests made by others in the department
      targetRequests = allRequests.filter(r => r.userId !== storedUsername);
    }

    // Filter by selectedMonthRaw (e.g. "2026-07")
    const filtered = targetRequests.reverse().filter(r => r.startDate.startsWith(selectedMonthRaw));

    setRequests(filtered.map(r => ({
      id: r.id,
      empId: `EMP-${(r.userId || '000').substring(0,3).toUpperCase()}${r.id.substring(0,2).toUpperCase()}`,
      name: r.userId || 'Unknown',
      dateStr: r.startDate === r.endDate ? formatDate(r.startDate) : `${formatDate(r.startDate)} - ${formatDate(r.endDate)}`,
      type: r.type,
      days: `${calculateDays(r.startDate, r.endDate)} วัน`,
      reason: r.reason || '-',
      status: r.status,
      raw: r
    })));
  };

  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    if (storedUsername && storedUsername !== "Manager") {
      setUsername(storedUsername);
    }
    loadRequests();
  }, [selectedMonthRaw, viewMode]);

  const handleMonthSelect = (monthIndex: number) => {
    const mm = (monthIndex + 1).toString().padStart(2, '0');
    setSelectedMonthRaw(`${tempYear}-${mm}`);
    setIsPickerOpen(false);
  };

  const handleDelete = async () => {
    if (confirm("คุณต้องการลบคำขอลาใช่หรือไม่?")) {
      await deleteLeaveRequest(selectedRequest.id);
      await loadRequests();
      setSelectedRequest(null);
    }
  };

  const handleEditClick = () => {
    setEditForm({
      type: selectedRequest.raw.type,
      startDate: selectedRequest.raw.startDate,
      endDate: selectedRequest.raw.endDate,
      reason: selectedRequest.raw.reason,
      format: "full"
    });
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.type || !editForm.startDate || !editForm.endDate || !editForm.reason) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // Open confirmation modal instead of saving immediately
    setShowConfirmEdit(true);
  };

  const confirmAndSave = async () => {
    await updateLeaveRequest(selectedRequest.id, {
      type: editForm.type.split(' ')[0],
      startDate: editForm.startDate,
      endDate: editForm.endDate,
      reason: editForm.reason
    });
    await loadRequests();

    setShowConfirmEdit(false);
    setIsEditing(false);
    setSelectedRequest(null);

    // Navigate to status page for Manager
    router.push('/dashboard/manager/status');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#E2E4E9] font-sans text-slate-800 flex flex-col relative">
      {/* Top Banner */}
      <div className="bg-white flex items-center justify-between px-8 py-5 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-black tracking-tight">ประวัติการลา (Leave History) - Manager</h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {viewMode === "department" ? "ดูประวัติและสถานะการลางานของแผนก" : "ดูประวัติและสถานะการลางานของคุณทั้งหมดที่ส่งให้ CEO"}
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Custom Month/Year Picker and View Toggle */}
          <div className="mb-8 flex items-center justify-between relative">
            <div className="relative inline-block">
              <button
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="bg-white border border-gray-200 text-black text-[15px] font-bold py-3 px-6 rounded-xl shadow-sm flex items-center gap-3 hover:bg-gray-50 hover:border-blue-400 hover:shadow-md transition-all active:scale-95"
            >
              <CalendarIcon className="w-[18px] h-[18px] text-blue-600" strokeWidth={2.5} />
              {formatMonthYear(selectedMonthRaw)}
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

            <button
              onClick={() => setViewMode(viewMode === "department" ? "personal" : "department")}
              className="text-[14px] font-bold text-gray-600 hover:text-blue-600 underline underline-offset-4 transition-colors"
            >
              {viewMode === "department" ? "ดูประวัติการลาของส่วนตัว" : "ดูประวัติการลาของแผนก"}
            </button>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
                  <div className="w-20 h-20 bg-[#F4F5F7] rounded-full flex items-center justify-center mb-5">
                    <CalendarIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่มีข้อมูลประวัติการลา</h3>
                  <p className="text-gray-500 font-medium">ไม่มีประวัติการยื่นคำขอลาในเดือน {formatMonthYear(selectedMonthRaw)}</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#CDE4EB] text-gray-800 text-[15px]">
                    <tr>
                      {viewMode === "department" && (
                        <>
                          <th className="px-6 py-4 font-bold whitespace-nowrap">รหัสพนักงาน</th>
                          <th className="px-6 py-4 font-bold whitespace-nowrap">ชื่อพนักงาน</th>
                        </>
                      )}
                      <th className="px-6 py-4 font-bold whitespace-nowrap">วันที่ลา</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">ประเภทการลา</th>
                      <th className="px-6 py-4 font-bold text-center whitespace-nowrap">จำนวนวันลา</th>
                      {viewMode === "personal" && <th className="px-6 py-4 font-bold whitespace-nowrap">เหตุผล</th>}
                      <th className="px-6 py-4 font-bold text-center whitespace-nowrap">สถานะ</th>
                      {viewMode === "personal" && <th className="px-6 py-4 font-bold text-center whitespace-nowrap">จัดการ</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req, idx) => (
                      <tr key={req.id || idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        {viewMode === "department" && (
                          <>
                            <td className="px-6 py-5 text-gray-500 font-medium whitespace-nowrap">{req.empId}</td>
                            <td className="px-6 py-5 text-black font-medium whitespace-nowrap">{req.name}</td>
                          </>
                        )}
                        <td className="px-6 py-5 text-black font-medium whitespace-nowrap">{req.dateStr}</td>
                        <td className="px-6 py-5 text-black font-medium whitespace-nowrap">{req.type}</td>
                        <td className="px-6 py-5 text-black font-medium text-center whitespace-nowrap">{req.days}</td>
                        {viewMode === "personal" && <td className="px-6 py-5 text-black font-medium">{req.reason}</td>}
                        
                        {viewMode === "department" ? (
                          <td className="px-6 py-5 text-center whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className={`inline-block px-5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm min-w-[80px] ${req.status === 'Approved' ? 'bg-[#00E676]' :
                                  req.status === 'Rejected' ? 'bg-[#FF0000]' : 'bg-[#FFA000]'
                                }`}>
                                {req.status === 'Approved' ? 'อนุมัติ' : req.status === 'Rejected' ? 'ปฏิเสธ' : 'รออนุมัติ'}
                              </span>
                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="text-gray-600 hover:text-blue-600 font-medium text-[12px] flex items-center gap-1 transition-colors"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                ดูรายละเอียด
                              </button>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="px-6 py-5 text-center whitespace-nowrap">
                              <span className={`inline-block px-5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm min-w-[80px] ${req.status === 'Approved' ? 'bg-[#00E676]' :
                                  req.status === 'Rejected' ? 'bg-[#FF0000]' : 'bg-[#FFA000]'
                                }`}>
                                {req.status === 'Approved' ? 'อนุมัติ' : req.status === 'Rejected' ? 'ปฏิเสธ' : 'รออนุมัติ'}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center whitespace-nowrap">
                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="text-gray-600 hover:text-blue-600 font-medium text-[13px] transition-colors underline underline-offset-2"
                              >
                                ดูรายละเอียด
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Leave Details Modal */}
      {(selectedRequest && !isEditing) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-[650px] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden relative">

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
                    <p className="flex items-center gap-2"><span className="font-bold min-w-[90px]">ชื่อ:</span> {selectedRequest.name || selectedRequest.raw?.userId || username}</p>
                    <p className="flex items-center gap-2"><span className="font-bold min-w-[90px]">แผนก|ตำแหน่ง:</span> Engineering | {selectedRequest.name === username ? "Engineering Manager" : "Software Engineer"}</p>
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
                    <p className="flex gap-2"><span className="font-bold min-w-[80px]">ช่วงเวลา:</span> {selectedRequest.dateStr} ({selectedRequest.days.replace(' วัน', '')} วัน)</p>
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
                      <span className="font-bold min-w-[80px]">เอกสารแนบ:</span> -
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

              {/* Approval */}
              <div className="mt-2">
                <h3 className="font-bold text-[#00A859] flex items-center gap-2 text-[15px] mb-2">
                  <span className="font-extrabold text-black/50 tracking-tighter">NID</span> การอนุมัติ (Approval)
                </h3>
                <div className="flex flex-col md:flex-row items-stretch gap-4 bg-[#F8F9FA] border border-gray-200 rounded-xl p-4">
                  <div className="w-[120px] flex flex-col justify-center border-r border-gray-200 pr-4">
                    <span className="text-[12px] font-bold text-black mb-2">สถานะ:</span>
                    <span className={`inline-flex justify-center items-center px-4 py-1.5 rounded-full text-[13px] font-bold text-white shadow-sm ${selectedRequest.status === 'Approved' ? 'bg-[#00E676]' :
                        selectedRequest.status === 'Rejected' ? 'bg-[#FF0000]' : 'bg-[#FFA000]'
                      }`}>
                      {selectedRequest.status === 'Approved' ? 'อนุมัติ' : selectedRequest.status === 'Rejected' ? 'ปฏิเสธ' : 'รอพิจารณา'}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-[12px] font-bold text-black mb-2">เหตุผลของผู้อนุมัติ ({viewMode === "department" ? "Manager" : "CEO"})</span>
                    <input
                      type="text"
                      readOnly
                      value={selectedRequest.raw?.approverReason || (selectedRequest.status === 'Pending' ? 'รอการพิจารณา' : 'ไม่มีหมายเหตุเพิ่มเติม')}
                      className={`w-full border rounded-xl p-2.5 text-[14px] outline-none cursor-default ${selectedRequest.status === 'Rejected' ? 'border-red-200 text-red-600 bg-red-50' :
                          selectedRequest.status === 'Approved' ? 'border-[#D1F2DF] text-green-600 bg-[#F4FDF8]' : 'border-gray-300 text-gray-500 bg-white'
                        }`}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <span className="text-[13px] font-medium text-gray-300">วันที่ยื่นคำขอ : {formatDate(selectedRequest.raw?.createdAt || new Date().toISOString())}</span>

              {selectedRequest.status === 'Pending' && viewMode === "personal" && (
                <div className="flex items-center gap-5">
                  <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 font-bold text-[14px] flex items-center gap-1.5 transition-colors">
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    ลบข้อมูล
                  </button>
                  <button onClick={handleEditClick} className="text-blue-600 hover:text-blue-700 font-bold text-[14px] flex items-center gap-1.5 transition-colors">
                    <Edit3 className="w-4 h-4" strokeWidth={2.5} />
                    แก้ไขข้อมูล
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Edit Form Modal (Fullscreen) */}
      {isEditing && (
        <div className="fixed inset-0 z-[120] bg-[#E2E4E9] overflow-y-auto">
          {/* Top Banner (Inside Edit) */}
          <div className="bg-white flex flex-col md:flex-row md:items-center justify-between px-8 py-5 shadow-sm sticky top-0 z-10 gap-4 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold text-black tracking-tight">แบบฟอร์มยื่นลา (Leave Request)</h1>
              <p className="text-[13px] text-gray-500 mt-1 font-medium">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อส่งให้ CEO อนุมัติ</p>
            </div>
            <div className="flex items-center gap-6 text-black self-end md:self-auto">
              <button
                onClick={() => { setIsEditing(false); setSelectedRequest(null); }}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-bold transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <form onSubmit={handleSaveEdit} className="space-y-8 text-black">

                {/* User Info (Readonly) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#F4F4F4] rounded-xl p-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                    <div className="font-bold text-black">{username}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">แผนก/ ตำแหน่ง</label>
                    <div className="font-bold text-black">Engineering | Engineering Manager</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {/* Leave Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ประเภทการลา</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                    >
                      <option>ลาพักร้อน (เหลือ 12 วัน)</option>
                      <option>ลากิจ</option>
                      <option>ลาป่วย</option>
                    </select>
                  </div>

                  {/* Leave Format */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">รูปแบบการลา</label>
                    <div className="flex gap-6 mt-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio" name="editFormat" value="full"
                          checked={editForm.format === "full"}
                          onChange={(e) => setEditForm({ ...editForm, format: e.target.value })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">เต็มวัน</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio" name="editFormat" value="morning"
                          checked={editForm.format === "morning"}
                          onChange={(e) => setEditForm({ ...editForm, format: e.target.value })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-600">ครึ่งวันเช้า</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio" name="editFormat" value="afternoon"
                          checked={editForm.format === "afternoon"}
                          onChange={(e) => setEditForm({ ...editForm, format: e.target.value })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-600">ครึ่งวันบ่าย</span>
                      </label>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">วันที่เริ่มต้น</label>
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">วันที่สิ้นสุด</label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">เหตุผลการลา</label>
                  <textarea
                    value={editForm.reason}
                    onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                    rows={4}
                    placeholder="ระบุเหตุผลที่ชัดเจน..."
                    className="w-full border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  ></textarea>
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">เอกสารแนบ (ถ้ามี)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 bg-[#FAFAFA] hover:bg-gray-50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-black mb-3" strokeWidth={2} />
                    <p className="text-sm font-bold text-black mb-1">
                      ลากไฟล์มาวางที่นี่ หรือ <span className="text-blue-600">คลิกเพื่ออัปโหลด</span>
                    </p>
                    <p className="text-xs text-gray-400">รองรับ PDF, PNG ขนาดไม่เกิน 5MB</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-[#0000FF] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all text-[15px] shadow-md hover:shadow-lg active:scale-95"
                  >
                    ส่งคำขอลา
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Confirmation Modal */}
          {showConfirmEdit && (
            <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl flex flex-col items-center py-12 px-8 border-[3px] border-[#3B82F6] relative animate-in zoom-in-95 duration-200">
                <div className="w-[100px] h-[100px] bg-[#00C853] rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Check className="w-12 h-12 text-white" strokeWidth={4} />
                </div>

                <h2 className="text-[26px] font-bold text-black mb-4 tracking-tight">ยืนยันการแก้ไขข้อมูล</h2>

                <p className="text-[#6B7280] text-[15px] text-center mb-10 leading-relaxed">
                  คำลาของคุณจะถูกส่งให้ CEO พิจารณา<br />
                  สามารถเช็คสถานะได้จากหน้าเช็คสถานะของคุณ
                </p>

                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setShowConfirmEdit(false)}
                    className="bg-[#FF0000] hover:bg-red-600 text-white font-bold py-2.5 px-10 rounded-xl transition-colors shadow-sm text-[16px]"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={confirmAndSave}
                    className="bg-[#00C853] hover:bg-green-600 text-white font-bold py-2.5 px-10 rounded-xl transition-colors shadow-sm text-[16px]"
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

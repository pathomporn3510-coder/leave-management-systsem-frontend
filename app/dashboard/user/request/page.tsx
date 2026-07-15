"use client";

import { useState, useEffect } from "react";
import { addLeaveRequest } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Mail, Bell, Settings, Upload, Check } from "lucide-react";

export default function RequestLeavePage() {
  const [type, setType] = useState("ลาพักร้อน (เหลือ 12 วัน)");
  const [startFormat, setStartFormat] = useState("full");
  const [endFormat, setEndFormat] = useState("full");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [username, setUsername] = useState("xxxxx xxxxxx");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername && storedUsername !== "User") {
      setUsername(storedUsername);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    addLeaveRequest({
      userId: username,
      type: type.split(' ')[0], // Extract just the type e.g., "ลาพักร้อน"
      startDate,
      endDate,
      reason,
      startFormat,
      endFormat,
    });

    setShowConfirmModal(false);
    router.push("/dashboard/user/status");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#E2E4E9] font-sans text-slate-800 flex flex-col">
      {/* Top Banner */}
      <div className="bg-white flex items-center justify-between px-8 py-5 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-black tracking-tight">แบบฟอร์มยื่นลา (Leave Request)</h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อส่งให้หัวหน้างานอนุมัติ</p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 p-6 md:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* User Info Box */}
          <div className="bg-[#F4F5F7] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <p className="text-[13px] font-semibold text-gray-700 mb-1.5">ชื่อ-นามสกุล</p>
              <p className="text-[17px] font-bold text-black">{username}</p>
            </div>
            <div className="md:text-left">
              <p className="text-[13px] font-semibold text-gray-700 mb-1.5">แผนก/ ตำแหน่ง</p>
              <p className="text-[17px] font-bold text-black">Engineering | Frontend Developer</p>
            </div>
            {/* Added an empty div to push things to left and right just in case, but justify-between handles it */}
            <div className="hidden md:block flex-1"></div> 
          </div>

          <form onSubmit={handleSubmit}>
            {/* Grid Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-6">
              
              {/* Leave Type */}
              <div className="md:col-span-2 md:w-[calc(50%-1.5rem)]">
                <label className="text-[13px] font-semibold text-gray-800 block mb-2">ประเภทการลา</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white shadow-sm transition-all text-gray-700"
                >
                  <option>ลาพักร้อน (เหลือ 12 วัน)</option>
                  <option>ลาป่วย</option>
                  <option>ลากิจ</option>
                  <option>ลางานไม่รับค่าจ้าง</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="text-[13px] font-semibold text-gray-800 block mb-2">วันที่เริ่มต้น</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white shadow-sm transition-all text-gray-700" 
                />
                <div className="flex items-center gap-4 mt-3">
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="startFormat" 
                      value="full"
                      checked={startFormat === 'full'}
                      onChange={() => setStartFormat('full')}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-400 focus:ring-blue-500" 
                    />
                    เต็มวัน
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="startFormat" 
                      value="morning"
                      checked={startFormat === 'morning'}
                      onChange={() => setStartFormat('morning')}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-400 focus:ring-blue-500" 
                    />
                    ครึ่งวันเช้า
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="startFormat" 
                      value="afternoon"
                      checked={startFormat === 'afternoon'}
                      onChange={() => setStartFormat('afternoon')}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-400 focus:ring-blue-500" 
                    />
                    ครึ่งวันบ่าย
                  </label>
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="text-[13px] font-semibold text-gray-800 block mb-2">วันที่สิ้นสุด</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white shadow-sm transition-all text-gray-700" 
                />
                <div className="flex items-center gap-4 mt-3">
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="endFormat" 
                      value="full"
                      checked={endFormat === 'full'}
                      onChange={() => setEndFormat('full')}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-400 focus:ring-blue-500" 
                    />
                    เต็มวัน
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="endFormat" 
                      value="morning"
                      checked={endFormat === 'morning'}
                      onChange={() => setEndFormat('morning')}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-400 focus:ring-blue-500" 
                    />
                    ครึ่งวันเช้า
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="endFormat" 
                      value="afternoon"
                      checked={endFormat === 'afternoon'}
                      onChange={() => setEndFormat('afternoon')}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-400 focus:ring-blue-500" 
                    />
                    ครึ่งวันบ่าย
                  </label>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="text-[13px] font-semibold text-gray-800 block mb-2">เหตุผลการลา</label>
              <textarea 
                rows={4} 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 shadow-sm transition-all resize-none text-gray-700" 
                placeholder="ระบุเหตุผลที่ชัดเจน..." 
              />
            </div>

            {/* Attachment */}
            <div className="mb-10">
              <label className="text-[13px] font-semibold text-gray-800 block mb-2">เอกสารแนบ (ถ้ามี)</label>
              <div className="border border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors shadow-sm relative group overflow-hidden">
                <Upload className="w-8 h-8 text-black mb-3 group-hover:-translate-y-1 transition-transform" strokeWidth={2} />
                <p className="text-[13px] text-black font-semibold">ลากไฟล์มาวางที่นี่ หรือ <span className="text-blue-600">คลิกเพื่ออัปโหลด</span></p>
                <p className="text-[11px] text-gray-400 mt-1.5">รองรับ PDF,PNG ขนาดไม่เกิน 5MB</p>
                {/* Invisible file input */}
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={handleSubmit}
                className="bg-[#0000FF] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all text-sm shadow-md hover:shadow-lg active:scale-95"
              >
                ส่งคำขอลา
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[500px] w-full p-10 text-center animate-in zoom-in-95 duration-200 mx-4">
            <div className="w-24 h-24 bg-[#4CAF50] rounded-full mx-auto flex items-center justify-center mb-6 shadow-md">
              <Check className="w-12 h-12 text-white" strokeWidth={4} />
            </div>
            <h2 className="text-2xl font-bold text-black mb-4">ยืนยันการส่งแบบฟอร์มยื่นคำขอลา</h2>
            <p className="text-gray-500 text-sm mb-10 leading-relaxed">
              คำลาของคุณจะถูกส่งไปยังระบบ<br />
              สามารถเช็คสถานะได้จากหน้าเช็คสถานะของคุณ
            </p>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="bg-[#FF0000] hover:bg-red-600 text-white font-bold py-2.5 px-8 rounded-lg transition-colors text-sm shadow-sm"
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmSubmit}
                className="bg-[#00B050] hover:bg-[#009040] text-white font-bold py-2.5 px-8 rounded-lg transition-colors text-sm shadow-sm"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

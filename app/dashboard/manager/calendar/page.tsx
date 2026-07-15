"use client";

import { useState, useEffect } from "react";
import { getLeaveRequests } from "@/lib/store";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock data for other event types
const publicHolidays = [
  { date: '2026-07-28', title: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', type: 'holiday' },
  { date: '2026-07-29', title: 'วันอาสาฬหบูชา', type: 'holiday' },
  { date: '2026-07-30', title: 'วันเข้าพรรษา', type: 'holiday' },
];

const companyEvents = [
  { date: '2026-07-31', title: 'กินเลี้ยงประจำเดือน', type: 'event' },
];

const birthdays = [
  { date: '2026-07-09', title: 'วันเกิดพนักงาน', type: 'birthday' },
];

const mockLeaves = [
  { startDate: '2026-07-13', endDate: '2026-07-13', type: 'ลากิจ', status: 'Approved' },
  { startDate: '2026-07-21', endDate: '2026-07-21', type: 'ลาป่วย', status: 'Approved' },
  { startDate: '2026-07-22', endDate: '2026-07-25', type: 'ลาพักร้อน 23-25', status: 'Approved' },
];

const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function LeaveCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Default to July 2026
  const [allLeaves, setAllLeaves] = useState<any[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempYear, setTempYear] = useState(2026);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "Manager";
    // Filter only requests for this Manager that are routed to CEO
    const realRequests = getLeaveRequests().filter(r => r.userId === storedUsername && r.approver === 'CEO');
    // Combine with mock leaves if needed
    setAllLeaves([...realRequests, ...mockLeaves]);
  }, []);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  // Build calendar cells
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const events: any[] = [];

    // Check holidays
    const holiday = publicHolidays.find(h => h.date === dateStr);
    if (holiday) events.push(holiday);

    // Check events
    const compEvent = companyEvents.find(e => e.date === dateStr);
    if (compEvent) events.push(compEvent);

    // Check birthdays
    const bday = birthdays.find(b => b.date === dateStr);
    if (bday) events.push(bday);

    // Check leaves (if the day falls within startDate and endDate)
    allLeaves.forEach(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const current = new Date(dateStr);
      if (current >= start && current <= end) {
        // Only show text if it's the start date
        events.push({
          title: leave.type,
          type: 'leave',
          isStart: leave.startDate === dateStr
        });
      }
    });

    return events;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#E2E4E9] font-sans text-slate-800 flex flex-col relative pb-8">
      {/* Top Banner */}
      <div className="bg-white flex items-center justify-between px-8 py-5 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-black tracking-tight">ปฏิทินวันลา (Leave Calendar) - Manager</h1>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-[1200px] mx-auto bg-[#D9D9D9] p-4 rounded-xl shadow-md animate-in fade-in zoom-in-95 duration-300">
          
          {/* Calendar Header Control */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 bg-transparent px-2">
            
            {/* Legends */}
            <div className="flex flex-wrap items-center gap-6 text-[13px] font-bold text-black mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#11B2B8]"></span>
                <span>วันลาของคุณ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FF0000]"></span>
                <span>วันหยุดนักขัตฤกษ์</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#E57373]"></span> {/* Pink for company event */}
                <span>กิจกรรมบริษัท</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#00C853]"></span>
                <span>วันเกิดพนักงาน</span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button 
                onClick={prevMonth}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-black"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={3} />
              </button>
              <div className="relative">
                <button 
                  onClick={() => {
                    setTempYear(currentYear);
                    setIsPickerOpen(!isPickerOpen);
                  }}
                  className="bg-white border border-gray-300 rounded-lg shadow-sm px-6 py-2.5 font-extrabold text-[15px] text-black min-w-[160px] text-center tracking-wide hover:bg-gray-50 active:scale-95 transition-all"
                >
                  {thaiMonths[currentMonth]} {currentYear}
                </button>

                {isPickerOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsPickerOpen(false)}></div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-[340px] z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between mb-5 px-1">
                        <button onClick={() => setTempYear(y => y - 1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <span className="font-bold text-lg text-black tracking-wide">{tempYear + 543}</span>
                        <button onClick={() => setTempYear(y => y + 1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."].map((m, i) => {
                          const isSelected = currentMonth === i && currentYear === tempYear;
                          return (
                            <button 
                              key={m} 
                              onClick={() => {
                                setCurrentDate(new Date(tempYear, i, 1));
                                setIsPickerOpen(false);
                              }}
                              className={`py-2.5 rounded-xl text-[14px] font-bold transition-all ${
                                isSelected 
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
                onClick={nextMonth}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-black"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white border border-gray-300 grid grid-cols-7 w-full border-collapse">
            
            {/* Days Header */}
            {daysOfWeek.map((d) => (
              <div key={d} className="bg-[#AFAFAF] text-white font-extrabold text-center py-3 border border-gray-300 text-[15px] uppercase tracking-wider">
                {d}
              </div>
            ))}

            {/* Empty Cells */}
            {blanks.map((b) => (
              <div key={`blank-${b}`} className="min-h-[120px] bg-[#E2E4E9] border border-gray-300 p-2"></div>
            ))}

            {/* Day Cells */}
            {days.map((d) => {
              const events = getEventsForDate(d);
              return (
                <div key={d} className="min-h-[120px] border border-gray-300 p-2 bg-white relative group">
                  <div className="font-extrabold text-[18px] text-black ml-1 mt-1 z-10 relative pointer-events-none">
                    {d}
                  </div>
                  
                  {/* Event Circles / Backgrounds */}
                  {events.map((evt, idx) => {
                    if (evt.type === 'holiday') {
                      return (
                        <div key={idx} className="absolute inset-0 flex flex-col justify-end p-1.5 pb-2">
                          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-[#FF0000] -z-10 flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform"></div>
                          <div className="bg-[#FF8A80] text-black font-extrabold text-[11px] px-1.5 py-1 rounded truncate shadow-sm text-center">
                            {evt.title}
                          </div>
                        </div>
                      );
                    }
                    if (evt.type === 'event') {
                      return (
                        <div key={idx} className="absolute inset-0 flex flex-col justify-end p-1.5 pb-2">
                          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-[#D81B60] -z-10 flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform"></div>
                          <div className="bg-[#F8BBD0] text-black font-extrabold text-[11px] px-1.5 py-1 rounded truncate shadow-sm text-center">
                            {evt.title}
                          </div>
                        </div>
                      );
                    }
                    if (evt.type === 'birthday') {
                      return (
                        <div key={idx} className="absolute inset-0 flex flex-col justify-end p-1.5 pb-2">
                          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-[#00C853] -z-10 flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform"></div>
                          <div className="bg-[#B9F6CA] text-[#00695C] font-extrabold text-[11px] px-1.5 py-1 rounded truncate shadow-sm text-center">
                            {evt.title}
                          </div>
                        </div>
                      );
                    }
                    if (evt.type === 'leave') {
                      return (
                        <div key={idx} className="absolute inset-0 flex flex-col justify-end p-1.5 pb-2">
                          {evt.isStart && (
                            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-[#11B2B8] -z-10 flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform"></div>
                          )}
                          <div className="bg-[#B2EBF2] text-[#006064] font-extrabold text-[11px] px-1.5 py-1 rounded truncate shadow-sm text-center">
                            {evt.title}
                          </div>
                        </div>
                      );
                    }
                  })}

                  {/* Date 10 specifically matching mockup with a grey circle, just hardcode for visual match if needed */}
                  {currentYear === 2026 && currentMonth === 6 && d === 10 && events.length === 0 && (
                    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-gray-400 -z-10"></div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

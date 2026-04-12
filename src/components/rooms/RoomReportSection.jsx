import React, { useMemo, useState } from 'react';
import { Clock, TrendingUp, Calendar as CalendarIcon, Home, Layers, CalendarDays, BookOpen } from 'lucide-react';

const RoomReportSection = ({ reportData, isLoading, error, className = "" }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'bookings', 'schedules'

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 p-8 rounded-[24px] shadow-sm animate-pulse border border-gray-100 dark:border-gray-700 ${className}`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 p-8 rounded-[24px] border border-red-200 dark:border-red-800 ${className}`}>
        <p className="text-red-600 dark:text-red-400 font-bold text-center">{error}</p>
      </div>
    );
  }

  if (!reportData) return null;

  const { period, raw_data, summary: originalSummary } = reportData;

  // Frontend calculation helper
  const calculateHours = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const [startH, startM] = String(startStr).split(':').map(Number);
    const [endH, endM] = String(endStr).split(':').map(Number);
    return (endH + endM / 60) - (startH + startM / 60);
  };

  // Process specific type of items
  const processUsage = (items) => {
    let total = 0;
    const usage = {};
    items.forEach(item => {
      const hours = calculateHours(item.start_time, item.end_time);
      total += hours;
      if (!usage[item.room_id]) usage[item.room_id] = 0;
      usage[item.room_id] += hours;
    });
    return {
      total_hours_this_week: total,
      usage_by_room: Object.keys(usage).map(id => ({ room_id: id, total_hours: usage[id] }))
    };
  };

  // Derive current summary based on activeTab
  let currentSummary;
  if (activeTab === 'all') {
    currentSummary = originalSummary; // Use backend calculated
  } else if (activeTab === 'bookings') {
    currentSummary = processUsage(raw_data?.bookings || []);
  } else if (activeTab === 'schedules') {
    currentSummary = processUsage(raw_data?.schedules || []);
  }

  const { total_hours_this_week, usage_by_room } = currentSummary;
  const maxHours = Math.max(...usage_by_room.map(r => r.total_hours), 1);

  // Format date helper (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 ${className} flex flex-col gap-8`}>
      {/* Header section with Tabs */}
      <div className="flex flex-col gap-4 pb-4 border-b-2 border-gray-100 dark:border-gray-800">
        
        {/* Row 1: Title */}
        <h2 className="text-xl lg:text-2xl font-black text-[#302782] dark:text-white flex items-center gap-3">
          <span className="w-2.5 h-7 bg-[#B2BB1E] rounded-full inline-block"></span>
          รายงานการใช้ห้องประจำสัปดาห์
        </h2>
        
        {/* Row 2: Date */}
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-2 ml-5 -mt-2">
          <CalendarIcon size={16} /> 
          {formatDate(period.start_date)} - {formatDate(period.end_date)}
        </p>

        {/* Row 3: Tab Toggle */}
        <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl flex items-center w-full mt-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'all' ? 'bg-white dark:bg-gray-800 text-[#302782] dark:text-[#B2BB1E] shadow-sm' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-600'}`}
          >
            <Layers size={18} /> ภาพรวม
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'bookings' ? 'bg-white dark:bg-gray-800 text-[#302782] dark:text-[#B2BB1E] shadow-sm' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-600'}`}
          >
            <CalendarDays size={18} /> การจอง
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'schedules' ? 'bg-white dark:bg-gray-800 text-[#302782] dark:text-[#B2BB1E] shadow-sm' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-600'}`}
          >
            <BookOpen size={18} /> ตารางเรียน
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#302782] to-[#453a99] p-6 rounded-3xl text-white shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 opacity-90 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Clock size={20} />
              </div>
              <span className="font-bold text-sm tracking-wide">รวมเวลาใช้งาน</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black">{total_hours_this_week.toFixed(1)}</span>
              <span className="text-lg font-bold opacity-80 mb-1">ชั่วโมง</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#B2BB1E] to-[#c5cf23] p-6 rounded-3xl text-white shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 opacity-90 mb-4">
               <div className="p-2 bg-black/10 rounded-xl">
                <Home size={20} />
              </div>
              <span className="font-bold text-sm tracking-wide text-white">จำนวนห้องที่ใช้งาน</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-white">{usage_by_room.length}</span>
              <span className="text-lg font-bold opacity-80 mb-1 text-white">ห้อง</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details List */}
      <div className="flex-1">
        <h3 className="text-lg font-black text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-[#302782] dark:text-[#B2BB1E]" /> 
          รายละเอียดรายห้อง
        </h3>
        
        {usage_by_room.length > 0 ? (
          <div className="space-y-4">
            {usage_by_room
              .sort((a, b) => b.total_hours - a.total_hours) // เรียงจากมากไปน้อย
              .map((room) => (
              <div key={room.room_id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-gray-100 dark:border-gray-700 hover:border-[#B2BB1E]/50 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-4 sm:w-[35%]">
                  <div className="font-black text-lg text-[#302782] dark:text-[#B2BB1E] w-16">
                    {room.room_id}
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {room.total_hours.toFixed(1)} <span className="text-xs text-gray-500 font-medium">ชม.</span>
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="flex-1 w-full bg-gray-100 dark:bg-gray-900 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-[#B2BB1E] to-[#8c9415] h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(room.total_hours / maxHours) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">ไม่มีข้อมูลการใช้งานในโหมดนี้</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomReportSection;

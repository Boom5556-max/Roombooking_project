import React from 'react';
import { Clock, TrendingUp, CalendarDays, BookOpen, Users } from 'lucide-react';

const StaffReportSection = ({ reportData, isLoading, error, className = "" }) => {
  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 p-8 rounded-[24px] shadow-sm animate-pulse border border-gray-100 dark:border-gray-700 ${className}`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-6"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
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

  if (!reportData || !reportData.term_info) return null;

  const { term_info, summary } = reportData;
  const { total_hours_all_rooms, room_ranking, teacher_ranking } = summary;

  // Calculate max hours for progress bars
  const maxRoomHours = Math.max(...room_ranking.map(r => r.total_hours), 1);
  const maxTeacherHours = Math.max(...teacher_ranking.map(t => t.total_hours), 1);

  // Format date helper (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const getTermLabel = (term) => {
    switch (term?.toLowerCase()) {
      case 'first': return 'เทอมต้น';
      case 'end': return 'เทอมปลาย';
      case 'summer': return 'เทอมฤดูร้อน';
      default: return term;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 ${className} flex flex-col gap-8`}>
      {/* Header section */}
      <div className="flex flex-col gap-4 pb-4 border-b-2 border-gray-100 dark:border-gray-800">
        <h2 className="text-xl lg:text-2xl font-black text-[#302782] dark:text-white flex items-center gap-3">
          <span className="w-2.5 h-7 bg-[#B2BB1E] rounded-full inline-block"></span>
          รายงานสรุปการใช้งานตลอดภาคการศึกษา
        </h2>

        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-2 ml-5 -mt-2">
          <BookOpen size={16} />
          ภาคเรียน {getTermLabel(term_info.term_name)}
          <span className="mx-2">•</span>
          <CalendarDays size={16} />
          {formatDate(term_info.start_date)} - {formatDate(term_info.end_date)}
        </p>
      </div>

      {/* Overview Stat */}
      <div className="bg-gradient-to-br from-[#302782] to-[#453a99] p-6 rounded-3xl text-white shadow-lg relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center gap-3 opacity-90 mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <Clock size={20} />
            </div>
            <span className="font-bold text-sm tracking-wide">รวมชั่วโมงการใช้งานทุกห้อง</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black">{total_hours_all_rooms.toFixed(1)}</span>
            <span className="text-lg font-bold opacity-80 mb-1">ชั่วโมง</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Room Rankings */}
        <div className="flex flex-col">
          <h3 className="text-lg font-black text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#302782] dark:text-[#B2BB1E]" />
            สรุปการใช้งานรายห้อง
          </h3>

          {room_ranking.length > 0 ? (
            <div className="space-y-4">
              {room_ranking.map((room) => (
                <div key={room.room_id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl flex flex-col gap-3 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-lg text-[#302782] dark:text-[#B2BB1E]">{room.room_id}</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      {room.total_hours.toFixed(1)} <span className="text-xs text-gray-500 font-medium">ชม.</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-[#B2BB1E] to-[#8c9415] h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(room.total_hours / maxRoomHours) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 font-medium">ยังไม่มีข้อมูลการใช้ห้อง</p>
            </div>
          )}
        </div>

        {/* Teacher Rankings */}
        <div className="flex flex-col">
          <h3 className="text-lg font-black text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <Users size={20} className="text-[#302782] dark:text-[#B2BB1E]" />
            สรุปผู้ใช้งานสูงสุด
          </h3>

          {teacher_ranking.length > 0 ? (
            <div className="space-y-4">
              {teacher_ranking.map((teacher, idx) => (
                <div key={teacher.user_id || idx} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl flex flex-col gap-3 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#302782] dark:text-gray-100 truncate pr-2">
                      {teacher.name}
                    </span>
                    <span className="font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm">
                      {teacher.total_hours.toFixed(1)} <span className="text-xs text-gray-500 font-medium">ชม.</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-[#302782] to-[#453a99] h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(teacher.total_hours / maxTeacherHours) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 font-medium">ยังไม่มีการจองหรือตารางสอน</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffReportSection;

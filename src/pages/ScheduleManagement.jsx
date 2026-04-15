import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar'; 
import { useSchedule } from '../hooks/useSchedule'; 
import { Edit2, Trash2, UploadCloud, AlertCircle, CheckCircle, X, ChevronDown, BookOpen, Loader2, ChevronLeft, Clock } from 'lucide-react'; 
import ActionModal from '../components/common/ActionModal'; 
import PageReveal from '../components/common/PageReveal';

const ScheduleManagement = () => {
  const navigate = useNavigate();
  const {
    schedules, isLoading, 
    isEditModalOpen, setIsEditModalOpen, 
    editingSchedule, setEditingSchedule, 
    isPreviewModalOpen, setIsPreviewModalOpen, isUploading,
    previewData, previewErrors, fileInputRef,
    handleDelete, openEditModal, handleSaveEdit,
    triggerFileInput, handleFileChange, handleConfirmReupload,
    fetchSubjects, editSubjectSchedule, deleteSubjectSchedule
  } = useSchedule(); 

  // State สำหรับ Dropdown รายวิชา
  const [expandedRow, setExpandedRow] = useState(null); // unique_schedules ของแถวที่ขยายอยู่
  const [subjectsMap, setSubjectsMap] = useState({});   // cache: { [unique_schedules]: subjects[] }
  const [loadingSubjects, setLoadingSubjects] = useState(null); // id ที่กำลังโหลดอยู่

  const toggleSubjects = async (id) => {
    // ถ้ากดซ้ำ -> ปิด
    if (expandedRow === id) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(id);
    // ถ้าเคยโหลดแล้ว ไม่ต้องโหลดซ้ำ (cache)
    if (subjectsMap[id]) return;

    setLoadingSubjects(id);
    try {
      const subjects = await fetchSubjects(id);
      setSubjectsMap(prev => ({ ...prev, [id]: subjects }));
    } catch {
      setSubjectsMap(prev => ({ ...prev, [id]: [] }));
    } finally {
      setLoadingSubjects(null);
    }
  };

  // --- State สำหรับ Edit Modal ของรายวิชา ---
  const [isSubjectEditModalOpen, setIsSubjectEditModalOpen] = useState(false);
  const [subjectEditScheduleId, setSubjectEditScheduleId] = useState(null);
  const [editingSubjectData, setEditingSubjectData] = useState({});
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  const openSubjectEditModal = (scheduleId, subj) => {
    setSubjectEditScheduleId(scheduleId);
    setEditingSubjectData({
      old_subject_name: subj.subject_name,
      old_sec: String(subj.sec),
      subject_name: subj.subject_name,
      sec: String(subj.sec),
      room_id: subj.room_id || '',
      date: subj.date || '',
      start_time: subj.start_time || '',
      end_time: subj.end_time || '',
      teacher_name: subj.teacher_name || '',
      teacher_surname: subj.teacher_surname || '',
      repeat: 1,
    });
    setIsSubjectEditModalOpen(true);
  };

  const onSaveSubjectEdit = async (e, force_cancel = false) => {
    if (e) e.preventDefault();
    setIsSavingSubject(true);
    try {
      await editSubjectSchedule(subjectEditScheduleId, {
        ...editingSubjectData,
        repeat: Number(editingSubjectData.repeat),
        force_cancel: force_cancel
      });
      setIsSubjectEditModalOpen(false);
      // ล้าง Cache แล้วโหลดข้อมูลรายวิชาใหม่
      setLoadingSubjects(subjectEditScheduleId);
      try {
        const updated = await fetchSubjects(subjectEditScheduleId);
        setSubjectsMap(prev => ({ ...prev, [subjectEditScheduleId]: updated }));
      } finally {
        setLoadingSubjects(null);
      }
      showResultAlert(true, 'แก้ไขรายวิชาสำเร็จ', '');
    } catch (error) {
      const isConflict = error.response?.status === 409 || error.response?.data?.code === 'BOOKING_CONFLICT';
      
      if (isConflict) {
        setAlertConfig({
          isOpen: true,
          title: error.response?.data?.message || 'พบตารางจองที่ทับซ้อน คุณต้องการดำเนินการต่อหรือไม่?',
          icon: <AlertCircle size={50} className="text-yellow-500" />,
          variant: "warning",
          showConfirm: true,
          showButtons: true,
          autoClose: false,
          onConfirm: async () => {
            closeAlert();
            await onSaveSubjectEdit(null, true);
          }
        });
      } else {
        showResultAlert(false, '', error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขรายวิชา');
      }
    } finally {
      setIsSavingSubject(false);
    }
  };

  const updateSubjectField = (field, value) => {
    setEditingSubjectData(prev => ({ ...prev, [field]: value }));
  };

  // ยืนยันลบรายวิชา
  const confirmDeleteSubject = (scheduleId, subj) => {
    setAlertConfig({
      isOpen: true,
      title: `ลบ "${subj.subject_name}" Sec ${subj.sec} ออกจากตารางเรียน?`,
      icon: <Trash2 size={50} className="text-red-500" />,
      variant: 'danger',
      showConfirm: true,
      showButtons: true,
      autoClose: false,
      onConfirm: async () => {
        closeAlert();
        try {
          await deleteSubjectSchedule(scheduleId, subj.subject_name, subj.sec);
          // รีโหลดรายวิชาหลังลบ
          setLoadingSubjects(scheduleId);
          try {
            const updated = await fetchSubjects(scheduleId);
            setSubjectsMap(prev => ({ ...prev, [scheduleId]: updated }));
          } finally {
            setLoadingSubjects(null);
          }
          showResultAlert(true, 'ลบรายวิชาสำเร็จ', '');
        } catch (error) {
          showResultAlert(false, '', error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบรายวิชา');
        }
      }
    });
  };

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    icon: null,
    variant: "primary",
    showConfirm: true,
    showButtons: null,
    autoClose: false,
    onConfirm: null,
  });

  const closeAlert = () => setAlertConfig((prev) => ({ ...prev, isOpen: false }));

  // โชว์ผลลัพธ์ (สำเร็จ/ล้มเหลว) แบบ Auto Close
  const showResultAlert = (success, successMsg, errorMsg) => {
    setAlertConfig({
      isOpen: true,
      title: success ? successMsg : errorMsg,
      icon: success ? <CheckCircle size={50} /> : <X size={50} />,
      variant: success ? "primary" : "danger",
      showConfirm: false,
      showButtons: false, 
      autoClose: true,
      onConfirm: null,
    });
  };

  // จัดการเวลากดลบ
  const confirmDelete = (id) => {
    setAlertConfig({
      isOpen: true,
      title: "ยืนยันการลบตารางเรียน?",
      icon: <Trash2 size={50} />,
      variant: "danger",
      showConfirm: true,
      showButtons: true,
      autoClose: false,
      onConfirm: async () => {
        closeAlert();
        try {
          const res = await handleDelete(id);
          const isSuccess = res?.success !== false; 
          showResultAlert(isSuccess, "ลบข้อมูลสำเร็จ", "เกิดข้อผิดพลาดในการลบข้อมูล");
        } catch (error) {
          showResultAlert(false, "", "เกิดข้อผิดพลาด ไม่สามารถลบข้อมูลได้");
        }
      }
    });
  };

  // จัดการเวลาบันทึกการแก้ไข
  const onSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await handleSaveEdit(e);
      setIsEditModalOpen(false);
      const isSuccess = res?.success !== false;
      showResultAlert(isSuccess, "บันทึกการแก้ไขสำเร็จ", "เกิดข้อผิดพลาดในการบันทึก");
    } catch (error) {
      showResultAlert(false, "", "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // ครอบการเลือกไฟล์ เพื่อดัก Error ตอน Preview
  const onFileChangeWrapper = async (e) => {
    try {
      await handleFileChange(e);
    } catch (error) {
      showResultAlert(false, "", error.response?.data?.message || "เกิดข้อผิดพลาดในการตรวจสอบไฟล์");
    }
  };

  // จัดการเวลายืนยันอัปโหลดทับ
  const onConfirmReuploadClick = async () => {
    if (previewErrors.length > 0) {
      setAlertConfig({
        isOpen: true,
        title: "ไฟล์นี้มีข้อผิดพลาด ต้องการอัปโหลดไฟล์ทับใช่หรือไม่",
        icon: <AlertCircle size={50} className="text-yellow-500" />,
        variant: "warning",
        showConfirm: true,
        showButtons: true,
        autoClose: false,
        onConfirm: async () => {
          closeAlert(); 
          await executeReupload(); 
        }
      });
    } else {
      await executeReupload();
    }
  };

  // ฟังก์ชันตัวจริงที่เรียก API ตอนอัปโหลด
  const executeReupload = async () => {
    try {
      const res = await handleConfirmReupload();
      setIsPreviewModalOpen(false);
      const isSuccess = res?.success !== false;
      showResultAlert(isSuccess, `อัปเดตข้อมูลทับไฟล์เดิมสำเร็จ! (${res?.totalSaved || 0} รายการ)`, "เกิดข้อผิดพลาดในการอัปเดต");
    } catch (error) {
      showResultAlert(false, "", "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Navbar />

      <PageReveal isLoading={isLoading} loadingText="กำลังดึงเนื้อหาตารางเรียนทั้งหมด...">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-40 md:pb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-[#302782] dark:text-[#B2BB1E] transition-all active:scale-90 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center group"
                title="ย้อนกลับ"
              >
                <ChevronLeft size={24} className="transition-transform group-hover:-translate-x-0.5" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#302782] dark:text-[#B2BB1E]">
                จัดการประวัติตารางเรียน
              </h1>
            </div>
          </div>

          <input type="file" accept=".xlsx, .xls" ref={fileInputRef} className="hidden" onChange={onFileChangeWrapper} />

          {/* Main List Table/Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-indigo-500/5 sm:rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden w-full">
            
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="min-w-full text-left text-sm text-black dark:text-white">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-[#302782] dark:text-[#B2BB1E] uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">อัปโหลดไฟล์ล่าสุด</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">ภาควิชา</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">ชั้นปี</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">ภาค</th>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {schedules.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-8 text-black dark:text-white">ไม่มีประวัติตารางเรียนในระบบ</td></tr>
                  ) : (
                    schedules.map((schedule) => {
                      const id = schedule.unique_schedules;
                      const isExpanded = expandedRow === id;
                      const subjects = subjectsMap[id] || [];
                      const isLoadingThis = loadingSubjects === id;

                      return (
                        <React.Fragment key={id}>
                          {/* แถวหลัก */}
                          <tr
                            onClick={() => toggleSubjects(id)}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer select-none"
                          >
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className={`transition-transform duration-200 text-black dark:text-white ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                                  <ChevronDown size={16} />
                                </span>
                                {formatDate(schedule.date_create)}
                              </div>
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">{schedule.department}</td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">ปี {schedule.study_year}</td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">{schedule.program_type}</td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 align-middle" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-center gap-2">
                                <button 
                                  onClick={() => triggerFileInput(id)} 
                                  disabled={isUploading} 
                                  className="flex items-center justify-center gap-1.5 bg-[#302782] hover:bg-[#4338ca] text-white px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50 shadow-sm hover:-translate-y-px active:scale-[0.98] w-full sm:w-auto"
                                  title="อัปโหลดไฟล์ Excel ทับข้อมูลเดิม"
                                >
                                  <UploadCloud size={16} /> <span className="hidden sm:inline">อัปโหลดทับ</span>
                                </button>
                                <button 
                                  onClick={() => openEditModal(schedule)} 
                                  className="flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm shrink-0"
                                  title="แก้ไขรายละเอียด"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => confirmDelete(id)} 
                                  className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm shrink-0"
                                  title="ลบข้อมูลชุดนี้"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* แถว Dropdown รายวิชา (Desktop) */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="5" className="px-0 py-0 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900">
                                <div className="px-6 py-4">
                                  <div className="flex items-center gap-2 mb-3 text-[#302782] dark:text-[#B2BB1E] font-semibold text-sm">
                                    <BookOpen size={16} />
                                    รายวิชาในชุดนี้
                                  </div>

                                  {isLoadingThis ? (
                                    <div className="flex items-center justify-center gap-2 py-6 text-black dark:text-white">
                                      <Loader2 size={20} className="animate-spin" />
                                      <span className="text-sm">กำลังโหลดรายวิชา...</span>
                                    </div>
                                  ) : subjects.length === 0 ? (
                                    <p className="text-center text-sm text-black dark:text-white py-4">ไม่พบรายวิชาในชุดนี้</p>
                                  ) : (
                                    <div className="overflow-x-auto rounded-xl border border-indigo-200 dark:border-indigo-800 text-sm">
                                      <table className="min-w-full text-sm text-left">
                                        <thead className="bg-[#302782] text-white">
                                          <tr>
                                            <th className="px-4 py-3 font-semibold whitespace-nowrap">วิชา</th>
                                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Sec</th>
                                            <th className="px-4 py-3 font-semibold whitespace-nowrap">ผู้สอน</th>
                                            <th className="px-4 py-3 font-semibold whitespace-nowrap">ช่วงเวลา</th>
                                            <th className="px-4 py-3 font-semibold whitespace-nowrap">ห้อง</th>
                                            <th className="px-4 py-3 font-semibold whitespace-nowrap text-center"></th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-indigo-100 dark:divide-indigo-900">
                                          {subjects.map((subj, idx) => (
                                            <tr key={idx} className="bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors">
                                              <td className="px-4 py-3 font-medium text-black dark:text-white whitespace-nowrap max-w-[240px] truncate" title={subj.subject_name}>{subj.subject_name}</td>
                                              <td className="px-4 py-3 text-black dark:text-white whitespace-nowrap">{subj.sec}</td>
                                              <td className="px-4 py-3 text-black dark:text-white whitespace-nowrap">{subj.teacher_name ? `${subj.teacher_name} ${subj.teacher_surname}` : '-'}</td>
                                              <td className="px-4 py-3 text-black dark:text-white whitespace-nowrap">{subj.start_time} – {subj.end_time}</td>
                                              <td className="px-4 py-3 text-black dark:text-white whitespace-nowrap">{subj.room_id || '-'}</td>
                                              <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); openSubjectEditModal(id, subj); }}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-all shadow-sm hover:-translate-y-px active:scale-95"
                                                    title="แก้ไขรายวิชานี้"
                                                  >
                                                    <Edit2 size={14} />
                                                  </button>
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); confirmDeleteSubject(id, subj); }}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-sm hover:-translate-y-px active:scale-95"
                                                    title="ลบรายวิชานี้"
                                                  >
                                                    <Trash2 size={14} />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards Layout */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {schedules.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-medium">ไม่มีประวัติตารางเรียนในระบบ</div>
              ) : (
                schedules.map((schedule) => {
                  const id = schedule.unique_schedules;
                  const isExpanded = expandedRow === id;
                  const subjects = subjectsMap[id] || [];
                  const isLoadingThis = loadingSubjects === id;

                  return (
                    <div key={id} className="flex flex-col bg-white dark:bg-gray-800">
                      {/* Card Header (Main Info) */}
                      <div 
                        onClick={() => toggleSubjects(id)}
                        className="p-5 flex flex-col gap-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-[#302782] dark:text-[#B2BB1E] uppercase tracking-wider">อัปโหลดล่าสุด</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(schedule.date_create)}</span>
                          </div>
                          <span className={`p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-[#302782] dark:text-[#B2BB1E] transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                            <ChevronDown size={20} />
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-400 uppercase">ภาควิชา</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1">{schedule.department}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-400 uppercase">ชั้นปี / ภาค</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ปี {schedule.study_year} ({schedule.program_type})</span>
                          </div>
                        </div>

                        {/* Action Buttons in Card */}
                        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => triggerFileInput(id)} 
                            disabled={isUploading} 
                            className="flex-1 flex items-center justify-center gap-2 bg-[#302782] hover:bg-[#4338ca] text-white px-4 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                          >
                            <UploadCloud size={16} /> อัปโหลดทับ
                          </button>
                          <button 
                            onClick={() => openEditModal(schedule)} 
                            className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl shadow-sm active:scale-95"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(id)} 
                            className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm active:scale-95"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Card Dropdown Expanded Subjects */}
                      {isExpanded && (
                        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-indigo-100 dark:border-indigo-900 overflow-hidden">
                          <div className="p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-4 text-[#302782] dark:text-[#B2BB1E] font-bold text-sm">
                              <BookOpen size={16} />
                              รายวิชาในชุดนี้ ({subjects.length})
                            </div>

                            {isLoadingThis ? (
                              <div className="flex items-center justify-center gap-3 py-10 text-gray-500">
                                <Loader2 size={24} className="animate-spin text-[#302782] dark:text-[#B2BB1E]" />
                                <span className="text-sm font-medium">กำลังโหลดรายวิชา...</span>
                              </div>
                            ) : subjects.length === 0 ? (
                              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center text-sm text-gray-400 border border-dashed border-gray-200 dark:border-gray-700">ไม่พบรายวิชาในชุดนี้</div>
                            ) : (
                              <div className="space-y-3">
                                {subjects.map((subj, idx) => (
                                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden group">
                                    <div className="flex flex-col gap-3">
                                      <div className="flex justify-between items-start gap-2">
                                        <div className="flex-grow">
                                          <h5 className="text-sm font-black text-[#302782] dark:text-white leading-tight mb-1">{subj.subject_name}</h5>
                                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 rounded text-[11px] font-bold text-[#302782] dark:text-[#B2BB1E]">Sec: {subj.sec}</span>
                                            <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                                              <Clock size={12} /> {subj.start_time} - {subj.end_time}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            onClick={() => openSubjectEditModal(id, subj)}
                                            className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-all"
                                          >
                                            <Edit2 size={14} />
                                          </button>
                                          <button
                                            onClick={() => confirmDeleteSubject(id, subj)}
                                            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2 text-[12px] pt-1 border-t border-gray-50 dark:border-gray-700">
                                        <div className="flex flex-col">
                                          <span className="text-gray-400 font-bold uppercase text-[10px]">ผู้สอน</span>
                                          <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{subj.teacher_name ? `${subj.teacher_name} ${subj.teacher_surname}` : '-'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-gray-400 font-bold uppercase text-[10px]">ห้องเรียน</span>
                                          <span className="font-medium text-gray-700 dark:text-gray-300">{subj.room_id || '-'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </PageReveal>

      {/* Modals remain outside for higher z-index if needed, or inside PageReveal depending on preference */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 font-sans">
          <div className="bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#302782] dark:text-[#B2BB1E]">แก้ไขรายละเอียด</h2>
            <form onSubmit={onSaveEdit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-black dark:text-white">ภาควิชา</label>
                <input required className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-black dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all" value={editingSchedule.department} onChange={(e) => setEditingSchedule({ ...editingSchedule, department: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-black dark:text-white">ชั้นปี</label>
                <input required className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-black dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all" value={editingSchedule.study_year} onChange={(e) => setEditingSchedule({ ...editingSchedule, study_year: e.target.value })} />
              </div>
              <div className="mb-6 sm:mb-8">
                <label className="block text-sm font-medium mb-1 text-black dark:text-white">ภาค</label>
                <input required className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-black dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all" value={editingSchedule.program_type} onChange={(e) => setEditingSchedule({ ...editingSchedule, program_type: e.target.value })} />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">ยกเลิก</button>
                <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-[#B2BB1E] text-white rounded-xl hover:bg-[#9fa719] transition-colors font-medium shadow-md">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ... Other modals should be similar ... */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 font-sans">
          <div className="bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#302782] dark:text-[#B2BB1E]">ตรวจสอบข้อมูลก่อนอัปเดต</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 sm:p-5 rounded-xl border border-green-200 dark:border-green-800 flex items-center gap-4">
                <CheckCircle className="text-green-500 w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-400">ข้อมูลที่พร้อมบันทึก</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-500">{previewData.length}</p>
                </div>
              </div>
              <div className={`p-4 sm:p-5 rounded-xl border flex items-center gap-4 ${previewErrors.length > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'}`}>
                <AlertCircle className={`${previewErrors.length > 0 ? 'text-red-500' : 'text-black'} w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0`} />
                <div>
                  <p className={`text-sm font-medium ${previewErrors.length > 0 ? 'text-red-800 dark:text-red-400' : 'text-black dark:text-white'}`}>พบข้อผิดพลาด</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${previewErrors.length > 0 ? 'text-red-700 dark:text-red-500' : 'text-black dark:text-white'}`}>{previewErrors.length}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full border-t border-gray-100 dark:border-gray-700 pt-4">
                 <button onClick={() => setIsPreviewModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">ยกเลิก</button>
                 <button onClick={onConfirmReuploadClick} className="w-full sm:w-auto px-5 py-2.5 bg-[#B2BB1E] text-white rounded-xl hover:bg-[#9fa719] transition-colors font-medium shadow-md">ยืนยันอัปเดต</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {isSubjectEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 font-sans">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
               <h2 className="text-lg font-bold text-[#302782] dark:text-[#B2BB1E]">แก้ไขรายวิชา</h2>
               <button onClick={() => setIsSubjectEditModalOpen(false)} className="text-black dark:text-white hover:text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={onSaveSubjectEdit} className="px-6 py-5 space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">ชื่อวิชา</label>
                    <input required value={editingSubjectData.subject_name || ''} onChange={(e) => updateSubjectField('subject_name', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">Sec</label>
                    <input required value={editingSubjectData.sec || ''} onChange={(e) => updateSubjectField('sec', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] outline-none" />
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">เวลาเริ่ม</label>
                    <input required type="time" value={editingSubjectData.start_time || ''} onChange={(e) => updateSubjectField('start_time', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">เวลาสิ้นสุด</label>
                    <input required type="time" value={editingSubjectData.end_time || ''} onChange={(e) => updateSubjectField('end_time', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] outline-none" />
                  </div>
               </div>
               <div className="flex justify-end pt-4">
                 <button type="submit" className="px-6 py-2.5 bg-[#B2BB1E] text-white rounded-xl hover:bg-[#9fa719] transition-colors font-medium shadow-md">บันทึก</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {alertConfig.isOpen && (
        <ActionModal 
          {...alertConfig} 
          onClose={closeAlert} 
        />
      )}
    </div>
  );
};

export default ScheduleManagement;
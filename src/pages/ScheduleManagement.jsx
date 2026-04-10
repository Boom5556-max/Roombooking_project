import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar'; 
import { useSchedule } from '../hooks/useSchedule'; 
import { Edit2, Trash2, UploadCloud, AlertCircle, CheckCircle, X, ChevronDown, ChevronUp, BookOpen, Loader2 } from 'lucide-react'; 
import ActionModal from '../components/common/ActionModal'; 

const ScheduleManagement = () => {
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
      semester_id: subj.semester_id || '',
    });
    setIsSubjectEditModalOpen(true);
  };

  const onSaveSubjectEdit = async (e) => {
    e.preventDefault();
    setIsSavingSubject(true);
    try {
      await editSubjectSchedule(subjectEditScheduleId, {
        ...editingSubjectData,
        repeat: Number(editingSubjectData.repeat),
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
      showResultAlert(false, '', error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขรายวิชา');
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

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#302782] dark:text-[#B2BB1E]">
            จัดการประวัติตารางเรียน
          </h1>
        </div>

        <input type="file" accept=".xlsx, .xls" ref={fileInputRef} className="hidden" onChange={onFileChangeWrapper} />

        {/* ตารางหลัก */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-[#302782] dark:text-[#B2BB1E] uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">อัปเดตล่าสุด</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">ภาควิชา</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">ชั้นปี</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">ภาค</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr><td colSpan="5" className="text-center py-8">กำลังโหลดข้อมูล...</td></tr>
                ) : schedules.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">ไม่มีประวัติตารางเรียนในระบบ</td></tr>
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
                              <span className={`transition-transform duration-200 text-gray-400 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronDown size={16} />}
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

                        {/* แถว Dropdown รายวิชา */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="5" className="px-0 py-0 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900">
                              <div className="px-6 py-4">
                                <div className="flex items-center gap-2 mb-3 text-[#302782] dark:text-[#B2BB1E] font-semibold text-sm">
                                  <BookOpen size={16} />
                                  รายวิชาในชุดนี้
                                </div>

                                {isLoadingThis ? (
                                  <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
                                    <Loader2 size={20} className="animate-spin" />
                                    <span className="text-sm">กำลังโหลดรายวิชา...</span>
                                  </div>
                                ) : subjects.length === 0 ? (
                                  <p className="text-center text-sm text-gray-400 py-4">ไม่พบรายวิชาในชุดนี้</p>
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
                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap max-w-[240px] truncate" title={subj.subject_name}>{subj.subject_name}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{subj.sec}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{subj.teacher_name ? `${subj.teacher_name} ${subj.teacher_surname}` : '-'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{subj.start_time} – {subj.end_time}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{subj.room_id || '-'}</td>
                                            <td className="px-4 py-3 text-center">
                                              <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); openSubjectEditModal(id, subj); }}
                                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:hover:bg-yellow-800/60 text-yellow-600 dark:text-yellow-400 transition-colors"
                                                  title="แก้ไขรายวิชานี้"
                                                >
                                                  <Edit2 size={14} />
                                                </button>
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); confirmDeleteSubject(id, subj); }}
                                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-800/60 text-red-500 dark:text-red-400 transition-colors"
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
        </div>

        {/* Modal: แก้ไข Header */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
            <div className="bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#302782] dark:text-[#B2BB1E]">แก้ไขรายละเอียด</h2>
              <form onSubmit={onSaveEdit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ภาควิชา</label>
                  <input required className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all" value={editingSchedule.department} onChange={(e) => setEditingSchedule({ ...editingSchedule, department: e.target.value })} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ชั้นปี</label>
                  <input required className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all" value={editingSchedule.study_year} onChange={(e) => setEditingSchedule({ ...editingSchedule, study_year: e.target.value })} />
                </div>
                <div className="mb-6 sm:mb-8">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ภาค</label>
                  <input required className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all" value={editingSchedule.program_type} onChange={(e) => setEditingSchedule({ ...editingSchedule, program_type: e.target.value })} />
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">ยกเลิก</button>
                  <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-[#B2BB1E] text-white rounded-xl hover:bg-[#9fa719] transition-colors font-medium shadow-md">บันทึกข้อมูล</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Preview ระบบอัปโหลดทับ */}
        {isPreviewModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
            <div className="bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#302782] dark:text-[#B2BB1E]">ตรวจสอบข้อมูลก่อนอัปเดต</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 sm:p-5 rounded-xl border border-green-200 dark:border-green-800 flex items-center gap-4">
                  <CheckCircle className="text-green-500 w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-400">ข้อมูลที่พร้อมบันทึก</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-500">{previewData.length} <span className="text-sm sm:text-lg font-normal">รายการ</span></p>
                  </div>
                </div>
                <div className={`p-4 sm:p-5 rounded-xl border flex items-center gap-4 ${previewErrors.length > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'}`}>
                  <AlertCircle className={`${previewErrors.length > 0 ? 'text-red-500' : 'text-gray-400'} w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0`} />
                  <div>
                    <p className={`text-sm font-medium ${previewErrors.length > 0 ? 'text-red-800 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>พบข้อผิดพลาด (ข้ามการบันทึก)</p>
                    <p className={`text-2xl sm:text-3xl font-bold ${previewErrors.length > 0 ? 'text-red-700 dark:text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{previewErrors.length} <span className="text-sm sm:text-lg font-normal">รายการ</span></p>
                  </div>
                </div>
              </div>

              {previewErrors.length > 0 && (
                <div className="flex-1 overflow-x-auto overflow-y-auto border border-red-200 dark:border-red-800/50 rounded-xl mb-4 sm:mb-6 min-h-[150px]">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">แถว Excel</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">ห้อง</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">สัปดาห์ / วันที่</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">รายละเอียดข้อผิดพลาด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100 dark:divide-red-900/20 text-gray-700 dark:text-gray-300">
                      {previewErrors.map((err, idx) => (
                         <tr key={idx} className="bg-white dark:bg-gray-800">
                          <td className="px-4 py-3 whitespace-nowrap">{err.row}</td>
                          <td className="px-4 py-3 font-medium whitespace-nowrap">{err.room}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{err.week ? `W${err.week} (${err.date})` : '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-red-600 dark:text-red-400 min-w-[200px]">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-auto pt-4 sm:pt-5 flex flex-col lg:flex-row justify-between items-center gap-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg w-full lg:w-auto text-center lg:text-left">
                  ⚠️ การกดยืนยันจะ <span className="font-bold text-red-600 dark:text-red-400">ลบข้อมูลตารางเดิมทิ้งทั้งหมด</span> แล้วนำชุดใหม่นี้เข้าไปแทนที่
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-3 w-full lg:w-auto">
                  <button onClick={() => setIsPreviewModalOpen(false)} disabled={isUploading} className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">
                    ยกเลิก
                  </button>
                  <button 
                    onClick={onConfirmReuploadClick} 
                    disabled={isUploading || previewData.length === 0} 
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#B2BB1E] hover:bg-[#9fa719] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md flex justify-center items-center gap-2"
                  >
                    {isUploading ? (
                      <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> กำลังบันทึก...</>
                    ) : 'ยืนยันอัปเดตข้อมูล'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {alertConfig.isOpen && (
        <ActionModal 
          {...alertConfig} 
          onClose={closeAlert} 
        />
      )}

      {/* ==================== Modal: แก้ไขรายวิชา ==================== */}
      {isSubjectEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
                  <Edit2 size={20} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#302782] dark:text-[#B2BB1E]">แก้ไขรายวิชา</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[300px]">{editingSubjectData.old_subject_name} (Sec {editingSubjectData.old_sec})</p>
                </div>
              </div>
              <button
                onClick={() => setIsSubjectEditModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSaveSubjectEdit} className="px-6 py-5 space-y-4">

              {/* แถว 1: ชื่อวิชา + Sec */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อวิชา</label>
                  <input
                    required
                    value={editingSubjectData.subject_name || ''}
                    onChange={(e) => updateSubjectField('subject_name', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sec (หมู่เรียน)</label>
                  <input
                    required
                    value={editingSubjectData.sec || ''}
                    onChange={(e) => updateSubjectField('sec', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* แถว 2: ชื่ออาจารย์ + นามสกุล */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่ออาจารย์</label>
                  <input
                    required
                    value={editingSubjectData.teacher_name || ''}
                    onChange={(e) => updateSubjectField('teacher_name', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">นามสกุลอาจารย์</label>
                  <input
                    required
                    value={editingSubjectData.teacher_surname || ''}
                    onChange={(e) => updateSubjectField('teacher_surname', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* แถว 3: ห้อง + เทอม */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ห้อง (room_id)</label>
                  <input
                    value={editingSubjectData.room_id || ''}
                    onChange={(e) => updateSubjectField('room_id', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">เทอม (semester_id)</label>
                  <input
                    value={editingSubjectData.semester_id || ''}
                    onChange={(e) => updateSubjectField('semester_id', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all text-sm"
                    placeholder="(ถ้าไม่กรอกจะใช้ค่าเดิม)"
                  />
                </div>
              </div>

              {/* แถว 4: เวลาเริ่ม + สิ้นสุด */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">เวลาเริ่ม</label>
                  <input
                    required
                    type="time"
                    value={editingSubjectData.start_time || ''}
                    onChange={(e) => updateSubjectField('start_time', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">เวลาสิ้นสุด</label>
                  <input
                    required
                    type="time"
                    value={editingSubjectData.end_time || ''}
                    onChange={(e) => updateSubjectField('end_time', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* แถว 5: วันที่เริ่ม + จำนวนสัปดาห์ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">วันที่เริ่มเรียน</label>
                  <input
                    required
                    type="date"
                    value={editingSubjectData.date || ''}
                    onChange={(e) => updateSubjectField('date', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">จำนวนสัปดาห์ (repeat)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={editingSubjectData.repeat || 1}
                    onChange={(e) => updateSubjectField('repeat', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* คำเตือน */}
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                ⚠️ ระบบจะ <span className="font-semibold">ลบรายวิชาเดิมทั้งหมดและสร้างใหม่</span> ตามจำนวนสัปดาห์ที่กรอก
              </p>

              {/* ปุ่ม */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectEditModalOpen(false)}
                  disabled={isSavingSubject}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingSubject}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#B2BB1E] hover:bg-[#9fa719] text-white rounded-xl transition-colors font-medium shadow-md text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSavingSubject ? (
                    <><Loader2 size={16} className="animate-spin" /> กำลังบันทึก...</>
                  ) : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
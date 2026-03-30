import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar'; 
import { useSchedule } from '../hooks/useSchedule'; 
import { Edit2, Trash2, UploadCloud, AlertCircle, CheckCircle, X } from 'lucide-react'; 
import ActionModal from '../components/common/ActionModal'; 

const ScheduleManagement = () => {
  const {
    schedules, isLoading, 
    isEditModalOpen, setIsEditModalOpen, 
    editingSchedule, setEditingSchedule, 
    isPreviewModalOpen, setIsPreviewModalOpen, isUploading,
    previewData, previewErrors, fileInputRef,
    handleDelete, openEditModal, handleSaveEdit,
    triggerFileInput, handleFileChange, handleConfirmReupload
  } = useSchedule(); 

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

  // 🚩 ครอบการเลือกไฟล์ เพื่อดัก Error ตอน Preview
  const onFileChangeWrapper = async (e) => {
    try {
      await handleFileChange(e);
    } catch (error) {
      showResultAlert(false, "", error.response?.data?.message || "เกิดข้อผิดพลาดในการตรวจสอบไฟล์");
    }
  };

  // 🚩 จัดการเวลายืนยันอัปโหลดทับ
  const onConfirmReuploadClick = async () => {
    // ถ้าไฟล์มี Error บางส่วน เด้งถามก่อน
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
          closeAlert(); // ปิด Modal ยืนยัน
          await executeReupload(); // สั่งอัปโหลด
        }
      });
    } else {
      // ไม่มี Error ข้ามไปอัปโหลดเลย
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

        {/* 🚩 เปลี่ยนให้ใช้ onFileChangeWrapper แทนตัวเดิม */}
        <input type="file" accept=".xlsx, .xls" ref={fileInputRef} className="hidden" onChange={onFileChangeWrapper} />

        {/* ตารางหลัก */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-[#302782] dark:text-[#B2BB1E] uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">อัปเดตล่าสุด</th>
                  <th className="px-6 py-4">รหัสชุดตารางเรียน</th>
                  <th className="px-6 py-4">ภาควิชา</th>
                  <th className="px-6 py-4">ชั้นปี</th>
                  <th className="px-6 py-4">ภาค</th>
                  <th className="px-6 py-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr><td colSpan="6" className="text-center py-8">กำลังโหลดข้อมูล...</td></tr>
                ) : schedules.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-gray-500">ไม่มีประวัติตารางเรียนในระบบ</td></tr>
                ) : (
                  schedules.map((schedule) => (
                    <tr key={schedule.unique_schedules} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(schedule.date_create)}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">{schedule.unique_schedules}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{schedule.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap">ปี {schedule.study_year}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{schedule.program_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex justify-center gap-2">
                        <button 
                          onClick={() => triggerFileInput(schedule.unique_schedules)} 
                          disabled={isUploading} 
                          className="flex items-center gap-1 bg-[#302782] hover:bg-[#4338ca] text-white px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50 shadow-sm"
                          title="อัปโหลดไฟล์ Excel ทับข้อมูลเดิม"
                        >
                          <UploadCloud size={16} /> <span className="hidden sm:inline">อัปโหลดทับ</span>
                        </button>
                        <button 
                          onClick={() => openEditModal(schedule)} 
                          className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm"
                          title="แก้ไขรายละเอียด"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(schedule.unique_schedules)} 
                          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm"
                          title="ลบข้อมูลชุดนี้"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: แก้ไข Header */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
              <h2 className="text-xl font-bold mb-6 text-[#302782] dark:text-[#B2BB1E]">แก้ไขรายละเอียด</h2>
              <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">ชุดตารางเรียน: <span className="font-mono text-blue-500">{editingSchedule.id}</span></div>
              <form onSubmit={onSaveEdit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ภาควิชา</label>
                  <input required className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all" value={editingSchedule.department} onChange={(e) => setEditingSchedule({ ...editingSchedule, department: e.target.value })} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ชั้นปี</label>
                  <input required className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all" value={editingSchedule.study_year} onChange={(e) => setEditingSchedule({ ...editingSchedule, study_year: e.target.value })} />
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ภาค</label>
                  <input required className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all" value={editingSchedule.program_type} onChange={(e) => setEditingSchedule({ ...editingSchedule, program_type: e.target.value })} />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">ยกเลิก</button>
                  <button type="submit" className="px-5 py-2.5 bg-[#B2BB1E] text-white rounded-xl hover:bg-[#9fa719] transition-colors font-medium shadow-md">บันทึกข้อมูล</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Preview ระบบอัปโหลดทับ */}
        {isPreviewModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[#302782] dark:text-[#B2BB1E]">ตรวจสอบข้อมูลก่อนอัปเดต</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-200 dark:border-green-800 flex items-center gap-4">
                  <CheckCircle className="text-green-500 w-10 h-10 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-400">ข้อมูลที่พร้อมบันทึก</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-500">{previewData.length} <span className="text-lg font-normal">รายการ</span></p>
                  </div>
                </div>
                <div className={`p-5 rounded-xl border flex items-center gap-4 ${previewErrors.length > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'}`}>
                  <AlertCircle className={`${previewErrors.length > 0 ? 'text-red-500' : 'text-gray-400'} w-10 h-10 flex-shrink-0`} />
                  <div>
                    <p className={`text-sm font-medium ${previewErrors.length > 0 ? 'text-red-800 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>พบข้อผิดพลาด (ข้ามการบันทึก)</p>
                    <p className={`text-3xl font-bold ${previewErrors.length > 0 ? 'text-red-700 dark:text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{previewErrors.length} <span className="text-lg font-normal">รายการ</span></p>
                  </div>
                </div>
              </div>

              {previewErrors.length > 0 && (
                <div className="flex-1 overflow-auto border border-red-200 dark:border-red-800/50 rounded-xl mb-6">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 font-semibold">แถว Excel</th>
                        <th className="px-4 py-3 font-semibold">ห้อง</th>
                        <th className="px-4 py-3 font-semibold">สัปดาห์ / วันที่</th>
                        <th className="px-4 py-3 font-semibold">รายละเอียดข้อผิดพลาด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100 dark:divide-red-900/20 text-gray-700 dark:text-gray-300">
                      {previewErrors.map((err, idx) => (
                         <tr key={idx} className="bg-white dark:bg-gray-800">
                          <td className="px-4 py-3">{err.row}</td>
                          <td className="px-4 py-3 font-medium">{err.room}</td>
                          <td className="px-4 py-3">{err.week ? `W${err.week} (${err.date})` : '-'}</td>
                          <td className="px-4 py-3 text-red-600 dark:text-red-400">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-auto pt-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                  ⚠️ การกดยืนยันจะ <span className="font-bold text-red-600 dark:text-red-400">ลบข้อมูลตารางเดิมทิ้งทั้งหมด</span> แล้วนำชุดใหม่นี้เข้าไปแทนที่
                </p>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button onClick={() => setIsPreviewModalOpen(false)} disabled={isUploading} className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">
                    ยกเลิก
                  </button>
                  {/* 🚩 เปลี่ยนให้ไปเรียก onConfirmReuploadClick */}
                  <button 
                    onClick={onConfirmReuploadClick} 
                    disabled={isUploading || previewData.length === 0} 
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-[#B2BB1E] hover:bg-[#9fa719] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md flex justify-center items-center gap-2"
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

      {/* แสดง ActionModal ที่ล่างสุด */}
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
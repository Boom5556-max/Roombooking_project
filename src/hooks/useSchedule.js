import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios.js'; 

export const useSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับ Modal แก้ไข Header
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState({ id: '', department: '', study_year: '', program_type: '' });

  // State สำหรับระบบ Re-upload
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewErrors, setPreviewErrors] = useState([]);
  const [currentReuploadId, setCurrentReuploadId] = useState(null);
  
  const fileInputRef = useRef(null);

  // 1. GET: ดึงข้อมูลประวัติตารางเรียน
  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/schedules/allScheduleLog');
      
      let scheduleData = [];
      if (Array.isArray(res.data)) {
        scheduleData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        scheduleData = res.data.data;
      } else if (res.data && Array.isArray(res.data.schedules)) {
        scheduleData = res.data.schedules;
      }

      setSchedules(scheduleData);
    } catch (error) {
      console.error('Fetch Schedules Error:', error);
      setSchedules([]); 
      throw error; 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules().catch(() => {});
  }, [fetchSchedules]);

  // 2. DELETE: ลบข้อมูลตารางเรียน
  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/schedules/${id}`);
      if (res.data.success) {
        await fetchSchedules();
        return { success: true }; 
      }
      return { success: false };
    } catch (error) {
      console.error('Delete Error:', error);
      throw error; 
    }
  };

  // 3. PUT: แก้ไขข้อมูล Header
  const openEditModal = (schedule) => {
    setEditingSchedule({
      id: schedule.unique_schedules,
      department: schedule.department,
      study_year: schedule.study_year,
      program_type: schedule.program_type,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    try {
      const payload = {
        department: editingSchedule.department,
        study_year: editingSchedule.study_year,
        program_type: editingSchedule.program_type,
      };
      const res = await api.put(`/schedules/${editingSchedule.id}`, payload);
      
      if (res.data.success) {
        await fetchSchedules();
        return { success: true }; 
      }
      return { success: false };
    } catch (error) {
      console.error('Edit Error:', error);
      throw error; 
    }
  };

  // 4. POST: เลือกไฟล์ใหม่และส่งไป Preview
  const triggerFileInput = (id) => {
    setCurrentReuploadId(id);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentReuploadId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/schedules/reupload/${currentReuploadId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPreviewData(res.data.previewData || []);
      setPreviewErrors(res.data.errors || []);
      setIsPreviewModalOpen(true);

    } catch (error) {
      console.error('Reupload Preview Error:', error);
      // 🚩 โยน Error ออกไปให้ Component แสดง Pop-up แทน alert()
      throw error; 
    } finally {
      setIsUploading(false);
      e.target.value = null; 
    }
  };

  // 5. PUT: ยืนยันการอัปโหลดทับข้อมูลเดิม
  const handleConfirmReupload = async () => {
    try {
      setIsUploading(true);
      const res = await api.put(`/schedules/reconfirm/${currentReuploadId}`, {
        schedules: previewData
      });

      if (res.data.success) {
        await fetchSchedules(); 
        return { success: true, totalSaved: res.data.totalSaved };
      }
      return { success: false };
    } catch (error) {
      console.error('Confirm Reupload Error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    schedules, isLoading, isEditModalOpen, setIsEditModalOpen, editingSchedule, setEditingSchedule,
    isPreviewModalOpen, setIsPreviewModalOpen, isUploading, previewData, previewErrors, fileInputRef,
    handleDelete, openEditModal, handleSaveEdit, triggerFileInput, handleFileChange, handleConfirmReupload
  };
};
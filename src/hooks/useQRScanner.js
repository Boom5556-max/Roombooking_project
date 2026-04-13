import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";

export const useQRScanner = (activeTab, showAlert) => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const qrScannerRef = useRef(null);

  const startCamera = useCallback(() => {
    setIsCameraActive(true);
    setErrorMsg("");
  }, []);

  const stopCamera = useCallback(() => {
    setIsCameraActive(false);
  }, []);

  // สกัด Room ID จาก URL หรือข้อความตรงๆ
  const extractRoomId = (text) => {
    try {
      if (text.startsWith("http")) {
        const url = new URL(text);
        const pathParts = url.pathname.split("/").filter((p) => p !== "");
        return pathParts[pathParts.length - 1];
      }
      return text.trim();
    } catch (e) {
      return text.trim();
    }
  };

  const handleProcessScan = useCallback((decodedText) => {
    const roomId = extractRoomId(decodedText);
    setScanResult(decodedText);
    
    if (navigator.vibrate) navigator.vibrate(100);

    // ปิดกล้องทันทีที่เจอ QR เพื่อไม่ให้ทรัพยากรเครื่องค้าง
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        qrScannerRef.current.stop().catch(err => console.error("Stop Error:", err));
        setIsCameraActive(false);
    }

    setTimeout(() => {
      if (roomId) {
        // ส่งต่อไปหน้าแสดงสถานะห้อง (หน้านั้นจะใช้ Axios ดึงข้อมูลเอง)
        navigate(`/room-status/${roomId}`);
      } else {
        alert("ข้อมูล QR ไม่ถูกต้อง");
        setScanResult("");
      }
    }, 800); // ลดเวลาลงนิดนึงเพื่อให้แอปดูรวดเร็ว
  }, [navigate]);

  // Logic การอ่านไฟล์รูปภาพ (Client-side Processing)
  const scanWithJsQR = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxSide = 1000; // เพิ่มความละเอียดนิดหน่อย
          let { width, height } = img;

          if (width > height) {
            if (width > maxSide) { height *= maxSide / width; width = maxSide; }
          } else {
            if (height > maxSide) { width *= maxSide / height; height = maxSide; }
          }
          canvas.width = width; canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) resolve(code.data);
          else reject("ไม่พบ QR Code");
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    if (activeTab === "camera" && isCameraActive) {
      const scanner = new Html5Qrcode("reader");
      qrScannerRef.current = scanner;

      const initCamera = async () => {
        try {
          await scanner.start(
            { facingMode: "environment" },
            { 
              fps: 15, 
              qrbox: { width: 250, height: 250 }, 
              aspectRatio: 1.0 
            },
            (decodedText) => {
              handleProcessScan(decodedText);
            },
            () => {} 
          );
          setErrorMsg("");
        } catch (err) {
          setErrorMsg(err.toString().includes("NotAllowedError") 
            ? "ถูกปฏิเสธการเข้าถึงกล้อง" 
            : "ไม่สามารถเปิดกล้องได้");
          setIsCameraActive(false);
        }
      };
      initCamera();
    }

    // Cleanup: ปิดกล้องเมื่อออกจาก Component หรือเปลี่ยน Tab
    return () => {
      if (qrScannerRef.current?.isScanning) {
        qrScannerRef.current.stop().catch(() => {});
      }
    };
  }, [activeTab, isCameraActive, handleProcessScan]);

  const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setIsScanningFile(true);
  try {
    const decodedText = await scanWithJsQR(file);
    
    // ตรวจสอบว่าสแกนเจอข้อมูลหรือไม่
    if (decodedText) {
      handleProcessScan(decodedText);
    } else {
      // 🔔 กรณีสแกนไม่เจอ (แต่ไม่มี Error จากระบบ)
      showAlert("ไม่พบ QR Code ในรูปภาพนี้");
    }
  } catch (err) {
    // 🔔 กรณีมี Error เกิดขึ้นระหว่างการสแกน
    showAlert("สแกนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
  } finally {
    setIsScanningFile(false);
    e.target.value = null; // รีเซ็ต input เพื่อให้เลือกรูปเดิมซ้ำได้
  }
};

  return { 
    errorMsg, 
    scanResult, 
    isScanningFile, 
    handleFileChange, 
    setScanResult, 
    setErrorMsg,
    isCameraActive,
    startCamera,
    stopCamera,
    handleProcessScan
  };
};
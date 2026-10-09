import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Bell, 
  Shield, Check, Save, Lock, AlertCircle, FileText, 
  Upload, X, Camera, Eye, EyeOff, Sparkles, 
  ShieldCheck, CheckCircle2, RotateCcw, Laptop, 
  Globe, BellRing, UserCheck, KeyRound, Trash2, Image as ImageIcon,
  RefreshCw, Edit3, Briefcase, ChevronRight, Users
} from 'lucide-react';
import { logActivity } from '../services/activityService';
import { useLanguage } from '../context/LanguageContext';

export const translations = {
  English: {
    settingsTitle: "Settings",
    settingsSubtitle: "Manage your administrator profile, organizational credentials, and system preferences",
    tabAccount: "Account Settings",
    tabSecurity: "Security & Access",
    tabNotifications: "Notifications & Language",
    firstName: "First Name",
    lastName: "Last Name",
    phone: "Phone Number",
    email: "Email address",
    city: "City / Office",
    country: "State / Country",
    designation: "Designation / Role",
    department: "Department Unit",
    bio: "Admin Bio & Responsibilities",
    updateBtn: "Update",
    viewDirectory: "View Employee Directory",
    managedStaff: "Managed Personnel",
    activeDepts: "Active Departments",
    activityLogs: "Recent Activity Logs",
    choosePhotoSource: "Change Profile Picture",
    selectFromGallery: "Select from Gallery",
    gallerySub: "Choose and upload an image file from your device",
    takePhoto: "Take a Photo",
    cameraSub: "Use your live camera or webcam to capture a photo",
    captureBtn: "Capture Photo",
    retakeBtn: "Retake",
    savePhotoBtn: "Use This Photo",
    removePhoto: "Remove Photo",
    cameraErrorMsg: "Camera access was denied or is not available. Please allow camera permissions in your browser.",
    securityTitle: "Password & Authentication",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    twoFactor: "Two-Factor Authentication (2FA)",
    twoFactorDesc: "Add an extra layer of verification to secure this administrator account",
    activeSessions: "Active Device Sessions",
    notificationsTitle: "Notification Preferences",
    emailAlerts: "Email Notifications",
    pushAlerts: "Browser Push Alerts",
    weeklyDigest: "Weekly Activity Digest",
    soundAlerts: "Activity Sound Effects",
    languageSelect: "Application Language",
    savedSuccess: "Settings updated successfully!",
    savedError: "Failed to save settings. Please try again."
  },
  Tamil: {
    settingsTitle: "அமைப்புகள்",
    settingsSubtitle: "உங்கள் சுயவிவர விவரங்கள் மற்றும் கணக்கு விருப்பங்களை நிர்வகிக்கவும்",
    tabAccount: "கணக்கு அமைப்புகள்",
    tabSecurity: "பாதுகாப்பு & அணுகல்",
    tabNotifications: "அறிவிப்புகள் & மொழி",
    firstName: "முதல் பெயர்",
    lastName: "கடைசி பெயர்",
    phone: "தொலைபேசி எண்",
    email: "மின்னஞ்சல் முகவரி",
    city: "நகரம் / அலுவலகம்",
    country: "மாநிலம் / நாடு",
    designation: "பதவி / பங்கு",
    department: "துறை பிரிவு",
    bio: "பொறுப்புகள் மற்றும் குறிப்பு",
    updateBtn: "புதுப்பிக்கவும்",
    viewDirectory: "பணியாளர் பட்டியலைக் காண்க",
    managedStaff: "பணியாளர்கள்",
    activeDepts: "செயலில் உள்ள துறைகள்",
    activityLogs: "செயல்பாட்டு பதிவுகள்",
    choosePhotoSource: "புகைப்படத்தை மாற்றவும்",
    selectFromGallery: "கேலரியிலிருந்து தேர்வு செய்யவும்",
    gallerySub: "உங்கள் சாதனத்திலிருந்து படத்தை பதிவேற்றவும்",
    takePhoto: "புகைப்படம் எடுக்கவும்",
    cameraSub: "கேமராவைப் பயன்படுத்தி படம் எடுக்கவும்",
    captureBtn: "படம் எடுக்கவும்",
    retakeBtn: "மீண்டும் எடுக்கவும்",
    savePhotoBtn: "இதைப் பயன்படுத்தவும்",
    removePhoto: "புகைப்படத்தை நீக்கு",
    cameraErrorMsg: "கேமரா அணுகல் மறுக்கப்பட்டது.",
    securityTitle: "கடவுச்சொல் & பாதுகாப்பு",
    newPassword: "புதிய கடவுச்சொல்",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    twoFactor: "இரு-காரணி அங்கீகாரம் (2FA)",
    twoFactorDesc: "கணக்கைப் பாதுகாக்க கூடுதல் சரிபார்ப்பைச் சேர்க்கவும்",
    activeSessions: "செயலில் உள்ள அமர்வுகள்",
    notificationsTitle: "அறிவிப்பு விருப்பங்கள்",
    emailAlerts: "மின்னஞ்சல் அறிவிப்புகள்",
    pushAlerts: "உலாவி அறிவிப்புகள்",
    weeklyDigest: "வாராந்திர அறிக்கை",
    soundAlerts: "ஒலி விளைவுகள்",
    languageSelect: "பயன்பாட்டு மொழி",
    savedSuccess: "அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!",
    savedError: "சேமிக்க முடியவில்லை."
  },
  Spanish: {
    settingsTitle: "Ajustes",
    settingsSubtitle: "Gestione los detalles de su perfil y configuración de administrador",
    tabAccount: "Ajustes de la cuenta",
    tabSecurity: "Seguridad y acceso",
    tabNotifications: "Notificaciones e idioma",
    firstName: "Nombre",
    lastName: "Apellido",
    phone: "Número de teléfono",
    email: "Correo electrónico",
    city: "Ciudad / Oficina",
    country: "Estado / País",
    designation: "Cargo / Rol",
    department: "Departamento",
    bio: "Biografía y funciones",
    updateBtn: "Actualizar",
    viewDirectory: "Ver directorio de empleados",
    managedStaff: "Personal administrado",
    activeDepts: "Departamentos activos",
    activityLogs: "Registros de actividad",
    choosePhotoSource: "Cambiar foto de perfil",
    selectFromGallery: "Seleccionar de la galería",
    gallerySub: "Suba un archivo de imagen desde su dispositivo",
    takePhoto: "Tomar una foto",
    cameraSub: "Use su cámara web para capturar una foto",
    captureBtn: "Capturar",
    retakeBtn: "Repetir",
    savePhotoBtn: "Usar esta foto",
    removePhoto: "Eliminar foto",
    cameraErrorMsg: "El acceso a la cámara fue denegado.",
    securityTitle: "Contraseña y seguridad",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    twoFactor: "Autenticación en dos pasos (2FA)",
    twoFactorDesc: "Añada una capa adicional de seguridad a su cuenta",
    activeSessions: "Sesiones activas",
    notificationsTitle: "Preferencias de notificación",
    emailAlerts: "Notificaciones por correo",
    pushAlerts: "Alertas push del navegador",
    weeklyDigest: "Resumen semanal",
    soundAlerts: "Efectos de sonido",
    languageSelect: "Idioma de la aplicación",
    savedSuccess: "¡Ajustes actualizados con éxito!",
    savedError: "Error al guardar los ajustes."
  }
};

const Settings = () => {
  const navigate = useNavigate();
  const { language: currentLang, changeLanguage } = useLanguage();
  const t = translations[currentLang] || translations.English;

  const [activeTab, setActiveTab] = useState('account');
  const [isEditMode, setIsEditMode] = useState(false);
  const [messageBox, setMessageBox] = useState({ isOpen: false, type: 'success', text: '' });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Password Visibility States
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Avatar Selection & Camera States
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState('');

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Split Name Helper
  const parseNames = (fullName) => {
    const parts = (fullName || '').trim().split(' ');
    const first = parts[0] || '';
    const last = parts.slice(1).join(' ') || '';
    return { first, last };
  };

  // Profile Form State
  const [profile, setProfile] = useState({
    firstName: 'Poovarasan',
    lastName: 'Sambath',
    username: 'Poovarasan Sambath',
    email: 'poovarasansam123@gmail.com',
    phone: '+91 8072672917',
    city: 'Bangalore',
    country: 'Karnataka, India',
    location: 'Bangalore, India',
    department: 'Operations & Engineering',
    designation: 'Lead Administrator',
    bio: 'Managing employee directory, system access control, and organizational operational metrics.',
    avatar: '',
  });

  // Passwords State
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('appNotifications');
      return saved ? JSON.parse(saved) : { 
        emailAlerts: true, 
        pushNotifications: true, 
        weeklyReport: true,
        soundAlerts: false
      };
    } catch {
      return { emailAlerts: true, pushNotifications: true, weeklyReport: true, soundAlerts: false };
    }
  });

  // Security State
  const [security, setSecurity] = useState(() => {
    try {
      const saved = localStorage.getItem('appSecurity');
      return saved ? JSON.parse(saved) : { twoFactorAuth: true };
    } catch {
      return { twoFactorAuth: true };
    }
  });

  // Fetch initial user data
  useEffect(() => {
    const fetchUserData = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const rawName = storedUser.username || storedUser.name || 'Poovarasan Sambath';
        const { first, last } = parseNames(rawName);

        const initialData = {
          firstName: storedUser.firstName || first || 'Poovarasan',
          lastName: storedUser.lastName || last || 'Sambath',
          username: rawName,
          email: storedUser.email || 'poovarasansam123@gmail.com',
          phone: storedUser.phone || '+91 8072672917',
          city: storedUser.city || 'Bangalore',
          country: storedUser.country || 'Karnataka, India',
          location: storedUser.location || 'Bangalore, India',
          department: storedUser.department || 'Operations & Engineering',
          designation: storedUser.designation || 'Lead Administrator',
          bio: storedUser.bio || 'Managing employee directory, system access control, and organizational operational metrics.',
          avatar: storedUser.avatar || storedUser.profilePic || storedUser.profileImage || '',
        };
        setProfile(initialData);
      } catch (err) {
        console.error('Failed to load settings data:', err);
      }
    };
    fetchUserData();

    return () => {
      stopCamera();
    };
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'firstName' || name === 'lastName') {
        updated.username = `${name === 'firstName' ? value : updated.firstName} ${name === 'lastName' ? value : updated.lastName}`.trim();
      }
      return updated;
    });
  };

  // Helper to save avatar to localStorage & dispatch event
  const saveAvatarImage = (base64Image) => {
    setProfile((prev) => ({ ...prev, avatar: base64Image }));
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { 
        ...currentUser, 
        avatar: base64Image, 
        profileImage: base64Image, 
        profilePic: base64Image 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));
    } catch (err) {
      console.error('Failed to cache avatar locally:', err);
    }
  };

  // 1. SELECT FROM GALLERY / FILES
  const handleTriggerGallery = () => {
    setIsAvatarPickerOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessageBox({ isOpen: true, type: 'error', text: 'Image size must be less than 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        saveAvatarImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // 2. TAKE PHOTO VIA LIVE WEBCAM / CAMERA
  const handleOpenLiveCamera = async () => {
    setIsAvatarPickerOpen(false);
    setCameraError('');
    setCapturedPhoto(null);
    setIsCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(t.cameraErrorMsg);
    }
  };

  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current && !capturedPhoto) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen, capturedPhoto]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    handleOpenLiveCamera();
  };

  const saveCapturedPhoto = () => {
    if (capturedPhoto) {
      saveAvatarImage(capturedPhoto);
    }
    closeCameraModal();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const closeCameraModal = () => {
    stopCamera();
    setIsCameraOpen(false);
    setCapturedPhoto(null);
    setCameraError('');
  };

  const handleRemoveAvatar = () => {
    setIsAvatarPickerOpen(false);
    saveAvatarImage('');
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPasswordError('');
  };

  const handleNotificationToggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('appNotifications', JSON.stringify(updated));
  };

  const handleSecurityToggle = () => {
    const updated = { ...security, twoFactorAuth: !security.twoFactorAuth };
    setSecurity(updated);
    localStorage.setItem('appSecurity', JSON.stringify(updated));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (passwords.newPassword || passwords.confirmPassword) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        setPasswordError('Passwords do not match');
        setActiveTab('security');
        return;
      }
      if (passwords.newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        setActiveTab('security');
        return;
      }
    }

    setLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUserObj = { 
        ...currentUser, 
        ...profile,
        username: profile.username || `${profile.firstName} ${profile.lastName}`.trim(),
        name: profile.username || `${profile.firstName} ${profile.lastName}`.trim(),
        profileImage: profile.avatar,
        profilePic: profile.avatar
      };
      localStorage.setItem('user', JSON.stringify(newUserObj));
      window.dispatchEvent(new Event('user-updated'));

      setPasswords({ newPassword: '', confirmPassword: '' });
      setIsEditMode(false);
      
      logActivity('PROFILE', 'Profile Updated', 'Administrator profile details were updated successfully');
      setMessageBox({ isOpen: true, type: 'success', text: t.savedSuccess });
    } catch (error) {
      console.error('Failed to update settings:', error);
      setMessageBox({ isOpen: true, type: 'error', text: t.savedError });
    } finally {
      setLoading(false);
    }
  };

  const userDisplayName = profile.username || `${profile.firstName} ${profile.lastName}`.trim() || 'Poovarasan Sambath';
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  return (
    <div className="settings-indigo-container">
      {/* Hidden File Input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleFileUpload} 
        style={{ display: 'none' }} 
      />

      {/* 1. Modal: Choose Photo Source */}
      {isAvatarPickerOpen && (
        <div className="settings-modal-backdrop" onClick={() => setIsAvatarPickerOpen(false)}>
          <div className="avatar-source-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-modal-header">
              <h3>{t.choosePhotoSource}</h3>
              <button 
                type="button" 
                className="avatar-modal-close-btn" 
                onClick={() => setIsAvatarPickerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="avatar-options-grid">
              <button 
                type="button" 
                className="avatar-option-btn" 
                onClick={handleTriggerGallery}
              >
                <div className="avatar-option-icon gallery">
                  <ImageIcon size={24} />
                </div>
                <div className="avatar-option-texts">
                  <h4>{t.selectFromGallery}</h4>
                  <p>{t.gallerySub}</p>
                </div>
              </button>

              <button 
                type="button" 
                className="avatar-option-btn" 
                onClick={handleOpenLiveCamera}
              >
                <div className="avatar-option-icon camera">
                  <Camera size={24} />
                </div>
                <div className="avatar-option-texts">
                  <h4>{t.takePhoto}</h4>
                  <p>{t.cameraSub}</p>
                </div>
              </button>
            </div>

            {profile.avatar && (
              <div className="avatar-modal-footer">
                <button 
                  type="button" 
                  className="btn-remove-avatar"
                  onClick={handleRemoveAvatar}
                >
                  <Trash2 size={16} />
                  <span>{t.removePhoto}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Live Camera Modal */}
      {isCameraOpen && (
        <div className="settings-modal-backdrop" onClick={closeCameraModal}>
          <div className="camera-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="camera-modal-header">
              <div className="camera-modal-title">
                <Camera size={20} />
                <h3>{t.takePhoto}</h3>
              </div>
              <button 
                type="button" 
                className="camera-modal-close-btn" 
                onClick={closeCameraModal}
              >
                <X size={18} />
              </button>
            </div>

            {cameraError ? (
              <div className="camera-error-wrap">
                <div className="camera-error-icon">
                  <AlertCircle size={32} />
                </div>
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 20px 0' }}>
                  {cameraError}
                </p>
                <button 
                  type="button" 
                  className="btn-camera-secondary"
                  onClick={handleTriggerGallery}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <ImageIcon size={16} />
                  <span>Choose from Gallery instead</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="camera-viewfinder-box">
                  {capturedPhoto ? (
                    <img src={capturedPhoto} alt="Captured Snapshot" className="camera-snapshot-preview" />
                  ) : (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="camera-video-feed" 
                    />
                  )}
                </div>

                {!capturedPhoto ? (
                  <div className="camera-action-bar">
                    <button 
                      type="button" 
                      onClick={capturePhoto} 
                      className="btn-capture-shutter"
                    >
                      <Camera size={18} />
                      <span>{t.captureBtn}</span>
                    </button>
                  </div>
                ) : (
                  <div className="camera-action-bar">
                    <button 
                      type="button" 
                      onClick={retakePhoto} 
                      className="btn-camera-secondary"
                    >
                      <RefreshCw size={15} />
                      <span>{t.retakeBtn}</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={saveCapturedPhoto} 
                      className="btn-camera-primary"
                    >
                      <Check size={16} />
                      <span>{t.savePhotoBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Status Modal */}
      {messageBox.isOpen && (
        <div className="settings-modal-backdrop" onClick={() => setMessageBox({ ...messageBox, isOpen: false })}>
          <div className="settings-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className={`settings-modal-icon-wrap ${messageBox.type}`}>
              {messageBox.type === 'success' ? (
                <CheckCircle2 size={32} />
              ) : (
                <AlertCircle size={32} />
              )}
            </div>
            <h3>{messageBox.type === 'success' ? 'Settings Saved' : 'Action Required'}</h3>
            <p>{messageBox.text}</p>
            <button 
              className="settings-modal-btn" 
              onClick={() => setMessageBox({ ...messageBox, isOpen: false })}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Header Block */}
      <div className="settings-indigo-header">
        <h1 className="settings-indigo-title">{t.settingsTitle}</h1>
        <p className="settings-indigo-subtitle">{t.settingsSubtitle}</p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="settings-indigo-layout">
        
        {/* LEFT COLUMN: Profile Card */}
        <div className="settings-indigo-profile-card">
          <div className="settings-indigo-avatar-wrap">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Admin Avatar" className="settings-indigo-avatar-img" />
            ) : (
              <div className="settings-indigo-avatar-fallback">{userInitial}</div>
            )}
            <button 
              type="button" 
              className="settings-indigo-camera-badge" 
              onClick={() => setIsAvatarPickerOpen(true)}
              title="Change Photo"
            >
              <Camera size={16} />
            </button>
          </div>

          <h3 className="settings-indigo-name">{userDisplayName}</h3>
          <p className="settings-indigo-role">{profile.designation || 'Lead Administrator'}</p>

          {/* Employee Management Stat Rows */}
          <div className="settings-indigo-stats-list">
            <div className="settings-indigo-stat-row">
              <span>{t.managedStaff}</span>
              <span className="settings-indigo-stat-pill">66</span>
            </div>
            <div className="settings-indigo-stat-row">
              <span>{t.activeDepts}</span>
              <span className="settings-indigo-stat-pill">12</span>
            </div>
            <div className="settings-indigo-stat-row">
              <span>{t.activityLogs}</span>
              <span className="settings-indigo-stat-pill">09</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            type="button" 
            className="settings-indigo-btn-amber"
            onClick={() => navigate('/employees')}
          >
            <Users size={16} />
            <span>{t.viewDirectory}</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Tabbed Form Panels */}
        <div className="settings-indigo-form-panel">
          
          {/* Horizontal Tabs Bar */}
          <div className="settings-indigo-tabs-bar">
            <button 
              type="button" 
              className={`settings-indigo-tab-btn ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => { setActiveTab('account'); setIsEditMode(false); }}
            >
              {t.tabAccount}
            </button>
            <button 
              type="button" 
              className={`settings-indigo-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => { setActiveTab('security'); setIsEditMode(false); }}
            >
              {t.tabSecurity}
            </button>
            <button 
              type="button" 
              className={`settings-indigo-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => { setActiveTab('notifications'); setIsEditMode(false); }}
            >
              {t.tabNotifications}
            </button>
          </div>

          {/* TAB 1: Account Settings Form */}
          {activeTab === 'account' && (
            <form onSubmit={handleSave}>
              {/* Edit / Cancel header row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
                {!isEditMode ? (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="settings-indigo-btn-amber"
                    style={{ width: 'auto', padding: '9px 22px', display: 'inline-flex', gap: '7px', fontSize: '13.5px' }}
                  >
                    <Edit3 size={15} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    style={{
                      width: 'auto', padding: '9px 22px', display: 'inline-flex', gap: '7px',
                      fontSize: '13.5px', background: 'transparent', border: '1.5px solid #cbd5e1',
                      borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontFamily: 'inherit',
                      alignItems: 'center', fontWeight: '600'
                    }}
                  >
                    <X size={15} />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <div className="settings-indigo-form-grid">
                
                {/* First Name */}
                <div className="settings-indigo-field">
                  <label className="settings-indigo-label">{t.firstName}</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={profile.firstName} 
                    onChange={handleProfileChange} 
                    placeholder="Poovarasan" 
                    className="settings-indigo-input"
                    readOnly={!isEditMode}
                    style={!isEditMode ? { cursor: 'default', opacity: 0.75 } : {}}
                    required 
                  />
                </div>

                {/* Last Name */}
                <div className="settings-indigo-field">
                  <label className="settings-indigo-label">{t.lastName}</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={profile.lastName} 
                    onChange={handleProfileChange} 
                    placeholder="Sambath" 
                    className="settings-indigo-input"
                    readOnly={!isEditMode}
                    style={!isEditMode ? { cursor: 'default', opacity: 0.75 } : {}}
                  />
                </div>

                {/* Phone Number */}
                <div className="settings-indigo-field">
                  <label className="settings-indigo-label">{t.phone}</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={profile.phone} 
                    onChange={handleProfileChange} 
                    placeholder="+91 80726 72917" 
                    className="settings-indigo-input"
                    readOnly={!isEditMode}
                    style={!isEditMode ? { cursor: 'default', opacity: 0.75 } : {}}
                  />
                </div>

                {/* Email Address */}
                <div className="settings-indigo-field">
                  <label className="settings-indigo-label">{t.email}</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={profile.email} 
                    onChange={handleProfileChange} 
                    placeholder="admin@enterprise.com" 
                    className="settings-indigo-input"
                    readOnly={!isEditMode}
                    style={!isEditMode ? { cursor: 'default', opacity: 0.75 } : {}}
                    required 
                  />
                </div>

                {/* City / Office */}
                <div className="settings-indigo-field">
                  <label className="settings-indigo-label">{t.city}</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={profile.city} 
                    onChange={handleProfileChange} 
                    placeholder="Bangalore" 
                    className="settings-indigo-input"
                    readOnly={!isEditMode}
                    style={!isEditMode ? { cursor: 'default', opacity: 0.75 } : {}}
                  />
                </div>

                {/* State / Country */}
                <div className="settings-indigo-field">
                  <label className="settings-indigo-label">{t.country}</label>
                  <input 
                    type="text" 
                    name="country" 
                    value={profile.country} 
                    onChange={handleProfileChange} 
                    placeholder="Karnataka, India" 
                    className="settings-indigo-input"
                    readOnly={!isEditMode}
                    style={!isEditMode ? { cursor: 'default', opacity: 0.75 } : {}}
                  />
                </div>

                {/* Designation */}
                <div className="settings-indigo-field">
                  <label className="settings-indigo-label">{t.designation}</label>
                  <input 
                    type="text" 
                    name="designation" 
                    value={profile.designation} 
                    onChange={handleProfileChange} 
                    placeholder="Lead Administrator" 
                    className="settings-indigo-input"
                    readOnly={!isEditMode}
                    style={!isEditMode ? { cursor: 'default', opacity: 0.75 } : {}}
                  />
                </div>

                {/* Department */}
                <div className="settings-indigo-field">
                  <label className="settings-indigo-label">{t.department}</label>
                  <input 
                    type="text" 
                    name="department" 
                    value={profile.department} 
                    onChange={handleProfileChange} 
                    placeholder="Operations & HR" 
                    className="settings-indigo-input"
                    readOnly={!isEditMode}
                    style={!isEditMode ? { cursor: 'default', opacity: 0.75 } : {}}
                  />
                </div>

                {/* Bio / Responsibilities */}
                <div className="settings-indigo-field full-width">
                  <label className="settings-indigo-label">{t.bio}</label>
                  <textarea 
                    name="bio" 
                    value={profile.bio} 
                    onChange={handleProfileChange} 
                    placeholder="Administrator responsibilities and scope..." 
                    className="settings-indigo-textarea" 
                    rows={3}
                    readOnly={!isEditMode}
                    style={!isEditMode ? { cursor: 'default', opacity: 0.75, resize: 'none' } : {}}
                  />
                </div>

              </div>

              {/* Save button only visible in edit mode */}
              {isEditMode && (
                <button 
                  type="submit" 
                  disabled={loading}
                  className="settings-indigo-btn-amber"
                  style={{ width: 'auto', padding: '12px 36px', display: 'inline-flex' }}
                >
                  <Save size={16} />
                  <span>{loading ? 'Updating...' : t.updateBtn}</span>
                </button>
              )}
            </form>
          )}

          {/* TAB 2: Security & Access */}
          {activeTab === 'security' && (
            <form onSubmit={handleSave}>
              <div style={{ background: 'var(--bg-main)', padding: '18px 20px', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{t.twoFactor}</h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-subtle)' }}>{t.twoFactorDesc}</p>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" checked={security.twoFactorAuth} onChange={handleSecurityToggle} />
                  <span className="settings-slider"></span>
                </label>
              </div>

              <div className="settings-indigo-form-grid">
                <div className="settings-indigo-field">
                  <label className="settings-indigo-label">{t.newPassword}</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className="settings-indigo-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="settings-indigo-field">
                  <label className="settings-indigo-label">{t.confirmPassword}</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="settings-indigo-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '18px' }}>⚠️ {passwordError}</p>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="settings-indigo-btn-amber"
                style={{ width: 'auto', padding: '12px 36px', display: 'inline-flex' }}
              >
                <Save size={16} />
                <span>{loading ? 'Updating...' : 'Save Password'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: Notifications & Language */}
          {activeTab === 'notifications' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {[
                  { key: 'emailAlerts', title: t.emailAlerts, desc: 'Receive instant notifications for employee actions via email' },
                  { key: 'pushNotifications', title: t.pushAlerts, desc: 'Receive live in-browser popups for scanner & database events' },
                  { key: 'weeklyReport', title: t.weeklyDigest, desc: 'Consolidated report delivered every Monday' },
                  { key: 'soundAlerts', title: t.soundAlerts, desc: 'Play notification audio sounds on system activity' }
                ].map(item => (
                  <div key={item.key} style={{ background: 'var(--bg-main)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13.5px', fontWeight: '700', color: 'var(--text-main)' }}>{item.title}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-subtle)' }}>{item.desc}</p>
                    </div>
                    <label className="settings-switch">
                      <input type="checkbox" checked={!!notifications[item.key]} onChange={() => handleNotificationToggle(item.key)} />
                      <span className="settings-slider"></span>
                    </label>
                  </div>
                ))}
              </div>

              {/* Language Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label className="settings-indigo-label" style={{ display: 'block', marginBottom: '10px' }}>
                  {t.languageSelect}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { code: 'English', label: 'English', sub: 'Default' },
                    { code: 'Tamil', label: 'தமிழ்', sub: 'Tamil' },
                    { code: 'Spanish', label: 'Español', sub: 'Spanish' }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => changeLanguage(lang.code)}
                      style={{
                        padding: '14px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: `2px solid ${currentLang === lang.code ? 'var(--accent-emerald)' : 'var(--border-color)'}`,
                        background: currentLang === lang.code ? 'var(--primary)' : 'var(--bg-main)',
                        color: currentLang === lang.code ? '#ffffff' : 'var(--text-main)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        fontFamily: 'inherit'
                      }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '14px' }}>{lang.label}</div>
                      <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{lang.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Settings;
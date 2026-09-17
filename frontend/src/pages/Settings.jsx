import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, MapPin, Bell, 
  Shield, Check, Save, Lock, AlertCircle, FileText, 
  Upload, X, Camera, Eye, EyeOff, Sparkles, 
  ShieldCheck, CheckCircle2, RotateCcw, Laptop, 
  Globe, BellRing, UserCheck, KeyRound, Trash2, Image as ImageIcon,
  RefreshCw, Edit3, Briefcase
} from 'lucide-react';
import { logActivity } from '../services/activityService';
import { useLanguage } from '../context/LanguageContext';

export const translations = {
  English: {
    accountSettings: "Account Settings",
    subtitle: "Manage your profile details, security preferences, and account configurations",
    saveChanges: "Save Changes",
    saving: "Saving...",
    editProfile: "Edit Profile",
    cancelEdit: "Cancel",
    discardChanges: "Reset",
    savedSuccess: "Settings updated successfully!",
    savedError: "Failed to save settings. Please try again.",
    tabProfile: "Profile Information",
    tabSecurity: "Security & Login",
    tabNotifications: "Notifications",
    tabPreferences: "Preferences & Language",
    profileInfo: "Personal Details",
    profileSub: "Your personal and public details visible across the workspace",
    profileEditSub: "Update your personal details below and click Save Changes",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    location: "Office / Location",
    designation: "Designation / Role",
    bio: "Professional Bio",
    profilePicture: "Profile Picture",
    uploadImage: "Upload Photo",
    removePhoto: "Remove Photo",
    photoHint: "Recommended size: 500x500px JPG, PNG or WebP (Max 2MB)",
    choosePhotoSource: "Change Profile Picture",
    selectFromGallery: "Select from Gallery",
    gallerySub: "Choose and upload an image file from your device",
    takePhoto: "Take a Photo",
    cameraSub: "Use your live camera or webcam to capture a photo",
    captureBtn: "Capture Photo",
    retakeBtn: "Retake",
    savePhotoBtn: "Use This Photo",
    cameraErrorMsg: "Camera access was denied or is not available. Please allow camera permissions in your browser.",
    securityTitle: "Password & Security",
    securitySub: "Update your password and configure account authentication protocols",
    changePassword: "Change Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    twoFactor: "Two-Factor Authentication (2FA)",
    twoFactorDesc: "Add a second verification step to secure your dashboard account",
    activeSessions: "Active Device Sessions",
    activeSessionsDesc: "Devices currently signed into this administrator account",
    currentDevice: "Current Workstation",
    notificationsTitle: "Notification Preferences",
    notificationsSub: "Configure how and when you receive system alerts and updates",
    emailAlerts: "Email Notifications",
    emailAlertsDesc: "Receive instant updates on critical changes and reports via email",
    pushAlerts: "In-Browser Push Alerts",
    pushAlertsDesc: "Receive instant popup alerts in your web browser while active",
    weeklyDigest: "Weekly Activity Digest",
    weeklyDigestDesc: "Receive a consolidated summary of employee changes every Monday",
    soundAlerts: "Activity Sound Effects",
    soundAlertsDesc: "Play audio cues for real-time notification alerts",
    preferencesTitle: "System Preferences & Localization",
    preferencesSub: "Customize language, regional display formats, and defaults",
    languageSelect: "Application Language",
    languageDesc: "Choose your preferred language interface for all dashboard modules",
    dateFormat: "Date Display Format",
    superAdmin: "Super Administrator",
    verifiedAccount: "Verified Account",
    profileCompleteness: "Profile Completeness"
  },
  Tamil: {
    accountSettings: "கணக்கு அமைப்புகள்",
    subtitle: "உங்கள் சுயவிவர விவரங்கள், பாதுகாப்பு மற்றும் கணக்கு அமைப்புகளை நிர்வகிக்கவும்",
    saveChanges: "மாற்றங்களைச் சேமிக்கவும்",
    saving: "சேமிக்கப்படுகிறது...",
    editProfile: "சுயவிவரத்தைத் திருத்து",
    cancelEdit: "ரத்து செய்",
    discardChanges: "மீட்டமை",
    savedSuccess: "அமைப்புகள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன!",
    savedError: "அமைப்புகளைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    tabProfile: "சுயவிவரத் தகவல்",
    tabSecurity: "பாதுகாப்பு & உள்நுழைவு",
    tabNotifications: "அறிவிப்புகள்",
    tabPreferences: "முன்னுரிமைகள் & மொழி",
    profileInfo: "தனிப்பட்ட விவரங்கள்",
    profileSub: "டாஷ்போர்டில் காட்டப்படும் உங்கள் தனிப்பட்ட மற்றும் பொது தகவல்",
    profileEditSub: "உங்கள் விவரங்களை கீழே மாற்றி சேமிக்கவும்",
    fullName: "முழு பெயர்",
    email: "மின்னஞ்சல் முகவரி",
    phone: "தொலைபேசி எண்",
    location: "அலுவலகம் / இருப்பிடம்",
    designation: "பதவி / பொறுப்பு",
    bio: "சுயவிவர குறிப்பு (Bio)",
    profilePicture: "சுயவிவரப் படம்",
    uploadImage: "படத்தைப் பதிவேற்றுக",
    removePhoto: "நீக்கு",
    photoHint: "பரிந்துரைக்கப்பட்ட அளவு: 500x500px JPG, PNG அல்லது WebP (அதிகபட்சம் 2MB)",
    choosePhotoSource: "சுயவிவரப் படத்தை மாற்றவும்",
    selectFromGallery: "கேலரியில் இருந்து தேர்ந்தெடுக்கவும்",
    gallerySub: "உங்கள் சாதனத்திலிருந்து ஒரு படத்தைத் தேர்ந்தெடுக்கவும்",
    takePhoto: "புகைப்படம் எடுக்கவும்",
    cameraSub: "புதிய புகைப்படத்தை எடுக்க உங்கள் கேமராவைப் பயன்படுத்தவும்",
    captureBtn: "புகைப்படம் எடு",
    retakeBtn: "மீண்டும் எடு",
    savePhotoBtn: "இப்படத்தைப் பயன்படுத்து",
    cameraErrorMsg: "கேமரா அணுகல் மறுக்கப்பட்டது அல்லது கிடைக்கவில்லை. கேமரா அனுமதிகளை சரிபார்க்கவும்.",
    securityTitle: "கடவுச்சொல் & பாதுகாப்பு",
    securitySub: "உங்கள் கடவுச்சொல்லைப் புதுப்பித்து கூடுதல் பாதுகாப்பை இயக்கவும்",
    changePassword: "கடவுச்சொல்லை மாற்றவும்",
    newPassword: "புதிய கடவுச்சொல்",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    twoFactor: "இரு-காரணி அங்கீகாரம் (2FA)",
    twoFactorDesc: "உங்கள் கணக்கைப் பாதுகாக்க கூடுதல் சரிபார்ப்பு படிநிலையை இயக்கவும்",
    activeSessions: "செயலில் உள்ள சாதனங்கள்",
    activeSessionsDesc: "தற்போது உள்நுழைந்துள்ள சாதனங்களின் பட்டியல்",
    currentDevice: "தற்போதைய சாதனம்",
    notificationsTitle: "அறிவிப்பு விருப்பத்தேர்வுகள்",
    notificationsSub: "கணினி எச்சரிக்கைகள் மற்றும் அறிவிப்புகளை நீங்கள் எவ்வாறு பெற விரும்புகிறீர்கள் என்பதைத் தேர்வுசெய்க",
    emailAlerts: "மின்னஞ்சல் அறிவிப்புகள்",
    emailAlertsDesc: "முக்கிய மாற்றங்கள் மற்றும் அறிக்கைகளை மின்னஞ்சல் மூலம் பெறவும்",
    pushAlerts: "உலாவி புஷ் எச்சரிக்கைகள்",
    pushAlertsDesc: "உலாவியில் உடனடி பாப்அப் எச்சரிக்கைகளைப் பெறவும்",
    weeklyDigest: "வாராந்திர அறிக்கை சுருக்கம்",
    weeklyDigestDesc: "திங்கள்கிழமைகளில் ஊழியர் மாற்றங்களின் வாராந்திர சுருக்கத்தைப் பெறவும்",
    soundAlerts: "அறிவிப்பு ஒலி விளைவுகள்",
    soundAlertsDesc: "புதிய அறிவிப்புகளுக்கு ஒலி சமிக்ஞைகளை இயக்கவும்",
    preferencesTitle: "கணினி முன்னுரிமைகள் & மொழி",
    preferencesSub: "மொழி மற்றும் காட்சி அமைப்புகளைத் தனிப்பயனாக்கவும்",
    languageSelect: "பயன்பாட்டு மொழி",
    languageDesc: "அனைத்து பக்கங்களுக்கும் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்",
    dateFormat: "தேதி வடிவம்",
    superAdmin: "முக்கிய நிர்வாகி",
    verifiedAccount: "சரிபார்க்கப்பட்ட கணக்கு",
    profileCompleteness: "சுயவிவர நிறைவு நிலை"
  },
  Spanish: {
    accountSettings: "Configuración de la cuenta",
    subtitle: "Gestione los detalles de su perfil, seguridad y preferencias del sistema",
    saveChanges: "Guardar cambios",
    saving: "Guardando...",
    editProfile: "Editar perfil",
    cancelEdit: "Cancelar",
    discardChanges: "Restablecer",
    savedSuccess: "¡Configuración actualizada con éxito!",
    savedError: "Error al guardar la configuración. Inténtelo de nuevo.",
    tabProfile: "Información del perfil",
    tabSecurity: "Seguridad y acceso",
    tabNotifications: "Notificaciones",
    tabPreferences: "Preferencias e idioma",
    profileInfo: "Detalles personales",
    profileSub: "Su información personal visible en el panel",
    profileEditSub: "Actualice los detalles de su perfil a continuación",
    fullName: "Nombre completo",
    email: "Correo electrónico",
    phone: "Número de teléfono",
    location: "Ubicación / Oficina",
    designation: "Cargo / Rol",
    bio: "Biografía profesional",
    profilePicture: "Foto de perfil",
    uploadImage: "Subir foto",
    removePhoto: "Eliminar foto",
    photoHint: "Tamaño recomendado: 500x500px JPG, PNG o WebP (Máx 2MB)",
    choosePhotoSource: "Cambiar foto de perfil",
    selectFromGallery: "Seleccionar de la galería",
    gallerySub: "Elige y sube una imagen de tu dispositivo",
    takePhoto: "Tomar una foto",
    cameraSub: "Usa tu cámara web para capturar una foto en vivo",
    captureBtn: "Capturar foto",
    retakeBtn: "Volver a tomar",
    savePhotoBtn: "Usar esta foto",
    cameraErrorMsg: "Acceso a la cámara denegado o no disponible. Permita el acceso en su navegador.",
    securityTitle: "Contraseña y seguridad",
    securitySub: "Actualice su contraseña y configure las opciones de autenticación",
    changePassword: "Cambiar contraseña",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    twoFactor: "Autenticación de dos factores (2FA)",
    twoFactorDesc: "Habilite seguridad adicional en el inicio de sesión",
    activeSessions: "Sesiones activas",
    activeSessionsDesc: "Dispositivos conectados actualmente a esta cuenta",
    currentDevice: "Equipo actual",
    notificationsTitle: "Preferencias de notificaciones",
    notificationsSub: "Elija qué alertas y actualizaciones desea recibir",
    emailAlerts: "Notificaciones por correo",
    emailAlertsDesc: "Reciba actualizaciones críticas por correo electrónico",
    pushAlerts: "Alertas push en navegador",
    pushAlertsDesc: "Reciba ventanas emergentes mientras usa el panel",
    weeklyDigest: "Resumen semanal",
    weeklyDigestDesc: "Reciba un informe consolidado de actividad cada lunes",
    soundAlerts: "Sonidos de alerta",
    soundAlertsDesc: "Reproducir sonidos para nuevas notificaciones",
    preferencesTitle: "Preferencias del sistema",
    preferencesSub: "Personalice el idioma y formatos de visualización",
    languageSelect: "Idioma de la aplicación",
    languageDesc: "Seleccione el idioma principal para toda la plataforma",
    dateFormat: "Formato de fecha",
    superAdmin: "Super Administrador",
    verifiedAccount: "Cuenta Verificada",
    profileCompleteness: "Nivel de perfil completado"
  }
};

const Settings = () => {
  const { language: currentLang, changeLanguage } = useLanguage();
  const t = translations[currentLang] || translations.English;

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
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

  // Profile Form State
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    designation: 'Lead Administrator',
    bio: '',
    avatar: '',
  });

  const [originalProfile, setOriginalProfile] = useState(null);

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
        const initialData = {
          username: storedUser.username || storedUser.name || 'poovarasansambath',
          email: storedUser.email || 'poovarasansambath1345@gmail.com',
          phone: storedUser.phone || '+91 8072672917',
          location: storedUser.location || 'Bangalore, India',
          designation: storedUser.designation || 'Lead Administrator',
          bio: storedUser.bio || 'Managing employee directory, access control, and operational metrics across departments.',
          avatar: storedUser.avatar || storedUser.profilePic || storedUser.profileImage || '',
        };
        setProfile(initialData);
        setOriginalProfile(initialData);
      } catch (err) {
        console.error('Failed to load settings data:', err);
      }
    };
    fetchUserData();

    return () => {
      stopCamera();
    };
  }, []);

  // Calculate Profile Completeness Percentage
  const calculateCompleteness = () => {
    let score = 0;
    if (profile.username && profile.username.trim()) score += 20;
    if (profile.email && profile.email.trim()) score += 20;
    if (profile.phone && profile.phone.trim()) score += 20;
    if (profile.location && profile.location.trim()) score += 15;
    if (profile.avatar) score += 15;
    if (profile.bio && profile.bio.trim()) score += 10;
    return score;
  };

  const completeness = calculateCompleteness();

  // Password Strength Calculator (0 to 3)
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 1;
    if (pass.length >= 6) score = 2;
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) score = 3;
    return score;
  };

  const passStrength = getPasswordStrength(passwords.newPassword);

  const handleProfileChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

  // Attach stream when video element is mounted
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

    // Mirror image to match live preview
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

  // 3. REMOVE AVATAR
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

  const handleReset = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setPasswords({ newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setIsEditing(false);
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
        profileImage: profile.avatar,
        profilePic: profile.avatar
      };
      localStorage.setItem('user', JSON.stringify(newUserObj));
      window.dispatchEvent(new Event('user-updated'));

      setPasswords({ newPassword: '', confirmPassword: '' });
      setOriginalProfile(profile);
      setIsEditing(false);
      
      // Log activity in background
      logActivity('PROFILE', 'Profile Updated', 'Your profile information and settings were updated successfully');

      setMessageBox({ isOpen: true, type: 'success', text: t.savedSuccess });
    } catch (error) {
      console.error('Failed to update settings:', error);
      setMessageBox({ isOpen: true, type: 'error', text: t.savedError });
    } finally {
      setLoading(false);
    }
  };

  const userInitial = profile.username ? profile.username.charAt(0).toUpperCase() : 'A';

  return (
    <div className="settings-page">
      {/* Hidden File Input for Gallery / Device Upload */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleFileUpload} 
        style={{ display: 'none' }} 
      />

      {/* 1. Modal: Choose Photo Source (Gallery vs Live Camera) */}
      {isAvatarPickerOpen && (
        <div className="settings-modal-backdrop" onClick={() => setIsAvatarPickerOpen(false)}>
          <div className="avatar-source-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-modal-header">
              <h3>{t.choosePhotoSource}</h3>
              <button 
                type="button" 
                className="avatar-modal-close-btn" 
                onClick={() => setIsAvatarPickerOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="avatar-options-grid">
              {/* Option 1: Select from Gallery */}
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

              {/* Option 2: Take a Photo (Live Camera) */}
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

              {/* Option 3: Remove current photo (if avatar exists) */}
              {profile.avatar && (
                <button 
                  type="button" 
                  className="avatar-option-btn" 
                  onClick={handleRemoveAvatar}
                >
                  <div className="avatar-option-icon remove">
                    <Trash2 size={24} />
                  </div>
                  <div className="avatar-option-texts">
                    <h4>{t.removePhoto}</h4>
                    <p>Remove custom profile picture and use initials</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Live Camera Viewfinder & Snapshot */}
      {isCameraOpen && (
        <div className="settings-modal-backdrop" onClick={closeCameraModal}>
          <div className="avatar-source-modal-window" style={{ maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="avatar-modal-header">
              <h3>{capturedPhoto ? 'Review Snapshot' : t.takePhoto}</h3>
              <button 
                type="button" 
                className="avatar-modal-close-btn" 
                onClick={closeCameraModal}
                title="Close Camera"
              >
                <X size={18} />
              </button>
            </div>

            {cameraError ? (
              <div style={{ padding: '24px 12px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <AlertCircle size={28} />
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

      {/* Modal Dialog for Save Status */}
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

      {/* Hero Profile Banner */}
      <div className="settings-hero-card">
        <div className="settings-hero-main">
          <div className="settings-hero-profile-wrap">
            <div className="settings-hero-avatar-wrap">
              <div 
                style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                onClick={() => setIsAvatarPickerOpen(true)}
                title="Click to Change Photo (Gallery or Camera)"
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.username} className="settings-hero-avatar" />
                ) : (
                  <div className="settings-hero-avatar-placeholder">
                    {userInitial}
                  </div>
                )}
              </div>
              <span className="settings-hero-status-dot" title="Online Admin" />
              <button 
                type="button"
                className="settings-hero-avatar-btn" 
                onClick={() => setIsAvatarPickerOpen(true)}
                title="Change Photo (Select from Gallery or Take Photo)"
              >
                <Camera size={15} />
              </button>
            </div>

            <div className="settings-hero-info">
              <h1 className="settings-hero-name">
                {profile.username || 'System User'}
              </h1>
              <div className="settings-hero-pills">
                <span className="settings-badge-pill settings-badge-admin">
                  <Sparkles size={13} />
                  <span>{t.superAdmin}</span>
                </span>
                <span className="settings-badge-pill settings-badge-email">
                  <ShieldCheck size={13} />
                  <span>{profile.email}</span>
                </span>
                {profile.location && (
                  <span className="settings-badge-pill settings-badge-location">
                    <MapPin size={13} />
                    <span>{profile.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Hero Actions: Edit Profile Toggle / Save & Cancel */}
          <div className="settings-hero-actions">
            {!isEditing ? (
              <button 
                type="button" 
                onClick={() => {
                  setActiveTab('profile');
                  setIsEditing(true);
                }} 
                className="btn-hero-save"
                title="Edit profile details"
              >
                <Edit3 size={15} />
                <span>{t.editProfile}</span>
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={handleReset} 
                  className="btn-hero-reset"
                  title="Cancel editing"
                >
                  <X size={15} />
                  <span>{t.cancelEdit}</span>
                </button>
                <button 
                  type="button" 
                  onClick={handleSave} 
                  className="btn-hero-save" 
                  disabled={loading}
                >
                  <Save size={16} />
                  <span>{loading ? t.saving : t.saveChanges}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Completeness Meter */}
        <div className="profile-completeness-bar">
          <div className="completeness-header">
            <span className="completeness-title">
              <UserCheck size={14} />
              <span>{t.profileCompleteness}</span>
            </span>
            <span className="completeness-score">{completeness}%</span>
          </div>
          <div className="completeness-track">
            <div className="completeness-fill" style={{ width: `${completeness}%` }} />
          </div>
          <div className="completeness-steps">
            <span className={`completeness-step-chip ${profile.username ? 'completeness-step-done' : 'completeness-step-pending'}`}>
              {profile.username ? '✓' : '○'} Full Name
            </span>
            <span className={`completeness-step-chip ${profile.email ? 'completeness-step-done' : 'completeness-step-pending'}`}>
              {profile.email ? '✓' : '○'} Email Address
            </span>
            <span className={`completeness-step-chip ${profile.avatar ? 'completeness-step-done' : 'completeness-step-pending'}`}>
              {profile.avatar ? '✓' : '○'} Profile Photo
            </span>
            <span className={`completeness-step-chip ${profile.phone ? 'completeness-step-done' : 'completeness-step-pending'}`}>
              {profile.phone ? '✓' : '○'} Phone Number
            </span>
            <span className={`completeness-step-chip ${profile.location ? 'completeness-step-done' : 'completeness-step-pending'}`}>
              {profile.location ? '✓' : '○'} Location
            </span>
            <span className={`completeness-step-chip ${profile.bio ? 'completeness-step-done' : 'completeness-step-pending'}`}>
              {profile.bio ? '✓' : '○'} Bio Note
            </span>
          </div>
        </div>
      </div>

      {/* Modern Segmented Tab Bar */}
      <div className="settings-tabs-nav">
        {[
          { id: 'profile', label: t.tabProfile, icon: User },
          { id: 'security', label: t.tabSecurity, icon: Shield },
          { id: 'notifications', label: t.tabNotifications, icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`settings-tab-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Card */}
      <div className="settings-card">
        
        {/* TAB 1: PROFILE INFORMATION */}
        {activeTab === 'profile' && (
          <div>
            <div className="settings-card-header">
              <div className="settings-card-title-wrap">
                <div className="settings-card-icon-badge">
                  <User size={22} />
                </div>
                <div>
                  <h2>{t.profileInfo}</h2>
                  <p>{isEditing ? t.profileEditSub : t.profileSub}</p>
                </div>
              </div>
            </div>

            {/* 1. READ-ONLY SUMMARY VIEW (WHEN NOT EDITING) */}
            {!isEditing ? (
              <div>
                <div className="profile-view-grid">
                  {/* Full Name */}
                  <div className="profile-view-item">
                    <div className="profile-view-icon">
                      <User size={18} />
                    </div>
                    <div className="profile-view-content">
                      <div className="profile-view-label">{t.fullName}</div>
                      <div className="profile-view-value">{profile.username || 'Not specified'}</div>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="profile-view-item">
                    <div className="profile-view-icon">
                      <Mail size={18} />
                    </div>
                    <div className="profile-view-content">
                      <div className="profile-view-label">{t.email}</div>
                      <div className="profile-view-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{profile.email}</span>
                        <span className="settings-badge-pill settings-badge-admin" style={{ fontSize: '10.5px', padding: '1px 6px' }}>
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="profile-view-item">
                    <div className="profile-view-icon">
                      <Phone size={18} />
                    </div>
                    <div className="profile-view-content">
                      <div className="profile-view-label">{t.phone}</div>
                      <div className="profile-view-value">{profile.phone || 'Not specified'}</div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="profile-view-item">
                    <div className="profile-view-icon">
                      <MapPin size={18} />
                    </div>
                    <div className="profile-view-content">
                      <div className="profile-view-label">{t.location}</div>
                      <div className="profile-view-value">{profile.location || 'Not specified'}</div>
                    </div>
                  </div>

                  {/* Designation */}
                  <div className="profile-view-item full-width">
                    <div className="profile-view-icon">
                      <Briefcase size={18} />
                    </div>
                    <div className="profile-view-content">
                      <div className="profile-view-label">{t.designation}</div>
                      <div className="profile-view-value">{profile.designation || 'Lead Administrator'}</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="profile-view-item full-width">
                    <div className="profile-view-icon">
                      <FileText size={18} />
                    </div>
                    <div className="profile-view-content">
                      <div className="profile-view-label">{t.bio}</div>
                      <div className="profile-view-bio">{profile.bio || 'No bio information added yet.'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 2. EDITABLE FORM VIEW (ONLY WHEN EDIT PROFILE IS CLICKED) */
              <form onSubmit={handleSave}>
                <div className="settings-form-grid">
                  {/* Full Name */}
                  <div className="settings-field-group">
                    <label className="settings-label">
                      <span>{t.fullName} *</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <User size={18} className="settings-input-icon" />
                      <input
                        type="text"
                        name="username"
                        value={profile.username}
                        onChange={handleProfileChange}
                        placeholder="e.g. Poovarasan Sambath"
                        className="settings-input"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Email (Read-Only) */}
                  <div className="settings-field-group">
                    <label className="settings-label">
                      <span>{t.email}</span>
                      <span className="settings-label-badge">{t.verifiedAccount}</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <Mail size={18} className="settings-input-icon" />
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        disabled
                        className="settings-input"
                      />
                    </div>
                    <span className="field-helper-text">
                      <span>Linked with your primary administrative login</span>
                    </span>
                  </div>

                  {/* Phone Number */}
                  <div className="settings-field-group">
                    <label className="settings-label">
                      <span>{t.phone}</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <Phone size={18} className="settings-input-icon" />
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        placeholder="+91 80726 72917"
                        className="settings-input"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="settings-field-group">
                    <label className="settings-label">
                      <span>{t.location}</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <MapPin size={18} className="settings-input-icon" />
                      <input
                        type="text"
                        name="location"
                        value={profile.location}
                        onChange={handleProfileChange}
                        placeholder="e.g. Bangalore, Karnataka"
                        className="settings-input"
                      />
                    </div>
                  </div>

                  {/* Designation / Role */}
                  <div className="settings-field-group full-width">
                    <label className="settings-label">
                      <span>{t.designation}</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <Sparkles size={18} className="settings-input-icon" />
                      <input
                        type="text"
                        name="designation"
                        value={profile.designation}
                        onChange={handleProfileChange}
                        placeholder="e.g. Lead Operations Administrator"
                        className="settings-input"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="settings-field-group full-width">
                    <label className="settings-label">
                      <span>{t.bio}</span>
                      <span className="settings-label-badge">{profile.bio.length}/300</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <FileText size={18} className="settings-input-icon" style={{ top: '16px' }} />
                      <textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleProfileChange}
                        placeholder="Brief description of your role and responsibilities..."
                        maxLength={300}
                        className="settings-textarea"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
                  <button 
                    type="button" 
                    className="btn-camera-secondary"
                    onClick={handleReset}
                  >
                    <X size={15} />
                    <span>{t.cancelEdit}</span>
                  </button>
                  <button 
                    type="submit" 
                    className="btn-camera-primary"
                    disabled={loading}
                  >
                    <Save size={15} />
                    <span>{loading ? t.saving : t.saveChanges}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: SECURITY & PASSWORDS */}
        {activeTab === 'security' && (
          <div>
            <div className="settings-card-header">
              <div className="settings-card-title-wrap">
                <div className="settings-card-icon-badge">
                  <Shield size={22} />
                </div>
                <div>
                  <h2>{t.securityTitle}</h2>
                  <p>{t.securitySub}</p>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="security-group-card">
              <div className="security-group-header">
                <div className="security-group-title">
                  <KeyRound size={18} color="#111111" />
                  <div>
                    <h3>{t.changePassword}</h3>
                    <p>Enter a strong password to protect your admin access</p>
                  </div>
                </div>
              </div>

              <div className="settings-form-grid">
                {/* New Password */}
                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>{t.newPassword}</span>
                  </label>
                  <div className="settings-input-wrapper">
                    <Lock size={18} className="settings-input-icon" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className="settings-input"
                    />
                    <button 
                      type="button" 
                      className="settings-password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {passwords.newPassword && (
                    <div className="password-strength-wrap">
                      <div className="password-strength-bars">
                        <div className={`password-strength-segment ${passStrength >= 1 ? 'active-weak' : ''}`} />
                        <div className={`password-strength-segment ${passStrength >= 2 ? 'active-medium' : ''}`} />
                        <div className={`password-strength-segment ${passStrength >= 3 ? 'active-strong' : ''}`} />
                      </div>
                      <div className="password-strength-info">
                        <span>Strength:</span>
                        <strong style={{ 
                          color: passStrength === 1 ? '#ef4444' : passStrength === 2 ? '#f59e0b' : '#10b981' 
                        }}>
                          {passStrength === 1 ? 'Weak' : passStrength === 2 ? 'Good' : 'Strong'}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>{t.confirmPassword}</span>
                  </label>
                  <div className="settings-input-wrapper">
                    <Lock size={18} className="settings-input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="settings-input"
                    />
                    <button 
                      type="button" 
                      className="settings-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <p style={{ color: '#dc2626', fontSize: '12.5px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            {/* Two-Factor Authentication Card */}
            <div className="security-group-card">
              <div className="security-group-header" style={{ marginBottom: 0 }}>
                <div className="security-group-title">
                  <ShieldCheck size={20} color="#10b981" />
                  <div>
                    <h3>{t.twoFactor}</h3>
                    <p>{t.twoFactorDesc}</p>
                  </div>
                </div>
                <label className="settings-switch-label">
                  <input 
                    type="checkbox" 
                    checked={security.twoFactorAuth} 
                    onChange={handleSecurityToggle} 
                  />
                  <span className="settings-switch-slider" />
                </label>
              </div>
            </div>

            {/* Active Sessions Info */}
            <div className="security-group-card">
              <div className="security-group-header">
                <div className="security-group-title">
                  <Laptop size={18} color="#111111" />
                  <div>
                    <h3>{t.activeSessions}</h3>
                    <p>{t.activeSessionsDesc}</p>
                  </div>
                </div>
              </div>

              <div className="session-info-box">
                <div className="session-info-left">
                  <Laptop size={20} className="session-icon" />
                  <div>
                    <div className="session-name">Windows PC • Google Chrome</div>
                    <div className="session-meta">Bangalore, India • Current active session</div>
                  </div>
                </div>
                <span className="session-status-badge">Active Now</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div>
            <div className="settings-card-header">
              <div className="settings-card-title-wrap">
                <div className="settings-card-icon-badge">
                  <Bell size={22} />
                </div>
                <div>
                  <h2>{t.notificationsTitle}</h2>
                  <p>{t.notificationsSub}</p>
                </div>
              </div>
            </div>

            <div className="notification-items-list">
              {[
                { 
                  key: 'emailAlerts', 
                  title: t.emailAlerts, 
                  desc: t.emailAlertsDesc,
                  icon: Mail 
                },
                { 
                  key: 'pushNotifications', 
                  title: t.pushAlerts, 
                  desc: t.pushAlertsDesc,
                  icon: BellRing 
                },
                { 
                  key: 'weeklyReport', 
                  title: t.weeklyDigest, 
                  desc: t.weeklyDigestDesc,
                  icon: FileText 
                },
                { 
                  key: 'soundAlerts', 
                  title: t.soundAlerts, 
                  desc: t.soundAlertsDesc,
                  icon: Sparkles 
                }
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.key} className="notification-item-row">
                    <div className="notification-item-text">
                      <div className="notification-item-icon">
                        <ItemIcon size={18} />
                      </div>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                    <label className="settings-switch-label">
                      <input 
                        type="checkbox" 
                        checked={Boolean(notifications[item.key])} 
                        onChange={() => handleNotificationToggle(item.key)} 
                      />
                      <span className="settings-switch-slider" />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define translations here so they are globally available
export const translations = {
  English: {
    dashboard: "Dashboard",
    settings: "Settings",
    profile: "Profile",
    accountSettings: "Account Settings",
    subtitle: "Manage your profile details and settings",
    saveChanges: "Save Changes",
    saving: "Saving...",
    savedSuccess: "Settings saved successfully!",
    savedError: "Failed to save settings. Please try again.",
    tabProfile: "Profile",
    tabSecurity: "Security",
    tabNotifications: "Notifications",
    tabPreferences: "Preferences",
    profileInfo: "Profile Information",
    profileSub: "Update your personal details below",
    fullName: "Full Name",
    email: "Email Address (Read-Only)",
    phone: "Phone Number",
    location: "Location",
    securityTitle: "Security Settings",
    securitySub: "Update your password and manage security options",
    changePassword: "Change Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    twoFactor: "Two-Factor Authentication",
    twoFactorDesc: "Enable extra login security",
    notificationsTitle: "Notifications",
    notificationsSub: "Choose what updates you want to receive",
    emailAlerts: "Email Notifications",
    emailAlertsDesc: "Receive updates via email",
    pushAlerts: "Push Alerts",
    pushAlertsDesc: "Receive popups in browser",
    weeklyDigest: "Weekly Digest",
    weeklyDigestDesc: "Receive weekly activity reports",
    preferencesTitle: "Preferences",
    preferencesSub: "Customize application settings",
    language: "Language"
  },
  Tamil: {
    dashboard: "டாஷ்போர்டு",
    settings: "அமைப்புகள்",
    profile: "சுயவிவரம்",
    accountSettings: "கணக்கு அமைப்புகள்",
    subtitle: "உங்கள் சுயவிவர விவரங்கள் மற்றும் அமைப்புகளை நிர்வகிக்கவும்",
    saveChanges: "மாற்றங்களைச் சேமிக்கவும்",
    saving: "சேமிக்கப்படுகிறது...",
    savedSuccess: "அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!",
    savedError: "அமைப்புகளைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    tabProfile: "சுயவிவரம்",
    tabSecurity: "பாதுகாப்பு",
    tabNotifications: "அறிவிப்புகள்",
    tabPreferences: "முன்னுரிமைகள்",
    profileInfo: "சுயவிவரத் தகவல்",
    profileSub: "உங்கள் தனிப்பட்ட விவரங்களை கீழே புதுப்பிக்கவும்",
    fullName: "முழு பெயர்",
    email: "மின்னஞ்சல் முகவரி (படிக்க மட்டும்)",
    phone: "தொலைபேசி எண்",
    location: "இருப்பிடம்",
    securityTitle: "பாதுகாப்பு அமைப்புகள்",
    securitySub: "உங்கள் கடவுச்சொல்லைப் புதுப்பித்து பாதுகாப்பை நிர்வகிக்கவும்",
    changePassword: "கடவுச்சொல்லை மாற்றவும்",
    newPassword: "புதிய கடவுச்சொல்",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    twoFactor: "இரு-காரணி அங்கீகாரம்",
    twoFactorDesc: "கூடுதல் உள்நுழைவு பாதுகாப்பை இயக்கவும்",
    notificationsTitle: "அறிவிப்புகள்",
    notificationsSub: "நீங்கள் பெற விரும்பும் புதுப்பிப்புகளைத் தேர்ந்தெடுக்கவும்",
    emailAlerts: "மின்னஞ்சல் அறிவிப்புகள்",
    emailAlertsDesc: "மின்னஞ்சல் வழியாக புதுப்பிப்புகளைப் பெறவும்",
    pushAlerts: "புஷ் எச்சரிக்கைகள்",
    pushAlertsDesc: "உலாவி மூலம் அறிவிப்புகளைப் பெறவும்",
    weeklyDigest: "வாராந்திர அறிக்கை",
    weeklyDigestDesc: "வாராந்திர செயல்பாட்டு அறிக்கைகளைப் பெறவும்",
    preferencesTitle: "முன்னுரிமைகள்",
    preferencesSub: "பயன்பாட்டு அமைப்புகளைத் தனிப்பயனாக்கவும்",
    language: "மொழி"
  },
  Spanish: {
    dashboard: "Panel de control",
    settings: "Ajustes",
    profile: "Perfil",
    accountSettings: "Configuración de la cuenta",
    subtitle: "Gestione los detalles de su perfil y configuración",
    saveChanges: "Guardar cambios",
    saving: "Guardando...",
    savedSuccess: "¡Configuración guardada con éxito!",
    savedError: "Error al guardar la configuración. Inténtelo de nuevo.",
    tabProfile: "Perfil",
    tabSecurity: "Seguridad",
    tabNotifications: "Notificaciones",
    tabPreferences: "Preferencias",
    profileInfo: "Información del perfil",
    profileSub: "Actualice sus datos personales a continuación",
    fullName: "Nombre completo",
    email: "Correo electrónico (Solo lectura)",
    phone: "Número de teléfono",
    location: "Ubicación",
    securityTitle: "Configuración de seguridad",
    securitySub: "Actualice su contraseña y gestione las opciones de seguridad",
    changePassword: "Cambiar contraseña",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    twoFactor: "Autenticación de dos factores",
    twoFactorDesc: "Habilitar seguridad de inicio de sesión adicional",
    notificationsTitle: "Notificaciones",
    notificationsSub: "Elija las actualizaciones que desea recibir",
    emailAlerts: "Notificaciones por correo",
    emailAlertsDesc: "Recibir actualizaciones por correo electrónico",
    pushAlerts: "Alertas push",
    pushAlertsDesc: "Recibir ventanas emergentes en el navegador",
    weeklyDigest: "Resumen semanal",
    weeklyDigestDesc: "Recibir informes de actividad semanales",
    preferencesTitle: "Preferencias",
    preferencesSub: "Personalizar la configuración de la aplicación",
    language: "Idioma"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'English';
  });

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('appLanguage', newLang);
  };

  const t = translations[language] || translations.English;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
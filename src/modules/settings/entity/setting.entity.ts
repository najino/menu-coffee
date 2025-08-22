export interface SiteSettings {
  _id?: string;

  // Site Identity
  siteName?: string; // نام سایت
  siteDescription?: string; // توضیحات سایت
  siteTitle?: string; // عنوان صفحه اصلی

  // Hero Banner (عکس بنر اصلی سایت)
  heroBanner: {
    image: string; // تصویر بنر اصلی
    title?: string; // عنوان بنر
    subtitle?: string; // زیرعنوان بنر
    buttonText?: string; // متن دکمه (اختیاری)
    buttonLink?: string; // لینک دکمه (اختیاری)
  };

  // Color Palette (پلت رنگی سایت)
  colorPalette: {
    primaryColor: string; // رنگ اصلی سایت
    textColor: string; // رنگ متن اصلی
    backgroundColor?: string; // رنگ پس‌زمینه
    surfaceColor?: string; // رنگ سطح (کارت‌ها، باکس‌ها)
    borderColor?: string; // رنگ بوردر
    successColor?: string; // رنگ موفقیت
    warningColor?: string; // رنگ هشدار
    errorColor?: string; // رنگ خطا
  };

  // Branding & Logos
  branding: {
    siteLogo: string; // لوگوی اصلی سایت
    adminLogo: string; // لوگوی پنل ادمین
    favicon?: string; // فاویکون سایت
    logoAltText?: string; // متن جایگزین لوگو
  };

  // Contact Information
  contactInfo: {
    email: string; // ایمیل تماس
    phone: string; // شماره تماس
    address: string; // آدرس
    workingHours: string; // ساعات کاری
    mapLocation?: {
      lat: number;
      lng: number;
    }; // موقعیت روی نقشه (اختیاری)
  };

  // Social Media Links
  socialMedia?: {
    instagram?: string; // اینستاگرام
    telegram?: string; // تلگرام
    whatsapp?: string; // واتساپ
    linkedin?: string; // لینکدین
    twitter?: string; // توییتر
    facebook?: string; // فیسبوک
    website?: string; // وبسایت
  };

  createdAt: Date;
  updatedAt: Date;
}

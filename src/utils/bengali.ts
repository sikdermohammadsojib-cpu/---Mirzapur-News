// Utility functions for authentic Bengali date, number, and time formatting

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toBengaliNumber(num: number | string): string {
  if (num === undefined || num === null) return '০';
  const str = num.toString();
  return str.replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

export function toEnglishNumber(str: string): string {
  if (!str) return '0';
  let result = str;
  bengaliDigits.forEach((bnDigit, index) => {
    result = result.split(bnDigit).join(englishDigits[index]);
  });
  return result;
}

const bnMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const bnDays = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
];

function parseValidDate(dateInput?: string | Date | number | null): Date | null {
  if (dateInput === undefined || dateInput === null || dateInput === '') return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  try {
    const parsed = new Date(dateInput);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

export function formatBengaliDate(dateInput?: string | Date | number | null, includeTime = false): string {
  const date = parseValidDate(dateInput);
  if (!date) return '';

  const dayOfWeek = bnDays[date.getDay()];
  const day = toBengaliNumber(date.getDate());
  const month = bnMonths[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());

  let result = `${dayOfWeek}, ${day} ${month} ${year}`;

  if (includeTime) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 6 ? 'রাত' : hours < 12 ? 'সকাল' : hours < 15 ? 'দুপুর' : hours < 18 ? 'বিকাল' : hours < 20 ? 'সন্ধ্যা' : 'রাত';
    
    hours = hours % 12;
    if (hours === 0) hours = 12;

    const formattedMinutes = minutes < 10 ? `০${toBengaliNumber(minutes)}` : toBengaliNumber(minutes);
    result += `, ${period} ${toBengaliNumber(hours)}:${formattedMinutes}`;
  }

  return result;
}

export function formatTimeAgoBengali(dateInput?: string | Date | number | null): string {
  const date = parseValidDate(dateInput);
  if (!date) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'এইমাত্র';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${toBengaliNumber(diffInMinutes)} মিনিট আগে`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${toBengaliNumber(diffInHours)} ঘণ্টা আগে`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${toBengaliNumber(diffInDays)} দিন আগে`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${toBengaliNumber(diffInMonths)} মাস আগে`;
  }
  const diffInYears = Math.floor(diffInDays / 365);
  return `${toBengaliNumber(diffInYears)} বছর আগে`;
}

export function generateBengaliSlug(title: string): string {
  // Cleans title, transliterates common terms or creates a clean URL-friendly identifier
  const clean = title
    .trim()
    .toLowerCase()
    .replace(/[^\u0980-\u09FFa-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return clean || `post-${Date.now()}`;
}

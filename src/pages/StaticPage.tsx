import React from 'react';
import { Mail, Phone, MapPin, Shield, FileText, Info } from 'lucide-react';
import { SiteSettings } from '../types/news';

interface StaticPageProps {
  page: 'about' | 'privacy' | 'terms' | 'contact';
  siteSettings: SiteSettings;
  onNavigateHome: () => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({
  page,
  siteSettings,
  onNavigateHome,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs">
        
        <button 
          onClick={onNavigateHome}
          className="text-xs font-semibold text-[#990000] hover:underline mb-6 block"
        >
          &larr; প্রচ্ছদে ফিরে যান
        </button>

        {page === 'about' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <Info className="w-8 h-8 text-[#990000]" />
              <h1 className="text-3xl font-black font-editorial text-gray-900">আমাদের সম্পর্কে</h1>
            </div>
            <div className="prose text-gray-700 leading-relaxed space-y-4">
              <p>
                <strong>{siteSettings.siteTitle}</strong> টাঙ্গাইল জেলার ঐতিহ্যবাহী মির্জাপুর উপজেলা ও সমগ্র বাংলাদেশের মানুষের কণ্ঠস্বর। সত্যনিষ্ঠ, নির্ভীক ও নিরপেক্ষ সাংবাদিকতার নীতি নিয়ে আমাদের এই পথচলা।
              </p>
              <p>
                আমরা কোনো বিশেষ রাজনৈতিক দল বা বাণিজ্যিক গোষ্ঠীর তোষামোদ না করে কেবল মানুষের কথা, তৃণমূলের বঞ্চনা, উন্নয়ন এবং অগ্রযাত্রার সংবাদ সবার সামনে তুলে ধরি।
              </p>
              <h3 className="text-xl font-bold font-editorial text-gray-900 pt-4">সম্পাদকীয় অঙ্গীকার</h3>
              <p>
                ডিজিটাল প্ল্যাটফর্মে গুজব ও অসত্য সংবাদের বিপরীতে যাচাইকৃত এবং দায়িত্বশীল সাংবাদিকতা নিশ্চিত করাই আমাদের প্রথম অঙ্গীকার।
              </p>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm">
                <div><strong>ভারপ্রাপ্ত সম্পাদক:</strong> {siteSettings.editorName}</div>
                <div><strong>প্রকাশক সংস্থা:</strong> {siteSettings.publisherName}</div>
                <div><strong>কার্যালয়:</strong> {siteSettings.contactAddress}</div>
              </div>
            </div>
          </div>
        )}

        {page === 'privacy' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <Shield className="w-8 h-8 text-[#990000]" />
              <h1 className="text-3xl font-black font-editorial text-gray-900">গোপনীয়তা নীতি (Privacy Policy)</h1>
            </div>
            <div className="prose text-gray-700 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>{siteSettings.siteTitle}</strong> এর পাঠকদের গোপনীয়তার সুরক্ষা আমাদের কাছে অত্যন্ত মূল্যবান। এই নীতিমালায় কীভাবে তথ্য সংগ্রহ ও সংরক্ষণ করা হয় তা ব্যাখ্যা করা হলো।
              </p>
              <h3 className="font-bold text-gray-900">১. ব্যক্তিগত তথ্য সংগ্রহ</h3>
              <p>
                সাধারণ পাঠক হিসেবে সংবাদ পাঠের জন্য কোনো প্রকার ব্যক্তিগত পরিচয় বা ফোন নম্বর প্রদানের প্রয়োজন নেই। মন্তব্য প্রদান বা সংবাদ অনুসন্ধানের সময় স্বেচ্ছায় প্রদত্ত নাম ও তথ্য নিরাপদ সার্ভারে সংরক্ষিত থাকে।
              </p>
              <h3 className="font-bold text-gray-900">২. কুকিজ ও অ্যানালিটিক্স</h3>
              <p>
                ব্যবহারকারীর ব্রাউজিং অভিজ্ঞতা উন্নত করতে এবং সর্বাধিক পঠিত সংবাদ শনাক্ত করতে আমরা স্ট্যান্ডার্ড অ্যানালিটিক্যাল কুকিজ ব্যবহার করি।
              </p>
              <h3 className="font-bold text-gray-900">৩. বিজ্ঞাপন প্রদর্শন</h3>
              <p>
                আমাদের সাইটে বিজ্ঞাপন প্রদর্শনকারী অংশীদাররা প্রাসঙ্গিক বিজ্ঞাপন প্রদর্শনের জন্য নিরাপদ কুকিজ ব্যবহার করতে পারে। কোনো অননুমোদিত তৃতীয় পক্ষের কাছে পাঠকের তথ্য বিক্রি করা হয় না।
              </p>
            </div>
          </div>
        )}

        {page === 'terms' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <FileText className="w-8 h-8 text-[#990000]" />
              <h1 className="text-3xl font-black font-editorial text-gray-900">ব্যবহারের শর্তাবলী (Terms of Service)</h1>
            </div>
            <div className="prose text-gray-700 leading-relaxed space-y-4 text-sm sm:text-base">
              <h3 className="font-bold text-gray-900">১. বুদ্ধিবৃত্তিক সম্পত্তি ও কপিরাইট</h3>
              <p>
                {siteSettings.siteTitle}-এ প্রকাশিত সকল সংবাদ, ছবি, ভিডিও ও নিবন্ধের স্বত্বাধিকারী এই পোর্টাল। লিখিত অনুমতি ব্যতিরেকে বাণিজ্যিকভাবে হুবহু পুনর্প্রকাশ নিষিদ্ধ। তবে সঠিক ক্রেডিট ও সরাসরি লিংক সংযুক্ত করে আংশিক উদ্ধৃতি ব্যবহার করা যাবে।
              </p>
              <h3 className="font-bold text-gray-900">২. পাঠকদের মন্তব্য</h3>
              <p>
                মন্তব্যের ঘরে অশালীন, ধর্মীয় অনুভূতিতে আঘাতকারী, উস্কানিমূলক বা বেআইনি কোনো বক্তব্য প্রকাশ করা শাস্তিযোগ্য অপরাধ। সম্পাদকীয় কর্তৃপক্ষ যে কোনো আপত্তিকর মন্তব্য অপসারণের পূর্ণ অধিকার সংরক্ষণ করে।
              </p>
            </div>
          </div>
        )}

        {page === 'contact' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <Phone className="w-8 h-8 text-[#990000]" />
              <h1 className="text-3xl font-black font-editorial text-gray-900">বিজ্ঞাপন ও যোগাযোগ</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-4">
                <h3 className="font-bold text-base text-gray-900">সম্পাদকীয় বিভাগ ও সংবাদ প্রেরণ</h3>
                <p className="text-gray-600">
                  আপনার এলাকার সংবাদ, ছবি বা প্রেস বিজ্ঞপ্তি পাঠাতে সরাসরি যোগাযোগ করুন:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#990000]" />
                    <span className="font-sans font-medium">{siteSettings.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#990000]" />
                    <span className="font-sans font-medium">{siteSettings.contactEmail}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#990000] shrink-0 mt-1" />
                    <span>{siteSettings.contactAddress}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50/60 p-6 rounded-xl border border-red-100 space-y-3">
                <h3 className="font-bold text-base text-red-950">বিজ্ঞাপন রেট ও প্রচার</h3>
                <p className="text-xs text-red-800 leading-relaxed">
                  মির্জাপুর, টাঙ্গাইল ও প্রবাসী বাংলাদেশিদের কাছে আপনার ব্র্যান্ড, পণ্য বা প্রতিষ্ঠানের প্রচারের জন্য সেরা মাধ্যম মির্জাপুর নিউজ।
                </p>
                <ul className="text-xs text-red-900 space-y-1.5 list-disc pl-4">
                  <li>শীর্ষ ব্যানার (Header Banner 970x120)</li>
                  <li>সাইডবার ডিসপ্লে ব্যানার (Sidebar Banner 336x280)</li>
                  <li>প্রতিবেদনের অভ্যন্তরে ইন-আর্টিকেল ব্যানার</li>
                  <li>বিশেষ স্পন্সরড স্টোরি ও ভিডিও ফিচার</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export type Locale = 'th' | 'en';

const STORAGE_KEY = 'welaa-language';

// A lightweight translation layer for the existing UI. Keeping the source UI in
// Thai lets us add English without rewriting booking/auth flows or stored data.
const en: Record<string, string> = {
  'เมนูหลัก': 'Main menu',
  'เปิดเมนูบัญชี': 'Open account menu',
  'เมนูบัญชี': 'Account menu',
  'ค้นหาพื้นที่': 'Find a space',
  'หมวดหมู่': 'Categories',
  'วิธีใช้งาน': 'How it works',
  'เข้าสู่ระบบ': 'Log in',
  'สมัครสมาชิก': 'Sign up',
  'เข้าสู่ระบบ/สมัครสมาชิก': 'Log in / Sign up',
  'สำรวจ': 'Explore',
  'ค้นหา': 'Search',
  'ปล่อยพื้นที่': 'List your space',
  'การจอง': 'Bookings',
  'โปรไฟล์': 'Profile',
  'การจองของฉัน': 'My bookings',
  'พื้นที่ของฉัน': 'My spaces',
  'พื้นที่ที่บันทึกไว้': 'Saved spaces',
  'โปรไฟล์และการตั้งค่า': 'Profile and settings',
  'วิธีใช้งานและความช่วยเหลือ': 'Help and how it works',
  'ออกจากระบบ': 'Log out',
  'ทั้งหมด': 'All',
  'ประชุม': 'Meetings',
  'ถ่าย Content': 'Content shoots',
  'เวิร์กช็อป': 'Workshops',
  'จัดกิจกรรม': 'Events',
  'เมืองยอดนิยม': 'Popular cities',
  'เลือกเมืองเพื่อเริ่มค้นหาพื้นที่ที่เหมาะกับคุณ': 'Choose a city to start finding the right space for you',
  'กรุงเทพฯ': 'Bangkok',
  'เชียงใหม่': 'Chiang Mai',
  'ภูเก็ต': 'Phuket',
  'พัทยา': 'Pattaya',
  'หาดใหญ่': 'Hat Yai',
  'ห้องที่ว่าง อาจเป็นจุดเริ่มต้น': 'An available room could be the start',
  'ของไอเดียที่ไม่ว่าง': 'of an idea that keeps moving',
  'ให้พื้นที่ของคุณได้ทำงาน ในเวลาที่คุณไม่ได้ใช้': 'Put your space to work while you are not using it',
  'เริ่มปล่อยพื้นที่': 'Start listing your space',
  'กฎชัดเจนก่อนจอง': 'Clear rules before booking',
  'เช่าพื้นที่สั้น ๆ หรือเต็มวัน': 'Book by the hour or for the day',
  'พื้นที่จากคนในย่านของคุณ': 'Spaces from people in your neighborhood',
  'พื้นที่มีค่า ทุกเวลา': 'Space matters, every moment',
  'รู้จัก WELAA': 'About WELAA',
  'เป็นเจ้าของพื้นที่': 'Become a host',
  'ส่งคำขอจองให้เจ้าของยืนยัน · ยังไม่มีการเรียกเก็บเงินจริง': 'Booking requests are confirmed by hosts · no real payments are processed',
  'FIND YOUR LITTLE CORNER': 'FIND YOUR LITTLE CORNER',
  'พื้นที่สำหรับเวลาของคุณ': 'A space for your time',
  'เช่น ห้องประชุม 6 คน หรือสตูดิโอถ่ายคลิป': 'e.g. a meeting room for 6 or a video studio',
  'ลอง “ห้องประชุม 6 คนช่วงบ่าย”': 'Try “meeting room for 6 this afternoon”',
  'สถานที่': 'Location',
  'วันที่': 'Date',
  'ช่วงเวลา': 'Time',
  'จำนวนคน': 'Guests',
  'ทุกพื้นที่': 'Any location',
  'ทุกช่วงเวลา': 'Any time',
  'พื้นที่ว่าง': 'Available spaces',
  'ตัวกรอง': 'Filters',
  'เรียงลำดับ': 'Sort by',
  'แนะนำสำหรับคุณ': 'Recommended',
  'ราคาต่ำไปสูง': 'Price: low to high',
  'คะแนนสูงสุด': 'Top rated',
  'แผนที่': 'Map',
  'รายการ': 'List',
  'ยังไม่เจอพื้นที่ที่ตรงกัน': 'No spaces match your search',
  'ตอนนี้ยังไม่มีพื้นที่ในเมืองหรือหมวดที่เลือก ลองดูทุกเมืองก่อน': 'There are no spaces in this city or category yet. Try all locations.',
  'ดูทุกเมือง': 'Browse all locations',
  'เลือกพื้นที่ที่ใช่': 'Find the right space',
  'กำหนดงบและสิ่งที่คุณต้องการ': 'Set your budget and preferences',
  'ราคาสูงสุด / ชั่วโมง': 'Maximum price / hour',
  'ระยะจากใจกลางเมือง': 'Distance from city center',
  'ระยะทาง': 'Distance',
  'ทุกระยะ': 'Any distance',
  'ประเภทพื้นที่': 'Space type',
  'ทุกประเภท': 'Any type',
  'ว่างตอนนี้ · จองได้ทันที': 'Available now · book instantly',
  'สิ่งอำนวยความสะดวก': 'Amenities',
  'ล้างตัวกรอง': 'Clear filters',
  'ดู': 'Show',
  'พื้นที่': 'spaces',
  'พื้นที่ที่ว่างตอนนี้': 'Available now',
  'YOUR SPACE, SOMEONE’S POSSIBILITY': 'YOUR SPACE, SOMEONE’S POSSIBILITY',
  'YOUR SPACE, YOUR SCHEDULE': 'YOUR SPACE, YOUR SCHEDULE',
  'MAKE ROOM FOR YOURSELF': 'MAKE ROOM FOR YOURSELF',
  'YOUR WELAA ACCOUNT': 'YOUR WELAA ACCOUNT',
  'โปรไฟล์ของคุณ': 'Your profile',
  'เข้าสู่ระบบเพื่อจัดการการจอง พื้นที่ที่บันทึก และบัญชีของคุณ': 'Log in to manage bookings, saved spaces, and your account',
  'บัญชีของฉัน': 'My account',
  'ดูสถานะและรายละเอียดการจอง': 'View booking status and details',
  'กลับไปดูพื้นที่ที่คุณสนใจ': 'Revisit spaces you are interested in',
  'ข้อความ': 'Messages',
  'พูดคุยกับเจ้าของพื้นที่': 'Chat with hosts',
  'การตั้งค่าและความช่วยเหลือ': 'Settings and help',
  'ตั้งค่า': 'Settings',
  'จัดการภาษาและการตั้งค่าบัญชี': 'Manage language and account settings',
  'ภาษา': 'Language',
  'เลือกภาษา': 'Choose language',
  'เลือกภาษาที่ใช้ใน WELAA': 'Choose the language for WELAA',
  'ภาษาไทย': 'ไทย (Thai)',
  'English': 'English',
  'ใช้งานอยู่': 'Currently selected',
  'กำลังเตรียมให้บริการ': 'Coming soon',
  'ตั้งค่า WELAA': 'WELAA settings',
  'จัดการการใช้งานบัญชีของคุณ': 'Manage your account preferences',
  'วิธีใช้งานและความปลอดภัย': 'How it works and safety',
  'รู้จักการจองและการใช้พื้นที่': 'Learn about bookings and using spaces',
  'ปล่อยพื้นที่กับ WELAA': 'List your space on WELAA',
  'เริ่มสร้างรายได้จากพื้นที่ว่าง': 'Start earning from your available space',
  'การแก้ไขข้อมูลส่วนตัวและออกจากระบบจะอยู่ในหน้าโปรไฟล์หลังเข้าสู่ระบบ': 'Edit your personal information or log out from your profile after signing in',
  'บัญชีเดียวสำหรับผู้เช่าและเจ้าของพื้นที่': 'One account for guests and hosts',
  'ยินดีต้อนรับกลับ': 'Welcome back',
  'เริ่มต้นเวลาดี ๆ กับ WELAA': 'Make room for good things with WELAA',
  'ดำเนินการต่อด้วย Google': 'Continue with Google',
  'ดำเนินการต่อด้วย Facebook': 'Continue with Facebook',
  'หรือ': 'OR',
  'ใช้อีเมล': 'Use email',
  'ใช้อีเมลแทน': 'Use email instead',
  'ชื่อที่แสดง': 'Display name',
  'อีเมล': 'Email',
  'รหัสผ่าน': 'Password',
  'กำลังดำเนินการ…': 'Working…',
  'มีบัญชีแล้ว? เข้าสู่ระบบ': 'Already have an account? Log in',
  'ยังไม่มีบัญชี? สมัครสมาชิก': 'New to WELAA? Sign up',
  'สวัสดี,': 'Hello,',
  'ลองใหม่': 'Try again',
  'โหลดข้อมูลไม่สำเร็จ': 'Could not load data',
  'การจองเป็นคำขอรอเจ้าของยืนยัน และยังไม่มีการชำระเงินจริง': 'Bookings are requests that require host confirmation. No real payments are processed.',
  'กำลังตรวจสอบบัญชี…': 'Checking your account…',
  'ไม่พบหน้านี้': 'Page not found',
  'กลับหน้าหลัก': 'Back to home',
  'จัดการพื้นที่ของคุณ': 'Manage your spaces',
  'ทุกช่วงเวลาว่าง จัดการได้ในที่เดียว': 'Manage all your available hours in one place',
  'ผู้เช่า': 'Guest',
  'เจ้าของพื้นที่': 'Host',
  'ข้อมูลของคุณ': 'Your information',
  'เบอร์โทรศัพท์': 'Phone number',
  'แนะนำตัว': 'About you',
  'บันทึกข้อมูล': 'Save changes',
  'ความน่าเชื่อถือ': 'Verification',
  'ตัวตน': 'Identity',
  'ยังไม่ยืนยัน': 'Not verified',
  'การกรอกข้อมูลไม่เท่ากับการยืนยัน ระบบตรวจสอบตัวตนและ OTP ยังไม่เปิดในรุ่นทดลอง': 'Providing information does not verify your identity. Identity verification and OTP are not available in this trial.',
  'บันทึกโปรไฟล์แล้ว': 'Profile saved',
  'จอง แล้วเริ่มทำสิ่งที่ชอบ': 'Book and get started',
  'ความสบายใจ เริ่มจากความชัดเจน': 'Peace of mind starts with clarity',
  'อ่านกฎและนโยบายยกเลิกก่อนจอง เจ้าของต้องยืนยันสิทธิ์ในการนำพื้นที่มาให้ใช้งาน และเคารพข้อจำกัดของอาคารและเพื่อนบ้าน': 'Read the rules and cancellation policy before booking. Hosts must have the right to offer their space and respect building and neighborhood rules.',
  'ฉันกำลังหาพื้นที่': 'I am looking for a space',
  'ฉันมีพื้นที่ว่าง': 'I have a space',
  'หาพื้นที่ที่ใช่': 'Find the right space',
  'เลือกเวลาของคุณ': 'Choose your time',
  'ต้อนรับไอเดียใหม่': 'Welcome new ideas',
  'รอเจ้าของยืนยัน': 'Awaiting host confirmation',
  'พื้นที่แรกของคุณ เริ่มได้ง่าย ๆ': 'Your first space starts here',
  'บัญชีของคุณ': 'Your account',
  'เข้าสู่ระบบเพื่อดูและจัดการการจอง': 'Log in to view and manage your bookings',
  'บัญชีอีเมลผ่าน ChatGPT': 'Email account via ChatGPT',
  'จัดการการจอง แล้วเผื่อเวลาให้สิ่งที่คุณชอบ': 'Manage bookings and make room for what you love',
  'ข้อมูลก่อนจองและปล่อยพื้นที่': 'Information before booking or listing a space',
  'แก้ไขข้อมูลที่แสดงใน WELAA': 'Edit the information shown on WELAA',
  'ออกจากบัญชีนี้บนอุปกรณ์': 'Sign out on this device',
  'ดูสถานะและรายละเอียด': 'View status and details',
  'ที่บันทึกไว้': 'Saved spaces',
  'จัดการพื้นที่ของฉัน': 'Manage my spaces',
  'คำขอจอง': 'Booking requests',
  'คำขอจองพื้นที่ของคุณ': 'Your space booking requests',
  'ปฏิทิน': 'Calendar',
  'ปฏิทินพื้นที่': 'Space calendar',
  'จัดการช่วงเวลา': 'Manage availability',
  'ยังไม่มีการจอง': 'No bookings yet',
  'เมื่อมีคนจองพื้นที่ รายละเอียดจะแสดงที่นี่': 'Booking details will appear here when someone books your space',
  'พื้นที่ดี ๆ กำลังรอไอเดียของคุณอยู่': 'A great space is waiting for your idea',
  'เก็บพื้นที่ที่ถูกใจ ไว้ใช้ในเวลาที่ใช่': 'Save spaces you like for the right moment',
  'แตะหัวใจบนรูปเพื่อบันทึกไว้ที่นี่': 'Tap the heart on a photo to save it here',
  'ยังไม่มีรายการชำระเงิน': 'No payment activity yet',
  'การชำระเงิน': 'Payments',
  'รายการทั้งหมดเป็นการชำระเงินจำลอง ไม่มีการตัดบัตรหรือโอนเงินจริง': 'All payment records are simulated. No card charges or transfers are made.',
  'รายได้จากพื้นที่ของคุณ': 'Earnings from your spaces',
  'มูลค่าการจองจำลอง': 'Simulated booking value',
  'การจองที่ยืนยัน': 'Confirmed bookings',
  'ชั่วโมงที่ถูกจอง': 'Hours booked',
  'รีวิวของฉัน': 'My reviews',
  'รีวิวจากผู้ใช้งาน': 'Guest reviews',
  'ยังไม่มีรีวิว': 'No reviews yet',
  'เล่าประสบการณ์ของคุณ': 'Share your experience',
  'รีวิวช่วยให้คนถัดไปเลือกพื้นที่ได้ง่ายขึ้น': 'Reviews help others choose a space',
  'ยืนยันคำขอ': 'Accept request',
  'ปฏิเสธ': 'Decline',
  'ยกเลิกคำขอ': 'Cancel request',
  'ยกเลิกการจองนี้?': 'Cancel this booking?',
  'เก็บการจองไว้': 'Keep booking',
  'ยืนยันยกเลิก': 'Confirm cancellation',
  'ยกเลิกการจองแล้ว': 'Booking cancelled',
  'จองแล้ว': 'Booked',
  'ยกเลิกแล้ว': 'Cancelled',
  'เจ้าของปฏิเสธ': 'Declined by host',
  'ยืนยันแล้ว': 'Confirmed',
  'ใช้งานเสร็จแล้ว': 'Completed',
  'พื้นที่ของคุณพร้อมแล้ว': 'Your space is ready',
  'พื้นที่ของคุณพร้อมเปิดแล้ว': 'Your space is ready to go live',
  'เริ่มต้นจากพื้นที่ที่คุณมี': 'Start with the space you have',
  'เข้าสู่ระบบเพื่อบันทึกฉบับร่าง อัปโหลดภาพ และเริ่มปล่อยพื้นที่': 'Log in to save a draft, upload photos, and list your space',
  'พื้นที่ของคุณคืออะไร?': 'What kind of space do you have?',
  'พื้นที่ของคุณอยู่ที่ไหน?': 'Where is your space?',
  'ที่นี่ใช้ทำอะไรได้บ้าง?': 'What can people do here?',
  'เมื่อไหร่ที่พื้นที่ของคุณว่าง?': 'When is your space available?',
  'เลือกกิจกรรมที่เหมาะกับพื้นที่และไม่รบกวนเพื่อนบ้าน': 'Choose activities that suit your space and respect your neighbors',
  'เลือกเวลาว่าง แล้วตั้งราคาต่อชั่วโมง': 'Set your available hours and hourly price',
  'เลือกเวลาว่าง': 'Set available hours',
  'เพิ่มพื้นที่': 'Add a space',
  'ชื่อพื้นที่': 'Space name',
  'ย่าน / ที่อยู่': 'Neighborhood / address',
  'เมือง': 'City',
  'ราคา / ชั่วโมง (บาท)': 'Price / hour (THB)',
  'ราคาต่อชั่วโมง (บาท)': 'Hourly price (THB)',
  'จำนวนคนสูงสุด': 'Maximum guests',
  'กฎการใช้พื้นที่': 'Space rules',
  'แนะนำพื้นที่': 'Space description',
  'อัปโหลดรูปพื้นที่': 'Upload space photos',
  'ภาพหน้าปก': 'Cover photo',
  'ภาพพื้นที่': 'Space photo',
  'เลือกรูปพื้นที่ของคุณ': 'Choose photos of your space',
  'อัปโหลดได้สูงสุด 8 รูป': 'Upload up to 8 photos',
  'เลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB': 'Choose JPG, PNG, or WebP images up to 5 MB',
  'บอกสิ่งที่ทำได้และสิ่งที่ควรหลีกเลี่ยงก่อนจอง': 'Explain what guests can do and what to avoid before booking',
  'ระบุย่านให้ผู้เช่าเห็นภาพว่าเดินทางอย่างไร': 'Describe the neighborhood to help guests plan their trip',
  'ยืนยันว่าคุณมีสิทธิ์นำพื้นที่นี้มาให้ผู้อื่นใช้งาน': 'Confirm that you are authorized to offer this space to others',
  'รุ่นทดลองยังไม่มีการรับหรือโอนเงินจริง': 'The trial does not process real payments or transfers',
  'ถัดไป': 'Next',
  'ย้อนกลับ': 'Back',
  'เผยแพร่': 'Publish',
  'ดูตัวอย่าง': 'Preview',
  'กำลังบันทึก…': 'Saving…',
  'กำลังอัปโหลด…': 'Uploading…',
  'บันทึกฉบับร่างแล้ว': 'Draft saved',
  'อัปโหลดภาพแล้ว': 'Photo uploaded',
  'อัปโหลดภาพไม่สำเร็จ': 'Photo upload failed',
  'ลบภาพ': 'Remove photo',
  'ภาพสว่างที่เห็นพื้นที่จริง ช่วยให้ตัดสินใจได้ง่ายขึ้น': 'Clear, well-lit photos help guests decide',
  'คุณกำลังหาพื้นที่': 'Looking for a space',
  'ห้องประชุม': 'Meeting room',
  'สตูดิโอ': 'Studio',
  'พื้นที่คาเฟ่': 'Cafe space',
  'กลับไปค้นหา': 'Back to search',
  'ค้นหาพื้นที่อื่น': 'Find another space',
  'เลือกเวลาเริ่ม แล้วกำหนดเวลาสิ้นสุดในสรุปการจอง': 'Choose a start time, then set your end time in the booking summary',
  'วันนี้ไม่มีช่วงเวลาว่าง ลองเลือกวันอื่น': 'No times are available today. Try another date.',
  'เลือกเวลาเพื่อดูยอดรวม': 'Choose a time to see the total',
  'ยอดรวม': 'Total',
  'จำนวนคนต้องไม่เกิน': 'Guest count must not exceed',
  'ฉันอ่านและยอมรับกฎพื้นที่และนโยบายยกเลิกแล้ว': 'I have read and agree to the space rules and cancellation policy',
  'จองเวลาของคุณแล้ว': 'Your time is booked',
  'ดูการจองของฉัน': 'View my bookings',
  'ก่อนหน้า': 'Previous',
  'ยังไม่มีการเรียกเก็บเงินในขั้นตอนนี้': 'No payment is collected at this stage',
  'คุยให้ชัด ก่อนใช้พื้นที่': 'Talk it through before using the space',
  'ส่งข้อความ': 'Send message',
  'ส่งข้อความถึง': 'Message',
  'เริ่มด้วยคำถามเกี่ยวกับพื้นที่ได้เลย': 'Start by asking a question about the space',
  'เขียนข้อความ…': 'Write a message…',
  'ตั้งราคาที่สบายใจ': 'Set a price that works for you',
  'ให้ภาพเล่าเรื่องพื้นที่': 'Let photos tell the story of your space',
  'ไม่ต้องเป็นสถานที่ใหญ่ แค่มุมที่พร้อมสำหรับใครสักคน': 'It does not need to be big, just ready for someone',
  'กติกาชัดเจน สบายใจทั้งสองฝ่าย': 'Clear rules help everyone feel at ease',
  'พื้นที่เล็ก ๆ ของคุณ': 'Your little space',
  'อาจเป็นโอกาสใหญ่ของใครสักคน': 'could be a big opportunity for someone',
  '/ ชั่วโมง': '/ hour',
  'JPG, PNG, WebP · ไม่เกิน 5 MB / รูป · สูงสุด 8 รูป': 'JPG, PNG, WebP · up to 5 MB / photo · up to 8 photos',
  'WELAA รุ่นทดลอง: รายการเริ่มต้นและรีวิวเป็นข้อมูลตัวอย่าง การจองไม่ใช่การเช่าสถานที่จริง และการชำระเงินไม่เรียกเก็บเงินจริง': 'WELAA trial: listings and reviews are sample data. Bookings are not real rentals and no real payments are collected.',
  'ยืนยันการจองจำลอง': 'Confirm simulated booking', 'เผยแพร่พื้นที่': 'Publish space', 'กฎของพื้นที่': 'Space rules',
  'กลับมาดูพื้นที่ที่สนใจ': 'Revisit spaces you are interested in', 'กลับหน้าของเจ้าของพื้นที่': 'Back to host dashboard',
  'การจองนี้ใช้ทดลองระบบ ไม่ใช่การเช่าสถานที่จริง': 'This booking is for testing only, not a real rental', 'การยกเลิก': 'Cancellation',
  'กำหนดทุกอย่างได้ด้วยตัวคุณเอง': 'Set everything to suit you', 'ขั้นตอน': 'Step', 'จาก 10': 'of 10',
  'ค่าบริการ 8%': '8% service fee', 'ค่าบริการผู้เช่า 8%': '8% guest service fee', 'จองพื้นที่': 'Book this space',
  'จัดการเวลาว่าง': 'Manage availability', 'คน และใช้งานเฉพาะกิจกรรมที่ระบุ': ' guests, and only for the listed activities',
  'ฉันเป็นเจ้าของหรือได้รับอนุญาตให้ปล่อยพื้นที่นี้ และตรวจสอบข้อกำหนดอาคาร คอนโด หรือสัญญาเช่าแล้ว': 'I own this space or have permission to list it, and have checked the building, condo, or lease requirements.',
  'ชำระเงินจำลอง · ไม่มีการตัดเงินจริง': 'Simulated payment · no real charge', 'ชื่อเจ้าของที่แสดง': 'Host display name',
  'ช่วงเวลาจะกลับมาว่างให้คนอื่นจอง รายการนี้ไม่มีการชำระเงินจริง': 'This time slot will become available again. No real payment was made.',
  'ช่วยเหลือ': 'Help', 'ดูทั้งหมด': 'View all', 'ดูพื้นที่': 'View space', 'ดูพื้นที่ของฉัน': 'View my spaces',
  'ดูรูปทั้งหมด (': 'View all photos (', 'ตรวจสอบการจองของคุณ': 'Review your booking', 'ตัวอย่างรีวิวสำหรับทดลองหน้ารายละเอียด': 'Sample review for this preview page',
  'ตำแหน่งโดยประมาณ': 'Approximate location', 'ติดต่อทีมงาน': 'Contact support', 'ติดต่อเจ้าของ': 'Contact host', 'ที่บันทึก': 'Saved',
  'บัญชีและการตั้งค่า': 'Account and settings', 'บันทึก': 'Save',
  'ประกาศจะแสดงในหน้าค้นหา รุ่นทดลองรองรับการจองและชำระเงินจำลองเท่านั้น': 'Your listing will appear in search. The trial supports simulated bookings and payments only.',
  'ปิดช่วงเวลาที่เลือก': 'Close selected time slots', 'ผู้เช่าจอง 2 ชั่วโมง': 'Guest booking for 2 hours',
  'พื้นที่ของคุณ': 'Your space', 'พื้นที่ตัวอย่าง: ข้อความถูกบันทึก แต่ไม่มีเจ้าของจริงคอยตอบกลับ': 'Sample space: messages are saved, but no real host will reply.',
  'พื้นที่ที่บันทึก': 'Saved spaces', 'พื้นที่พอดี กับเวลาที่คุณต้องการ': 'A space that fits your time',
  'ยกเลิกก่อนเริ่มใช้งานได้จาก “การจองของฉัน” รุ่นทดลองนี้ไม่มีการเรียกเก็บเงินหรือคืนเงินจริง': 'Cancel before your booking starts from “My bookings.” This trial does not process real charges or refunds.',
  'ยอดนี้เป็นข้อมูลทดลอง ยังไม่มีการรับเงินจริง การถอนเงินจะพร้อมเมื่อเชื่อมผู้ให้บริการชำระเงิน': 'These are sample figures. No real payments are collected. Payouts will be available after a payment provider is connected.',
  'ยังไม่มีการสนทนา เริ่มสอบถามจากหน้ารายละเอียดพื้นที่ได้เลย': 'No conversations yet. Start by asking a question on a space detail page.',
  'ยืนยันการชำระเงินจำลอง ไม่มีการตัดเงินจริง': 'Simulated payment confirmed. No real charge was made.',
  'รวมผู้ใช้งานทุกคนในพื้นที่': 'Include everyone using the space',
  'ระบุการเดินทางในคำอธิบาย และตกลงจุดนัดพบกับผู้เช่าผ่านข้อความ': 'Describe how to get there and arrange a meeting point with guests by message.',
  'ระบุสูบบุหรี่ อาหาร สัตว์เลี้ยง เสียงดัง และกิจกรรมที่ห้าม ใช้ • แยกแต่ละข้อ': 'List rules for smoking, food, pets, noise, and restricted activities. Separate each item with •',
  'รายชั่วโมง': 'Hourly', 'รีวิวจะแสดงหลังจบการใช้งาน': 'Reviews appear after the booking is complete', 'วันแรกที่เปิดให้ใช้งาน': 'First available date',
  'ว่าง': 'Available', 'สมัครสมาชิก / เข้าสู่ระบบ': 'Sign up / Log in', 'สำรวจพื้นที่': 'Explore spaces',
  'สำหรับเจ้าของพื้นที่': 'For hosts', 'สิ้นสุด': 'End time', 'ส่งรีวิว': 'Submit review', 'ส่งอีเมลถึงฝ่ายช่วยเหลือ': 'Email support',
  'เปลี่ยนช่วงที่ว่าง': 'Change available hours', 'เปิดพื้นที่ตอนนี้': 'Make space available now',
  'เปิดช่วงว่างวันนี้พร้อมราคาพิเศษ รายการออกจาก “ว่างตอนนี้” เองเมื่อหมดเวลา': 'Open a discounted time slot for today. It will leave “Available now” when it expires.',
  'เปิดเฉพาะวันที่เลือก คุณเพิ่มวัน เปิด–ปิดชั่วโมง และตั้งราคาพิเศษได้หลังเผยแพร่': 'Only the selected date will open. After publishing, you can add dates, set hours, and adjust prices.',
  'เปิดเวลาและบันทึกราคา': 'Open hours and save price', 'เริ่ม': 'Start',
  'เริ่มจากหนึ่งชั่วโมง แล้วให้ไอเดียของคุณไปต่อ': 'Start with one hour and take your idea further', 'เริ่มที่ 1 ชั่วโมง': 'From 1 hour',
  'เลือกช่วงเวลาเพื่อดูยอดรวม': 'Choose a time slot to see the total', 'เลือกทุกช่วงที่แก้ไขได้': 'Select all editable slots',
  'เลือกวันที่วันนี้เพื่อเปิด Instant Availability': 'Choose today to enable instant availability',
  'เลือกหลายช่วงเวลา แล้วเปิด ปิด หรือปรับราคาในครั้งเดียว': 'Select multiple time slots to open, close, or update prices at once',
  'เวลาของคุณ': 'Your time', 'เวลาสิ้นสุด': 'End time', 'เวลาเริ่ม': 'Start time', 'แชร์': 'Share',
  'ให้พื้นที่นี้ เป็นพื้นที่ของไอเดียคุณ': 'Make this space the home of your next idea', 'ให้เป็นโอกาสดี ๆ': 'Turn it into a great opportunity', 'ไม่เปิดให้จอง': 'Not available for booking',

};

const LanguageContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({ locale: 'th', setLocale: () => {} });

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

function applyTranslations(root: ParentNode, locale: Locale, originals: WeakMap<Node, string>, lastApplied: WeakMap<Node, string>, attrOriginals: WeakMap<Element, Map<string, string>>) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script,style,noscript,textarea,[contenteditable="true"]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const current = node.nodeValue ?? '';
    const last = lastApplied.get(node);
    if (last !== undefined && current !== last) originals.set(node, current);
    const original = originals.get(node) ?? current;
    originals.set(node, original);
    const key = normalize(original);
    if (!key) continue;
    const translated = en[key];
    const leading = original.match(/^\s*/)?.[0] ?? '';
    const trailing = original.match(/\s*$/)?.[0] ?? '';
    const desired = locale === 'th' ? original : translated === undefined ? original : `${leading}${translated}${trailing}`;
    // Preserve surrounding whitespace while translating the visible phrase.
    if (current !== desired) node.nodeValue = desired;
    lastApplied.set(node, desired);
  }

  const attributes = ['aria-label', 'title', 'placeholder', 'alt'];
  root.querySelectorAll?.('*').forEach((element) => {
    const saved = attrOriginals.get(element) ?? new Map<string, string>();
    for (const attribute of attributes) {
      const current = element.getAttribute(attribute);
      if (current === null) continue;
      const original = saved.get(attribute) ?? current;
      saved.set(attribute, original);
      const translated = locale === 'en' ? en[normalize(original)] : normalize(original);
      if (translated !== undefined && current !== translated) element.setAttribute(attribute, translated);
    }
    attrOriginals.set(element, saved);
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('th');
  const [hydrated, setHydrated] = useState(false);
  const originals = useRef(new WeakMap<Node, string>());
  const lastApplied = useRef(new WeakMap<Node, string>());
  const attrOriginals = useRef(new WeakMap<Element, Map<string, string>>());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'th') setLocaleState(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale;
    const translate = () => applyTranslations(document.body, locale, originals.current, lastApplied.current, attrOriginals.current);
    translate();
    const observer = new MutationObserver((records) => {
      // Translation writes are observed too. Applying the same locale is safe:
      // original text is retained per node, so the observer settles immediately.
      if (records.some((record) => record.type === 'childList' || record.type === 'characterData' || record.type === 'attributes')) translate();
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'title', 'placeholder', 'alt'] });
    return () => observer.disconnect();
  }, [locale, hydrated]);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);

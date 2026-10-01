import type {Metadata} from 'next';
import './welaa-styles.css';
import './typography.css';
import './booking-experience.css';
import './ui-refinements.css';
import './marketplace-design.css';
import {previewAllowed} from '@/lib/booking';
import Welaa from './welaa';
import {LanguageProvider} from './language';
export const metadata:Metadata={title:'WELAA — พื้นที่มีค่า ทุกเวลา',description:'ค้นหาและจองพื้นที่รายชั่วโมง สำหรับไอเดียและช่วงเวลาดี ๆ ของคุณ',icons:{icon:'/favicon.svg'},appleWebApp:{capable:true,title:'WELAA',statusBarStyle:'default'},manifest:'/manifest.webmanifest'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><head><link rel="stylesheet" href="/fonts/fonts.css"/></head><body><LanguageProvider><Welaa previewMode={previewAllowed(process.env)} />{children}</LanguageProvider></body></html>}

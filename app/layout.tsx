import type {Metadata} from 'next';
import './globals.css';
import Welaa from './welaa';
export const metadata:Metadata={title:'WELAA — พื้นที่มีค่า ทุกเวลา',description:'ค้นหาและจองพื้นที่รายชั่วโมง สำหรับไอเดียและช่วงเวลาดี ๆ ของคุณ',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><head><link rel="stylesheet" href="/fonts/fonts.css"/></head><body><Welaa />{children}</body></html>}

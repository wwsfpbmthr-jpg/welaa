import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'WELAA — พื้นที่มีค่า ทุกเวลา',description:'ค้นหาและจองพื้นที่รายชั่วโมง สำหรับไอเดียและช่วงเวลาดี ๆ ของคุณ',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><body>{children}</body></html>}

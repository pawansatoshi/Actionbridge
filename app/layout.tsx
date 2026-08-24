import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata={title:"ActionBridge — Turn intention into real-world action",description:"Goal-driven phone-work orchestration powered by CALL-E.",applicationName:"ActionBridge"};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#07100e"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

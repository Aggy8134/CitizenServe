import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "CitizenServe — Public Service Requests",
  description: "Report and track public service issues in your community.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="container page">{children}</main>
          <footer className="footer">CitizenServe · Public Service Request System</footer>
        </AuthProvider>
      </body>
    </html>
  );
}

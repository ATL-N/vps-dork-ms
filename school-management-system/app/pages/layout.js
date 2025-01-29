import { Providers } from "./providers";
import SidePanel from "../components/sidepanel/sidepanel";
import Footer from "../components/footer/footer";
import Header from "../components/header/header";
import { Suspense } from "react";

export default function DashboardLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <SidePanel />
        <Footer />
        <Providers>
          <Suspense fallback={<loading />}>
            <div className="flex bg-gray-200 h-svh overflow-hidden">
              <div className="flex-1 ml-0 md:ml-16 mt-16 mb-16 p-6 pb-20 md:pb-16 h-full overflow-auto bg-gray-100">
                {children}
              </div>
            </div>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}

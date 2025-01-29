// app/layout.js
import { Providers } from "./providers";

export default function AuthLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <div className="flex bg-gray-200 h-svh overflow-hidden">
              {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

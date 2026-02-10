'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-white px-6 py-4">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-gray-500 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} CodeHub. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/help" className="hover:text-gray-700">
            도움말
          </Link>
          <Link href="/contact" className="hover:text-gray-700">
            문의하기
          </Link>
          <Link href="/terms" className="hover:text-gray-700">
            이용약관
          </Link>
        </div>
      </div>
    </footer>
  );
}

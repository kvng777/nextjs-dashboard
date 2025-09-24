import SignupForm from '@/app/ui/signup-form';
import AcmeLogo from '@/app/ui/acme-logo';
import { Suspense } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <main className="flex items-center justify-center md:h-screen border-4 border-blue-500 bg-gray-300">
    <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32 border-4 border-red-500 rounded-lg">
      <Link href={'/'} className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
        <div className="w-32 text-white md:w-36">
          <AcmeLogo />
        </div>
      </Link>
      <Suspense>
        <SignupForm />
      </Suspense>
    </div>
  </main>
  );
}

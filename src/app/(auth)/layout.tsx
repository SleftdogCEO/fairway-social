import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense>
        {children}
      </Suspense>
    </div>
  );
}

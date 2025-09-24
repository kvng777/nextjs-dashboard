import { auth } from '@/auth';

export default async function ServerUserProfile() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="text-lg font-semibold text-gray-900">User Profile</h2>
      <div className="mt-2 space-y-1">
        <p><span className="font-medium">Name:</span> {session.user.name}</p>
        <p><span className="font-medium">Email:</span> {session.user.email}</p>
      </div>
    </div>
  );
}

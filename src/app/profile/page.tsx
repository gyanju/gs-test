import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const cookieStore = cookies();
  //const token = cookieStore.get("auth_token")?.value;
  const token = (await cookieStore).get("auth_token");  // Get the auth_token cookie

  if (!token) redirect("/login");

  const payload = await verifyToken(token.value);
  const userId = payload.userId as string | undefined;

  if (!userId) redirect("/login");

  await connectToDatabase();

  const user = await User.findById(userId).lean();
  if (!user) redirect("/login");

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User";

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Your Profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome, <span className="font-medium">{fullName}</span>
          </p>
        </div>

        <LogoutButton />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">Photo</div>
          <div className="mt-4">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={fullName}
                className="h-20 w-20 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600 ring-1 ring-slate-200">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">Details</div>

          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Full name</dt>
              <dd className="mt-1 text-sm text-slate-900">{fullName}</dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Role</dt>
              <dd className="mt-1 text-sm text-slate-900">{user.role ?? "user"}</dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Email</dt>
              <dd className="mt-1 text-sm text-slate-900">{user.email}</dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Phone</dt>
              <dd className="mt-1 text-sm text-slate-900">{user.phone ?? "-"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

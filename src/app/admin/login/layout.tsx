export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  // Admin login has no auth wrapper — middleware handles redirect if already logged in
  return <>{children}</>;
}

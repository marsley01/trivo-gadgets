export default function VendorLoginLayout({ children }: { children: React.ReactNode }) {
  // Vendor login page has no auth wrapper — middleware handles redirect if already logged in
  return <>{children}</>;
}

import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}

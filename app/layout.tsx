export const metadata = {
  title: "Octane Biomech API",
  description: "API-only service for biomechanics data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


export default function Testlayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Layout UI */}
        {/* Place children where you want to render a page or nested layout */}
        <main>
            <div>sub header</div>
            {children}
        </main>
      </body>
    </html>
  )
}
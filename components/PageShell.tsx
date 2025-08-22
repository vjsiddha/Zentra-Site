interface PageShellProps {
  children: React.ReactNode
}

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <div className="max-w-[1280px] mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

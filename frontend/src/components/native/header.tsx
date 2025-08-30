const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex gap-6 md:gap-10">
          <h1 className="text-2xl font-bold tracking-tight">RemoteJobs</h1>
        </div>
      </div>
    </header>
  )
}

export default Header;
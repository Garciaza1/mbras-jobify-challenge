import { Bookmark } from "lucide-react"
import { Button } from "../ui/button"

const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex gap-6 md:gap-10">
          <h1 className="text-2xl font-bold tracking-tight">RemoteJobs</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Bookmark className="mr-2 h-4 w-4" />
            Vagas Salvas
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header;
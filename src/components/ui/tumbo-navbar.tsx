"use client"

import { Bell, User, Settings, LogOut, FileText } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { AuthModal } from "@/components/ui/auth-modal"

// Navigation links array - simple buttons only
const navigationLinks = [
  { href: "/classes", label: "Browse Classes" },
  { href: "/collections", label: "Curated Collections" },
  { href: "/tumbo-chat", label: "Ask Tümbo" },
]

// Custom NotificationMenu Component
function NotificationMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative opacity-80 hover:opacity-100 transition-opacity">
          <Bell className="h-4 w-4" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            3
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          <Badge variant="secondary" className="ml-2">3 new</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex-col items-start p-3">
          <div className="flex w-full items-center justify-between">
            <span className="font-medium">New class recommendation</span>
            <span className="text-xs text-muted-foreground">2m ago</span>
          </div>
          <span className="text-sm text-muted-foreground mt-1">
            We found 3 perfect matches for your child in Bishan
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex-col items-start p-3">
          <div className="flex w-full items-center justify-between">
            <span className="font-medium">Class starting soon</span>
            <span className="text-xs text-muted-foreground">1h ago</span>
          </div>
          <span className="text-sm text-muted-foreground mt-1">
            Creative Little Architects starts this Saturday
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex-col items-start p-3">
          <div className="flex w-full items-center justify-between">
            <span className="font-medium">Welcome to Tümbo!</span>
            <span className="text-xs text-muted-foreground">3h ago</span>
          </div>
          <span className="text-sm text-muted-foreground mt-1">
            Complete your child&apos;s profile for better recommendations
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-center">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Custom UserMenu Component
function UserMenu() {
  const { user, logout } = useAuth()
  
  const handleLogout = () => {
    logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-80 hover:opacity-100 transition-opacity">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name || 'User'} 
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText className="mr-2 h-4 w-4" />
          My Classes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function TumboNavbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin')

  const openSignInModal = () => {
    setAuthMode('signin')
    setAuthModalOpen(true)
  }

  const openRegisterModal = () => {
    setAuthMode('register')
    setAuthModalOpen(true)
  }

  const homeUrl = isAuthenticated ? '/userdashboard' : '/'

  return (
    <header className="border-b w-full">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6 max-w-none w-full">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group h-8 w-8 md:hidden opacity-80 hover:opacity-100 transition-opacity"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      <NavigationMenuLink asChild>
                        <Link href={link.href} className="block w-full py-2 px-3 text-sm hover:bg-accent rounded-md">
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <Link href={homeUrl} className="text-primary hover:text-primary/90">
              <img
                className="h-6 flex-none object-cover"
                src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                alt="Tümbo logo"
              />
            </Link>
            {/* Navigation menu */}
            <div className="max-md:hidden">
              <nav className="flex items-center gap-6">
                {navigationLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="text-muted-foreground hover:text-primary py-1.5 px-2 font-medium opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Authenticated state */}
              <div className="flex items-center gap-2">
                <NotificationMenu />
              </div>
              <UserMenu />
            </>
          ) : (
            <>
              {/* Unauthenticated state */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                onClick={openSignInModal}
              >
                Sign In
              </Button>
              <Button 
                size="sm" 
                className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                onClick={openRegisterModal}
              >
                Register
              </Button>
            </>
          )}
        </div>

        {/* Auth Modal */}
        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
        />
      </div>
    </header>
  )
}

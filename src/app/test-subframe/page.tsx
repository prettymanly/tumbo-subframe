import { ClassCard } from '@/components/subframe/ui/components/ClassCard'
import { Button } from '@/components/subframe/ui/components/Button'
import { Badge } from '@/components/subframe/ui/components/Badge'
import { BoldNavbar } from '@/components/subframe/ui/components/BoldNavbar'

export default function TestSubframePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Subframe Navbar */}
      <BoldNavbar 
        logo="🎯 Tümbo"
        navigation={[
          { label: 'Classes', href: '/classes' },
          { label: 'Collections', href: '/collections' },
          { label: 'Providers', href: '/providers' }
        ]}
        actions={[
          { label: 'Sign In', href: '/auth/signin' },
          { label: 'Get Started', href: '/auth/signup', variant: 'primary' }
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Subframe Components Test
        </h1>

        {/* Test Subframe Button */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Button Components</h2>
          <div className="flex gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
          </div>
        </div>

        {/* Test Subframe Badge */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Badge Components</h2>
          <div className="flex gap-4">
            <Badge variant="default">Default Badge</Badge>
            <Badge variant="secondary">Secondary Badge</Badge>
            <Badge variant="destructive">Destructive Badge</Badge>
          </div>
        </div>

        {/* Test Subframe ClassCard */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Class Card Component</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ClassCard
              title="Creative Painting Workshop"
              description="A hands-on painting workshop where children explore different techniques, colors, and mediums."
              image="https://images.unsplash.com/photo-1499892477393-f675706cbe6e?w=400"
              price="$35"
              ageRange="4-8 years"
              location="Little Artists Studio - Orchard"
              tags={['Art', 'Creative', 'Hands-on']}
              provider="Little Artists Studio"
              rating={4.8}
              reviewCount={24}
            />
            <ClassCard
              title="Introduction to Robotics"
              description="Learn the fundamentals of robotics through building and programming simple robots."
              image="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400"
              price="$55"
              ageRange="6-12 years"
              location="TechTots Academy - Marina Bay"
              tags={['STEM', 'Robotics', 'Technology']}
              provider="TechTots Academy"
              rating={4.9}
              reviewCount={31}
            />
            <ClassCard
              title="Ballet Basics"
              description="Introduction to classical ballet techniques, posture, and movement."
              image="https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400"
              price="$40"
              ageRange="3-6 years"
              location="Dance Dreams - Orchard Road"
              tags={['Dance', 'Movement', 'Graceful']}
              provider="Dance Dreams Singapore"
              rating={4.7}
              reviewCount={18}
            />
          </div>
        </div>

        {/* Test Subframe Search Components */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Components</h2>
          <div className="max-w-2xl">
            <div className="mb-4">
              <h3 className="font-medium mb-2">Listings Search</h3>
              {/* We'll need to import and test these components */}
              <p className="text-gray-600">Search components ready for integration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

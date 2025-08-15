"use client"

import React from 'react'
import { ModernPageLayout } from "@/components/ui/modern-page-layout"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  ChevronDown, 
  BookOpen, 
  Heart, 
  Star, 
  Clock, 
  MapPin,
  Users,
  Lightbulb,
  Target,
  Calendar
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function UserDashboard() {
  const { user, currentChild, switchChild } = useAuth()

  if (!user) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Please sign in</h1>
            <p className="text-muted-foreground">You need to be signed in to view your dashboard.</p>
          </div>
        </div>
      </ModernPageLayout>
    )
  }

  const handleChildChange = (childId: string) => {
    switchChild(childId)
  }

  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-center justify-center bg-default-background">
        <div className="w-full max-w-[1024px] px-6 py-8">
          
          {/* Header with Child Selector */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">You&apos;re managing</h1>
              {user.children.length > 0 ? (
                <Select value={currentChild?.id || ''} onValueChange={handleChildChange}>
                  <SelectTrigger className="w-auto min-w-[120px] text-3xl font-bold border-0 p-0 h-auto bg-transparent">
                    <SelectValue placeholder="Select child" />
                    <ChevronDown className="h-5 w-5 ml-2" />
                  </SelectTrigger>
                  <SelectContent>
                    {user.children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-3xl font-bold">your child</span>
              )}
            </div>
            
            {user.children.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 mb-2">Welcome to Tümbo! Let&apos;s get started by adding your child&apos;s information.</p>
                <Button>Add Child Profile</Button>
              </div>
            )}
          </div>

          {currentChild && (
            <>
              {/* Child Description */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    About {currentChild.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentChild.description || `${currentChild.name} is ${currentChild.age} years old. Add more details about their personality, interests, and learning style to get better recommendations.`}
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Edit Description
                  </Button>
                </CardContent>
              </Card>

              {/* Learning Signature */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {currentChild.name}&apos;s Learning Signature
                  </CardTitle>
                  <CardDescription>
                    How {currentChild.name} learns best and what environments help them thrive
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {currentChild.learningSignature || "Complete the learning assessment to discover your child's unique learning signature and get personalized class recommendations."}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Update Learning Profile
                    </Button>
                    <Button variant="ghost" size="sm">
                      Take Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Ways to Engage */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Ways to engage {currentChild.name}
                  </CardTitle>
                  <CardDescription>
                    Personalized strategies based on {currentChild.name}&apos;s learning style
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-1">Learning Environment</h4>
                      <p className="text-sm text-green-700">Small groups with patient instructors</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-1">Activity Type</h4>
                      <p className="text-sm text-blue-700">Hands-on, creative exploration</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-1">Communication Style</h4>
                      <p className="text-sm text-purple-700">Gentle encouragement, visual cues</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-800 mb-1">Motivation</h4>
                      <p className="text-sm text-orange-700">Personal achievement, exploration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Classes */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Current Classes
                  </CardTitle>
                  <CardDescription>
                    Classes {currentChild.name} is currently enrolled in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentChild.currentClasses.length > 0 ? (
                    <div className="space-y-3">
                      {currentChild.currentClasses.map((className, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{className}</h4>
                              <p className="text-sm text-muted-foreground">Next session: This Saturday</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-3">No current classes</p>
                      <Button>Browse Classes</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bookmarked Classes */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Bookmarked Classes
                  </CardTitle>
                  <CardDescription>
                    Classes you&apos;ve saved for {currentChild.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentChild.bookmarkedClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentChild.bookmarkedClasses.map((className, index) => (
                        <div key={index} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{className}</h4>
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">Perfect for creative kids who love hands-on activities</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Orchard
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Weekends
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-3">No bookmarked classes yet</p>
                      <Button variant="outline">Explore Classes</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Recommendations for {currentChild.name}
                  </CardTitle>
                  <CardDescription>
                    Curated suggestions based on {currentChild.name}&apos;s learning signature
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentChild.recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentChild.recommendations.map((className, index) => (
                        <div key={index} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{className}</h4>
                            <Badge variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">Recommended based on learning style and interests</p>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1">Enroll</Button>
                            <Button size="sm" variant="outline">
                              <Heart className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-3">Complete your child&apos;s profile to get personalized recommendations</p>
                      <Button>Complete Profile</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ModernPageLayout>
  )
}

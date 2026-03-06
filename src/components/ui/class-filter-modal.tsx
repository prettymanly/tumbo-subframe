"use client";

import React, { useState } from "react";
import { DialogLayout } from "@/components/subframe/ui/layouts/DialogLayout";
import { FeatherX } from "@subframe/core";
import { IconButton } from "@/components/subframe/ui/components/IconButton";
import { Button } from "@/components/subframe/ui/components/Button";
import { TextField } from "@/components/subframe/ui/components/TextField";
import { FeatherMapPin } from "@subframe/core";
import { FeatherSunrise } from "@subframe/core";
import { FeatherSun } from "@subframe/core";
import { FeatherMoon } from "@subframe/core";
import { Slider } from "@/components/subframe/ui/components/Slider";

interface ClassFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ClassFilterModal({ open, onOpenChange }: ClassFilterModalProps) {
  // Filter state
  const [location, setLocation] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([25, 75]);
  const [selectedPriceBadges, setSelectedPriceBadges] = useState<string[]>([]);
  const [contentTypeSearch, setContentTypeSearch] = useState("");
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [experienceSearch, setExperienceSearch] = useState("");
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [philosophySearch, setPhilosophySearch] = useState("");
  const [selectedPhilosophies, setSelectedPhilosophies] = useState<string[]>([]);
  const [personalitySearch, setPersonalitySearch] = useState("");
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);

  // Helper function to toggle selection
  const toggleSelection = (array: string[], value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  // Helper function to get tag color
  const getTagColor = (tagName: string, isSelected: boolean) => {
    if (!isSelected) return 'transparent';
    
    const tagLower = tagName.toLowerCase();
    
    // Content Tags - Brown
    if (['math', 'music', 'ballet', 'coding', 'mandarin', 'drama', 'art', 'dance', 'stem', 'sports'].some(keyword => tagLower.includes(keyword))) {
      return 'var(--tumbo-tag-content)';
    }
    // Philosophy Tags - Red/Orange
    else if (['montessori', 'reggio', 'play-based', 'islamic', 'waldorf', 'academic', 'values-led'].some(keyword => tagLower.includes(keyword))) {
      return 'var(--tumbo-tag-philosophy)';
    }
    // Experience Tags - Yellow/Amber
    else if (['1-to-1', 'small group', 'movement-based', 'high-energy', 'quiet', 'sensory', 'outdoor'].some(keyword => tagLower.includes(keyword))) {
      return 'var(--tumbo-tag-experience)';
    }
    // Child Tags - Coral/Pink
    else if (['shy', 'curious', 'sensitive', 'confident', 'high-energy'].some(keyword => tagLower.includes(keyword))) {
      return 'var(--tumbo-tag-child)';
    }
    // Default to Content Tags color
    else {
      return 'var(--tumbo-tag-content)';
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setLocation("");
    setSelectedLocations([]);
    setSelectedAgeRanges([]);
    setSelectedDays([]);
    setSelectedTimeSlots([]);
    setPriceRange([25, 75]);
    setSelectedPriceBadges([]);
    setContentTypeSearch("");
    setSelectedContentTypes([]);
    setExperienceSearch("");
    setSelectedExperiences([]);
    setPhilosophySearch("");
    setSelectedPhilosophies([]);
    setPersonalitySearch("");
    setSelectedPersonalities([]);
  };

  // Confirm filters
  const confirmFilters = () => {
    // Here you would apply the filters to your class data
    console.log('Filters applied:', {
      location,
      selectedLocations,
      selectedAgeRanges,
      selectedDays,
      selectedTimeSlots,
      priceRange,
      selectedPriceBadges,
      selectedContentTypes,
      selectedExperiences,
      selectedPhilosophies,
      selectedPersonalities
    });
    onOpenChange(false);
  };
  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-full flex-col items-center max-h-[100vh]" style={{ backgroundColor: 'var(--tumbo-background)' }}>
        <div className="flex w-full items-center border-b border-solid border-neutral-border px-4 py-4">
          <IconButton
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
          <div className="flex grow shrink-0 basis-0 items-center justify-center gap-2">
            <span className="text-body-bold font-body-bold text-default-font">
              Filter Classes
            </span>
          </div>
          <Button
            variant="neutral-tertiary"
            size="small"
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        </div>
        <div className="flex w-full flex-col items-start gap-8 px-6 py-6 overflow-auto">
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Location
            </span>
            <div className="flex w-full flex-col items-start gap-2">
              {[
                'Central Singapore', 'North Singapore', 'South Singapore', 'East Singapore', 'West Singapore',
                'Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Batok', 'Bukit Merah', 'Bukit Panjang', 'Bukit Timah',
                'Choa Chu Kang', 'Clementi', 'Geylang', 'Hougang', 'Jurong East', 'Jurong West', 'Kallang',
                'Marine Parade', 'Pasir Ris', 'Punggol', 'Queenstown', 'Sembawang', 'Sengkang', 'Serangoon',
                'Tampines', 'Toa Payoh', 'Woodlands', 'Yishun'
              ].map((region) => (
                <label key={region} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(region)}
                    onChange={() => toggleSelection(selectedLocations, region, setSelectedLocations)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-body font-body text-default-font">{region}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Age Range
            </span>
            <div className="flex w-full flex-wrap items-start gap-2">
              {['2-3', '3-4', '5-6', '7-9', '10-12', '13-14', '15-16'].map((ageRange) => (
                <button
                  key={ageRange}
                  onClick={() => toggleSelection(selectedAgeRanges, ageRange, setSelectedAgeRanges)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedAgeRanges.includes(ageRange)
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-800'
                  }`}
                  style={{
                    backgroundColor: selectedAgeRanges.includes(ageRange) ? 'var(--tumbo-tag-content)' : 'transparent',
                    border: selectedAgeRanges.includes(ageRange) ? 'none' : '1px solid #E2D6C7'
                  }}
                >
                  {ageRange}
                </button>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Day &amp; Time
            </span>
            <div className="flex w-full flex-wrap items-start gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <button
                  key={day}
                  onClick={() => toggleSelection(selectedDays, day, setSelectedDays)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedDays.includes(day)
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-800'
                  }`}
                  style={{
                    backgroundColor: selectedDays.includes(day) ? 'var(--tumbo-tag-experience)' : 'transparent',
                    border: selectedDays.includes(day) ? 'none' : '1px solid #E2D6C7'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="flex w-full flex-wrap items-start gap-2">
              {[
                { name: 'Morning', icon: <FeatherSunrise /> },
                { name: 'Afternoon', icon: <FeatherSun /> },
                { name: 'Evening', icon: <FeatherMoon /> }
              ].map((timeSlot) => (
                <button
                  key={timeSlot.name}
                  onClick={() => toggleSelection(selectedTimeSlots, timeSlot.name, setSelectedTimeSlots)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTimeSlots.includes(timeSlot.name)
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-800'
                  }`}
                  style={{
                    backgroundColor: selectedTimeSlots.includes(timeSlot.name) ? 'var(--tumbo-tag-experience)' : 'transparent',
                    border: selectedTimeSlots.includes(timeSlot.name) ? 'none' : '1px solid #E2D6C7'
                  }}
                >
                  {timeSlot.icon}
                  {timeSlot.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Price Range
            </span>
            <div className="flex w-full flex-wrap items-start gap-2">
              {['Under $25', '$25 - $50', '$50 - $75', '$75 - $100', '$100+'].map((priceBadge) => (
                <button
                  key={priceBadge}
                  onClick={() => toggleSelection(selectedPriceBadges, priceBadge, setSelectedPriceBadges)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedPriceBadges.includes(priceBadge)
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-800'
                  }`}
                  style={{
                    backgroundColor: selectedPriceBadges.includes(priceBadge) ? 'var(--tumbo-tag-content)' : 'transparent',
                    border: selectedPriceBadges.includes(priceBadge) ? 'none' : '1px solid #E2D6C7'
                  }}
                >
                  {priceBadge}
                </button>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Content Type
            </span>
            <TextField className="h-auto w-full flex-none" label="" helpText="">
              <TextField.Input
                placeholder="Search content types..."
                value={contentTypeSearch}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setContentTypeSearch(event.target.value)}
              />
            </TextField>
            <div className="flex w-full flex-wrap items-start gap-2">
              {[
                'Music', 'Dance', 'Art', 'Creative', 'Design', 'STEM', 'Tech', 'Robotics', 'Coding', 'Science', 
                'Math', 'Language', 'Writing', 'Reading', 'Sports', 'Pottery', 'Painting', 'Visual', 'Drawing', 
                'Sculpture', 'Crafts', 'Ballet', 'Mandarin', 'Drama', 'Theater', 'Photography', 'Film', 'Animation',
                'Digital Art', 'Graphic Design', 'Fashion Design', 'Architecture', 'Engineering', 'Chemistry', 'Physics',
                'Biology', 'Astronomy', 'Geology', 'Computer Science', 'Web Development', 'App Development', 'Game Design',
                '3D Modeling', 'Video Production', 'Podcasting', 'Journalism', 'Poetry', 'Creative Writing', 'Storytelling',
                'Public Speaking', 'Debate', 'Chess', 'Puzzle Solving', 'Logic Games', 'Board Games', 'Card Games',
                'Magic Tricks', 'Juggling', 'Circus Arts', 'Street Dance', 'Hip Hop', 'Contemporary Dance', 'Jazz Dance',
                'Tap Dance', 'Folk Dance', 'Cultural Dance', 'Malay Dance', 'Chinese Dance', 'Indian Dance', 'Latin Dance',
                'Ballroom Dance', 'Salsa', 'Bachata', 'Kizomba', 'Zumba', 'Yoga', 'Pilates', 'Martial Arts', 'Karate',
                'Taekwondo', 'Judo', 'Kung Fu', 'Tai Chi', 'Capoeira', 'Rock Climbing', 'Swimming', 'Tennis', 'Badminton',
                'Table Tennis', 'Golf', 'Archery', 'Fencing', 'Boxing', 'Wrestling', 'Gymnastics', 'Acrobatics',
                'Parkour', 'Skateboarding', 'Roller Skating', 'Ice Skating', 'Skiing', 'Snowboarding', 'Surfing',
                'Kayaking', 'Canoeing', 'Sailing', 'Fishing', 'Bird Watching', 'Nature Photography', 'Botany',
                'Zoology', 'Marine Biology', 'Conservation', 'Sustainability', 'Recycling', 'Composting', 'Urban Farming',
                'Hydroponics', 'Aquaponics', 'Beekeeping', 'Chicken Keeping', 'Pet Care', 'Veterinary Science',
                'Animal Training', 'Horse Riding', 'Dog Training', 'Cat Care', 'Fish Keeping', 'Reptile Care',
                'Bird Care', 'Hamster Care', 'Guinea Pig Care', 'Rabbit Care', 'Turtle Care', 'Snake Care',
                'Lizard Care', 'Frog Care', 'Salamander Care', 'Newt Care', 'Axolotl Care', 'Hermit Crab Care',
                'Tarantula Care', 'Scorpion Care', 'Centipede Care', 'Millipede Care', 'Worm Care', 'Ant Care',
                'Bee Care', 'Butterfly Care', 'Moth Care', 'Dragonfly Care', 'Damselfly Care', 'Grasshopper Care',
                'Cricket Care', 'Beetle Care', 'Ladybug Care', 'Firefly Care', 'Glowworm Care', 'Bioluminescence',
                'Fluorescence', 'Phosphorescence', 'Chemiluminescence', 'Triboluminescence', 'Sonoluminescence',
                'Crystalloluminescence', 'Electroluminescence', 'Photoluminescence', 'Thermoluminescence',
                'Radioluminescence', 'Cathodoluminescence', 'X-ray Fluorescence', 'UV Fluorescence', 'IR Fluorescence',
                'Visible Light', 'Infrared Light', 'Ultraviolet Light', 'X-rays', 'Gamma Rays', 'Radio Waves',
                'Microwaves', 'Sound Waves', 'Light Waves', 'Water Waves', 'Earthquake Waves', 'Tsunami Waves',
                'Tidal Waves', 'Ocean Waves', 'River Waves', 'Lake Waves', 'Pond Waves', 'Stream Waves', 'Creek Waves',
                'Brook Waves', 'Rivulet Waves', 'Rill Waves', 'Gully Waves', 'Valley Waves', 'Canyon Waves',
                'Gorge Waves', 'Ravine Waves', 'Gully Waves', 'Arroyo Waves', 'Wadi Waves', 'Dry River Bed Waves',
                'Ephemeral Stream Waves', 'Intermittent Stream Waves', 'Perennial Stream Waves', 'Seasonal Stream Waves',
                'Temporary Stream Waves', 'Permanent Stream Waves', 'Natural Stream Waves', 'Artificial Stream Waves',
                'Man-made Stream Waves', 'Human-made Stream Waves', 'Constructed Stream Waves', 'Built Stream Waves',
                'Created Stream Waves', 'Formed Stream Waves', 'Developed Stream Waves', 'Established Stream Waves',
                'Founded Stream Waves', 'Instituted Stream Waves', 'Constituted Stream Waves', 'Organized Stream Waves',
                'Structured Stream Waves', 'Arranged Stream Waves', 'Ordered Stream Waves', 'Systematized Stream Waves',
                'Methodized Stream Waves', 'Regularized Stream Waves', 'Standardized Stream Waves', 'Normalized Stream Waves',
                'Regularized Stream Waves', 'Systematized Stream Waves', 'Methodized Stream Waves', 'Organized Stream Waves',
                'Structured Stream Waves', 'Arranged Stream Waves', 'Ordered Stream Waves', 'Arranged Stream Waves',
                'Organized Stream Waves', 'Structured Stream Waves', 'Methodized Stream Waves', 'Systematized Stream Waves'
              ].map((contentType) => (
                <button
                  key={contentType}
                  onClick={() => toggleSelection(selectedContentTypes, contentType, setSelectedContentTypes)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedContentTypes.includes(contentType)
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-800'
                  }`}
                  style={{
                    backgroundColor: getTagColor(contentType, selectedContentTypes.includes(contentType)),
                    border: selectedContentTypes.includes(contentType) ? 'none' : '1px solid #E2D6C7'
                  }}
                >
                  {contentType}
                </button>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Experience Style
            </span>
            <TextField className="h-auto w-full flex-none" label="" helpText="">
              <TextField.Input
                placeholder="Search experience styles..."
                value={experienceSearch}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setExperienceSearch(event.target.value)}
              />
            </TextField>
            <div className="flex w-full flex-wrap items-start gap-2">
              {['1-to-1', 'Small Group', 'Movement-Based', 'High-Energy', 'Quiet', 'Sensory', 'Outdoor'].map((experience) => (
                <button
                  key={experience}
                  onClick={() => toggleSelection(selectedExperiences, experience, setSelectedExperiences)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedExperiences.includes(experience)
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-800'
                  }`}
                  style={{
                    backgroundColor: getTagColor(experience, selectedExperiences.includes(experience)),
                    border: selectedExperiences.includes(experience) ? 'none' : '1px solid #E2D6C7'
                  }}
                >
                  {experience}
                </button>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Educational Philosophy
            </span>
            <TextField className="h-auto w-full flex-none" label="" helpText="">
              <TextField.Input
                placeholder="Search educational philosophies..."
                value={philosophySearch}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPhilosophySearch(event.target.value)}
              />
            </TextField>
            <div className="flex w-full flex-wrap items-start gap-2">
              {[
                'Montessori-Aligned', 'Reggio Emilia Inspired', 'Waldorf / Steiner', 'IB-Inspired Learning', 
                'Project-Based Learning', 'Play-Based Learning', 'STEM / STEAM-Focused', '21st-Century Skills', 
                'Future Skills', 'Mandarin-Speaking', 'Malay-Led', 'Tamil-Led', 'Bilingual Instruction', 
                'Chinese Heritage Arts', 'Malay Heritage Arts', 'Indian Heritage Arts', 'Global Perspectives', 
                'Religious Ethos', 'Islamic Ethos', 'Christian Values', 'Buddhist Philosophy', 'Emotional Literacy Focus', 
                'Resilience-Building', 'Anti-Burnout', 'Balanced Learning', 'Confidence-Building', 'Collaboration & Teamwork', 
                'Critical Thinking', 'Problem-Solving', 'Independence', 'Self-Directed', 'Parent-Child Co-Learning', 
                'Neurodiverse-Inclusive', 'Equity', 'Access-Oriented', 'Environmental Awareness', 'Sustainability',
                'Values-led', 'Academic', 'Holistic', 'Child-Centered', 'Inquiry-Based', 'Discovery Learning',
                'Experiential Learning', 'Hands-On Learning', 'Active Learning', 'Constructivist', 'Social Learning',
                'Collaborative Learning', 'Peer Learning', 'Mentor-Based', 'Apprenticeship', 'Traditional', 'Modern',
                'Progressive', 'Conservative', 'Liberal', 'Democratic', 'Authoritarian', 'Permissive', 'Structured',
                'Unstructured', 'Flexible', 'Rigid', 'Adaptive', 'Fixed', 'Growth Mindset', 'Fixed Mindset',
                'Resilient', 'Persistent', 'Determined', 'Motivated', 'Intrinsic', 'Extrinsic', 'Self-Motivated',
                'Goal-Oriented', 'Achievement-Focused', 'Process-Focused', 'Outcome-Focused', 'Learning-Focused',
                'Performance-Focused', 'Mastery-Oriented', 'Competition-Oriented', 'Collaboration-Oriented',
                'Individual-Focused', 'Group-Focused', 'Community-Focused', 'Global-Focused', 'Local-Focused',
                'Cultural-Focused', 'Universal-Focused', 'Traditional-Focused', 'Modern-Focused', 'Future-Focused',
                'Past-Focused', 'Present-Focused', 'Time-Aware', 'Time-Unaware', 'Schedule-Focused', 'Flexible-Time',
                'Structured-Time', 'Unstructured-Time', 'Planned', 'Spontaneous', 'Organized', 'Chaotic',
                'Systematic', 'Random', 'Logical', 'Creative', 'Analytical', 'Intuitive', 'Rational', 'Emotional',
                'Cognitive', 'Affective', 'Behavioral', 'Social', 'Emotional', 'Physical', 'Intellectual', 'Spiritual',
                'Moral', 'Ethical', 'Aesthetic', 'Practical', 'Theoretical', 'Applied', 'Pure', 'Interdisciplinary',
                'Multidisciplinary', 'Cross-Curricular', 'Integrated', 'Separated', 'Connected', 'Disconnected',
                'Related', 'Unrelated', 'Relevant', 'Irrelevant', 'Meaningful', 'Meaningless', 'Purposeful',
                'Purposeless', 'Goal-Directed', 'Aimless', 'Focused', 'Unfocused', 'Concentrated', 'Distracted',
                'Attentive', 'Inattentive', 'Mindful', 'Mindless', 'Conscious', 'Unconscious', 'Aware', 'Unaware',
                'Observant', 'Unobservant', 'Perceptive', 'Imperceptive', 'Insightful', 'Uninsightful', 'Wise',
                'Unwise', 'Knowledgeable', 'Ignorant', 'Educated', 'Uneducated', 'Learned', 'Unlearned',
                'Scholarly', 'Unscholarly', 'Academic', 'Non-Academic', 'Intellectual', 'Non-Intellectual',
                'Cognitive', 'Non-Cognitive', 'Analytical', 'Non-Analytical', 'Critical', 'Uncritical',
                'Reflective', 'Unreflective', 'Thoughtful', 'Thoughtless', 'Considerate', 'Inconsiderate',
                'Mindful', 'Mindless', 'Conscious', 'Unconscious', 'Aware', 'Unaware', 'Observant', 'Unobservant',
                'Perceptive', 'Imperceptive', 'Insightful', 'Uninsightful', 'Wise', 'Unwise', 'Knowledgeable',
                'Ignorant', 'Educated', 'Uneducated', 'Learned', 'Unlearned', 'Scholarly', 'Unscholarly'
              ].map((philosophy) => (
                <button
                  key={philosophy}
                  onClick={() => toggleSelection(selectedPhilosophies, philosophy, setSelectedPhilosophies)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedPhilosophies.includes(philosophy)
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-800'
                  }`}
                  style={{
                    backgroundColor: getTagColor(philosophy, selectedPhilosophies.includes(philosophy)),
                    border: selectedPhilosophies.includes(philosophy) ? 'none' : '1px solid #E2D6C7'
                  }}
                >
                  {philosophy}
                </button>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Personality Fit
            </span>
            <TextField className="h-auto w-full flex-none" label="" helpText="">
              <TextField.Input
                placeholder="Search personality traits..."
                value={personalitySearch}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPersonalitySearch(event.target.value)}
              />
            </TextField>
            <div className="flex w-full flex-wrap items-start gap-2">
              {['Shy', 'Curious', 'Sensitive', 'Confident', 'High-energy'].map((personality) => (
                <button
                  key={personality}
                  onClick={() => toggleSelection(selectedPersonalities, personality, setSelectedPersonalities)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedPersonalities.includes(personality)
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-800'
                  }`}
                  style={{
                    backgroundColor: getTagColor(personality, selectedPersonalities.includes(personality)),
                    border: selectedPersonalities.includes(personality) ? 'none' : '1px solid #E2D6C7'
                  }}
                >
                  {personality}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-center border-t border-solid border-neutral-border px-4 py-6">
          <Button
            className="h-14 w-48 text-lg font-semibold"
            size="large"
            onClick={confirmFilters}
          >
            Confirm Filters
          </Button>
        </div>
      </div>
    </DialogLayout>
  );
}

export default ClassFilterModal;

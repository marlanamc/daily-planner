"use client"

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X as CloseIcon, Calendar as CalendarIcon, Settings, LogIn, LogOut } from 'lucide-react'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import AuthComponent from './Auth';


interface Todo {
  id: string;
  text: string;
  completed: boolean;
  start_time: string | null;
  end_time: string | null;
  category_id?: string;
  user_id?: string;
  dueDate?: string;
}

interface Category {
  id: string;
  name: string;
  todos: Todo[];
  color: string;
  newTodo: string;
  newTodoTimes?: { start: string; end: string } | null;
}

interface ScheduledTask {
  text: string;
  startTime: string | null;
  endTime: string | null;
  hour?: number; // Optional if it’s not always set
  completed: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time?: string;
  description?: string;
}

const DailyPlanner = () => {
      // Core state
  const [mainTask, setMainTask] = useState('');
  const [displayedTask, setDisplayedTask] = useState('');
  const [categories, setCategories] = useState<Category[]>([
    { id: crypto.randomUUID(), name: 'Wellness ✨', todos: [], color: '#FBA2BE', newTodo: '', newTodoTimes: null },
    { id: crypto.randomUUID(), name: 'Apartment 🏠', todos: [], color: '#FFD5DD', newTodo: '', newTodoTimes: null },
    { id: crypto.randomUUID(), name: 'Job Search 💼', todos: [], color: '#C8E8E5', newTodo: '', newTodoTimes: null },
  ]);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Theme state - each color needs its own useState
  const [backgroundColor1, setBackgroundColor1] = useState('#fce7f3');
  const [backgroundColor2, setBackgroundColor2] = useState('#dbeafe');
  const [textColor, setTextColor] = useState('#111827');
  const [buttonColor, setButtonColor] = useState('#FBA2BE');
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState('16');

  // Navigation and Schedule state
  const [activePage, setActivePage] = useState('planner');
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [scheduleBlocks, setScheduleBlocks] = useState([]);
  const [newBlock, setNewBlock] = useState({
    title: '',
    startTime: '',
    endTime: '',
    color: '#FBA2BE'
  });

  // These handle which page you're on                 
  const [scheduledTask, setScheduledTask] = useState<ScheduledTask | null>(null);

  // Add this near your other state declarations at the top
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Add new state for events
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({});

  // Add this helper function
  const formatDateToYYYYMMDD = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Add this function to handle event creation
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date && user) {
      console.log('Attempting to add event:', newEvent);
      
      const event = {
        id: crypto.randomUUID(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        description: newEvent.description,
        user_id: user.id
      };

      const { error } = await supabase
        .from('events')
        .insert([event]);

      if (error) {
        console.error('Error saving event:', error);
      } else {
        console.log('Event saved successfully:', event);
        setEvents([...events, event]);
        setNewEvent({});
        setIsModalOpen(false);
      }
    }
  };

  // Add this function to get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = formatDateToYYYYMMDD(date);
    return events.filter(event => event.date === dateStr);
  };

  // Add this useEffect for auth state
  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Initial session check:', session ? 'logged in' : 'logged out');
        setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session ? 'logged in' : 'logged out');
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
            // Clear any local storage if needed
            localStorage.removeItem('supabase.auth.token');
            // Force reload after sign out
            window.location.reload();
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

    // Get current date and week dates
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
    
  const getWeekDates = () => {
    const curr = new Date(); // This creates a new date based on current time
    curr.setHours(0, 0, 0, 0); // Reset time portion to avoid timezone issues
    const week = [];
    
    curr.setDate(curr.getDate() - curr.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      week.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    
    return week;
  };

  const getHourFromTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
  };

  const getTaskHeight = (
    task: ScheduledTask | { startTime: string | null; endTime: string | null } | null
  ): string => {
    if (!task || !task.startTime || !task.endTime) {
      return '0px';
    }

    const start = getHourFromTime(task.startTime);
    const end = getHourFromTime(task.endTime);
    
    if (start === null || end === null) return '0px';
    return `${(end - start) * 48}px`; // 48px per hour
  };

  const getTimeDifferenceInHours = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) return null; // Handle null or undefined inputs

    // Parse the hours and minutes from both time strings
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Convert start and end times to minutes
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Calculate the difference in minutes
    const differenceInMinutes = endTotalMinutes - startTotalMinutes;

    // Convert back to hours and return
    return differenceInMinutes / 60;
};


  const weekDates = getWeekDates();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate full month calendar data
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const monthDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    monthDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    monthDays.push(i);
  }


  const handleAddTodo = async (categoryIndex: number) => {
    const updatedCategories = [...categories];
    const category = updatedCategories[categoryIndex];

    if (category.newTodo.trim()) {
      const todo = {
        id: crypto.randomUUID(),
        text: category.newTodo,
        completed: false,
        start_time: category.newTodoTimes?.start || null,
        end_time: category.newTodoTimes?.end || null
      };

      // Only save to Supabase if user is logged in
      if (user) {
        const todoWithUser = {
          ...todo,
          user_id: user.id,
          category_id: category.id
        };

        const { error } = await supabase
          .from('todos')
          .insert([todoWithUser]);

        if (error) {
          console.error('Error saving todo:', error);
          return;
        }
      }

      category.todos.push(todo);
      category.newTodo = '';
      category.newTodoTimes = null;
      setCategories(updatedCategories);
    }
  };


  const toggleTodo = async (categoryIndex: number, todoIndex: number) => {
    if (!user) return;

    const updatedCategories = [...categories];
    const todo = updatedCategories[categoryIndex].todos[todoIndex];
    const newCompleted = !todo.completed;

    const { error } = await supabase
      .from('todos')
      .update({ completed: newCompleted })
      .eq('id', todo.id);

    if (!error) {
      todo.completed = newCompleted;
      setCategories(updatedCategories);
    }
  };

  const startEditingCategory = (index: number, currentName: string) => {
    setEditingCategory(index);
    setNewCategoryName(currentName);
  };

  const handleCategoryNameChange = (index: number) => {
    if (newCategoryName.trim()) {
      const updatedCategories = [...categories];
      updatedCategories[index].name = newCategoryName;
      setCategories(updatedCategories);
      setEditingCategory(null);
    }
  };

  const deleteTodo = (categoryIndex: number, todoIndex: number) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].todos.splice(todoIndex, 1);
    setCategories(updatedCategories);
  };

  const isScheduledTaskValid = (
    task: ScheduledTask | null
  ): task is ScheduledTask & { startTime: string; endTime: string } => {
    return !!task?.startTime && !!task?.endTime;
  };

    // For main task
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleTodoTimeChange = (categoryIndex: number, type: 'start' | 'end', value: string) => {
    const updatedCategories = [...categories];
    if (!updatedCategories[categoryIndex].newTodoTimes) {
        updatedCategories[categoryIndex].newTodoTimes = { start: '', end: '' }; // Provide defaults
    }
    updatedCategories[categoryIndex].newTodoTimes[type] = value;
    setCategories(updatedCategories);
};

  const handleTodoInputChange = (categoryIndex: number, value: string) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].newTodo = value;
    setCategories(updatedCategories);
};


  const handleMainTaskSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !mainTask) return;

    const task = {
      user_id: user.id,
      text: mainTask,
      start_time: startTime,
      end_time: endTime,
      completed: false
    };

    const { error } = await supabase
      .from('main_tasks')
      .insert([task]);

    if (!error) {
      setScheduledTask({
        text: mainTask,
        startTime: startTime,
        endTime: endTime,
        completed: false
      });
      setDisplayedTask(mainTask);
      setMainTask('');
      setStartTime('');
      setEndTime('');
    }
  };


  const resetColors = () => {
    setBackgroundColor1('#fce7f3');
    setBackgroundColor2('#dbeafe');
    setTextColor('#111827');
    setButtonColor('#FBA2BE');

    const defaultColors = ['#FBA2BE', '#FFD5DD', '#C8E8E5']; // Define default colors
    const updatedCategories = categories.map((category, index) => ({
        ...category,
        color: defaultColors[index % defaultColors.length], // Cycle through defaults
    }));
    setCategories(updatedCategories);
  };

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('dailyPlanner');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed && typeof parsed === 'object') {
          const { categories, mainTask, colors, fontSize: savedFontSize } = parsed;
          if (Array.isArray(categories)) {
            setCategories(categories);
          }
          if (typeof mainTask === 'string') {
            setDisplayedTask(mainTask);
          }
          if (colors && typeof colors === 'object') {
            setBackgroundColor1(colors.bg1 || '#fce7f3');
            setBackgroundColor2(colors.bg2 || '#dbeafe');
            setTextColor(colors.text || '#111827');
            setButtonColor(colors.button || '#FBA2BE');
          }
          if (savedFontSize) {
            setFontSize(savedFontSize);
          }
          if (Array.isArray(parsed.events)) {
            setEvents(parsed.events);
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Update the useEffect for saving data
  useEffect(() => {
    localStorage.setItem(
      'dailyPlanner',
      JSON.stringify({
        categories,
        mainTask: displayedTask,
        scheduledTask,
        colors: {
          bg1: backgroundColor1,
          bg2: backgroundColor2,
          text: textColor,
          button: buttonColor,
        },
        fontSize,
        events,
      })
    );
  }, [categories, displayedTask, scheduledTask, backgroundColor1, backgroundColor2, textColor, buttonColor, fontSize, events]);

  // Add this helper function near your other utility functions
  const isTimeInPast = (hour: number): boolean => {
    const currentHour = new Date().getHours();
    return hour < currentHour;
  };

  // Add this helper function near your other utility functions
  const sortTodosByTime = (todos: Todo[]) => {
    return [...todos].sort((a, b) => {
        // Handle cases where either todo doesn't have a start time
        if (!a.startTime) return 1;  // Push items without times to the end
        if (!b.startTime) return -1; // Push items without times to the end
        
        // Convert time strings to comparable numbers
        const [aHour, aMin] = a.startTime.split(':').map(Number);
        const [bHour, bMin] = b.startTime.split(':').map(Number);
        
        // Compare hours first
        if (aHour !== bHour) return aHour - bHour;
        // If hours are equal, compare minutes
        return aMin - bMin;
    });
  };

  // Add this function inside your DailyPlanner component
  const handleDeleteTodo = (categoryIndex: number, todoIndex: number) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].todos.splice(todoIndex, 1);
    setCategories(updatedCategories);
  };

  // Add this helper function
  const formatTime12Hour = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Add this helper function to get the user's first name
  const getUserFirstName = () => {
    if (!user?.user_metadata?.full_name) return '';
    return user.user_metadata.full_name.split(' ')[0];
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Reset to default categories instead of clearing
      setCategories([
        { id: crypto.randomUUID(), name: 'Wellness ✨', todos: [], color: '#FBA2BE', newTodo: '', newTodoTimes: null },
        { id: crypto.randomUUID(), name: 'Apartment 🏠', todos: [], color: '#FFD5DD', newTodo: '', newTodoTimes: null },
        { id: crypto.randomUUID(), name: 'Job Search 💼', todos: [], color: '#C8E8E5', newTodo: '', newTodoTimes: null },
      ]);
      setEvents([]);
      setDisplayedTask('');
      setScheduledTask(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/';
    }
  };

  // Add this state at the top of your component
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add these functions near your other useEffects
  useEffect(() => {
    // Load events when user logs in
    const loadEvents = async () => {
      if (user) {
        console.log('Attempting to load events for user:', user.id);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error loading events:', error);
        }
        if (data) {
          console.log('Events loaded successfully:', data);
          setEvents(data);
        }
      }
    };

    loadEvents();
  }, [user]);

  // Add these loading functions
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        console.log('No user, using default categories');
        return;
      }

      console.log('Loading data for user:', user.id);

      // Check for existing categories
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      console.log('Existing categories from DB:', existingCategories);

      if (!existingCategories || existingCategories.length === 0) {
        console.log('No existing categories, creating defaults');
        // First time user - insert default categories into database
        const categoriesToInsert = defaultCategories.map(cat => ({
          name: cat.name,
          color: cat.color,
          user_id: user.id
        }));

        const { data: newCategories, error } = await supabase
          .from('categories')
          .insert(categoriesToInsert)
          .select();

        if (error) {
          console.error('Error creating categories:', error);
        } else {
          console.log('Created new categories:', newCategories);
        }
      } else {
        console.log('Loading existing categories with todos');
        const categoriesWithTodos = existingCategories.map(cat => ({
          ...cat,
          todos: [],
          newTodo: '',
          newTodoTimes: null
        }));

        // Load todos
        const { data: todosData } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id);

        console.log('Loaded todos:', todosData);

        if (todosData) {
          todosData.forEach(todo => {
            const categoryIndex = categoriesWithTodos.findIndex(
              cat => cat.id === todo.category_id
            );
            if (categoryIndex !== -1) {
              categoriesWithTodos[categoryIndex].todos.push(todo);
            }
          });
        }
        
        console.log('Setting categories to:', categoriesWithTodos);
        setCategories(categoriesWithTodos);
      }
    };

    loadUserData();
  }, [user]);

  // Add state for event detail modal
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);

  // Add the event detail modal
  {isEventDetailModalOpen && selectedEvent && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
          <button 
            onClick={() => setIsEventDetailModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Date: </span>
            {new Date(selectedEvent.date).toLocaleDateString()}
          </p>
          {selectedEvent.time && (
            <p className="text-sm">
              <span className="font-medium">Time: </span>
              {formatTime12Hour(selectedEvent.time)}
            </p>
          )}
          {selectedEvent.description && (
            <p className="text-sm">
              <span className="font-medium">Description: </span>
              {selectedEvent.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )}

  return (
    // Main Container
    <div 
      className="min-h-screen" 
      style={{ 
        background: `linear-gradient(to bottom right, ${backgroundColor1}, ${backgroundColor2})`,
        fontSize: `${fontSize}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* ===== DATE HEADER SECTION ===== */}
        <div className="mb-8">
            {/* Current Date Display */}
            <div className="text-center space-y-2 p-4 bg-white/30 backdrop-blur-sm rounded-2xl shadow-sm">
                <div className="text-4xl font-semibold tracking-tight" style={{ color: textColor }}>
                    {currentDate.toLocaleDateString('en-US', { 
                        weekday: 'long',
                    })}
                </div>
                <div className="text-2xl font-light" style={{ color: textColor }}>
                    {currentDate.toLocaleDateString('en-US', { 
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </div>
            </div>

            {/* Week View */}
            <div className="flex justify-center gap-4 mt-6">
                {weekDates.map((date, index) => (
                    <div key={index} className="text-center">
                        <div className="text-sm font-medium mb-2" style={{ color: textColor }}>
                            {weekDays[index]}
                        </div>
                        <div
                            className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-all duration-200 ${
                                date.getDate() === currentDate.getDate() 
                                ? 'shadow-md transform hover:scale-110' 
                                : 'hover:bg-white/20'
                            }`}
                            style={{
                                backgroundColor: date.getDate() === currentDate.getDate() ? buttonColor : 'transparent',
                                color: date.getDate() === currentDate.getDate() ? 'white' : textColor,
                            }}
                        >
                            {date.getDate()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
  
        {/* ===== SETTINGS PANEL ===== */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
                variant="ghost"
                onClick={(e) => {
                    e.stopPropagation();
                    setShowSettings(true);
                }}
                className="flex items-center gap-2"
            >
                <Settings className="h-6 w-6" />
                <span>Settings</span>
            </Button>

            {user ? (
                <Button
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSignOut();
                    }}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowAuth(true);
                    }}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                    <LogIn className="h-5 w-5" />
                    <span>Log In</span>
                </Button>
            )}
        </div>
  
        {/* ===== MAIN CONTENT TABS ===== */}
        <Tabs defaultValue="planner" className="w-full">
          {/* === PLANNER TAB === */}
          <TabsContent value="planner">
            {getEventsForDate(currentDate).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Today's Events</h3>
                <div className="space-y-2">
                  {getEventsForDate(currentDate).map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded"
                      style={{ backgroundColor: buttonColor + '40' }}
                    >
                      <div className="font-medium">{event.title}</div>
                      {event.time && <div className="text-sm">{event.time}</div>}
                      {event.description && <div className="text-sm mt-1">{event.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Main Task Input/Display */}
            {!displayedTask ? (
              <form onSubmit={handleMainTaskSubmit} className="space-y-4 mb-6 max-w-md mx-auto">
                <div className="text-lg font-normal text-gray-900 text-center" style={{ fontFamily: 'system-ui', color: textColor }}>
                  What is expected of you today? 🌟
                </div>
                <div className="flex flex-col gap-2">
                  <Input
                    value={mainTask}
                    onChange={(e) => setMainTask(e.target.value)}
                    placeholder="Enter your main task..."
                    className="flex-grow bg-white/70 max-w-md"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-white/70 w-32"
                    />
                    <span className="self-center">to</span>
                    <Input
                      type="time"
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-white/70 w-32"
                    />
                    <Button 
                      type="submit"
                      className="whitespace-nowrap text-black font-normal hover:bg-black hover:text-white"
                      style={{ backgroundColor: buttonColor }}
                    >
                      Submit ✨
                    </Button>
                  </div>
                </div>
            </form>
            ) : (
              <div className="max-w-md mx-auto relative border border-black rounded p-4 bg-white/70 mb-8">
                <Card className="border-none">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center relative">
                    <div className="text-2xl font-normal text-gray-900" style={{ fontFamily: 'system-ui', color: textColor }}>
                      🎯 {displayedTask}
                    </div>
                    {scheduledTask && scheduledTask.startTime && scheduledTask.endTime && (
                        <div className="text-sm text-gray-600 mt-2">
                            {formatTime12Hour(scheduledTask.startTime)} - {formatTime12Hour(scheduledTask.endTime)}
                        </div>
                    )}
                    <button 
                        onClick={() => {
                            setDisplayedTask('');
                            setScheduledTask(null);
                        }} 
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                        <CloseIcon size={20} />
                    </button>
                  </CardContent>
                </Card>
              </div>
            )}
  
            {/* Category Cards */}
            <div className="flex flex-col md:flex-row gap-4 md:overflow-x-auto pb-4">
              {categories.map((category, categoryIndex) => (
                <Card 
                  key={categoryIndex} 
                  className="flex-1 md:min-w-[300px] border-none"
                  style={{ backgroundColor: category.color + '80' }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    {editingCategory === categoryIndex ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="w-32 bg-white/70 text-gray-900"
                        />
                        <input
                          type="color"
                          value={category.color}
                          onChange={(e) => {
                            const updatedCategories = [...categories];
                            updatedCategories[categoryIndex].color = e.target.value;
                            setCategories(updatedCategories);
                          }}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <Button 
                          onClick={() => handleCategoryNameChange(categoryIndex)}
                          size="sm"
                          className="bg-white/70 text-black hover:bg-white font-normal"
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div 
                          className="font-normal cursor-pointer text-lg text-gray-900"
                          onClick={() => startEditingCategory(categoryIndex, category.name)}
                          style={{ fontFamily: 'system-ui', color: textColor }}
                        >
                          {category.name}
                        </div>
                        <div
                          className="w-4 h-4 rounded-full cursor-pointer"
                          style={{ backgroundColor: category.color }}
                          onClick={() => startEditingCategory(categoryIndex, category.name)}
                        />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Input
                            placeholder="Add new todo..."
                            value={category.newTodo}
                            onChange={(e) => handleTodoInputChange(categoryIndex, e.target.value)}
                            className="bg-white/70 text-gray-900 placeholder:text-gray-500"
                            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                    handleAddTodo(categoryIndex);
                                }
                            }}
                        />

                        {/* Conditionally render the time inputs if there's text in the newTodo input */}
                        {category.newTodo && (
                            <div className="flex flex-col gap-3 p-2 bg-white/80 rounded-lg">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-gray-600">Start Time</label>
                                        <Input
                                            type="time"
                                            value={category.newTodoTimes?.start || ''}
                                            onChange={(e) => handleTodoTimeChange(categoryIndex, 'start', e.target.value)}
                                            className="bg-white text-sm time-input focus:ring-2 focus:ring-offset-0 h-8"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-gray-600">End Time</label>
                                        <Input
                                            type="time"
                                            value={category.newTodoTimes?.end || ''}
                                            onChange={(e) => handleTodoTimeChange(categoryIndex, 'end', e.target.value)}
                                            className="bg-white text-sm time-input focus:ring-2 focus:ring-offset-0 h-8"
                                        />
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => handleAddTodo(categoryIndex)}
                                    size="sm"
                                    className="bg-white hover:bg-white/90 text-black w-full"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Add Task
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Existing todo items display */}
                    <div className="space-y-2">
                        {sortTodosByTime(category.todos).map((todo, todoIndex) => (
                            <div key={todo.id} className="flex items-center gap-2 mb-2">
                                <Checkbox
                                    checked={todo.completed}
                                    onCheckedChange={() => toggleTodo(categoryIndex, todoIndex)}
                                />
                                <div className="flex flex-col flex-grow">
                                    <div className={`${todo.completed ? 'line-through' : ''}`}>
                                        {todo.text}
                                    </div>
                                    {todo.startTime && (
                                        <div className="text-xs text-gray-500">
                                            {formatTime12Hour(todo.startTime)}
                                            {todo.endTime && ` - ${formatTime12Hour(todo.endTime)}`}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteTodo(categoryIndex, todoIndex)}
                                >
                                    <CloseIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
  
          {/* === CALENDAR TAB === */}
          <TabsContent value="calendar">
            <Card className="border-none bg-white/70">
              <CardHeader>
                <div className="flex flex-col items-center gap-4">
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-black font-normal hover:bg-black hover:text-white"
                    style={{ backgroundColor: buttonColor }}
                  >
                    Add Event
                  </Button>

                  {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-bold">Add New Event</h2>
                          <button 
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <form onSubmit={handleAddEvent} className="space-y-4">
                          <input
                            className="w-full p-2 border rounded"
                            placeholder="Event Title"
                            value={newEvent.title || ''}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          />
                          <input
                            className="w-full p-2 border rounded"
                            type="date"
                            value={newEvent.date || ''}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          />
                          <input
                            className="w-full p-2 border rounded"
                            type="time"
                            value={newEvent.time || ''}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                          />
                          <input
                            className="w-full p-2 border rounded"
                            placeholder="Description (optional)"
                            value={newEvent.description || ''}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          />
                          <Button type="submit">Save Event</Button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {monthDays.map((day, index) => (
                      <div
                        key={index}
                        className="min-h-[80px] sm:min-h-[100px] text-center p-1 sm:p-2 rounded-lg relative"
                        style={{
                          backgroundColor: day === currentDate.getDate() ? buttonColor : 'white/10',
                          color: day === currentDate.getDate() ? 'white' : 'gray',
                        }}
                      >
                        {day && (
                          <>
                            <div className="font-normal mb-1">{day}</div>
                            {/* Events container with scroll on overflow */}
                            <div className="space-y-1 max-h-[60px] overflow-y-auto">
                              {events
                                .filter(event => {
                                  const [eventYear, eventMonth, eventDay] = event.date.split('-');
                                  return (
                                    parseInt(eventDay) === day &&
                                    parseInt(eventMonth) === (currentDate.getMonth() + 1) &&
                                    parseInt(eventYear) === currentDate.getFullYear()
                                  );
                                })
                                .map((event) => (
                                  <div
                                    key={event.id}
                                    className="text-[10px] sm:text-xs p-1 rounded cursor-pointer hover:opacity-80"
                                    style={{ backgroundColor: buttonColor + '40' }}
                                    onClick={() => {
                                      // Show event details in a modal
                                      setSelectedEvent(event);
                                      setIsEventDetailModalOpen(true);
                                    }}
                                  >
                                    <div className="font-medium truncate">
                                      {event.title}
                                    </div>
                                    {event.time && (
                                      <div className="text-[8px] sm:text-[10px] text-gray-600">
                                        {formatTime12Hour(event.time)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                            {/* Indicator for more events */}
                            {events.filter(event => {
                              const [eventYear, eventMonth, eventDay] = event.date.split('-');
                              return (
                                parseInt(eventDay) === day &&
                                parseInt(eventMonth) === (currentDate.getMonth() + 1) &&
                                parseInt(eventYear) === currentDate.getFullYear()
                              );
                            }).length > 2 && (
                              <div className="text-[8px] sm:text-xs text-gray-500 mt-1">
                                more...
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
            </Card>
          </TabsContent>
  
          {/* === SCHEDULE TAB === */}
          <TabsContent value="schedule">
            <div className="schedule-view max-w-md mx-auto bg-white/70 p-4">
                {/* Early Hours (12 AM - 6 AM) */}
                {/* <details className="cursor-pointer mb-2">
                    <summary className="text-gray-500 p-2 hover:bg-white/50 rounded">
                        12 AM - 6 AM
                    </summary>
                    <div className="relative">
                        {[...Array(6).keys()].map((hour) => (
                            <div key={hour} className="hour-slot flex items-start h-12 border-t border-gray-200">
                                <span className="text-gray-400 w-12">
                                    {hour === 0 ? '12' : hour} AM
                                </span>
                                <div className="flex-grow" />
                            </div>
                        ))}
                    </div>
                </details> */}

                {/* Past Hours of Current Day */}
                <details className="cursor-pointer mb-2">
                    <summary className="text-gray-500 p-2 hover:bg-white/50 rounded">
                        Past Hours Today
                    </summary>
                    <div className="relative">
                        {[...Array(18).keys()]
                            .map(hour => hour + 6)
                            .filter(hour => isTimeInPast(hour))
                            .map((hour) => (
                                <div key={hour} className="hour-slot flex items-start h-12 border-t border-gray-200 bg-gray-100/50">
                                    <span className="text-gray-400 w-12">
                                        {hour % 12 || 12} {hour < 12 ? 'AM' : 'PM'}
                                    </span>
                                    <div className="flex-grow" />
                                </div>
                            ))}
                    </div>
                </details>

                {/* Current and Future Hours with Tasks Overlay */}
                <div className="relative">
                    {/* Hour slots */}
                    {[...Array(18).keys()]
                        .map(hour => hour + 6)
                        .filter(hour => !isTimeInPast(hour))
                        .map((hour) => (
                            <div key={hour} className="hour-slot flex items-start h-12 border-t border-gray-200">
                                <span className="text-gray-500 w-12">
                                    {hour % 12 || 12} {hour < 12 ? 'AM' : 'PM'}
                                </span>
                                <div className="flex-grow" />
                            </div>
                        ))}

                    {/* Tasks Overlay */}
                    <div className="absolute top-0 left-12 right-0 h-full">
                        {/* Main Task */}
                        {scheduledTask && scheduledTask.startTime && (
                            <div
                                className="absolute left-0 w-full rounded px-2"
                                style={{
                                    backgroundColor: buttonColor,
                                    height: getTaskHeight(scheduledTask.startTime, scheduledTask.endTime),
                                    top: `${((getHourFromTime(scheduledTask.startTime) || 0) - 6) * 48}px`,
                                    opacity: scheduledTask.completed ? 0.5 : 1
                                }}
                            >
                                <span className={scheduledTask.completed ? 'line-through' : ''}>
                                    {scheduledTask.text}
                                </span>
                            </div>
                        )}

                        {/* Category Tasks */}
                        {categories.flatMap((category) =>
                            category.todos
                                .filter((todo) => todo.start_time && todo.end_time)
                                .map((todo) => {
                                    const startHour = getHourFromTime(todo.start_time);
                                    if (startHour === null) return null;
                                    
                                    return (
                                        <div
                                            key={todo.id}
                                            className="absolute left-0 w-full rounded px-2"
                                            style={{
                                                backgroundColor: category.color + '80',
                                                height: getTaskHeight(
                                                    { startTime: todo.start_time, endTime: todo.end_time }
                                                ),
                                                top: `${(startHour - 6) * 48}px`,
                                                opacity: todo.completed ? 0.5 : 1
                                            }}
                                        >
                                            <span className={`text-sm ${todo.completed ? 'line-through' : ''}`}>
                                                {todo.text}
                                            </span>
                                            {todo.start_time && todo.end_time && (
                                                <div className="text-xs opacity-75">
                                                    {formatTime12Hour(todo.start_time)} - {formatTime12Hour(todo.end_time)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>
            </div>
          </TabsContent>
  
          {/* === NAVIGATION TABS === */}
          <TabsList className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/70">
            <TabsTrigger
              value="planner"
              onClick={() => setActivePage('planner')}
              style={{
                backgroundColor: activePage === 'planner' ? buttonColor : 'white',
                color: activePage === 'planner' ? 'white' : 'black'
              }}
              className="font-normal transition-colors"
            >
              Planner
            </TabsTrigger>
            <TabsTrigger
                value="calendar"
                onClick={() => setActivePage('calendar')}
                style={{
                    backgroundColor: activePage === 'calendar' ? buttonColor : 'white',
                    color: activePage === 'calendar' ? 'white' : 'black',
                }}
                className="font-normal transition-colors"
            >
                Calendar
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              onClick={() => setActivePage('schedule')}
              style={{
                backgroundColor: activePage === 'schedule' ? buttonColor : 'white',
                color: activePage === 'schedule' ? 'white' : 'black'
              }}
              className="font-normal transition-colors"
            >
              Schedule
            </TabsTrigger>
          </TabsList>
        </Tabs>
  
      </div>
      {showAuth && (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAuth(false)}
        >
            <div 
                className="bg-white rounded-lg p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Sign In</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowAuth(false)}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </Button>
                </div>
                <AuthComponent onClose={() => setShowAuth(false)} />
            </div>
        </div>
      )}
      {showSettings && (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
        >
            <div 
                className="bg-white rounded-lg p-6 w-full max-w-md space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold">Settings</h3>
                        {user && (
                            <p className="text-sm text-gray-600">
                                Welcome, {getUserFirstName() || 'User'}!
                            </p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSettings(false)}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </Button>
                </div>

                {/* Color Settings */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Gradient Top:</span>
                        <input
                            type="color"
                            value={backgroundColor1}
                            onChange={(e) => setBackgroundColor1(e.target.value)}
                            className="rounded cursor-pointer"
                            style={{ width: '40px', height: '40px' }}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Gradient Bottom:</span>
                        <input
                            type="color"
                            value={backgroundColor2}
                            onChange={(e) => setBackgroundColor2(e.target.value)}
                            className="rounded cursor-pointer"
                            style={{ width: '40px', height: '40px' }}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Font Color:</span>
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="rounded cursor-pointer"
                            style={{ width: '40px', height: '40px' }}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Button Color:</span>
                        <input
                            type="color"
                            value={buttonColor}
                            onChange={(e) => setButtonColor(e.target.value)}
                            className="rounded cursor-pointer"
                            style={{ width: '40px', height: '40px' }}
                        />
                    </div>
                    
                    {/* Font Size Control */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Font Size:</span>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                className="w-16 text-center"
                                min="12"
                                max="24"
                            />
                            <span className="text-xs">px</span>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <Button
                        onClick={resetColors}
                        className="whitespace-nowrap mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
                    >
                        Reset Colors
                    </Button>
                </div>

                {/* Sign Out Button */}
                {user && (
                    <div className="pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await supabase.auth.signOut();
                                setShowSettings(false);
                            }}
                            className="w-full"
                        >
                            Sign Out
                        </Button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
 };
export default DailyPlanner;
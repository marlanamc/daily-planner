"use client"

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X as CloseIcon, Calendar as CalendarIcon, Settings } from 'lucide-react'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  startTime: string | null;
  endTime: string | null;
}

interface Category {
  name: string; // Category name like "Wellness"
  todos: Todo[]; // List of todos in this category
  color: string; // Color of the category card
  newTodo: string; // Text being typed in the "Add todo" box
  newTodoTimes?: { start: string; end: string } | null; // Times for the new todo (optional)
}

interface ScheduledTask {
  text: string;
  startTime: string | null;
  endTime: string | null;
  hour?: number; // Optional if it’s not always set
  completed: boolean;
}

const DailyPlanner = () => {
      // Core state
  const [mainTask, setMainTask] = useState('');
  const [displayedTask, setDisplayedTask] = useState('');
  const [categories, setCategories] = useState<Category[]>([
    { name: 'Wellness ✨', todos: [], color: '#FBA2BE', newTodo: '', newTodoTimes: null },
    { name: 'Apartment 🏠', todos: [], color: '#FFD5DD', newTodo: '', newTodoTimes: null },
    { name: 'Job Search 💼', todos: [], color: '#C8E8E5', newTodo: '', newTodoTimes: null },
]);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Theme state - each color needs its own useState
  const [backgroundColor1, setBackgroundColor1] = useState('#fce7f3');
  const [backgroundColor2, setBackgroundColor2] = useState('#dbeafe');
  const [textColor, setTextColor] = useState('#111827');
  const [buttonColor, setButtonColor] = useState('#FBA2BE');
  const [showSettings, setShowSettings] = useState(false);

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
    const [hour] = time.split(':').map(Number);
    return hour - 6; // Subtract 6 to align with our display that starts at 6 AM
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


  const handleAddTodo = (categoryIndex: number) => {
    const updatedCategories = [...categories];

    if (updatedCategories[categoryIndex].newTodo.trim()) {
        updatedCategories[categoryIndex].todos.push({
            id: crypto.randomUUID(),
            text: updatedCategories[categoryIndex].newTodo,
            completed: false,
            dueDate: undefined,
            startTime: updatedCategories[categoryIndex].newTodoTimes?.start || null,
            endTime: updatedCategories[categoryIndex].newTodoTimes?.end || null,
        });

        // Reset newTodo and newTodoTimes
        updatedCategories[categoryIndex].newTodo = '';
        updatedCategories[categoryIndex].newTodoTimes = null;
        setCategories(updatedCategories);
    }
};



  const updateTodoDueDate = (categoryIndex: number, todoIndex: number, date: string) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].todos[todoIndex].dueDate = date || undefined; // Use undefined
    setCategories(updatedCategories);
  };


  const toggleTodo = (categoryIndex: number, todoIndex: number) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].todos[todoIndex].completed = 
      !updatedCategories[categoryIndex].todos[todoIndex].completed;
    setCategories(updatedCategories);
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

  const getTaskHeight = (scheduledTask: ScheduledTask | null): string => {
    if (!scheduledTask || !scheduledTask.startTime || !scheduledTask.endTime) {
      return '0px'; // Fallback height
    }
  
    const startTime = scheduledTask.startTime;
    const endTime = scheduledTask.endTime;
  
    // Ensure non-null access is explicitly enforced here
    const timeDifferenceInHours = getTimeDifferenceInHours(startTime, endTime);
    return timeDifferenceInHours !== null ? `${timeDifferenceInHours * 48}px` : '0px';
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


  const handleMainTaskSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission behavior

    if (mainTask) {
        // Attempt to extract the time from the main task string
        const timeMatch = mainTask.match(/(\d{1,2})\s*(AM|PM)/i);
        if (timeMatch) {
            const hour = parseInt(timeMatch[1]);
            const isPM = timeMatch[2].toUpperCase() === 'PM';
            const taskHour = isPM && hour !== 12 ? hour + 12 : hour % 12; // Convert to 24-hour time format

            setScheduledTask({
              text: mainTask,
              startTime,
              endTime,
              hour: taskHour, // Optional property
              completed: false,
          
            });
        } else {
            // If no time is extracted, set the task without an hour
            setScheduledTask({
                text: mainTask,
                startTime,
                endTime,
                completed: false,
            });
        }

        // Update the displayed task and reset form fields
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
                const { categories, mainTask, colors } = parsed;
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
            }
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
        // Could also set some default state here
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem(
        'dailyPlanner',
        JSON.stringify({
            categories,
            mainTask: displayedTask,
            scheduledTask, // Add this to persist the scheduled task
            colors: {
                bg1: backgroundColor1,
                bg2: backgroundColor2,
                text: textColor,
                button: buttonColor,
            },
        })
    );
  }, [categories, displayedTask, scheduledTask, backgroundColor1, backgroundColor2, textColor, buttonColor]);

  // Add this helper function near your other utility functions
  const isTimeInPast = (hour: number): boolean => {
    const currentHour = new Date().getHours();
    return hour < currentHour;
  };

  return (
    // Main Container
    <div className="min-h-screen" style={{ background: `linear-gradient(to bottom right, ${backgroundColor1}, ${backgroundColor2})` }}>
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
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/70 hover:bg-white/90"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          {showSettings && (
            <Card className="absolute right-0 mt-2 p-4 bg-white/90 shadow-lg w-64">
              <div className="space-y-4">
                {/* Color Picker Items */}
                  <div className="flex items-center justify-between">
                  <span className="text-sm">Gradient Top:</span>
                  <input
                    type="color"
                    value={backgroundColor1}
                    onChange={(e) => setBackgroundColor1(e.target.value)}
                    className="rounded cursor-pointer"
                    style={{ width: '40px', height: '40px' }} // Fixed size
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gradient Bottom:</span>
                  <input
                    type="color"
                    value={backgroundColor2}
                    onChange={(e) => setBackgroundColor2(e.target.value)}
                    className="rounded cursor-pointer"
                    style={{ width: '40px', height: '40px' }} // Fixed size
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Font Color:</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="rounded cursor-pointer"
                    style={{ width: '40px', height: '40px' }} // Fixed size
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Button Color:</span>
                  <input
                    type="color"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="rounded cursor-pointer"
                    style={{ width: '40px', height: '40px' }} // Fixed size
                  />
                </div>
                <Button
                  onClick={resetColors}
                  className="whitespace-nowrap mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Reset Colors
                </Button>
              </div>
            </Card>
          )}
        </div>
  
        {/* ===== MAIN CONTENT TABS ===== */}
        <Tabs defaultValue="planner" className="w-full">
          {/* === PLANNER TAB === */}
          <TabsContent value="planner">
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
                  <CardContent className="p-4 flex items-center justify-center text-center relative">
                    <div className="text-2xl font-normal text-gray-900" style={{ fontFamily: 'system-ui', color: textColor }}>
                      🎯 {displayedTask}
                    </div>
                    <button 
                      onClick={() => setDisplayedTask('')} 
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
                        {category.todos.map((todo) => (
                            <div key={todo.id}
                                className="flex items-center gap-2 font-normal text-gray-900 group relative hover:bg-white/50 rounded-lg p-2 transition-all" 
                                style={{ fontFamily: 'system-ui', color: textColor }}
                            >
                                <Checkbox
                                    checked={todo.completed}
                                    onCheckedChange={() => toggleTodo(categoryIndex, category.todos.indexOf(todo))}
                                />
                                <div className="flex flex-col">
                                    <span className={todo.completed ? 'line-through' : ''}>
                                        {todo.text}
                                    </span>
                                    {todo.dueDate && (
                                        <span className="text-sm text-gray-500">
                                            Due: {todo.dueDate}
                                        </span>
                                    )}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 absolute right-2 flex gap-2">
                                    <input
                                        type="date"
                                        value={todo.dueDate || ''}
                                        onChange={(e) => updateTodoDueDate(categoryIndex, category.todos.indexOf(todo), e.target.value)}
                                        className="bg-transparent border-none text-sm text-gray-500 hover:text-gray-700"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-500 hover:text-red-500"
                                        onClick={() => deleteTodo(categoryIndex, category.todos.indexOf(todo))}
                                    >
                                        <CloseIcon size={16} />
                                    </Button>
                                </div>
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
              <CardContent className="pt-6">
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-gray-700 font-normal">
                        {day[0]}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {monthDays.map((day, index) => (
                      <div
                        key={index}
                        className={`text-center p-2 rounded-full font-normal`}
                        style={{
                            backgroundColor: day === currentDate.getDate() ? buttonColor : 'transparent',
                            color: day === currentDate.getDate() ? 'white' : 'gray',
                        }}
                    >
                        {day}
                    </div>
                    ))}
                  </div>
                </CardContent>
            </Card>
          </TabsContent>
  
          {/* === SCHEDULE TAB === */}
          <TabsContent value="schedule">
            <div className="schedule-view max-w-md mx-auto bg-white/70 p-4">
                {/* Early Hours Collapsed Section */}
                <div className="mb-2">
                    <details className="cursor-pointer">
                        <summary className="text-gray-500 p-2 hover:bg-white/50 rounded">
                            12 AM - 6 AM
                        </summary>
                        {[...Array(6).keys()].map((hour) => (
                            <div key={hour} className="relative">
                                <div className="hour-slot flex items-start h-12 border-t border-gray-200">
                                    <span className="text-gray-400 w-12">
                                        {hour === 0 ? '12' : hour} AM
                                    </span>
                                    <div className="flex-grow relative">
                                        {/* Task rendering for early hours */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </details>
                </div>

                {/* Regular Hours */}
                <div className="relative">
                    {[...Array(18).keys()].map((hour) => {
                        const displayHour = hour + 6;
                        const isPast = isTimeInPast(displayHour);
                        
                        return (
                            <div key={displayHour}>
                                <div 
                                    className={`hour-slot flex items-start h-12 border-t border-gray-200 transition-colors ${
                                        isPast ? 'bg-gray-100/50' : ''
                                    }`}
                                >
                                    <span className={`w-12 ${isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {displayHour % 12 || 12} {displayHour < 12 ? 'AM' : 'PM'}
                                    </span>
                                    <div className="flex-grow">
                                        {/* Time slot content */}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Tasks rendered outside the hour slots */}
                    <div className="absolute top-0 left-12 right-0 h-full pointer-events-none">
                        {/* Scheduled Task */}
                        {scheduledTask && (
                            <div
                                className="absolute left-0 w-full rounded px-2 pointer-events-auto"
                                style={{
                                    backgroundColor: buttonColor,
                                    height: (() => {
                                        const diff = getTimeDifferenceInHours(
                                            scheduledTask.startTime,
                                            scheduledTask.endTime
                                        );
                                        return diff !== null ? `${diff * 48}px` : '0px';
                                    })(),
                                    top: `${(getHourFromTime(scheduledTask.startTime) || 0) * 48}px`
                                }}
                            >
                                <span className={scheduledTask.completed ? 'line-through' : ''}>
                                    {scheduledTask.text}
                                </span>
                            </div>
                        )}

                        {/* Category Todos */}
                        {categories.flatMap((category) =>
                            category.todos
                                .filter((todo) => todo.startTime !== null && todo.startTime !== undefined)
                                .map((todo) => (
                                    <div
                                        key={todo.id}
                                        className="absolute left-0 w-full rounded px-2 pointer-events-auto"
                                        style={{
                                            backgroundColor: category.color + '80',
                                            height: (() => {
                                                const diff = getTimeDifferenceInHours(todo.startTime || null, todo.endTime || null);
                                                return diff !== null ? `${diff * 48}px` : '0px';
                                            })(),
                                            top: `${(getHourFromTime(todo.startTime || '') || 0) * 48}px`
                                        }}
                                    >
                                        <span className={todo.completed ? 'line-through' : ''}>
                                            {todo.text}
                                        </span>
                                    </div>
                                ))
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
    </div>
  );
 };
export default DailyPlanner;
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Todo {
  text: string;
  completed: boolean;
  dueDate?: string | null;  // Changed to string for simple date input
}

interface Category {
  name: string;
  todos: Todo[];
  color: string;
  newTodo: string;
}

const DailyPlanner = () => {
  const [mainTask, setMainTask] = useState('');
  const [displayedTask, setDisplayedTask] = useState('');
  const [categories, setCategories] = useState<Category[]>([
    { name: 'Wellness ✨', todos: [], color: '#FBA2BE', newTodo: '' },
    { name: 'Apartment 🏠', todos: [], color: '#FFD5DD', newTodo: '' },
    { name: 'Job Search 💼', todos: [], color: '#C8E8E5', newTodo: '' }
  ]);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showFullCalendar, setShowFullCalendar] = useState(false);

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

  const handleMainTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDisplayedTask(mainTask);
    setMainTask('');
  };

  const handleTodoInputChange = (categoryIndex: number, value: string) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].newTodo = value;
    setCategories(updatedCategories);
  };

  const handleAddTodo = (categoryIndex: number) => {
    const updatedCategories = [...categories];
    if (updatedCategories[categoryIndex].newTodo.trim()) {
      updatedCategories[categoryIndex].todos.push({
        text: updatedCategories[categoryIndex].newTodo,
        completed: false,
        dueDate: null
      });
      updatedCategories[categoryIndex].newTodo = '';
      setCategories(updatedCategories);
    }
  };

  const updateTodoDueDate = (categoryIndex: number, todoIndex: number, date: string) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].todos[todoIndex].dueDate = date || null;
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

  useEffect(() => {
    const savedData = localStorage.getItem('dailyPlanner');
    if (savedData) {
      const { categories: savedCategories, mainTask } = JSON.parse(savedData);
      setCategories(savedCategories);
      setDisplayedTask(mainTask);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyPlanner', JSON.stringify({
      categories,
      mainTask: displayedTask
    }));
  }, [categories, displayedTask]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Week View */}
        <div className="mb-8">
          <div className="text-3xl text-center mb-6 font-normal text-gray-900" style={{ fontFamily: 'system-ui' }}>
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            })}
          </div>
          <div className="flex justify-center gap-4 mb-8">
            {weekDates.map((date, index) => (
              <div key={index} className="text-center">
                <div className="text-sm text-gray-700 mb-2 font-medium">
                  {weekDays[index][0]}
                </div>
                <div 
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-normal
                    ${date.getDate() === currentDate.getDate() ? 
                      'bg-[#FBA2BE] text-white' : 
                      'text-gray-900'
                    }`}
                >
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Planner Content */}
        <Tabs defaultValue="planner" className="w-full">
          <TabsContent value="planner">
          <form onSubmit={handleMainTaskSubmit} className="space-y-4 mb-6 max-w-xl mx-auto">
            <div className="text-lg font-normal text-gray-900 text-center" style={{ fontFamily: 'system-ui' }}>
              What is expected of you today? 🌟
            </div>
            <div className="flex gap-4">
              <Input
                value={mainTask}
                onChange={(e) => setMainTask(e.target.value)}
                placeholder="Enter your main task..."
                className="flex-grow bg-white/70"
              />
              <Button 
                type="submit"
                className="bg-[#FBA2BE] hover:bg-[#FFD5DD] text-black font-normal"
              >
                Submit ✨
              </Button>
            </div>
            </form>
            {displayedTask && (
              <Card className="mb-6 bg-white/70 border-none">
                <CardContent className="p-4">
                  <div className="text-lg font-normal text-gray-900" style={{ fontFamily: 'system-ui' }}>
                    🎯 {displayedTask}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-row gap-4 overflow-x-auto pb-4">
              {categories.map((category, categoryIndex) => (
                <Card 
                  key={categoryIndex} 
                  className="flex-1 min-w-[300px] border-none"
                  style={{ backgroundColor: category.color + '80' }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    {editingCategory === categoryIndex ? (
                      <div className="flex gap-2">
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="w-32 bg-white/70 text-gray-900"
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
                      <div 
                        className="font-normal cursor-pointer text-lg text-gray-900"
                        onClick={() => startEditingCategory(categoryIndex, category.name)}
                        style={{ fontFamily: 'system-ui' }}
                      >
                        {category.name}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new todo..."
                        value={category.newTodo}
                        onChange={(e) => handleTodoInputChange(categoryIndex, e.target.value)}
                        className="bg-white/70 text-gray-900 placeholder:text-gray-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddTodo(categoryIndex);
                          }
                        }}
                      />
                      <Button 
                        onClick={() => handleAddTodo(categoryIndex)}
                        size="sm"
                        className="bg-white/70 hover:bg-white text-black px-2"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {category.todos.map((todo, todoIndex) => (
                        <div 
                          key={todoIndex} 
                          className="flex items-center gap-2 font-normal text-gray-900 group relative hover:bg-white/50 rounded-lg p-2 transition-all" 
                          style={{ fontFamily: 'system-ui' }}
                        >
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => toggleTodo(categoryIndex, todoIndex)}
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
                              onChange={(e) => updateTodoDueDate(categoryIndex, todoIndex, e.target.value)}
                              className="bg-transparent border-none text-sm text-gray-500 hover:text-gray-700"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-red-500"
                              onClick={() => deleteTodo(categoryIndex, todoIndex)}
                            >
                              <X size={16} />
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
                      className={`text-center p-2 rounded-full font-normal ${
                        day === currentDate.getDate() 
                          ? 'bg-[#FBA2BE] text-white' 
                          : 'text-gray-900'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsList className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/70">
            <TabsTrigger value="planner" className="data-[state=active]:bg-[#FBA2BE] font-normal text-gray-900">
              Planner
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-[#FBA2BE] font-normal text-gray-900">
              Calendar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default DailyPlanner;
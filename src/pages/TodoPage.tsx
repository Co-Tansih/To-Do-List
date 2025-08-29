import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ListTodo, LogOut, Plus, Pencil, Trash2, X, Check, Calendar, User, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const TodoPage: React.FC = () => {
  const { logout, user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, [user]);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          { text: newTodo.trim(), user_id: user.id }
        ])
        .select()
        .single();

      if (error) throw error;

      setTodos([data, ...todos]);
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .match({ id });

      if (error) throw error;

      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editText.trim()) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ text: editText.trim() })
        .match({ id })
        .select()
        .single();

      if (error) throw error;

      setTodos(todos.map(todo => 
        todo.id === id ? data : todo
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const toggleComplete = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .match({ id })
        .select()
        .single();

      if (error) throw error;

      setTodos(todos.map(t => 
        t.id === id ? data : t
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <ListTodo className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
                <p className="text-sm text-gray-600">Stay organized and productive</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <ListTodo className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
                <p className="text-sm text-gray-600">Total Tasks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{completedCount}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalCount - completedCount}</p>
                <p className="text-sm text-gray-600">Remaining</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Todo Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-6">
          <form onSubmit={handleAddTodo}>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full rounded-xl border-0 py-4 px-6 bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!newTodo.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </div>
          </form>
        </div>

        {/* Todo List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="text-gray-600 font-medium">Loading your tasks...</span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/50">
              {todos.map((todo, index) => (
                <div
                  key={todo.id}
                  className={`p-6 transition-all duration-200 hover:bg-gray-50/50 ${
                    todo.completed ? 'opacity-75' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleComplete(todo.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                        todo.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {todo.completed && <Check className="h-4 w-4 mx-auto" />}
                    </button>
                    
                    {editingId === todo.id ? (
                      <div className="flex-1 flex gap-3">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEdit(todo.id)}
                          className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`flex-1 text-lg ${
                            todo.completed 
                              ? 'text-gray-500 line-through' 
                              : 'text-gray-800'
                          } transition-colors`}
                        >
                          {todo.text}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(todo.id);
                              setEditText(todo.text);
                            }}
                            className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(todo.id)}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {todos.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ListTodo className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks yet</h3>
                  <p className="text-gray-600 mb-6">Create your first task to get started on your productivity journey</p>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto"></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                {completedCount} of {totalCount} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {completedCount === totalCount && totalCount > 0 
                ? "🎉 All tasks completed! Great job!" 
                : `${totalCount - completedCount} tasks remaining`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoPage;
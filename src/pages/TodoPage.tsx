import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ListTodo, LogOut, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#f8be00] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ListTodo className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Todo List</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>

          <form onSubmit={handleAddTodo} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new todo..."
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add
              </button>
            </div>
          </form>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    todo.completed ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  
                  {editingId === todo.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleEdit(todo.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span
                        className={`flex-1 ${
                          todo.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                        }`}
                      >
                        {todo.text}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(todo.id);
                            setEditText(todo.text);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {todos.length === 0 && (
                <p className="text-center text-gray-500 py-4">No todos yet. Add one above!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoPage;


import { useState, useCallback } from 'react';
import AuthContext             from '../context/AuthContext';
import  useAuth  from '../context/useAuth';
import { useWebSocket }         from '../hooks/Usewebsocket';
import NotificationToast        from '../components/Notificationtoast';
import TaskForm                 from '../components/TaskForm';
import TaskList                 from '../components/TaskList';
import FilterBar                from '../components/FilterBar';

export default function Dashboard() {

const { user, token, logout } = useAuth();

 
  const [filter, setFilter] = useState('all'); 


  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

 
  const handleWsMessage = useCallback(
    (data) => {
      if (data.type === 'TASK_OVERDUE' || data.type === 'TASK_COMPLETED') {
        refresh();
      }
    },
    [refresh]
  );

  const { notification, clearNotification } = useWebSocket(token, handleWsMessage);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
   
      <header className="sticky top-0 z-40 bg-zinc-900 border-b border-zinc-800 px-4 py-3
        flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Todo</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400 hidden sm:block">{user?.email}</span>
          <button
            onClick={logout}
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

   
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <TaskForm onAdd={refresh} />

        <FilterBar filter={filter} onChange={setFilter} />

        <TaskList
          key={refreshKey}
          filter={filter}
          onUpdate={refresh}
        />
      </main>

     
      <NotificationToast notification={notification} onDismiss={clearNotification} />
    </div>
  );
}

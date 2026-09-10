import { NavLink, Outlet } from 'react-router-dom';
import { Home, Video, LayoutList, Target, BarChart3, Eye, Settings } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/record', label: 'Record', icon: Video },
  { to: '/sessions', label: 'Sessions', icon: LayoutList },
  { to: '/pitch-map', label: 'Pitch map', icon: Target },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/umpire-view', label: 'Umpire view', icon: Eye },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Shell() {
  return (
    <div className="min-h-screen bg-turf-950 text-chalk-100">
      <div className="flex flex-col lg:flex-row">
        <aside className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-turf-700 bg-turf-900">
          <div className="flex items-center gap-2 px-5 py-5">
            <div className="h-7 w-7 rounded-full bg-seam-500 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-chalk-100" />
            </div>
            <span className="font-display text-2xl font-semibold tracking-tight">Pace Pal</span>
          </div>
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible px-2 pb-3 lg:pb-5 gap-0.5">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 whitespace-nowrap rounded-sm px-3 py-2.5 font-body text-sm transition-colors ${
                    isActive
                      ? 'bg-turf-700 text-chalk-100'
                      : 'text-slateg-400 hover:text-chalk-300 hover:bg-turf-800'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

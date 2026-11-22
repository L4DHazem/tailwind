import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, FileText, LogOut, LogIn, UserPlus, Trees, Menu, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(undefined);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu on page navigation
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const linkClass = ({ isActive }) =>
    `nav-link inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors focus:outline-hidden ${isActive ? 'nav-link-active' : ''
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus:outline-hidden ${isActive
      ? 'nav-link-active'
      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800'
    }`;

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      return;
    }
    localStorage.removeItem('usertoken');
    setIsOpen(false);
    navigate('/Login', { replace: true });
  }

  if (session === undefined) return null;

  return (
    <nav className="nav-bar sticky top-0 z-40 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-gray-100 dark:border-neutral-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Brand Logo */}
        <NavLink
          to="/"
          className="font-display flex flex-none items-center gap-2 text-xl font-semibold text-wood-800 dark:text-white focus:outline-hidden"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-wood-700 text-wood-50 shadow-wood">
            <Trees size={18} />
          </span>
          Harvest
        </NavLink>

        {/* Desktop Navigation Links */}
        {session && (
          <div className="hidden md:flex items-center gap-x-1">
            <NavLink to="/" end className={linkClass}>
              <Home size={15} />
              Feed
            </NavLink>

            <NavLink to="/profile" className={linkClass}>
              <User size={15} />
              Profile
            </NavLink>

            <NavLink to="/Postdetail" className={linkClass}>
              <FileText size={15} />
              Post Details
            </NavLink>
            <NavLink to="/Photo" className={linkClass}>
              <FileText size={15} />
              Photo
            </NavLink>
          </div>
        )}

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-x-1">
          {session ? (
            <button
              type="button"
              onClick={handleLogout}
              className={`${linkClass({ isActive: false })} cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30`}
            >
              <LogOut size={15} />
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/Login" className={linkClass}>
                <LogIn size={15} />
                Login
              </NavLink>

              <NavLink to="/Register" className={linkClass}>
                <UserPlus size={15} />
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-hidden"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-neutral-800 px-4 pt-2 pb-4 flex flex-col gap-1 bg-white dark:bg-neutral-900 shadow-lg">
          {session ? (
            <>
              <NavLink to="/" end className={mobileLinkClass}>
                <Home size={18} />
                Feed
              </NavLink>

              <NavLink to="/profile" className={mobileLinkClass}>
                <User size={18} />
                Profile
              </NavLink>

              <NavLink to="/Postdetail" className={mobileLinkClass}>
                <FileText size={18} />
                Post Details
              </NavLink>
              <NavLink to="/Photo" className={mobileLinkClass}>
                <FileText size={18} />
                Photo
              </NavLink>

              <hr className="my-1 border-gray-100 dark:border-neutral-800" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/Login" className={mobileLinkClass}>
                <LogIn size={18} />
                Login
              </NavLink>

              <NavLink to="/Register" className={mobileLinkClass}>
                <UserPlus size={18} />
                Register
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

import { useState, Fragment } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Transition } from "@headlessui/react";

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-indigo-700 text-white shadow py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/images/logo.svg"
              alt="JO 2024"
              className="h-20 w-auto"
            />
            {/* Si tu veux tu peux garder un petit texte */}
            {/* <span className="text-xl font-bold hover:text-indigo-300">JO 2024</span> */}
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex space-x-6 items-center font-medium">
            <Link to="/" className="hover:text-indigo-300 transition-colors">
              Accueil
            </Link>

            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="hover:text-indigo-300 transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="hover:text-indigo-300 transition-colors"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-indigo-300 transition-colors">
                Se connecter
              </Link>
            )}
          </div>

          {/* Hamburger mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile avec animation */}
      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-300 transform"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-200 transform"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-2"
      >
        <div className="md:hidden bg-indigo-600 px-2 pt-2 pb-3 space-y-1 font-medium">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded hover:bg-indigo-500"
          >
            Accueil
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded hover:bg-indigo-500"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-indigo-500"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded hover:bg-indigo-500"
            >
              Se connecter
            </Link>
          )}
        </div>
      </Transition>
    </nav>
  );
};

export default Navbar;



/*import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Navbar = () => {
    const { isLoggedIn } = useAuth();

    return (
        <nav style={{ marginBottom: '20px' }}>
            <Link to="/">Accueil</Link> |{' '}
            {isLoggedIn ? (
                <>
                  <Link to="/Dashboard">Dashboard</Link> | {' '}
                  <Link to="/logout">Se déconnecter</Link>
                </>
            ) : (
                  <Link to="/login">Se connecter</Link>
            )}
        </nav>
    );
};

export default Navbar;*/
// <<<<<<< cursor/refactor-app-layout-component-f25e
// import { ReactNode, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   Menu,
//   X,
//   Plus,
//   UserPlus,
//   Settings,
// } from "lucide-react";
// import ThemeToggle from "../ui/ThemeToggle";
// import { useMouseFollow } from "@/hooks/use-mouse-follow";

// // Constants
// const NAVIGATION_MODES = {
//   MANUAL: "manual",
//   CREATE: "create", 
//   JOIN: "join",
// } as const;

// const NAVIGATION_PATHS = {
//   MANUAL: "/manual",
//   CREATE: "/create",
//   JOIN: "/join",
//   FACILITATE: "/facilitate",
// } as const;

// const BUTTON_STYLES = {
//   base: "relative z-10 px-4 h-10 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1",
//   active: "shadow-sm transform scale-[1.02] border-2",
//   inactive: "hover:scale-[1.01] border-2",
//   manual: {
//     active: "bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-100 border-blue-500",
//     inactive: "bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400"
//   },
//   create: {
//     active: "bg-gradient-to-b from-primary to-accent text-white border-primary",
//     inactive: "bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary"
//   },
//   join: {
//     active: "bg-gradient-to-b from-moss-green to-sage-green text-white border-moss-green",
//     inactive: "bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-moss-green"
//   }
// } as const;

// interface AppLayoutProps {
//   children: ReactNode;
// }

// // Helper functions
// const getNavigationMode = (pathname: string) => {
//   if (pathname.startsWith(NAVIGATION_PATHS.MANUAL)) return NAVIGATION_MODES.MANUAL;
//   if (pathname.startsWith(NAVIGATION_PATHS.JOIN)) return NAVIGATION_MODES.JOIN;
//   if (pathname.startsWith(NAVIGATION_PATHS.CREATE)) return NAVIGATION_MODES.CREATE;
//   return NAVIGATION_MODES.CREATE; // default
// };

// const getButtonClassName = (mode: string, currentMode: string, buttonType: 'manual' | 'create' | 'join') => {
//   const isActive = mode === currentMode;
//   const baseClass = BUTTON_STYLES.base;
//   const stateClass = isActive ? BUTTON_STYLES.active : BUTTON_STYLES.inactive;
//   const styleClass = isActive ? BUTTON_STYLES[buttonType].active : BUTTON_STYLES[buttonType].inactive;
  
//   return `${baseClass} ${stateClass} ${styleClass}`;
// };

// function AppLayout({ children }: AppLayoutProps) {
//   const location = useLocation();
//   const isActive = (path: string) => {
//     if (path === "/") {
//       return location.pathname === "/";
//     }
//     return (
//       location.pathname === path || location.pathname.startsWith(`${path}/`)
//     );
//   };
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const navigate = useNavigate();

//   const {
//     containerRef,
//     mousePosition,
//     isHovering,
//     handleMouseMove,
//     handleMouseEnter,
//     handleMouseLeave,
//   } = useMouseFollow({
//     enabled: true,

//     smoothness: 0.2,
//   });

//   const handleFacilitateClick = () => {
//     // Check if we're already in a meeting context
//     if (location.pathname.startsWith(NAVIGATION_PATHS.FACILITATE)) {
//       return; // Already in facilitate view
//     }

//     // Check if we're in a meeting room and can extract meeting ID
//     if (location.pathname.startsWith("/meeting/")) {
//       const meetingId = location.pathname.split("/meeting/")[1];
//       if (meetingId) {
//         navigate(`${NAVIGATION_PATHS.FACILITATE}/${meetingId}`);
//         return;
//       }
//     }

//     // Check localStorage for stored meeting data
//     const storedMeetingData = localStorage.getItem("currentMeeting");
//     if (storedMeetingData) {
//       try {
//         const { meetingCode, facilitatorName, meetingName } =
//           JSON.parse(storedMeetingData);
//         navigate(`${NAVIGATION_PATHS.FACILITATE}/${meetingCode}`, {
//           state: {
//             facilitatorName,
//             meetingName,
//             meetingCode,
//           },
//         });
//         return;
//       } catch (error) {
//         console.error("Error parsing stored meeting data:", error);
//         localStorage.removeItem("currentMeeting");
//       }
//     }

//     // If no meeting context found, prompt for meeting code
//     const meetingCode = prompt("Enter meeting code to facilitate:");
//     if (meetingCode && meetingCode.trim()) {
//       navigate(`${NAVIGATION_PATHS.FACILITATE}/${meetingCode.trim()}`);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-zinc-950 dark:to-zinc-900 flex flex-col">
//       <header
//         className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800"
//         role="banner"
//       >
//         <div className="container mx-auto px-4 py-3 flex items-center justify-between">
//           <Link
//             to="/"
//             aria-current={isActive("/") ? "page" : undefined}
//             aria-label="Home"
//             className="flex items-center space-x-2"
//           >
//             <img
//               src="/icc-removebg-preview.png"
//               alt="ICC Austin logo"
//               className="w-6 h-6 object-contain drop-shadow-sm dark:brightness-110"
//             />
//             <span className="font-semibold text-gray-900 dark:text-zinc-100">
//               ICC Austin Stack
//             </span>
//           </Link>
//           <div className="flex items-center space-x-3">
//             <nav
//               className="hidden md:flex items-center space-x-1"
//               role="navigation"
//               aria-label="Main navigation"
//             >
//               {/* Manual/Create/Join toggle */}
//               {(() => {
//                 const mode = getNavigationMode(location.pathname);

//                 // Calculate indicator position based on mouse or selected state
//                 const getIndicatorStyle = () => {
//                   if (isHovering) {
//                     // Follow mouse position when hovering - smooth fluid movement
//                     const containerWidth = containerRef.current?.offsetWidth || 0
//                     const mouseX = mousePosition.x
//                     const indicatorWidth = containerWidth / 3 - 4
// =======
// // <<<<<<< cursor/review-todo-md-list-c301
// // import { ReactNode, useState } from 'react'
// // import { Link, useLocation, useNavigate } from 'react-router-dom'
// // import { Menu, X, Plus, UserPlus, MessageSquare, QrCode, Users } from 'lucide-react'
// // import ThemeToggle from '../ui/ThemeToggle'
// // import { useMouseFollow } from '@/hooks/use-mouse-follow'
// // import { useFacilitatorSession } from '@/hooks/useFacilitatorSession'
// // =======
// // import { ReactNode, useState } from "react";
// // import { Link, useLocation, useNavigate } from "react-router-dom";
// // import {
// //   Menu,
// //   X,
// //   Plus,
// //   UserPlus,
// //   MessageSquare,
// //   QrCode,
// //   Settings,
// // } from "lucide-react";
// // import ThemeToggle from "../ui/ThemeToggle";
// // import { useMouseFollow } from "@/hooks/use-mouse-follow";
// // >>>>>>> main

// // interface AppLayoutProps {
// //   children: ReactNode;
// // }

// // function AppLayout({ children }: AppLayoutProps) {
// //   const location = useLocation();
// //   const isActive = (path: string) => {
// //     if (path === "/") {
// //       return location.pathname === "/";
// //     }
// // <<<<<<< cursor/review-todo-md-list-c301
// //     return location.pathname === path || location.pathname.startsWith(`${path}/`)
// //   }
// //   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
// //   const navigate = useNavigate()
// //   const { hasActiveSession, getSessionInfo, restoreSession } = useFacilitatorSession()
// // =======
// //     return (
// //       location.pathname === path || location.pathname.startsWith(`${path}/`)
// //     );
// //   };
// //   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
// //   const navigate = useNavigate();
// // >>>>>>> main

// //   const {
// //     containerRef,
// //     mousePosition,
// //     isHovering,
// //     handleMouseMove,
// //     handleMouseEnter,
// //     handleMouseLeave,
// //   } = useMouseFollow({
// //     enabled: true,

// //     smoothness: 0.2,
// //   });

// //   const handleFacilitateClick = () => {
// //     // Check if we're already in a meeting context
// //     if (location.pathname.startsWith("/facilitate/")) {
// //       return; // Already in facilitate view
// //     }

// //     // Check if we're in a meeting room and can extract meeting ID
// //     if (location.pathname.startsWith("/meeting/")) {
// //       const meetingId = location.pathname.split("/meeting/")[1];
// //       if (meetingId) {
// //         navigate(`/facilitate/${meetingId}`);
// //         return;
// //       }
// //     }

// //     // Check localStorage for stored meeting data
// //     const storedMeetingData = localStorage.getItem("currentMeeting");
// //     if (storedMeetingData) {
// //       try {
// //         const { meetingCode, facilitatorName, meetingName } =
// //           JSON.parse(storedMeetingData);
// //         navigate(`/facilitate/${meetingCode}`, {
// //           state: {
// //             facilitatorName,
// //             meetingName,
// //             meetingCode,
// //           },
// //         });
// //         return;
// //       } catch (error) {
// //         console.error("Error parsing stored meeting data:", error);
// //         localStorage.removeItem("currentMeeting");
// //       }
// //     }

// //     // If no meeting context found, prompt for meeting code
// //     const meetingCode = prompt("Enter meeting code to facilitate:");
// //     if (meetingCode && meetingCode.trim()) {
// //       navigate(`/facilitate/${meetingCode.trim()}`);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-zinc-950 dark:to-zinc-900 flex flex-col">
// //       <header
// //         className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800"
// //         role="banner"
// //       >
// //         <div className="container mx-auto px-4 py-3 flex items-center justify-between">
// //           <Link
// //             to="/"
// //             aria-current={isActive("/") ? "page" : undefined}
// //             aria-label="Home"
// //             className="flex items-center space-x-2"
// //           >
// //             <img
// //               src="/icc-removebg-preview.png"
// //               alt="ICC Austin logo"
// //               className="w-6 h-6 object-contain drop-shadow-sm dark:brightness-110"
// //             />
// //             <span className="font-semibold text-gray-900 dark:text-zinc-100">
// //               ICC Austin Stack
// //             </span>
// //           </Link>
// //           <div className="flex items-center space-x-3">
// // <<<<<<< cursor/review-todo-md-list-c301
// //             {/* Facilitate Button - Show if user has active session */}
// //             {hasActiveSession() && (
// //               <button
// //                 onClick={restoreSession}
// //                 className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-primary/90 hover:to-accent/90 transition-all duration-200 shadow-sm hover:shadow-md"
// //                 title={`Resume facilitating ${getSessionInfo()?.meetingCode}`}
// //               >
// //                 <Users className="w-4 h-4" />
// //                 <span className="text-sm font-medium">Facilitate</span>
// //               </button>
// //             )}
            
// //             <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
// // =======
// //             <nav
// //               className="hidden md:flex items-center space-x-1"
// //               role="navigation"
// //               aria-label="Main navigation"
// //             >
// // >>>>>>> main
// //               {/* Manual/Create/Join toggle */}
// //               {(() => {
// //                 const mode = isActive("/manual")
// //                   ? "manual"
// //                   : isActive("/join")
// //                     ? "join"
// //                     : isActive("/create")
// //                       ? "create"
// //                       : "create";

// //                 // Calculate indicator position based on mouse or selected state
// //                 const getIndicatorStyle = () => {
// //                   if (isHovering) {
// //                     // Follow mouse position when hovering - smooth fluid movement
// //                     const containerWidth = containerRef.current?.offsetWidth || 0
// //                     const mouseX = mousePosition.x
// //                     const indicatorWidth = containerWidth / 3 - 4
// >>>>>>> main
                    
// //                     // Smoothly follow mouse with some constraints
// //                     let leftPosition = Math.max(4, Math.min(mouseX - indicatorWidth / 2, containerWidth - indicatorWidth - 4))
                    
// //                     // Determine background based on which section we're closest to
// //                     const sectionWidth = containerWidth / 3
// //                     let background
                    
// <<<<<<< cursor/refactor-app-layout-component-f25e
//                     if (mouseX < sectionWidth) {
//                       background = 'linear-gradient(to right, hsl(var(--secondary)), hsl(var(--secondary-foreground)))'
//                     } else if (mouseX < sectionWidth * 2) {
//                       background = 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))'
//                     } else {
//                       background = 'linear-gradient(to right, hsl(var(--moss-green)), hsl(var(--sage-green)))'
//                     }

//                     return {
//                       left: `${leftPosition}px`,
//                       width: `${indicatorWidth}px`,
//                       background
//                     }

//                   } else {
//                     // Use selected state when not hovering
//                     if (mode === "manual") {
//                       return {
//                         left: "4px",
//                         width: "calc(33.333% - 4px)",
//                         background:
//                           "linear-gradient(to right, hsl(var(--secondary)), hsl(var(--secondary-foreground)))",
//                       };
//                     } else if (mode === "create") {
//                       return {
//                         left: "calc(33.333% + 2px)",
//                         width: "calc(33.333% - 4px)",
//                         background:
//                           "linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))",
//                       };
//                     } else {
//                       return {
//                         left: "calc(66.666% + 2px)",
//                         width: "calc(33.333% - 4px)",
//                         background:
//                           "linear-gradient(to right, hsl(var(--moss-green)), hsl(var(--sage-green)))",
//                       };
//                     }
//                   }
//                 };

//                 return (
//                   <div
//                     ref={containerRef}
//                     onMouseMove={handleMouseMove}
//                     onMouseEnter={handleMouseEnter}
//                     onMouseLeave={handleMouseLeave}
//                     className="relative bg-gradient-to-r from-muted/50 to-muted/30 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-xl p-1 flex backdrop-blur-sm border border-border/50 shadow-elegant w-[360px]"
//                   >
//                     <div
//                       className="toggle-indicator"
//                       style={getIndicatorStyle()}
//                     />
//                     <button
//                       onClick={() => navigate(NAVIGATION_PATHS.MANUAL)}
//                       className={getButtonClassName(NAVIGATION_MODES.MANUAL, mode, 'manual')}
//                       aria-current={mode === NAVIGATION_MODES.MANUAL ? "page" : undefined}
//                     >
//                       <span className="text-xs">Manual</span>
//                     </button>
//                     <button
//                       onClick={() => navigate(NAVIGATION_PATHS.CREATE)}
//                       className={getButtonClassName(NAVIGATION_MODES.CREATE, mode, 'create')}
//                       aria-current={mode === NAVIGATION_MODES.CREATE ? 'page' : undefined}
//                     >
//                       <Plus className={`w-3 h-3 mr-1 transition-all duration-300 ${
//                         mode === NAVIGATION_MODES.CREATE ? 'text-white' : 'text-primary'
//                       }`} />
//                       <span className="text-xs">Create</span>
//                     </button>
//                     <button
//                       onClick={() => navigate(NAVIGATION_PATHS.JOIN)}
//                       className={getButtonClassName(NAVIGATION_MODES.JOIN, mode, 'join')}
//                       aria-current={mode === NAVIGATION_MODES.JOIN ? 'page' : undefined}
//                     >
//                       <UserPlus className={`w-3 h-3 mr-1 transition-all duration-300 ${
//                         mode === NAVIGATION_MODES.JOIN ? 'text-white' : 'text-moss-green'
//                       }`} />
//                       <span className="text-xs">Join</span>
//                     </button>

//                   </div>
//                 );
//               })()}
//             </nav>

//             {/* Facilitate Button */}
//             <button
//               onClick={handleFacilitateClick}
//               className={`hidden md:flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out hover:scale-[1.02] ${
//                 location.pathname.startsWith(NAVIGATION_PATHS.FACILITATE)
//                   ? "bg-primary text-primary-foreground shadow-sm"
//                   : "text-foreground/70 hover:text-foreground dark:text-zinc-300 dark:hover:text-zinc-100 hover:bg-muted/50"
//               }`}
//               aria-current={
//                 location.pathname.startsWith(NAVIGATION_PATHS.FACILITATE)
//                   ? "page"
//                   : undefined
//               }
//               title="Facilitate Meeting"
//             >
//               <Settings className="w-4 h-4 mr-2" />
//               <span className="text-xs">Facilitate</span>
//             </button>

//             <ThemeToggle />
//             <button
//               className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               aria-expanded={mobileMenuOpen}
//               aria-controls="mobile-menu"
//               aria-label="Toggle menu"
//             >
//               {mobileMenuOpen ? (
//                 <X className="w-5 h-5" />
//               ) : (
//                 <Menu className="w-5 h-5" />
//               )}
//             </button>
//           </div>
//         </div>
//         {mobileMenuOpen && (
//           <nav
//             id="mobile-menu"
//             className="md:hidden border-t border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur"
//             role="navigation"
//             aria-label="Mobile navigation"
//           >
//             <div className="container mx-auto px-4 py-3 flex flex-col space-y-1">
//               {(() => {
//                 const mode = getNavigationMode(location.pathname);
//                 return (
//                   <>
//                     <Link
//                       to={NAVIGATION_PATHS.MANUAL}
//                       onClick={() => setMobileMenuOpen(false)}
//                       aria-current={isActive(NAVIGATION_PATHS.MANUAL) ? "page" : undefined}
//                       className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium border-2 ${
//                         isActive(NAVIGATION_PATHS.MANUAL)
//                           ? BUTTON_STYLES.manual.active
//                           : BUTTON_STYLES.manual.inactive
//                       }`}
//                     >
//                       Manual
//                     </Link>
//                     <Link
//                       to={NAVIGATION_PATHS.CREATE}
//                       onClick={() => setMobileMenuOpen(false)}
//                       aria-current={isActive(NAVIGATION_PATHS.CREATE) ? "page" : undefined}
//                       className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium border-2 ${
//                         isActive(NAVIGATION_PATHS.CREATE)
//                           ? BUTTON_STYLES.create.active
//                           : BUTTON_STYLES.create.inactive
//                       }`}
//                     >
//                       <Plus className="w-4 h-4 mr-2" />
//                       Create Meeting
//                     </Link>
//                     <Link
//                       to={NAVIGATION_PATHS.JOIN}
//                       onClick={() => setMobileMenuOpen(false)}
//                       aria-current={isActive(NAVIGATION_PATHS.JOIN) ? "page" : undefined}
//                       className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium border-2 ${
//                         isActive(NAVIGATION_PATHS.JOIN)
//                           ? BUTTON_STYLES.join.active
//                           : BUTTON_STYLES.join.inactive
//                       }`}
//                     >
//                       <UserPlus className="w-4 h-4 mr-2" />
//                       Join Meeting
//                     </Link>
//                   </>
//                 );
//               })()}
//               <button
//                 onClick={() => {
//                   setMobileMenuOpen(false);
//                   handleFacilitateClick();
//                 }}
//                 className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${
//                   location.pathname.startsWith(NAVIGATION_PATHS.FACILITATE)
//                     ? "text-primary dark:text-primary-light bg-primary/10"
//                     : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
//                 }`}
//               >
//                 <Settings className="w-4 h-4 mr-2" />
//                 Facilitate Meeting
//               </button>
//             </div>
//           </nav>
//         )}
//       </header>
//       <main className="flex-grow" role="main">
//         {children}
//       </main>
//       <footer
//         className="bg-white/70 backdrop-blur border-t border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800 mt-auto"
//         role="contentinfo"
//       >
//         <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center space-y-4">
//           <img
//             src="/icc2-removebg-preview.png"
//             alt="ICC2 Logo"
//             className="h-12 w-auto object-contain drop-shadow-sm dark:brightness-110"
//           />
//           <p className="text-sm text-gray-600 dark:text-zinc-400 text-center">
//             Powered by ICC Austin Stack
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default AppLayout;
// =======
// //                     if (mouseX < sectionWidth) {
// //                       background = 'linear-gradient(to right, hsl(var(--secondary)), hsl(var(--secondary-foreground)))'
// //                     } else if (mouseX < sectionWidth * 2) {
// //                       background = 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))'
// //                     } else {
// //                       background = 'linear-gradient(to right, hsl(var(--moss-green)), hsl(var(--sage-green)))'

// //                     // Follow mouse position when hovering
// //                     const containerWidth =
// //                       containerRef.current?.offsetWidth || 0;
// //                     const mouseX = mousePosition.x;

// //                     // Determine which section we're in
// //                     const sectionWidth = containerWidth / 3;
// //                     let leftPosition, width, background;

// //                     if (mouseX < sectionWidth) {
// //                       // Manual section - full button width
// //                       leftPosition = 4;
// //                       width = sectionWidth - 4;
// //                       background =
// //                         "linear-gradient(to right, hsl(var(--secondary)), hsl(var(--secondary-foreground)))";
// //                     } else if (mouseX < sectionWidth * 2) {
// //                       // Create section - smaller indicator
// //                       leftPosition = sectionWidth + 2;
// //                       width = sectionWidth - 4;
// //                       background =
// //                         "linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))";
// //                     } else {
// //                       // Join section - smaller indicator
// //                       leftPosition = sectionWidth * 2 + 2;
// //                       width = sectionWidth - 4;
// //                       background =
// //                         "linear-gradient(to right, hsl(var(--moss-green)), hsl(var(--sage-green)))";

// //                     }

// //                     return {
// //                       left: `${leftPosition}px`,
// //                       width: `${indicatorWidth}px`,
// //                       background
// //                     }

// //                       width: `${width}px`,
// //                       background,

// //                   } else {
// //                     // Use selected state when not hovering
// //                     if (mode === "manual") {
// //                       return {
// //                         left: "4px",
// //                         width: "calc(33.333% - 4px)",
// //                         background:
// //                           "linear-gradient(to right, hsl(var(--secondary)), hsl(var(--secondary-foreground)))",
// //                       };
// //                     } else if (mode === "create") {
// //                       return {
// //                         left: "calc(33.333% + 2px)",
// //                         width: "calc(33.333% - 4px)",
// //                         background:
// //                           "linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))",
// //                       };
// //                     } else {
// //                       return {
// //                         left: "calc(66.666% + 2px)",
// //                         width: "calc(33.333% - 4px)",
// //                         background:
// //                           "linear-gradient(to right, hsl(var(--moss-green)), hsl(var(--sage-green)))",
// //                       };
// //                     }
// //                   }
// //                 };

// //                 return (
// //                   <div
// //                     ref={containerRef}
// //                     onMouseMove={handleMouseMove}
// //                     onMouseEnter={handleMouseEnter}
// //                     onMouseLeave={handleMouseLeave}
// //                     className="relative bg-gradient-to-r from-muted/50 to-muted/30 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-xl p-1 flex backdrop-blur-sm border border-border/50 shadow-elegant w-[360px]"
// //                   >
// //                     <div
// //                       className="toggle-indicator"
// //                       style={getIndicatorStyle()}
// //                     />
// //                     <button

// //                       onClick={() => navigate("/manual")}
// //                       className={`relative z-10 px-4 h-10 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
// //                         mode === "manual"
// //                           ? "bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-100 shadow-sm transform scale-[1.02] border-2 border-blue-500"
// //                           : "bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:scale-[1.01] border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400"

// //                       }`}
// //                       aria-current={mode === "manual" ? "page" : undefined}
// //                     >
// //                       <span className="text-xs">Manual</span>
// //                     </button>
// //                     <button
// //                       onClick={() => navigate('/create')}
// //                       className={`toggle-button relative z-10 px-3 h-10 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
// //                         mode === 'create'
// //                           ? 'text-white shadow-sm transform scale-[1.02]'
// //                           : 'text-foreground/70 hover:text-foreground hover:scale-[1.01] dark:text-zinc-300 dark:hover:text-zinc-100'
// //                       }`}
// //                       aria-current={mode === 'create' ? 'page' : undefined}
// //                     >
// //                       <Plus className={`w-3 h-3 mr-1 transition-all duration-300 ${
// //                         mode === 'create' ? 'text-white' : 'text-primary'
// //                       }`} />
// //                       <span className="text-xs">Create</span>
// //                     </button>
// //                     <button
// //                       onClick={() => navigate('/join')}
// //                       className={`toggle-button relative z-10 px-3 h-10 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
// //                         mode === 'join'
// //                           ? 'text-white shadow-sm transform scale-[1.02]'
// //                           : 'text-foreground/70 hover:text-foreground hover:scale-[1.01] dark:text-zinc-300 dark:hover:text-zinc-100'
// //                       }`}
// //                       aria-current={mode === 'join' ? 'page' : undefined}
// //                     >
// //                       <UserPlus className={`w-3 h-3 mr-1 transition-all duration-300 ${
// //                         mode === 'join' ? 'text-white' : 'text-moss-green'
// //                       }`} />
// //                       <span className="text-xs">Join</span>
// //                     </button>


// //                     {/* Create and Join - Simple text link style */}
// //                     <div className="flex items-center justify-center flex-1 px-2">
// //                       <button
// //                         onClick={() => navigate("/create")}
// //                         className={`flex items-center justify-center text-sm font-medium transition-all duration-300 ease-out hover:scale-[1.02] ${
// //                           mode === "create"
// //                             ? "text-primary dark:text-primary-light"
// //                             : "text-foreground/70 hover:text-foreground dark:text-zinc-300 dark:hover:text-zinc-100"
// //                         }`}
// //                         aria-current={mode === "create" ? "page" : undefined}
// //                       >
// //                         <Plus
// //                           className={`w-3 h-3 mr-1 transition-all duration-300 ${
// //                             mode === "create"
// //                               ? "text-primary dark:text-primary-light"
// //                               : "text-primary"
// //                           }`}
// //                         />
// //                         <span className="text-xs">Create</span>
// //                       </button>
// //                     </div>

// //                     <div className="flex items-center justify-center flex-1 px-2">
// //                       <button
// //                         onClick={() => navigate("/join")}
// //                         className={`flex items-center justify-center text-sm font-medium transition-all duration-300 ease-out hover:scale-[1.02] ${
// //                           mode === "join"
// //                             ? "text-moss-green dark:text-sage-green"
// //                             : "text-foreground/70 hover:text-foreground dark:text-zinc-300 dark:hover:text-zinc-100"
// //                         }`}
// //                         aria-current={mode === "join" ? "page" : undefined}
// //                       >
// //                         <UserPlus
// //                           className={`w-3 h-3 mr-1 transition-all duration-300 ${
// //                             mode === "join"
// //                               ? "text-moss-green dark:text-sage-green"
// //                               : "text-moss-green"
// //                           }`}
// //                         />
// //                         <span className="text-xs">Join</span>
// //                       </button>
// //                     </div>

// //                   </div>
// //                 );
// //               })()}
// //             </nav>

// //             {/* Facilitate Button */}
// //             <button
// //               onClick={handleFacilitateClick}
// //               className={`hidden md:flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out hover:scale-[1.02] ${
// //                 location.pathname.startsWith("/facilitate/")
// //                   ? "bg-primary text-primary-foreground shadow-sm"
// //                   : "text-foreground/70 hover:text-foreground dark:text-zinc-300 dark:hover:text-zinc-100 hover:bg-muted/50"
// //               }`}
// //               aria-current={
// //                 location.pathname.startsWith("/facilitate/")
// //                   ? "page"
// //                   : undefined
// //               }
// //               title="Facilitate Meeting"
// //             >
// //               <Settings className="w-4 h-4 mr-2" />
// //               <span className="text-xs">Facilitate</span>
// //             </button>

// //             <ThemeToggle />
// //             <button
// //               className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
// //               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
// //               aria-expanded={mobileMenuOpen}
// //               aria-controls="mobile-menu"
// //               aria-label="Toggle menu"
// //             >
// //               {mobileMenuOpen ? (
// //                 <X className="w-5 h-5" />
// //               ) : (
// //                 <Menu className="w-5 h-5" />
// //               )}
// //             </button>
// //           </div>
// //         </div>
// //         {mobileMenuOpen && (
// //           <nav
// //             id="mobile-menu"
// //             className="md:hidden border-t border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur"
// //             role="navigation"
// //             aria-label="Mobile navigation"
// //           >
// //             <div className="container mx-auto px-4 py-3 flex flex-col space-y-1">
// //               {/* Facilitate Button for Mobile */}
// //               {hasActiveSession() && (
// //                 <button
// //                   onClick={() => {
// //                     restoreSession();
// //                     setMobileMenuOpen(false);
// //                   }}
// //                   className="h-10 flex items-center px-4 rounded-lg text-sm font-medium bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 transition-all duration-200"
// //                 >
// //                   <Users className="w-4 h-4 mr-2" />
// //                   Resume Facilitating
// //                 </button>
// //               )}
              
// //               <Link
// //                 to="/manual"
// //                 onClick={() => setMobileMenuOpen(false)}

// //                 aria-current={isActive('/manual') ? 'page' : undefined}
// //                 className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${
// //                   isActive('/manual') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'

// //                 aria-current={isActive("/manual") ? "page" : undefined}
// //                 className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium border-2 ${
// //                   isActive("/manual")
// //                     ? "bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-100 border-blue-500"
// //                     : "bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400"

// //                 }`}
// //               >
// //                 Manual
// //               </Link>
// //               <Link
// //                 to="/create"
// //                 onClick={() => setMobileMenuOpen(false)}
// //                 aria-current={isActive("/create") ? "page" : undefined}
// //                 className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${

// //                   isActive('/create') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'

// //                   isActive("/create")
// //                     ? "text-primary dark:text-primary-light"
// //                     : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"

// //                 }`}
// //               >
// //                 <MessageSquare className="w-4 h-4 mr-2" />
// //                 Create Meeting
// //               </Link>
// //               <Link
// //                 to="/join"
// //                 onClick={() => setMobileMenuOpen(false)}
// //                 aria-current={isActive("/join") ? "page" : undefined}
// //                 className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${

// //                   isActive('/join') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'

// //                   isActive("/join")
// //                     ? "text-moss-green dark:text-sage-green"
// //                     : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"

// //                 }`}
// //               >
// //                 <QrCode className="w-4 h-4 mr-2" />
// //                 Join Meeting
// //               </Link>
// //               <button
// //                 onClick={() => {
// //                   setMobileMenuOpen(false);
// //                   handleFacilitateClick();
// //                 }}
// //                 className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${
// //                   location.pathname.startsWith("/facilitate/")
// //                     ? "text-primary dark:text-primary-light bg-primary/10"
// //                     : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
// //                 }`}
// //               >
// //                 <Settings className="w-4 h-4 mr-2" />
// //                 Facilitate Meeting
// //               </button>
// //             </div>
// //           </nav>
// //         )}
// //       </header>
// //       <main className="flex-grow" role="main">
// //         {children}
// //       </main>
// //       <footer
// //         className="bg-white/70 backdrop-blur border-t border-gray-200 dark:bg-zinc-950/70 dark:border-zinc-800 mt-auto"
// //         role="contentinfo"
// //       >
// //         <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center space-y-4">
// //           <img
// //             src="/icc2-removebg-preview.png"
// //             alt="ICC2 Logo"
// //             className="h-12 w-auto object-contain drop-shadow-sm dark:brightness-110"
// //           />
// //           <p className="text-sm text-gray-600 dark:text-zinc-400 text-center">
// //             Powered by ICC Austin Stack
// //           </p>
// //         </div>
// //       </footer>
// //     </div>
// //   );
// // }

// // export default AppLayout;
// >>>>>>> main

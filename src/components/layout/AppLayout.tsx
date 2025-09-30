// <<<<<<< cursor/refactor-app-layout-and-create-meeting-d706
// import { ReactNode, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   Menu,
//   X,
//   Plus,
//   UserPlus,
//   MessageSquare,
//   QrCode,
//   Settings,
//   Users,
// } from "lucide-react";
// import ThemeToggle from "../ui/ThemeToggle";
// import { useMouseFollow } from "@/hooks/use-mouse-follow";
// import { useFacilitatorSession } from "@/hooks/useFacilitatorSession";

// // Constants
// const NAVIGATION_ITEMS = [
//   { path: "/manual", label: "Manual", icon: null },
//   { path: "/create", label: "Create", icon: Plus },
//   { path: "/join", label: "Join", icon: UserPlus },
// ] as const;
// =======
// import { ReactNode } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { Plus, UserPlus, Settings } from "lucide-react";
// import ThemeToggle from "../ui/ThemeToggle";
// >>>>>>> main

// interface AppLayoutProps {
//   children: ReactNode;
// }

// function AppLayout({ children }: AppLayoutProps) {
//   const location = useLocation();
// <<<<<<< cursor/refactor-app-layout-and-create-meeting-d706
//   const navigate = useNavigate();
//   const { hasActiveSession, getSessionInfo, restoreSession } = useFacilitatorSession();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   // Helper functions
// =======
// >>>>>>> main
//   const isActive = (path: string) => {
//     if (path === "/") {
//       return location.pathname === "/";
//     }
//     return (
//       location.pathname === path || location.pathname.startsWith(`${path}/`)
//     );
//   };

// <<<<<<< cursor/refactor-app-layout-and-create-meeting-d706
//   const getCurrentMode = () => {
//     if (isActive("/manual")) return "manual";
//     if (isActive("/join")) return "join";
//     if (isActive("/create")) return "create";
//     return "create";
//   };

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
//     if (location.pathname.startsWith("/facilitate/")) {
//       return; // Already in facilitate view
//     }

//     // Check if we're in a meeting room and can extract meeting ID
//     if (location.pathname.startsWith("/meeting/")) {
//       const meetingId = location.pathname.split("/meeting/")[1];
//       if (meetingId) {
//         navigate(`/facilitate/${meetingId}`);
//         return;
//       }
//     }

//     // Check localStorage for stored meeting data
//     const storedMeetingData = localStorage.getItem("currentMeeting");
//     if (storedMeetingData) {
//       try {
//         const { meetingCode, facilitatorName, meetingName } =
//           JSON.parse(storedMeetingData);
//         navigate(`/facilitate/${meetingCode}`, {
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
//       navigate(`/facilitate/${meetingCode.trim()}`);
//     }
//   };

// =======
// >>>>>>> main
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
// <<<<<<< cursor/refactor-app-layout-and-create-meeting-d706
//             {/* Facilitate Button - Show if user has active session */}
//             {hasActiveSession() && (
//               <button
//                 onClick={restoreSession}
//                 className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-primary/90 hover:to-accent/90 transition-all duration-200 shadow-sm hover:shadow-md"
//                 title={`Resume facilitating ${getSessionInfo()?.meetingCode}`}
//               >
//                 <Users className="w-4 h-4" />
//                 <span className="text-sm font-medium">Facilitate</span>
//               </button>
//             )}
            
// =======
// >>>>>>> main
//             <nav
//               className="hidden md:flex items-center space-x-1"
//               role="navigation"
//               aria-label="Main navigation"
//             >
// <<<<<<< cursor/refactor-app-layout-and-create-meeting-d706
//               {/* Manual/Create/Join toggle */}
//               {(() => {
//                 const mode = getCurrentMode();

//                 // Calculate indicator position based on mouse or selected state
//                 const getIndicatorStyle = () => {
//                   if (isHovering) {
//                     // Follow mouse position when hovering - smooth fluid movement
//                     const containerWidth = containerRef.current?.offsetWidth || 0;
//                     const mouseX = mousePosition.x;

//                     // Determine which section we're in
//                     const sectionWidth = containerWidth / 3;
//                     let leftPosition, width, background;

//                     if (mouseX < sectionWidth) {
//                       // Manual section - full button width
//                       leftPosition = 4;
//                       width = sectionWidth - 4;
//                       background =
//                         "linear-gradient(to right, hsl(var(--secondary)), hsl(var(--secondary-foreground)))";
//                     } else if (mouseX < sectionWidth * 2) {
//                       // Create section - smaller indicator
//                       leftPosition = sectionWidth + 2;
//                       width = sectionWidth - 4;
//                       background =
//                         "linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))";
//                     } else {
//                       // Join section - smaller indicator
//                       leftPosition = sectionWidth * 2 + 2;
//                       width = sectionWidth - 4;
//                       background =
//                         "linear-gradient(to right, hsl(var(--moss-green)), hsl(var(--sage-green)))";
//                     }

//                     return {
//                       left: `${leftPosition}px`,
//                       width: `${width}px`,
//                       background,
//                     };
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
//                       onClick={() => navigate("/manual")}
//                       className={`relative z-10 px-4 h-10 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
//                         mode === "manual"
//                           ? "bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-100 shadow-sm transform scale-[1.02] border-2 border-blue-500"
//                           : "bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:scale-[1.01] border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400"
//                       }`}
//                       aria-current={mode === "manual" ? "page" : undefined}
//                     >
//                       <span className="text-xs">Manual</span>
//                     </button>
//                     <button
//                       onClick={() => navigate('/create')}
//                       className={`toggle-button relative z-10 px-3 h-10 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
//                         mode === 'create'
//                           ? 'text-white shadow-sm transform scale-[1.02]'
//                           : 'text-foreground/70 hover:text-foreground hover:scale-[1.01] dark:text-zinc-300 dark:hover:text-zinc-100'
//                       }`}
//                       aria-current={mode === 'create' ? 'page' : undefined}
//                     >
//                       <Plus className={`w-3 h-3 mr-1 transition-all duration-300 ${
//                         mode === 'create' ? 'text-white' : 'text-primary'
//                       }`} />
//                       <span className="text-xs">Create</span>
//                     </button>
//                     <button
//                       onClick={() => navigate('/join')}
//                       className={`toggle-button relative z-10 px-3 h-10 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center flex-1 ${
//                         mode === 'join'
//                           ? 'text-white shadow-sm transform scale-[1.02]'
//                           : 'text-foreground/70 hover:text-foreground hover:scale-[1.01] dark:text-zinc-300 dark:hover:text-zinc-100'
//                       }`}
//                       aria-current={mode === 'join' ? 'page' : undefined}
//                     >
//                       <UserPlus className={`w-3 h-3 mr-1 transition-all duration-300 ${
//                         mode === 'join' ? 'text-white' : 'text-moss-green'
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
//                 location.pathname.startsWith("/facilitate/")
//                   ? "bg-primary text-primary-foreground shadow-sm"
//                   : "text-foreground/70 hover:text-foreground dark:text-zinc-300 dark:hover:text-zinc-100 hover:bg-muted/50"
//               }`}
//               aria-current={
//                 location.pathname.startsWith("/facilitate/")
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
//               {/* Facilitate Button for Mobile */}
//               {hasActiveSession() && (
//                 <button
//                   onClick={() => {
//                     restoreSession();
//                     setMobileMenuOpen(false);
//                   }}
//                   className="h-10 flex items-center px-4 rounded-lg text-sm font-medium bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 transition-all duration-200"
//                 >
//                   <Users className="w-4 h-4 mr-2" />
//                   Resume Facilitating
//                 </button>
//               )}
              
//               <Link
//                 to="/manual"
//                 onClick={() => setMobileMenuOpen(false)}
//                 aria-current={isActive("/manual") ? "page" : undefined}
//                 className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium border-2 ${
//                   isActive("/manual")
//                     ? "bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-100 border-blue-500"
//                     : "bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400"
// =======
//               <Link
//                 to="/manual"
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                   isActive("/manual")
//                     ? "bg-primary text-white"
//                     : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
// >>>>>>> main
//                 }`}
//               >
//                 Manual
//               </Link>
//               <Link
//                 to="/create"
// <<<<<<< cursor/refactor-app-layout-and-create-meeting-d706
//                 onClick={() => setMobileMenuOpen(false)}
//                 aria-current={isActive("/create") ? "page" : undefined}
//                 className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${
//                   isActive("/create")
//                     ? "text-primary dark:text-primary-light"
//                     : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
//                 }`}
//               >
//                 <MessageSquare className="w-4 h-4 mr-2" />
//                 Create Meeting
//               </Link>
//               <Link
//                 to="/join"
//                 onClick={() => setMobileMenuOpen(false)}
//                 aria-current={isActive("/join") ? "page" : undefined}
//                 className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${
//                   isActive("/join")
//                     ? "text-moss-green dark:text-sage-green"
//                     : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
//                 }`}
//               >
//                 <QrCode className="w-4 h-4 mr-2" />
//                 Join Meeting
//               </Link>
//               <button
//                 onClick={() => {
//                   setMobileMenuOpen(false);
//                   handleFacilitateClick();
//                 }}
//                 className={`h-10 flex items-center px-4 rounded-lg text-sm font-medium ${
//                   location.pathname.startsWith("/facilitate/")
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
// =======
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
//                   isActive("/create")
//                     ? "bg-primary text-white"
//                     : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
//                 }`}
//               >
//                 <Plus className="w-4 h-4 mr-1" />
//                 Create
//               </Link>
//               <Link
//                 to="/join"
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
//                   isActive("/join")
//                     ? "bg-primary text-white"
//                     : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
//                 }`}
//               >
//                 <UserPlus className="w-4 h-4 mr-1" />
//                 Join
//               </Link>
//             </nav>
//             <button
//               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
//                 location.pathname.startsWith("/facilitate/")
//                   ? "bg-primary text-white"
//                   : "text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
//               }`}
//               title="Facilitate Meeting"
//             >
//               <Settings className="w-4 h-4 mr-1" />
//               Facilitate
//             </button>
//             <ThemeToggle />
//           </div>
//         </div>
// >>>>>>> main
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
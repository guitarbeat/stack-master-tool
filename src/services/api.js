// import {
//   AppError,
//   ErrorCode,
//   ErrorType,
//   logError,
// } from "../utils/errorHandling";

// class ApiService {
//   constructor() {
//     this.baseUrl = this.getBaseUrl();
//   }

//   getBaseUrl() {
//     // Return the backend API URL based on environment
//     if (window.location.hostname === "localhost") {
//       return "http://localhost:3001/api";
//     }
//     // For production, use the current origin (assuming backend is served from same domain)
//     return `${window.location.origin}/api`;
//   }

//   async createMeeting(facilitatorName, meetingTitle) {
//     try {
//       // Validate input
//       if (
//         !facilitatorName ||
//         typeof facilitatorName !== "string" ||
//         facilitatorName.trim().length === 0
//       ) {
//         throw new AppError(
//           ErrorCode.INVALID_PARTICIPANT_NAME,
//           undefined,
//           "Facilitator name is required"
//         );
// <<<<<<< cursor/set-optional-meeting-title-for-remote-access-09d4
// =======
//       }

//       if (
//         !meetingTitle ||
//         typeof meetingTitle !== "string" ||
//         meetingTitle.trim().length === 0
//       ) {
//         throw new AppError(
//           ErrorCode.MISSING_REQUIRED_FIELD,
//           undefined,
//           "Meeting title is required"
//         );
// >>>>>>> main
//       }

//       // Meeting title is optional - use default if not provided
//       const finalMeetingTitle =
//         meetingTitle &&
//         typeof meetingTitle === "string" &&
//         meetingTitle.trim().length > 0
//           ? meetingTitle.trim()
//           : `${facilitatorName.trim()}'s Meeting`;

//       const response = await fetch(`${this.baseUrl}/meetings`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           facilitatorName: facilitatorName.trim(),
// <<<<<<< cursor/set-optional-meeting-title-for-remote-access-09d4
//           meetingTitle: finalMeetingTitle,
// =======
//           meetingTitle: meetingTitle.trim(),
// >>>>>>> main
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));

//         // Map server error codes to client error codes
//         let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
//         if (errorData.code) {
//           errorCode = errorData.code;
//         } else if (response.status === 400) {
//           errorCode = ErrorCode.INVALID_PARTICIPANT_NAME;
//         } else if (response.status === 409) {
//           errorCode = ErrorCode.MEETING_CODE_EXISTS;
//         } else if (response.status === 500) {
//           errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
//         }

//         throw new AppError(
//           errorCode,
//           errorData,
//           errorData.error || "Failed to create meeting"
//         );
//       }

//       const data = await response.json();
//       return {
//         meetingId: data.meetingId,
//         meetingCode: data.meetingCode,
// <<<<<<< cursor/set-optional-meeting-title-for-remote-access-09d4
//         meetingTitle: finalMeetingTitle,
// =======
//         meetingTitle: meetingTitle.trim(),
// >>>>>>> main
//         facilitatorName: facilitatorName.trim(),
//       };
//     } catch (error) {
//       if (error instanceof AppError) {
//         throw error;
//       }

//       // Handle network errors
//       if (error.name === "TypeError" && error.message.includes("fetch")) {
//         throw new AppError(
//           ErrorCode.CONNECTION_FAILED,
//           error,
//           "Unable to connect to server"
//         );
//       }

//       logError(error, "createMeeting");
//       throw new AppError(
//         ErrorCode.INTERNAL_SERVER_ERROR,
//         error,
//         "Failed to create meeting"
//       );
//     }
//   }

//   async getMeeting(meetingCode) {
//     try {
//       // Validate meeting code
//       if (
//         !meetingCode ||
//         typeof meetingCode !== "string" ||
//         meetingCode.length !== 6
//       ) {
//         throw new AppError(
//           ErrorCode.INVALID_MEETING_CODE,
//           undefined,
//           "Meeting code must be 6 characters"
//         );
//       }

//       const response = await fetch(
//         `${this.baseUrl}/meetings/${meetingCode.toUpperCase()}`
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));

//         // Map server error codes to client error codes
//         let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
//         if (errorData.code) {
//           errorCode = errorData.code;
//         } else if (response.status === 400) {
//           errorCode = ErrorCode.INVALID_MEETING_CODE;
//         } else if (response.status === 404) {
//           errorCode = ErrorCode.MEETING_NOT_FOUND;
//         } else if (response.status === 500) {
//           errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
//         }

//         throw new AppError(
//           errorCode,
//           errorData,
//           errorData.error || "Failed to get meeting"
//         );
//       }

//       const data = await response.json();
//       return {
//         meetingId: data.id,
//         meetingCode: data.code,
//         meetingTitle: data.title,
//         facilitatorName: data.facilitator,
//         createdAt: data.createdAt,
//       };
//     } catch (error) {
//       if (error instanceof AppError) {
//         throw error;
//       }

//       // Handle network errors
//       if (error.name === "TypeError" && error.message.includes("fetch")) {
//         throw new AppError(
//           ErrorCode.CONNECTION_FAILED,
//           error,
//           "Unable to connect to server"
//         );
//       }

//       logError(error, "getMeeting");
//       throw new AppError(
//         ErrorCode.INTERNAL_SERVER_ERROR,
//         error,
//         "Failed to get meeting"
//       );
//     }
//   }

//   getJoinUrl(meetingCode) {
//     return `${window.location.origin}/join/${meetingCode}`;
//   }

//   getSocketUrl() {
//     // Return the backend WebSocket URL based on environment
//     if (window.location.hostname === "localhost") {
//       return "http://localhost:3001";
//     }
//     // For production, use the current origin (assuming backend is served from same domain)
//     return window.location.origin;
//   }
// }

// export default new ApiService();

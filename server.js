// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const { v4: uuidv4 } = require("uuid");
// const dotenv = require("dotenv");

// dotenv.config();

// // Initialize Express app
// const app = express();
// const server = http.createServer(app);

// // Configure CORS
// app.use(
//   cors({
//     origin: "*",
//     // origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );

// // Initialize Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // In-memory data storage
// const activePlaygrounds = new Map();
// const chatMessages = new Map();
// const userSessions = new Map();

// // Debug logger
// const debug = (namespace, message, data = null) => {
//   const timestamp = new Date().toISOString();
//   console.log(`[${timestamp}] [${namespace}] ${message}`);
//   if (data) console.log(data);
// };

// // Socket.IO connection handler
// io.on("connection", (socket) => {
//   debug("socket", `New client connected: ${socket.id}`);

//   // Get active playgrounds
//   socket.on("getActivePlaygrounds", () => {
//     const playgroundsArray = Array.from(activePlaygrounds.values()).map(
//       (pg) => ({
//         id: pg.id,
//         name: pg.name,
//         language: pg.language,
//         isPublic: pg.isPublic,
//         createdBy: pg.createdBy,
//         participants: pg.participants.length,
//         maxParticipants: pg.maxParticipants,
//       })
//     );

//     socket.emit("activePlaygrounds", playgroundsArray);
//   });

//   // Create a new playground --
//   socket.on("createPlayground", (data) => {
//     try {
//       const playgroundId = uuidv4();

//       const playground = {
//         id: playgroundId,
//         name: data.name,
//         language: data.language,
//         isPublic: data.isPublic,
//         createdBy: data.createdBy,
//         creatorAvatar: data.creatorAvatar,
//         createdAt: new Date(),
//         code: "",
//         maxParticipants: data.maxParticipants || 5,
//         participants: [],
//       };

//       activePlaygrounds.set(playgroundId, playground);
//       chatMessages.set(playgroundId, []);

//       debug(
//         "playground",
//         `Created new playground: ${playground.name} (${playgroundId})`
//       );

//       console.log(`Playground Data:`, playground);

//       // Notify all clients about the new playground
//       io.emit("playgroundCreated", {
//         id: playground.id,
//         name: playground.name,
//         language: playground.language,
//         isPublic: playground.isPublic,
//         createdBy: playground.createdBy,
//         creatorAvatar: playground.creatorAvatar,
//         participants: playground.participants.length,
//         maxParticipants: playground.maxParticipants,
//       });

//       // socket.emit("playgroundCreated", { id: playgroundId });
//     } catch (error) {
//       console.error("Error creating playground:", error);
//       socket.emit("error", { message: "Failed to create playground" });
//     }
//   });

//   // Join a playground
//   socket.on("joinPlayground", (data) => {
//     try {
//       const { playgroundId, userName, userAvatar } = data;

//       // console.log(`Playground ID:`, playgroundId);
//       // console.log(`User Name:`, userName);
//       // console.log(`User Avatar:`, userAvatar);

//       if (!activePlaygrounds.has(playgroundId)) {
//         return socket.emit("error", { message: "Playground not found" });
//       }

//       const playground = activePlaygrounds.get(playgroundId);

//       // Check if playground is full
//       if (playground.participants.length >= playground.maxParticipants) {
//         return socket.emit("error", { message: "Playground is full" });
//       }

//       // Create participant object
//       const participant = {
//         id: socket.id,
//         name: userName,
//         avatar: userAvatar,
//         isSpeaking: false,
//         joinedAt: new Date(),
//       };

//       // Add participant to playground
//       playground.participants.push(participant);

//       // Store user session
//       userSessions.set(socket.id, {
//         playgroundId,
//         name: userName,
//         avatar: userAvatar,
//       });

//       // Join socket room
//       socket.join(playgroundId);

//       debug(
//         "playground",
//         `User ${userName} joined playground: ${playground.name} (${playgroundId})`
//       );

//       // Notify other participants
//       socket.to(playgroundId).emit("participantJoined", participant);

//       // // Send playground data to the new participant
//       socket.emit("playgroundData", {
//         ...playground,
//         participants: playground.participants,
//       });

//       // Update playground info for lobby
//       io.emit("playgroundUpdated", {
//         id: playground.id,
//         name: playground.name,
//         language: playground.language,
//         isPublic: playground.isPublic,
//         createdBy: playground.createdBy,
//         creatorAvatar: playground.creatorAvatar,
//         participants: playground.participants.length,
//         maxParticipants: playground.maxParticipants,
//       });
//     } catch (error) {
//       console.error("Error joining playground:", error);
//       socket.emit("error", { message: "Failed to join playground" });
//     }
//   });

//   // Update code
//   socket.on("updateCode", (data) => {
//     try {
//       const { playgroundId, code } = data;

//       if (!activePlaygrounds.has(playgroundId)) {
//         return socket.emit("error", { message: "Playground not found" });
//       }

//       const playground = activePlaygrounds.get(playgroundId);
//       playground.code = code;

//       // Broadcast code update to other participants
//       socket.to(playgroundId).emit("codeUpdate", { code });
//     } catch (error) {
//       console.error("Error updating code:", error);
//       socket.emit("error", { message: "Failed to update code" });
//     }
//   });

//   // Run code
//   socket.on("runCode", (data) => {
//     try {
//       const { playgroundId, code, input } = data;

//       if (!activePlaygrounds.has(playgroundId)) {
//         return socket.emit("error", { message: "Playground not found" });
//       }

//       // In a real implementation, this would execute the code securely
//       // For this example, we'll simulate code execution with a delay
//       setTimeout(() => {
//         let output = "";

//         try {
//           // This is just a simulation - in a real app, you'd use a secure sandbox
//           // like VM2 or a containerized solution to execute code safely
//           if (activePlaygrounds.get(playgroundId).language === "javascript") {
//             // VERY UNSAFE - just for demo purposes
//             // In a real app, NEVER eval user code directly
//             output = `// Output (simulated):\n${
//               input ? "Input: " + input + "\n\n" : ""
//             }Console output would appear here.\n\nIn a real implementation, code would be executed in a secure sandbox.`;
//           } else {
//             output = `// ${
//               activePlaygrounds.get(playgroundId).language
//             } execution (simulated):\n${
//               input ? "Input: " + input + "\n\n" : ""
//             }Code execution for ${
//               activePlaygrounds.get(playgroundId).language
//             } would be handled by a language-specific backend.`;
//           }
//         } catch (execError) {
//           output = `Error: ${execError.message}`;
//         }

//         // Send output to all participants
//         io.to(playgroundId).emit("codeOutput", { output });
//       }, 1500); // Simulate execution delay
//     } catch (error) {
//       console.error("Error running code:", error);
//       socket.emit("error", { message: "Failed to run code" });
//     }
//   });

//   // Audio level (speaking detection)
//   socket.on("audioLevel", (data) => {
//     try {
//       const { playgroundId, isSpeaking } = data;
//       const session = userSessions.get(socket.id);

//       if (!session || !activePlaygrounds.has(playgroundId)) return;

//       const playground = activePlaygrounds.get(playgroundId);

//       // Update participant speaking status
//       const participant = playground.participants.find(
//         (p) => p.id === socket.id
//       );
//       if (participant) {
//         participant.isSpeaking = isSpeaking;

//         // Broadcast speaking status to other participants
//         socket.to(playgroundId).emit("participantSpeaking", {
//           id: socket.id,
//           isSpeaking,
//         });
//       }
//     } catch (error) {
//       console.error("Error updating audio level:", error);
//     }
//   });

//   // WebRTC signaling
//   socket.on("offer", (data) => {
//     const { to, offer } = data;
//     debug("webrtc", `Relaying offer from ${socket.id} to ${to}`);

//     // Forward the offer to the target participant
//     io.to(to).emit("offer", {
//       from: socket.id,
//       offer,
//     });
//   });

//   socket.on("answer", (data) => {
//     const { to, answer } = data;
//     debug("webrtc", `Relaying answer from ${socket.id} to ${to}`);

//     // Forward the answer to the target participant
//     io.to(to).emit("answer", {
//       from: socket.id,
//       answer,
//     });
//   });

//   socket.on("iceCandidate", (data) => {
//     const { to, candidate } = data;
//     debug("webrtc", `Relaying ICE candidate from ${socket.id} to ${to}`);

//     // Forward the ICE candidate to the target participant
//     io.to(to).emit("iceCandidate", {
//       from: socket.id,
//       candidate,
//     });
//   });

//   // Start audio streaming
//   socket.on("startAudio", (data) => {
//     const { playgroundId } = data;
//     debug(
//       "audio",
//       `User ${socket.id} started audio in playground ${playgroundId}`
//     );
//   });

//   // Stop audio streaming
//   socket.on("stopAudio", (data) => {
//     const { playgroundId } = data;
//     debug(
//       "audio",
//       `User ${socket.id} stopped audio in playground ${playgroundId}`
//     );

//     // Update speaking status to false
//     if (activePlaygrounds.has(playgroundId)) {
//       const playground = activePlaygrounds.get(playgroundId);
//       const participant = playground.participants.find(
//         (p) => p.id === socket.id
//       );

//       if (participant) {
//         participant.isSpeaking = false;

//         socket.to(playgroundId).emit("participantSpeaking", {
//           id: socket.id,
//           isSpeaking: false,
//         });
//       }
//     }
//   });

//   // Chat messages
//   socket.on("sendMessage", (data) => {
//     try {
//       const { playgroundId, text, sender, senderAvatar } = data;

//       if (!activePlaygrounds.has(playgroundId)) {
//         return socket.emit("error", { message: "Playground not found" });
//       }

//       const message = {
//         id: uuidv4(),
//         sender,
//         senderAvatar,
//         text,
//         timestamp: new Date(),
//       };

//       // Store message
//       if (!chatMessages.has(playgroundId)) {
//         chatMessages.set(playgroundId, []);
//       }

//       chatMessages.get(playgroundId).push(message);

//       // Broadcast message to all participants
//       io.to(playgroundId).emit("chatMessage", message);
//     } catch (error) {
//       console.error("Error sending message:", error);
//       socket.emit("error", { message: "Failed to send message" });
//     }
//   });

//   // Get chat history
//   socket.on("getChatHistory", (data) => {
//     try {
//       const { playgroundId } = data;

//       if (!chatMessages.has(playgroundId)) {
//         chatMessages.set(playgroundId, []);
//       }

//       socket.emit("chatHistory", chatMessages.get(playgroundId));
//     } catch (error) {
//       console.error("Error getting chat history:", error);
//       socket.emit("error", { message: "Failed to get chat history" });
//     }
//   });

//   // Disconnect handler
//   socket.on("disconnect", () => {
//     try {
//       debug("socket", `Client disconnected: ${socket.id}`);

//       // Check if user was in a playground
//       const session = userSessions.get(socket.id);

//       if (session && activePlaygrounds.has(session.playgroundId)) {
//         const playground = activePlaygrounds.get(session.playgroundId);

//         // Remove participant from playground
//         const participantIndex = playground.participants.findIndex(
//           (p) => p.id === socket.id
//         );

//         if (participantIndex !== -1) {
//           const participant = playground.participants[participantIndex];
//           playground.participants.splice(participantIndex, 1);

//           debug(
//             "playground",
//             `User ${participant.name} left playground: ${playground.name} (${session.playgroundId})`
//           );

//           // Notify other participants
//           socket.to(session.playgroundId).emit("participantLeft", {
//             id: socket.id,
//             name: participant.name,
//           });

//           // Update playground info for lobby
//           io.emit("playgroundUpdated", {
//             id: playground.id,
//             name: playground.name,
//             language: playground.language,
//             isPublic: playground.isPublic,
//             createdBy: playground.createdBy,
//             participants: playground.participants.length,
//             maxParticipants: playground.maxParticipants,
//           });

//           // If playground is empty, remove it after a delay
//           if (playground.participants.length === 0) {
//             setTimeout(() => {
//               if (
//                 activePlaygrounds.has(session.playgroundId) &&
//                 activePlaygrounds.get(session.playgroundId).participants
//                   .length === 0
//               ) {
//                 activePlaygrounds.delete(session.playgroundId);
//                 chatMessages.delete(session.playgroundId);

//                 debug(
//                   "playground",
//                   `Removed empty playground: ${playground.name} (${session.playgroundId})`
//                 );

//                 // Notify clients that playground was closed
//                 io.emit("playgroundClosed", session.playgroundId);
//               }
//             }, 60000); // 1 minute delay
//           }
//         }
//       }

//       // Remove user session
//       userSessions.delete(socket.id);
//     } catch (error) {
//       console.error("Error handling disconnect:", error);
//     }
//   });
// });

// // Start server
// const PORT = process.env.PORT || 5001;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(
  cors({
    origin: "*",
    // origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// In-memory data storage
const activePlaygrounds = new Map();
const chatMessages = new Map();
const userSessions = new Map();

// Debug logger
const debug = (namespace, message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${namespace}] ${message}`);
  if (data) console.log(data);
};

// Socket.IO connection handler
io.on("connection", (socket) => {
  debug("socket", `New client connected: ${socket.id}`);

  // Get active playgrounds
  socket.on("getActivePlaygrounds", () => {
    const playgroundsArray = Array.from(activePlaygrounds.values()).map(
      (pg) => ({
        id: pg.id,
        name: pg.name,
        language: pg.language,
        isPublic: pg.isPublic,
        createdBy: pg.createdBy,
        creatorAvatar: pg.creatorAvatar,
        participants: pg.participants.length,
        maxParticipants: pg.maxParticipants,
      })
    );

    socket.emit("activePlaygrounds", playgroundsArray);
  });

  // Create a new playground
  socket.on("createPlayground", (data) => {
    try {
      const playgroundId = uuidv4();

      const playground = {
        id: playgroundId,
        name: data.name,
        language: data.language,
        isPublic: data.isPublic,
        createdBy: data.createdBy,
        creatorAvatar: data.creatorAvatar,
        createdAt: new Date(),
        code: "",
        maxParticipants: data.maxParticipants || 5,
        participants: [],
      };

      activePlaygrounds.set(playgroundId, playground);
      chatMessages.set(playgroundId, []);

      debug(
        "playground",
        `Created new playground: ${playground.name} (${playgroundId})`
      );

      console.log(`Playground Data:`, playground);

      // Notify all clients about the new playground
      io.emit("playgroundCreated", {
        id: playground.id,
        name: playground.name,
        language: playground.language,
        isPublic: playground.isPublic,
        createdBy: playground.createdBy,
        creatorAvatar: playground.creatorAvatar,
        participants: playground.participants.length,
        maxParticipants: playground.maxParticipants,
      });

      // socket.emit("playgroundCreated", { id: playgroundId });
    } catch (error) {
      console.error("Error creating playground:", error);
      socket.emit("error", { message: "Failed to create playground" });
    }
  });

  // Join a playground
  socket.on("joinPlayground", (data) => {
    try {
      const { playgroundId, userName, userAvatar } = data;

      console.log(`Playground ID:`, playgroundId);
      console.log(`User Name:`, userName);
      console.log(`User Avatar:`, userAvatar);

      if (!activePlaygrounds.has(playgroundId)) {
        return socket.emit("error", { message: "Playground not found" });
      }

      const playground = activePlaygrounds.get(playgroundId);

      // Check if playground is full
      if (playground.participants.length >= playground.maxParticipants) {
        return socket.emit("error", { message: "Playground is full" });
      }

      // Create participant object
      const participant = {
        id: socket.id,
        name: userName,
        avatar: userAvatar,
        isSpeaking: false,
        joinedAt: new Date(),
      };

      // Add participant to playground
      playground.participants.push(participant);

      // Store user session
      userSessions.set(socket.id, {
        playgroundId,
        name: userName,
        avatar: userAvatar,
      });

      // Join socket room
      socket.join(playgroundId);

      debug(
        "playground",
        `User ${userName} joined playground: ${playground.name} (${playgroundId})`
      );

      // Notify other participants
      socket.to(playgroundId).emit("participantJoined", participant);

      // Send playground data to the new participant
      socket.emit("playgroundData", {
        ...playground,
        participants: playground.participants,
      });

      // Update playground info for lobby
      io.emit("playgroundUpdated", {
        id: playground.id,
        name: playground.name,
        language: playground.language,
        isPublic: playground.isPublic,
        createdBy: playground.createdBy,
        creatorAvatar: playground.creatorAvatar,
        participants: playground.participants.length,
        maxParticipants: playground.maxParticipants,
      });
    } catch (error) {
      console.error("Error joining playground:", error);
      socket.emit("error", { message: "Failed to join playground" });
    }
  });

  // Update code
  socket.on("updateCode", (data) => {
    try {
      const { playgroundId, code, language, userName, userAvatar } = data;

      if (!activePlaygrounds.has(playgroundId)) {
        return socket.emit("error", { message: "Playground not found" });
      }

      const playground = activePlaygrounds.get(playgroundId);
      playground.code = code;

      // Update language if provided
      if (language) {
        playground.language = language;
      }

      // Broadcast code update to other participants
      socket.to(playgroundId).emit("codeUpdate", {
        code,
        language,
        userId: socket.id,
        userName,
        userAvatar,
      });
    } catch (error) {
      console.error("Error updating code:", error);
      socket.emit("error", { message: "Failed to update code" });
    }
  });

  // Typing indicator
  socket.on("typingIndicator", (data) => {
    try {
      const { playgroundId, userId, userName, userAvatar } = data;

      if (!activePlaygrounds.has(playgroundId)) {
        return;
      }

      // Broadcast typing indicator to other participants
      socket.to(playgroundId).emit("typingIndicator", {
        userId,
        userName,
        userAvatar,
      });
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  });

  // Run code
  socket.on("runCode", (data) => {
    try {
      const { playgroundId, code, input } = data;

      if (!activePlaygrounds.has(playgroundId)) {
        return socket.emit("error", { message: "Playground not found" });
      }

      // In a real implementation, this would execute the code securely
      // For this example, we'll simulate code execution with a delay
      setTimeout(() => {
        let output = "";

        try {
          // This is just a simulation - in a real app, you'd use a secure sandbox
          // like VM2 or a containerized solution to execute code safely
          if (activePlaygrounds.get(playgroundId).language === "javascript") {
            // VERY UNSAFE - just for demo purposes
            // In a real app, NEVER eval user code directly
            output = `// Output (simulated):\n${
              input ? "Input: " + input + "\n\n" : ""
            }Console output would appear here.\n\nIn a real implementation, code would be executed in a secure sandbox.`;
          } else {
            output = `// ${
              activePlaygrounds.get(playgroundId).language
            } execution (simulated):\n${
              input ? "Input: " + input + "\n\n" : ""
            }Code execution for ${
              activePlaygrounds.get(playgroundId).language
            } would be handled by a language-specific backend.`;
          }
        } catch (execError) {
          output = `Error: ${execError.message}`;
        }

        // Send output to all participants
        io.to(playgroundId).emit("codeOutput", { output });
      }, 1500); // Simulate execution delay
    } catch (error) {
      console.error("Error running code:", error);
      socket.emit("error", { message: "Failed to run code" });
    }
  });

  // Audio level (speaking detection)
  socket.on("audioLevel", (data) => {
    try {
      const { playgroundId, isSpeaking } = data;
      const session = userSessions.get(socket.id);

      if (!session || !activePlaygrounds.has(playgroundId)) return;

      const playground = activePlaygrounds.get(playgroundId);

      // Update participant speaking status
      const participant = playground.participants.find(
        (p) => p.id === socket.id
      );
      if (participant) {
        participant.isSpeaking = isSpeaking;

        // Broadcast speaking status to other participants
        socket.to(playgroundId).emit("participantSpeaking", {
          id: socket.id,
          isSpeaking,
        });
      }
    } catch (error) {
      console.error("Error updating audio level:", error);
    }
  });

  // WebRTC signaling
  socket.on("offer", (data) => {
    const { to, offer } = data;
    debug("webrtc", `Relaying offer from ${socket.id} to ${to}`);

    // Forward the offer to the target participant
    io.to(to).emit("offer", {
      from: socket.id,
      offer,
    });
  });

  socket.on("answer", (data) => {
    const { to, answer } = data;
    debug("webrtc", `Relaying answer from ${socket.id} to ${to}`);

    // Forward the answer to the target participant
    io.to(to).emit("answer", {
      from: socket.id,
      answer,
    });
  });

  socket.on("iceCandidate", (data) => {
    const { to, candidate } = data;
    debug("webrtc", `Relaying ICE candidate from ${socket.id} to ${to}`);

    // Forward the ICE candidate to the target participant
    io.to(to).emit("iceCandidate", {
      from: socket.id,
      candidate,
    });
  });

  // Start audio streaming
  socket.on("startAudio", (data) => {
    const { playgroundId } = data;
    debug(
      "audio",
      `User ${socket.id} started audio in playground ${playgroundId}`
    );
  });

  // Stop audio streaming
  socket.on("stopAudio", (data) => {
    const { playgroundId } = data;
    debug(
      "audio",
      `User ${socket.id} stopped audio in playground ${playgroundId}`
    );

    // Update speaking status to false
    if (activePlaygrounds.has(playgroundId)) {
      const playground = activePlaygrounds.get(playgroundId);
      const participant = playground.participants.find(
        (p) => p.id === socket.id
      );

      if (participant) {
        participant.isSpeaking = false;

        socket.to(playgroundId).emit("participantSpeaking", {
          id: socket.id,
          isSpeaking: false,
        });
      }
    }
  });

  // Chat messages
  socket.on("sendMessage", (data) => {
    try {
      const { playgroundId, text, sender, senderAvatar } = data;

      if (!activePlaygrounds.has(playgroundId)) {
        return socket.emit("error", { message: "Playground not found" });
      }

      const message = {
        id: uuidv4(),
        sender,
        senderAvatar,
        text,
        timestamp: new Date(),
      };

      // Store message
      if (!chatMessages.has(playgroundId)) {
        chatMessages.set(playgroundId, []);
      }

      chatMessages.get(playgroundId).push(message);

      // Broadcast message to all participants
      io.to(playgroundId).emit("chatMessage", message);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Get chat history
  socket.on("getChatHistory", (data) => {
    try {
      const { playgroundId } = data;

      if (!chatMessages.has(playgroundId)) {
        chatMessages.set(playgroundId, []);
      }

      socket.emit("chatHistory", chatMessages.get(playgroundId));
    } catch (error) {
      console.error("Error getting chat history:", error);
      socket.emit("error", { message: "Failed to get chat history" });
    }
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    try {
      debug("socket", `Client disconnected: ${socket.id}`);

      // Check if user was in a playground
      const session = userSessions.get(socket.id);

      if (session && activePlaygrounds.has(session.playgroundId)) {
        const playground = activePlaygrounds.get(session.playgroundId);

        // Remove participant from playground
        const participantIndex = playground.participants.findIndex(
          (p) => p.id === socket.id
        );

        if (participantIndex !== -1) {
          const participant = playground.participants[participantIndex];
          playground.participants.splice(participantIndex, 1);

          debug(
            "playground",
            `User ${participant.name} left playground: ${playground.name} (${session.playgroundId})`
          );

          // Notify other participants
          socket.to(session.playgroundId).emit("participantLeft", {
            id: socket.id,
            name: participant.name,
          });

          // Update playground info for lobby
          io.emit("playgroundUpdated", {
            id: playground.id,
            name: playground.name,
            language: playground.language,
            isPublic: playground.isPublic,
            createdBy: playground.createdBy,
            participants: playground.participants.length,
            maxParticipants: playground.maxParticipants,
          });

          // If playground is empty, remove it after a delay
          if (playground.participants.length === 0) {
            setTimeout(() => {
              if (
                activePlaygrounds.has(session.playgroundId) &&
                activePlaygrounds.get(session.playgroundId).participants
                  .length === 0
              ) {
                activePlaygrounds.delete(session.playgroundId);
                chatMessages.delete(session.playgroundId);

                debug(
                  "playground",
                  `Removed empty playground: ${playground.name} (${session.playgroundId})`
                );

                // Notify clients that playground was closed
                io.emit("playgroundClosed", session.playgroundId);
              }
            }, 60000); // 1 minute delay
          }
        }
      }

      // Remove user session
      userSessions.delete(socket.id);
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

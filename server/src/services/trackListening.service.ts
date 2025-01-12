// trackListeningService.ts
import { Server, Socket } from "socket.io";
import { Prisma, PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";

// types.ts

interface TrackSession {
  userId: number;
  trackId: number;
  artistId: number;
  startTime: number;
  currentPosition: number;
  isPlaying: boolean;
  lastUpdateTime: number;
  totalPauseDuration: number;
  lastPauseTime: number | null;
  bufferingStartTime: number | null;
  totalBufferingTime: number;
  skipCount: number;
  deviceInfo: DeviceInfo;
  duration: number;
  currentBufferSize: number;
  bufferUpdates: number[];
  networkQuality: "good" | "poor" | "unstable";
  lastBufferUpdate: number;
}

interface DeviceInfo {
  type: string;
  browser?: string;
  os?: string;
  networkType?: string;
}

interface PlaybackMetrics {
  skipRate: number;
  bufferingPercentage: number;
  averageListenDuration: number;
  completionRate: number;
}

interface PlaybackQualityMetrics {
  bufferingEvents: number;
  averageBufferSize: number;
  networkQuality: string;
  timestamp: number;
}

export class TrackListeningService {
  private prisma: PrismaClient;
  private io: Server;
  private redis: Redis;
  private activeSessions: Map<string, TrackSession>;
  private readonly UPDATE_INTERVAL = 5000; // 5 seconds for periodic updates
  private readonly BUFFER_THRESHOLD = 500; // ms threshold for buffer updates
  private updateIntervals: Map<string, NodeJS.Timeout>;
  private readonly MINIMUM_VALID_LISTEN_TIME = 30; // seconds
  private readonly BUFFER_HISTORY_SIZE = 10; // Keep track of last 10 buffer updates

  constructor(io: Server, prisma: PrismaClient, redis: Redis) {
    this.prisma = prisma;
    this.io = io;
    this.redis = redis;
    this.activeSessions = new Map();
    this.updateIntervals = new Map();
    this.setupSocketHandlers();
    this.startHealthCheck();
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on(
        "startPlaying",
        async (data: {
          userId: number;
          trackId: number;
          artistId: number;
          deviceInfo: DeviceInfo;
          duration: number;
        }) => {
          console.log("startPlaying", data);
          await this.handleStartPlaying(socket.id, data);
        }
      );

      socket.on("updatePosition", (position: number) => {
        this.handleUpdatePosition(socket.id, position);
      });

      socket.on("updateBuffer", (bufferSize: number) => {
        this.handleBufferUpdate(socket.id, bufferSize);
      });

      socket.on("pausePlaying", () => {
        console.log("pausePlaying");
        this.handlePausePlaying(socket.id);
      });

      socket.on("resumePlaying", () => {
        console.log("resumePlaying");
        this.handleResumePlaying(socket.id);
      });

      socket.on("bufferingStart", () => {
        console.log("bufferingStart");
        this.handleBufferingStart(socket.id);
      });

      socket.on("bufferingEnd", () => {
        console.log("bufferingEnd");
        this.handleBufferingEnd(socket.id);
      });

      socket.on(
        "networkQualityUpdate",
        (quality: "good" | "poor" | "unstable") => {
          console.log("networkQualityUpdate", quality);
          this.handleNetworkQualityUpdate(socket.id, quality);
        }
      );

      socket.on("stopPlaying", () => {
        console.log("stopPlaying");
        this.handleStopPlaying(socket.id);
      });

      socket.on("skipTrack", () => {
        console.log("skipTrack");
        this.handleSkipTrack(socket.id);
      });

      // Update disconnect handler
      socket.on("disconnect", async () => {
        console.log(`Client disconnected: ${socket.id}`);
        await this.handleStopPlaying(socket.id);
        this.activeSessions.delete(socket.id);
      });
    });
  }

  private async handleSkipTrack(socketId: string): Promise<void> {
    const session = this.activeSessions.get(socketId);
    if (!session) return;

    // Increment skip count
    session.skipCount += 1;

    // Record the current session before stopping
    await this.handleStopPlaying(socketId);
  }

  private async handleStopPlaying(socketId: string): Promise<void> {
    const session = this.activeSessions.get(socketId);
    if (!session) return;

    // Calculate final stats before cleanup
    const now = Date.now();
    const totalDuration = now - session.startTime;
    const effectiveListenTime =
      totalDuration - session.totalPauseDuration - session.totalBufferingTime;

    try {
      const getListener = await this.getListener(session);
      if (!getListener) return;

      // Final update to listening time
      await this.updateListeningTime(socketId);

      // Record final streaming history
      await this.prisma.streamingHistory.create({
        data: {
          trackId: session.trackId,
          listenerId: getListener.id,
          streamedAt: new Date(session.startTime),
          deviceInfo: JSON.stringify(session.deviceInfo),
          bufferingTime: new Date(session.totalBufferingTime),
          skipCount: session.skipCount,
          completionRate: session.currentPosition / (session.duration || 1),
          // endTime: new Date(),  // Add end time
          // totalDuration: Math.floor(effectiveListenTime / 1000), // Convert to seconds
        },
      });

      // Update playback metrics one final time
      await this.calculatePlaybackMetrics(session.trackId);

      // Clean up
      this.clearUpdateInterval(socketId);

      // Clear Redis cache for this session
      await this.redis.del(`track:${session.trackId}:lastListen`);

      console.log("Successfully cleaned up session:", {
        trackId: session.trackId,
        totalDuration: Math.floor(effectiveListenTime / 1000),
        skipCount: session.skipCount,
        completionRate: session.currentPosition / (session.duration || 1),
      });
    } catch (error) {
      console.error("Error in handleStopPlaying:", error);
    }
  }

  private handleBufferUpdate(socketId: string, bufferSize: number): void {
    const session = this.activeSessions.get(socketId);
    if (!session) return;

    const now = Date.now();
    if (now - session.lastBufferUpdate >= this.BUFFER_THRESHOLD) {
      session.currentBufferSize = bufferSize;
      session.bufferUpdates.push(bufferSize);
      if (session.bufferUpdates.length > this.BUFFER_HISTORY_SIZE) {
        session.bufferUpdates.shift();
      }
      session.lastBufferUpdate = now;

      this.updatePlaybackQuality(socketId);
    }
  }

  private handleNetworkQualityUpdate(
    socketId: string,
    quality: "good" | "poor" | "unstable"
  ): void {
    const session = this.activeSessions.get(socketId);
    if (session) {
      session.networkQuality = quality;
      this.updatePlaybackQuality(socketId);
    }
  }

  private async updatePlaybackQuality(socketId: string): Promise<void> {
    const session = this.activeSessions.get(socketId);
    if (!session) return;

    const metrics: PlaybackQualityMetrics = {
      bufferingEvents: session.bufferUpdates.length,
      averageBufferSize:
        session.bufferUpdates.length > 0
          ? session.bufferUpdates.reduce((a, b) => a + b, 0) /
            session.bufferUpdates.length
          : 0,
      networkQuality: session.networkQuality,
      timestamp: Date.now(),
    };

    const getListener = await this.getListener(session);
    if (!getListener) return;

    console.log("session.trackId", session.trackId);

    console.log("metrics.averageBufferSize", metrics.averageBufferSize);

    await this.prisma.playbackQuality.create({
      data: {
        trackId: session.trackId,
        listenerId: getListener.id,
        bufferingEvents: metrics.bufferingEvents,
        averageBufferSize: metrics.averageBufferSize,
        networkQuality: metrics.networkQuality,
        timestamp: new Date(metrics.timestamp),
      },
    });

    // Update real-time metrics in Redis
    await this.redis.hset(`track:${session.trackId}:quality`, {
      ...metrics,
      lastUpdate: Date.now(),
    });
  }

  private startPeriodicUpdate(socketId: string): void {
    // Clear any existing interval
    this.clearUpdateInterval(socketId);

    const session = this.activeSessions.get(socketId);
    if (!session || !session.isPlaying) return;

    const interval = setInterval(() => {
      this.updateListeningTime(socketId);
    }, this.UPDATE_INTERVAL);

    this.updateIntervals.set(socketId, interval);
  }

  private clearUpdateInterval(socketId: string): void {
    const existingInterval = this.updateIntervals.get(socketId);
    if (existingInterval) {
      clearInterval(existingInterval);
      this.updateIntervals.delete(socketId);
    }
  }

  private async handleStartPlaying(
    socketId: string,
    data: {
      userId: number;
      trackId: number;
      artistId: number;
      deviceInfo: DeviceInfo;
      duration: number;
    }
  ): Promise<void> {
    const now = Date.now();
    const session: TrackSession = {
      ...data,
      startTime: now,
      currentPosition: 0,
      isPlaying: true,
      lastUpdateTime: now,
      totalPauseDuration: 0,
      lastPauseTime: null,
      bufferingStartTime: null,
      totalBufferingTime: 0,
      skipCount: 0,
      currentBufferSize: 0,
      bufferUpdates: [],
      networkQuality: "good",
      lastBufferUpdate: now,
    };
    console.log("session", session["trackId"]);
    console.log("socketId", socketId);
    this.activeSessions.set(socketId, session);
    this.startPeriodicUpdate(socketId);

    const getListener = await this.getListener(session);

    if (!getListener) {
      console.log("Listener not found");
      return;
    }

    // Create initial playback session record
    await this.prisma.playbackSession.create({
      data: {
        trackId: session.trackId,
        // listenerId: session.userId,
        listenerId: getListener.id,
        deviceInfo: JSON.stringify(session.deviceInfo),
        startTime: new Date(session.startTime),
      },
    });
  }

  private async getListener(
    session: TrackSession
  ): Promise<Prisma.ListenerGetPayload<{ include: { user: true } }> | null> {
    return await this.prisma.listener.findFirst({
      where: {
        userId: session.userId,
      },
      include: {
        user: true,
      },
    });
  }

  private async handleDisconnect(socketId: string): Promise<void> {
    await this.updateListeningTime(socketId);
    this.clearUpdateInterval(socketId);
    this.activeSessions.delete(socketId);
  }

  private startHealthCheck(): void {
    setInterval(() => {
      this.activeSessions.forEach((session, socketId) => {
        const timeSinceLastUpdate = Date.now() - session.lastUpdateTime;
        if (timeSinceLastUpdate > 30000) {
          // 30 seconds
          this.handleDisconnect(socketId);
        }
      });
    }, 30000); // Check every 30 seconds
  }

  private handleUpdatePosition(socketId: string, position: number): void {
    const session = this.activeSessions.get(socketId);
    if (session) {
      session.currentPosition = position;
      session.lastUpdateTime = Date.now();
    }
  }

  private handlePausePlaying(socketId: string): void {
    const session = this.activeSessions.get(socketId);
    if (session) {
      session.isPlaying = false;
      session.lastPauseTime = Date.now();

      // Force an immediate update when pausing
      this.updateListeningTime(socketId);

      // Clear the periodic update interval while paused
      this.clearUpdateInterval(socketId);
    }
  }

  private handleResumePlaying(socketId: string): void {
    const session = this.activeSessions.get(socketId);
    if (!session) return;

    // Reset the session state for resume
    session.isPlaying = true;

    if (session.lastPauseTime) {
      session.totalPauseDuration += Date.now() - session.lastPauseTime;
      session.lastPauseTime = null;
    }

    // Update the last update time to now
    session.lastUpdateTime = Date.now();

    // Restart periodic updates
    this.startPeriodicUpdate(socketId);
  }

  private handleBufferingStart(socketId: string): void {
    const session = this.activeSessions.get(socketId);
    if (session && !session.bufferingStartTime) {
      session.bufferingStartTime = Date.now();
    }
  }

  private handleBufferingEnd(socketId: string): void {
    const session = this.activeSessions.get(socketId);
    if (session && session.bufferingStartTime) {
      const bufferingDuration = Date.now() - session.bufferingStartTime;
      session.totalBufferingTime += bufferingDuration;
      session.bufferingStartTime = null;
    }
  }

  private async updateListeningTime(socketId: string): Promise<void> {
    const session = this.activeSessions.get(socketId);
    if (!session || !session.isPlaying) return;

    const now = Date.now();
    const elapsedTime = now - session.lastUpdateTime;

    // Convert to seconds and ensure it's not negative
    const listeningTime = Math.max(0, Math.floor(elapsedTime / 1000));

    console.log("Update Listening Time:", {
      socketId,
      trackId: session.trackId,
      elapsedTime,
      listeningTime,
    });

    if (listeningTime >= this.MINIMUM_VALID_LISTEN_TIME) {
      try {
        const getListener = await this.getListener(session);
        if (!getListener) return;

        await this.prisma.$transaction([
          // Update Track listening time
          this.prisma.track.update({
            where: { id: session.trackId },
            data: { listenTime: { increment: listeningTime } },
          }),

          // Update ListeningTime record
          this.prisma.listeningTime.upsert({
            where: {
              trackId_artistId: {
                trackId: session.trackId,
                artistId: session.artistId,
              },
            },
            create: {
              trackId: session.trackId,
              artistId: session.artistId,
              totalListeningTime: listeningTime,
            },
            update: {
              totalListeningTime: { increment: listeningTime },
            },
          }),

          // Create streaming history entry
          this.prisma.streamingHistory.create({
            data: {
              trackId: session.trackId,
              listenerId: getListener.id,
              streamedAt: new Date(),
              deviceInfo: JSON.stringify(session.deviceInfo),
              bufferingTime: session.totalBufferingTime
                ? new Date(session.totalBufferingTime)
                : new Date(0),
              skipCount: session.skipCount,
              completionRate: session.currentPosition / (session.duration || 1),
            },
          }),
        ]);

        // Only update the last update time if successful
        session.lastUpdateTime = now;

        console.log("Successfully updated DB:", {
          trackId: session.trackId,
          listeningTime,
          timestamp: now,
        });
      } catch (error) {
        console.error("Failed to update listening time:", error);
      }
    }
  }

  private async calculatePlaybackMetrics(
    trackId: number
  ): Promise<PlaybackMetrics> {
    const sessions = Array.from(this.activeSessions.values()).filter(
      (session) => session.trackId === trackId
    );

    const totalSessions = sessions.length;
    if (totalSessions === 0) {
      return {
        skipRate: 0,
        bufferingPercentage: 0,
        averageListenDuration: 0,
        completionRate: 0,
      };
    }

    const metrics: PlaybackMetrics = {
      skipRate:
        sessions.reduce((acc, session) => acc + session.skipCount, 0) /
        totalSessions,
      bufferingPercentage:
        sessions.reduce((acc, session) => acc + session.totalBufferingTime, 0) /
        totalSessions,
      averageListenDuration:
        sessions.reduce((acc, session) => {
          const duration =
            Date.now() -
            session.startTime -
            session.totalPauseDuration -
            session.totalBufferingTime;
          return acc + duration;
        }, 0) / totalSessions,
      completionRate:
        sessions.filter(
          (session) => session.currentPosition / (session.duration || 1) > 0.9
        ).length / totalSessions,
    };

    await this.redis.hset(`track:${trackId}:metrics`, metrics);
    return metrics;
  }
  private async retryUpdate(socketId: string, error: any): Promise<void> {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retryCount))
        );
        await this.updateListeningTime(socketId);
        return;
      } catch (retryError) {
        retryCount++;
        if (retryCount === maxRetries) {
          // Log to error monitoring service
          console.error("Final retry failed:", retryError);
        }
      }
    }
  }
}

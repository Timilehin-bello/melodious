# Repository Data Access Through Automatic Notices

## Overview

This document outlines how to modify existing controllers to automatically emit repository data as notices whenever data changes occur, eliminating the need for inspect calls.

## Current Architecture Analysis

### Notice Flow and Format

**Backend (Cartesi):**
1. Controllers create JSON string payloads
2. `new Notice(payload)` converts to hex and stores in Cartesi
3. GraphQL endpoint serves hex-encoded payloads

**Frontend:**
1. GraphQL query fetches hex-encoded payloads
2. `ethers.utils.toUtf8String(payload)` decodes hex to JSON string
3. `JSON.parse(decodedString)` converts to JavaScript object

### Existing Notice Pattern
```typescript
// Current pattern in controllers
const notice_payload = JSON.stringify({type: "create_track", content: track_json});
return new Notice(notice_payload);
```

### Repository Service Structure
```typescript
// /src/services/repository.service.ts
class RepositoryService {
  static users: Model.User[] = [];
  static albums: Model.Album[] = [];
  static genres: Model.Genre[] = [];
  static tracks: Model.Track[] = [];
  static artists: Model.Artist[] = [];
  static listeners: Model.Listener[] = [];
  static playlists: Model.Playlist[] = [];
  static config: Model.Config | null = null;
}
```

## Implementation Strategy

### 1. Enhanced Repository Service with Auto-Notices

**File**: `/src/services/repository.service.ts`

```typescript
import * as Model from "../models";
import { Notice } from "cartesi-wallet";

class RepositoryService {
  static users: Model.User[] = [];
  static albums: Model.Album[] = [];
  static genres: Model.Genre[] = [];
  static tracks: Model.Track[] = [];
  static artists: Model.Artist[] = [];
  static listeners: Model.Listener[] = [];
  static playlists: Model.Playlist[] = [];
  static config: Model.Config | null = null;

  // Auto-notice flags
  static enableAutoNotices = true;
  static noticeQueue: Notice[] = [];

  // Repository snapshot generator
  static generateRepositorySnapshot(): any {
    return {
      users: this.users,
      albums: this.albums,
      genres: this.genres,
      tracks: this.tracks,
      artists: this.artists,
      listeners: this.listeners,
      playlists: this.playlists,
      config: this.config,
      stats: {
        usersCount: this.users.length,
        albumsCount: this.albums.length,
        genresCount: this.genres.length,
        tracksCount: this.tracks.length,
        artistsCount: this.artists.length,
        listenersCount: this.listeners.length,
        playlistsCount: this.playlists.length,
        hasConfig: !!this.config
      },
      timestamp: new Date().toISOString()
    };
  }

  // Create repository notice
  static createRepositoryNotice(changeType: string, changedData?: any): Notice {
    const snapshot = this.generateRepositorySnapshot();
    const notice_payload = JSON.stringify({
      type: "repository_update",
      content: {
        changeType,
        changedData,
        repository: snapshot
      }
    });
    
    const notice = new Notice(notice_payload);
    
    if (this.enableAutoNotices) {
      this.noticeQueue.push(notice);
    }
    
    return notice;
  }

  // Specific data type notices
  static createDataTypeNotice(dataType: string, action: string, data: any): Notice {
    const notice_payload = JSON.stringify({
      type: `repository_${dataType}_${action}`,
      content: {
        action,
        data,
        [dataType]: this[dataType as keyof typeof this],
        timestamp: new Date().toISOString()
      }
    });
    
    return new Notice(notice_payload);
  }

  // Get queued notices
  static getQueuedNotices(): Notice[] {
    const notices = [...this.noticeQueue];
    this.noticeQueue = [];
    return notices;
  }
}

export { RepositoryService };
```

### 2. Modified Controllers with Auto-Repository Notices

#### User Controller Enhancement

**File**: `/src/controllers/user.controller.ts` (modifications)

```typescript
// Add this method to UserController class
public create(
  userBody: User & { walletAddress: string },
  returnAsNotice?: boolean
) {
  // ... existing validation logic ...

  try {
    // ... existing user creation logic ...
    
    RepositoryService.users.push(user);
    console.log("user", user);

    const user_json = JSON.stringify(user);
    
    // Create individual user notice
    const user_notice_payload = `{{"type":"create_user","content":${user_json}}}`;
    const userNotice = new Notice(user_notice_payload);
    
    // Create repository update notice
    const repositoryNotice = RepositoryService.createRepositoryNotice(
      "user_created", 
      user
    );
    
    console.log(
      `User ${user.name} created with wallet address ${user.walletAddress}`
    );
    
    // Return both notices or just the user notice based on preference
    if (returnAsNotice === false) {
      return user;
    }
    
    // You can return either individual notice or repository notice
    // For repository access, return the repository notice
    return repositoryNotice; // This contains full repository snapshot
    
  } catch (error) {
    const error_msg = `Failed to create User ${error}`;
    console.debug("Create User", error_msg);
    return new Error_out(error_msg);
  }
}
```

#### Track Controller Enhancement

**File**: `/src/controllers/track.controller.ts` (modifications)

```typescript
// Modify the createTrack method
public createTrack(
  trackBody: Track & { walletAddress: string },
  returnAsNotice?: boolean
) {
  // ... existing validation logic ...

  try {
    // ... existing track creation logic ...
    
    RepositoryService.tracks.push(newTrack);
    console.log("Track created", newTrack);
    
    const track_json = JSON.stringify(newTrack);
    
    if (!returnAsNotice) {
      console.log("All tracks", RepositoryService.tracks, RepositoryService.tracks.length);
      console.log("Creating track", track_json);
      return newTrack;
    }
    
    // Create individual track notice
    const track_notice_payload = `{{"type":"create_track", "content":${track_json}}}`;
    const trackNotice = new Notice(track_notice_payload);
    
    // Create repository update notice with full snapshot
    const repositoryNotice = RepositoryService.createRepositoryNotice(
      "track_created",
      newTrack
    );
    
    // Return repository notice for full data access
    return repositoryNotice;
    
  } catch (error) {
    const error_msg = `Failed to create Track ${error}`;
    console.debug(error_msg);
    return new Error_out(error_msg);
  }
}
```

#### Playlist Controller Enhancement

**File**: `/src/controllers/playlist.controller.ts` (modifications)

```typescript
// Modify the create method
public create(playlistBody: {
  title: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
  walletAddress: string;
  timestamp: number;
}) {
  try {
    // ... existing validation and creation logic ...
    
    RepositoryService.playlists.push(playlist);
    
    const playlist_json = JSON.stringify(playlist);
    
    // Create individual playlist notice
    const playlist_notice_payload = `{{"type":"create_playlist","content":${playlist_json}}}`;
    const playlistNotice = new Notice(playlist_notice_payload);
    
    // Create repository update notice
    const repositoryNotice = RepositoryService.createRepositoryNotice(
      "playlist_created",
      playlist
    );
    
    console.log(
      `Playlist "${playlist.title}" created for listener ${playlist.listenerId}`
    );
    
    // Return repository notice for full data access
    return repositoryNotice;
    
  } catch (error) {
    const error_msg = `Failed to create Playlist: ${error}`;
    console.debug("Create Playlist", error_msg);
    return new Error_out(error_msg);
  }
}
```

### 3. Notice Types and Structure

#### Repository Update Notice Structure

**Raw Notice Payload (hex-encoded):**
```
0x7b2274797065223a22726570...  // Hex-encoded JSON
```

**After ethers.utils.toUtf8String() decoding:**
```typescript
{
  "type": "repository_update",
  "content": {
    "changeType": "user_created" | "track_created" | "playlist_created" | "album_created" | etc.,
    "changedData": { /* the specific item that changed */ },
    "repository": {
      "users": [...],
      "albums": [...],
      "genres": [...],
      "tracks": [...],
      "artists": [...],
      "listeners": [...],
      "playlists": [...],
      "config": {...},
      "stats": {
        "usersCount": 5,
        "albumsCount": 3,
        "tracksCount": 12,
        // ... etc
      },
      "timestamp": "2025-01-15T10:30:00.000Z"
    }
  }
}```

#### Data Type Specific Notice Structure

**After ethers.utils.toUtf8String() decoding:**
```typescript
{
  "type": "repository_users_created",
  "content": {
    "action": "created",
    "data": { /* new user object */ },
    "users": [ /* all users array */ ],
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}```

### 4. Frontend Integration

#### Enhanced useNoticesQuery Hook

**File**: `/frontend/hooks/useNoticesQuery.ts` (modifications)

```typescript
// Add repository notice types
interface RepositoryNotice {
  type: 'repository_update';
  content: {
    changeType: string;
    changedData: any;
    repository: {
      users: any[];
      albums: any[];
      genres: any[];
      tracks: any[];
      artists: any[];
      listeners: any[];
      playlists: any[];
      config: any;
      stats: {
        usersCount: number;
        albumsCount: number;
        tracksCount: number;
        artistsCount: number;
        listenersCount: number;
        playlistsCount: number;
        hasConfig: boolean;
      };
      timestamp: string;
    };
  };
}

// Enhanced hook with repository data extraction
export const useRepositoryData = () => {
  const { data: notices, ...queryResult } = useNoticesQuery();
  
  const repositoryData = useMemo(() => {
    if (!notices || notices.length === 0) return null;
    
    // Find the latest repository update notice
    const repositoryNotices = notices.filter(
      (notice: any) => {
        try {
          // Notice payload is already decoded by useNoticesQuery (ethers.utils.toUtf8String)
          const parsed = JSON.parse(notice.payload);
          return parsed.type === 'repository_update';
        } catch {
          return false;
        }
      }
    );
    
    if (repositoryNotices.length === 0) return null;
    
    // Get the most recent repository snapshot
    const latestNotice = repositoryNotices[repositoryNotices.length - 1];
    const parsed = JSON.parse(latestNotice.payload);
    return parsed.content.repository;
  }, [notices]);
  
  return {
    ...queryResult,
    repositoryData,
    users: repositoryData?.users || [],
    albums: repositoryData?.albums || [],
    tracks: repositoryData?.tracks || [],
    playlists: repositoryData?.playlists || [],
    artists: repositoryData?.artists || [],
    listeners: repositoryData?.listeners || [],
    genres: repositoryData?.genres || [],
    config: repositoryData?.config,
    stats: repositoryData?.stats
  };
};
```

### 5. Usage Examples

#### Creating a User (Triggers Repository Notice)
```bash
# This will create a user AND emit a repository_update notice
curl -X POST "http://localhost:8080/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { create_user(name: \"John Doe\", role: \"ARTIST\") }"
  }'
```

#### Frontend Usage
```typescript
// Component using repository data
const MyComponent = () => {
  const { 
    repositoryData, 
    users, 
    tracks, 
    playlists, 
    stats, 
    isLoading 
  } = useRepositoryData();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Repository Stats</h2>
      <p>Users: {stats?.usersCount}</p>
      <p>Tracks: {stats?.tracksCount}</p>
      <p>Playlists: {stats?.playlistsCount}</p>
      
      <h3>All Users</h3>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      
      <h3>All Tracks</h3>
      {tracks.map(track => (
        <div key={track.id}>{track.title}</div>
      ))}
    </div>
  );
};
```

## Implementation Benefits

1. **Automatic Repository Access**: Every data change automatically emits full repository snapshot
2. **No Inspect Calls Needed**: All data comes through the existing notice system
3. **Real-time Updates**: Frontend gets immediate updates when any data changes
4. **Backward Compatible**: Existing individual notices still work
5. **Comprehensive Data**: Each notice includes full repository state plus change details
6. **Efficient Frontend**: Single hook provides access to all repository data

## Migration Steps

1. **Update Repository Service**: Add the enhanced methods shown above
2. **Modify Controllers**: Update each controller's create/update/delete methods
3. **Update Frontend Hooks**: Add the new `useRepositoryData` hook
4. **Test Integration**: Verify notices are emitted correctly
5. **Update Components**: Use the new repository data access pattern

## Configuration Options

```typescript
// Disable auto-notices if needed
RepositoryService.enableAutoNotices = false;

// Get queued notices manually
const queuedNotices = RepositoryService.getQueuedNotices();
```

This approach ensures that every time any controller modifies repository data, a comprehensive notice is automatically emitted, giving your frontend complete access to the repository state without requiring inspect calls.
/** Perfil público (`GET /users/:id`) */
export type PublicProfile = {
  id: string;
  displayName: string;
  avatarColorKey: string;
  bio: string | null;
  xpTotal: number;
  level: number;
  gems: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  completedLessons: number;
  solvedExercises: number;
  followerCount: number;
  followingCount: number;
  xpProgress: {
    level: number;
    currentBandXp: number;
    bandSize: number;
  };
  isSelf: boolean;
  isFollowing?: boolean;
};

export type ComparePayload = {
  you: PublicProfile;
  them: PublicProfile;
};

export type UserSearchHit = {
  id: string;
  displayName: string;
  avatarColorKey: string;
  level: number;
  xpTotal: number;
};

export type FollowListUser = {
  id: string;
  displayName: string;
  avatarColorKey: string;
  level: number;
  xpTotal: number;
  viewerFollowsThem: boolean;
};

/** GET /users/online */
export type OnlineUser = {
  id: string;
  displayName: string;
  avatarColorKey: string;
  level: number;
  xpTotal: number;
  lastSeenAt: string;
  isSelf: boolean;
};

export type OnlineUsersPayload = {
  users: OnlineUser[];
  windowMinutes: number;
  scope: 'all' | 'following';
};

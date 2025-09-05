// In-memory user stats state to simulate DB while infra is not available

const userStats = new Map();
const userProfileMeta = new Map(); // { profileComplete: boolean }

function ensureUser(userId) {
  if (!userStats.has(userId)) {
    userStats.set(userId, {
      reputationPoints: 0,
      currencyBalance: 0,
      currentLevel: 1,
      achievements: [],
    });
  }
  if (!userProfileMeta.has(userId)) {
    userProfileMeta.set(userId, { profileComplete: false });
  }
}

function calculateLevel(rep) {
  if (rep < 0) rep = 0;
  const lvl = Math.floor(Math.pow(rep / 100, 1 / 2.5)) + 1;
  return Math.max(1, lvl);
}

export function getUserStats(userId) {
  ensureUser(userId);
  return userStats.get(userId);
}

export function adjustUserStats(userId, repDelta, currencyDelta) {
  ensureUser(userId);
  const s = userStats.get(userId);
  s.reputationPoints = Math.max(0, s.reputationPoints + (repDelta || 0));
  s.currencyBalance = Math.max(0, s.currencyBalance + (currencyDelta || 0));
  s.currentLevel = calculateLevel(s.reputationPoints);
  userStats.set(userId, s);
  return s;
}

export function addAchievement(userId, code) {
  ensureUser(userId);
  const s = userStats.get(userId);
  if (!s.achievements.includes(code)) {
    s.achievements.push(code);
  }
}

export function getProfileMeta(userId) {
  ensureUser(userId);
  return userProfileMeta.get(userId);
}

export function markProfileComplete(userId) {
  ensureUser(userId);
  const meta = userProfileMeta.get(userId);
  if (!meta.profileComplete) {
    meta.profileComplete = true;
    userProfileMeta.set(userId, meta);
    return true; // transitioned
  }
  return false;
}

export function getAllUsersStats() {
  return Array.from(userStats.entries()).map(([userId, stats]) => ({ userId, ...stats }));
}



// Generic camelCase (app) <-> snake_case (Postgres) row mapping, driven by a
// field-name table per entity so each table's shape is declared once.

type FieldMap = [string, string][];

export function toRow<T extends Record<string, any>>(obj: Partial<T>, fields: FieldMap): Record<string, any> {
  const row: Record<string, any> = {};
  for (const [camelKey, snakeKey] of fields) {
    if (camelKey in obj && (obj as any)[camelKey] !== undefined) {
      row[snakeKey] = (obj as any)[camelKey];
    }
  }
  return row;
}

export function fromRow<T>(row: Record<string, any>, fields: FieldMap): T {
  const obj: Record<string, any> = {};
  for (const [camelKey, snakeKey] of fields) {
    obj[camelKey] = row[snakeKey];
  }
  return obj as T;
}

export const HABIT_FIELDS: FieldMap = [
  ['id', 'id'],
  ['title', 'title'],
  ['category', 'category'],
  ['iconName', 'icon_name'],
  ['color', 'color'],
  ['frequency', 'frequency'],
  ['targetValue', 'target_value'],
  ['targetUnit', 'target_unit'],
  ['reminderTime', 'reminder_time'],
  ['notes', 'notes'],
  ['isPaused', 'is_paused'],
  ['isArchived', 'is_archived'],
  ['createdAt', 'created_at']
];

export const LOG_FIELDS: FieldMap = [
  ['habitId', 'habit_id'],
  ['date', 'date'],
  ['currentValue', 'current_value'],
  ['completed', 'completed'],
  ['notes', 'notes']
];

export const PROFILE_FIELDS: FieldMap = [
  ['name', 'name'],
  ['email', 'email'],
  ['avatarUrl', 'avatar_url'],
  ['theme', 'theme'],
  ['notificationsEnabled', 'notifications_enabled'],
  ['reminderTime', 'reminder_time'],
  ['primaryGoal', 'primary_goal'],
  ['joinedDate', 'joined_date']
];

export const MILESTONE_FIELDS: FieldMap = [
  ['days', 'days'],
  ['title', 'title'],
  ['description', 'description'],
  ['iconName', 'icon_name'],
  ['unlocked', 'unlocked'],
  ['unlockedAt', 'unlocked_at']
];

export const DAILY_CHALLENGE_FIELDS: FieldMap = [
  ['date', 'date'],
  ['title', 'title'],
  ['description', 'description'],
  ['category', 'category'],
  ['xpReward', 'xp_reward'],
  ['completed', 'completed']
];

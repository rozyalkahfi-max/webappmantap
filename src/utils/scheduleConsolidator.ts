import { ScheduleItem, AttendanceSession } from '../types';

export interface ConsolidatedScheduleItem extends ScheduleItem {
  allScheduleIds: string[]; // List of original ScheduleItem IDs merged together
  periodDisplay: string;    // e.g. "Jam Ke-1" or "Jam Ke-1 s/d 2"
  periodCount: number;      // e.g. 2
  rawPeriods: number[];     // e.g. [1, 2]
  timeDisplay: string;      // e.g. "09:30 - 10:50"
}

/**
 * Standard period slot fallback times in SMP (40-45 mins per jam)
 */
const STANDARD_PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: '07:00', end: '07:45' },
  2: { start: '07:45', end: '08:30' },
  3: { start: '08:30', end: '09:15' },
  4: { start: '09:45', end: '10:30' },
  5: { start: '10:30', end: '11:15' },
  6: { start: '11:15', end: '12:00' },
  7: { start: '12:30', end: '13:15' },
  8: { start: '13:15', end: '14:00' },
};

/**
 * Consolidates contiguous teaching periods for the same class + same subject + same day + same teacher
 * into a single unified session (e.g. 09:30 - 10:50, Jam Ke-1 s/d 2).
 */
export function consolidateScheduleItems(items: ScheduleItem[]): ConsolidatedScheduleItem[] {
  if (!items || items.length === 0) return [];

  // Group by day to process day-by-day in sequence
  const dayGroups: Record<string, ScheduleItem[]> = {};

  items.forEach((item) => {
    const day = item.day || 'Senin';
    if (!dayGroups[day]) dayGroups[day] = [];
    dayGroups[day].push(item);
  });

  const consolidated: ConsolidatedScheduleItem[] = [];

  const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  dayOrder.forEach((day) => {
    const dayItems = dayGroups[day];
    if (!dayItems || dayItems.length === 0) return;

    // Sort schedules of this day by period (asc), then by startTime
    const sorted = [...dayItems].sort((a, b) => {
      const pDiff = (a.period || 1) - (b.period || 1);
      if (pDiff !== 0) return pDiff;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

    let current: ConsolidatedScheduleItem | null = null;

    sorted.forEach((item) => {
      const itemStart = item.startTime || STANDARD_PERIOD_TIMES[item.period]?.start || '07:00';
      const itemEnd = item.endTime || STANDARD_PERIOD_TIMES[item.period]?.end || '08:30';

      if (!current) {
        current = {
          ...item,
          startTime: itemStart,
          endTime: itemEnd,
          timeDisplay: `${itemStart} - ${itemEnd}`,
          allScheduleIds: [item.id],
          periodDisplay: `Jam Ke-${item.period}`,
          periodCount: 1,
          rawPeriods: [item.period],
        };
        return;
      }

      // Determine if item can be merged into current contiguous block
      const sameClass = current.classId.trim().toUpperCase() === item.classId.trim().toUpperCase();
      const sameSubject =
        current.subjectCode.trim().toUpperCase() === item.subjectCode.trim().toUpperCase() ||
        current.subjectName.trim().toLowerCase() === item.subjectName.trim().toLowerCase();
      const sameTeacher =
        (current.teacherCode && item.teacherCode && current.teacherCode.trim().toUpperCase() === item.teacherCode.trim().toUpperCase()) ||
        current.teacherName.trim().toLowerCase() === item.teacherName.trim().toLowerCase();

      // Check temporal contiguity:
      // 1) Period is directly sequential (e.g. 1 then 2)
      const lastPeriod = current.rawPeriods[current.rawPeriods.length - 1];
      const isSequentialPeriod = item.period === lastPeriod + 1;
      
      // 2) Adjacent or overlapping times (e.g. 10:10 matches 10:10)
      const isAdjacentTime = current.endTime.replace(':', '') === itemStart.replace(':', '');
      
      // 3) Both are same class & subject on same day without intervening different class
      const isContiguous = sameClass && sameSubject && sameTeacher && (isSequentialPeriod || isAdjacentTime || Math.abs(item.period - lastPeriod) <= 1);

      if (isContiguous) {
        // Merge into current consolidated session
        current.allScheduleIds.push(item.id);
        current.rawPeriods.push(item.period);
        current.endTime = itemEnd;
        current.timeDisplay = `${current.startTime} - ${itemEnd}`;
        current.periodCount += 1;
        const minP = Math.min(...current.rawPeriods);
        const maxP = Math.max(...current.rawPeriods);
        current.periodDisplay = minP === maxP ? `Jam Ke-${minP}` : `Jam Ke-${minP} s/d ${maxP}`;
      } else {
        // Finalize previous block and start new
        consolidated.push(current);
        current = {
          ...item,
          startTime: itemStart,
          endTime: itemEnd,
          timeDisplay: `${itemStart} - ${itemEnd}`,
          allScheduleIds: [item.id],
          periodDisplay: `Jam Ke-${item.period}`,
          periodCount: 1,
          rawPeriods: [item.period],
        };
      }
    });

    if (current) {
      consolidated.push(current);
    }
  });

  return consolidated;
}

/**
 * Filter and consolidate schedules for a specific teacher.
 */
export function getTeacherConsolidatedSchedules(
  schedules: ScheduleItem[],
  teacherCode?: string,
  teacherName?: string
): ConsolidatedScheduleItem[] {
  const teacherSchedules = schedules.filter((s) => {
    if (teacherCode && s.teacherCode && s.teacherCode.trim().toLowerCase() === teacherCode.trim().toLowerCase()) {
      return true;
    }
    if (teacherName && s.teacherName && s.teacherName.trim().toLowerCase() === teacherName.trim().toLowerCase()) {
      return true;
    }
    return false;
  });

  return consolidateScheduleItems(teacherSchedules);
}

/**
 * Checks if a consolidated schedule item has already had attendance submitted for a given date.
 */
export function findAttendanceForConsolidated(
  sessions: AttendanceSession[],
  item: ConsolidatedScheduleItem,
  date: string
): AttendanceSession | undefined {
  return sessions.find(
    (ses) =>
      ses.date === date &&
      (ses.scheduleId === item.id ||
        item.allScheduleIds.includes(ses.scheduleId) ||
        (ses.classId === item.classId &&
          ses.subjectCode === item.subjectCode &&
          ses.period === item.period))
  );
}

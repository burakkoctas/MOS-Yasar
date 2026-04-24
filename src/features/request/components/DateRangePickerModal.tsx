import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { AppColors } from '@/src/shared/theme/colors';
import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DateRangePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (rangeText: string) => void;
}

type MarkedDateType = {
  startingDay?: boolean;
  endingDay?: boolean;
  color: string;
  textColor: string;
};

type CalendarMode = 'calendar' | 'month' | 'year';

const QUICK_RANGE_DAYS = [3, 7, 21];

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function toCalendarDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseInputToCalendarDate(value: string) {
  const parts = value.split('.');

  if (parts.length !== 3) {
    return null;
  }

  const [day, month, year] = parts.map(Number);

  if (!day || !month || !year || year < 1900) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return toCalendarDate(parsedDate);
}

function formatCalendarDate(dateString: string) {
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.${year}`;
}

function formatRangeText(startDate: string, endDate: string) {
  return `${formatCalendarDate(startDate)} - ${formatCalendarDate(endDate)}`;
}

function createYearRange(baseYear: number) {
  const rangeStart = baseYear - 4;
  return Array.from({ length: 9 }, (_, index) => rangeStart + index);
}

export default function DateRangePickerModal({
  visible,
  onClose,
  onSave,
}: DateRangePickerModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const MONTH_NAMES = t.months;
  const QUICK_RANGES = [
    { key: 'last3days', label: t.requests.last3Days, days: 3 },
    { key: 'lastWeek', label: t.requests.last1Week, days: 7 },
    { key: 'last3weeks', label: t.requests.last3Weeks, days: 21 },
  ];
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [currentMonth, setCurrentMonth] = useState(
    toCalendarDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  );
  const [mode, setMode] = useState<CalendarMode>('calendar');
  const [yearPageCenter, setYearPageCenter] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!visible) {
      return;
    }

    const today = new Date();
    const initialMonth = toCalendarDate(new Date(today.getFullYear(), today.getMonth(), 1));

    setCurrentMonth(initialMonth);
    setMode('calendar');
    setYearPageCenter(today.getFullYear());
  }, [visible]);

  useEffect(() => {
    setStartInput(startDate ? formatCalendarDate(startDate) : '');
  }, [startDate]);

  useEffect(() => {
    setEndInput(endDate ? formatCalendarDate(endDate) : '');
  }, [endDate]);

  const currentDate = useMemo(() => new Date(currentMonth), [currentMonth]);
  const displayedMonthName = MONTH_NAMES[currentDate.getMonth()];
  const displayedYear = currentDate.getFullYear();
  const yearOptions = useMemo(() => createYearRange(yearPageCenter), [yearPageCenter]);

  const syncCalendarFromDate = (dateString: string) => {
    setCurrentMonth(`${dateString.slice(0, 7)}-01`);
    setYearPageCenter(Number(dateString.slice(0, 4)));
  };

  const onDayPress = (day: { dateString: string }) => {
    const dateString = day.dateString;

    if (!startDate || endDate) {
      setStartDate(dateString);
      setEndDate(null);
      syncCalendarFromDate(dateString);
      return;
    }

    if (dateString >= startDate) {
      setEndDate(dateString);
      syncCalendarFromDate(dateString);
      return;
    }

    setStartDate(dateString);
    setEndDate(null);
    syncCalendarFromDate(dateString);
  };

  const getMarkedDates = () => {
    const marked: Record<string, MarkedDateType> = {};

    if (startDate) {
      marked[startDate] = { startingDay: true, color: colors.primary, textColor: '#FFFFFF' };
    }

    if (startDate && endDate) {
      marked[endDate] = { endingDay: true, color: colors.primary, textColor: '#FFFFFF' };

      const current = new Date(startDate);
      const end = new Date(endDate);
      current.setDate(current.getDate() + 1);

      while (current < end) {
        const dateStr = toCalendarDate(current);
        marked[dateStr] = { color: colors.primaryLighter, textColor: colors.primary };
        current.setDate(current.getDate() + 1);
      }
    }

    return marked;
  };

  const handleInputChange = (type: 'start' | 'end', value: string) => {
    const formattedValue = formatDateInput(value);
    const parsedValue = parseInputToCalendarDate(formattedValue);

    if (type === 'start') {
      setStartInput(formattedValue);

      if (!parsedValue) {
        setStartDate(null);
        return;
      }

      if (endDate && parsedValue > endDate) {
        setStartDate(parsedValue);
        setEndDate(null);
      } else {
        setStartDate(parsedValue);
      }

      syncCalendarFromDate(parsedValue);
      return;
    }

    setEndInput(formattedValue);

    if (!parsedValue) {
      setEndDate(null);
      return;
    }

    if (startDate && parsedValue < startDate) {
      setStartDate(parsedValue);
      setEndDate(null);
    } else {
      setEndDate(parsedValue);
    }

    syncCalendarFromDate(parsedValue);
  };

  const handleSave = () => {
    if (startDate && endDate) {
      onSave(formatRangeText(startDate, endDate));
    }
  };

  const applyQuickRange = (dayCount: number) => {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    start.setDate(end.getDate() - (dayCount - 1));

    const nextStart = toCalendarDate(start);
    const nextEnd = toCalendarDate(end);

    setStartDate(nextStart);
    setEndDate(nextEnd);
    syncCalendarFromDate(nextEnd);
    setMode('calendar');
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + (direction === 'next' ? 1 : -1));
    const nextMonth = toCalendarDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));

    setCurrentMonth(nextMonth);
    setYearPageCenter(nextDate.getFullYear());
  };

  const handleMonthSelect = (monthIndex: number) => {
    const nextMonth = toCalendarDate(new Date(displayedYear, monthIndex, 1));
    setCurrentMonth(nextMonth);
    setMode('calendar');
  };

  const handleYearSelect = (year: number) => {
    const nextMonth = toCalendarDate(new Date(year, currentDate.getMonth(), 1));
    setCurrentMonth(nextMonth);
    setYearPageCenter(year);
    setMode('month');
  };

  const handlePrevious = () => {
    if (mode === 'year') {
      setYearPageCenter((prev) => prev - 9);
      return;
    }

    changeMonth('prev');
  };

  const handleNext = () => {
    if (mode === 'year') {
      setYearPageCenter((prev) => prev + 9);
      return;
    }

    changeMonth('next');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.headerBar}>
          <Pressable onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={26} color={colors.textPrimary} />
          </Pressable>

          <Text style={styles.headerTitle}>{t.requests.dateRange}</Text>

          <Pressable
            onPress={handleSave}
            disabled={!(startDate && endDate)}
            style={styles.iconButton}
          >
            <Ionicons
              name="checkmark-circle"
              size={28}
              color={startDate && endDate ? colors.primary : colors.borderLight}
            />
          </Pressable>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            value={startInput}
            onChangeText={(value) => handleInputChange('start', value)}
            keyboardType="number-pad"
            placeholder={t.requests.start}
            placeholderTextColor={colors.textCalendarPlaceholder}
            style={styles.dateInput}
            maxLength={10}
          />

          <View style={styles.arrowWrapper}>
            <Ionicons name="arrow-forward" size={18} color={colors.textCalendarArrow} />
          </View>

          <TextInput
            value={endInput}
            onChangeText={(value) => handleInputChange('end', value)}
            keyboardType="number-pad"
            placeholder={t.requests.end}
            placeholderTextColor={colors.textCalendarPlaceholder}
            style={styles.dateInput}
            maxLength={10}
          />
        </View>

        <View style={styles.quickRangeRow}>
          {QUICK_RANGES.map((quickRange) => (
            <Pressable
              key={quickRange.key}
              onPress={() => applyQuickRange(quickRange.days)}
              style={styles.quickRangeChip}
            >
              <Text style={styles.quickRangeChipText}>{quickRange.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.calendarWrapper}>
          <View style={styles.calendarHeader}>
            <Pressable onPress={handlePrevious} style={styles.headerControl}>
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </Pressable>

            <View style={styles.titleGroup}>
              <Pressable onPress={() => setMode('month')} style={styles.titleButton}>
                <Text style={styles.titleButtonText}>{displayedMonthName}</Text>
              </Pressable>

              <Pressable onPress={() => setMode('year')} style={styles.titleButton}>
                <Text style={styles.titleButtonText}>{displayedYear}</Text>
              </Pressable>
            </View>

            <Pressable onPress={handleNext} style={styles.headerControl}>
              <Ionicons name="chevron-forward" size={22} color={colors.primary} />
            </Pressable>
          </View>

          {mode === 'calendar' && (
            <Calendar
              key={currentMonth}
              current={currentMonth}
              hideArrows={true}
              markingType="period"
              onDayPress={onDayPress}
              markedDates={getMarkedDates()}
              theme={{
                todayTextColor: colors.primary,
                textDayFontSize: 15,
                textMonthFontWeight: 'bold',
                monthTextColor: colors.textPrimary,
                textDayHeaderFontWeight: '600',
                calendarBackground: 'transparent',
                dayTextColor: colors.textPrimary,
                textDisabledColor: colors.textDisabled,
              }}
            />
          )}

          {mode === 'month' && (
            <View style={styles.selectionGrid}>
              {MONTH_NAMES.map((monthName, index) => (
                <Pressable
                  key={monthName}
                  onPress={() => handleMonthSelect(index)}
                  style={[
                    styles.selectionChip,
                    index === currentDate.getMonth() && styles.selectionChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectionChipText,
                      index === currentDate.getMonth() && styles.selectionChipTextActive,
                    ]}
                  >
                    {monthName}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {mode === 'year' && (
            <View style={styles.selectionGrid}>
              {yearOptions.map((year) => (
                <Pressable
                  key={year}
                  onPress={() => handleYearSelect(year)}
                  style={[
                    styles.selectionChip,
                    year === displayedYear && styles.selectionChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectionChipText,
                      year === displayedYear && styles.selectionChipTextActive,
                    ]}
                  >
                    {year}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surfaceCalendar,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderCalendar,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  iconButton: {
    padding: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 14,
  },
  dateInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDate,
    paddingHorizontal: 14,
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  arrowWrapper: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickRangeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  quickRangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primaryLighter,
    borderWidth: 1,
    borderColor: colors.primaryLighterBorder,
  },
  quickRangeChipText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  calendarWrapper: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderCalendar,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerControl: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLighter,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  titleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primaryLighter,
  },
  titleButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 8,
  },
  selectionChip: {
    width: '31%',
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.surfaceChip,
    borderWidth: 1,
    borderColor: colors.borderChip,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  selectionChipActive: {
    backgroundColor: colors.primaryLighter,
    borderColor: colors.primary,
  },
  selectionChipText: {
    color: colors.textBody,
    fontWeight: '600',
  },
  selectionChipTextActive: {
    color: colors.primary,
  },
});

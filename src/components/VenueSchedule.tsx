"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Spinner,
  Divider,
  Select,
  SelectItem
} from '@nextui-org/react';
import styles from '../app/styles/Calendar.module.css';

interface Slot {
  id: string;
  location: string;
  day: string;
  start_time: number;
  end_time: number;
  assigned_team?: string;
  isBooked?: boolean;
}

const DAYS_OF_WEEK = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8);
const START_HOUR = 8;

const HALLS = [
  "אולם שדות",
  "אולם הפועל",
  "אולם לב המושבה",
  "חוץ לב המושבה 1",
  "חוץ לב המושבה 2",
  "אולם בן גוריון",
  "אולם קריית חינוך",
  "סככת קריית חינוך 1",
  "סככת קריית חינוך 2",
  "חוץ שדות 1",
  "חוץ שדות 2",
  "חוץ לב המושבה קאנטרי",
  "חוץ ארגמן"
].sort();

const VenueSchedule: React.FC = () => {
  const [selectedHall, setSelectedHall] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState(0);

  const convertToTimeString = (time: number): string => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  useEffect(() => {
    // עדכון הזמן הנוכחי כל דקה
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    setCurrentTime(currentHour + currentMinute / 60);

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.getHours() + now.getMinutes() / 60);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedHall) return;

    const fetchSlots = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/slots');
        if (!response.ok) throw new Error('נכשל בטעינת המשבצות');
        const data = await response.json();
        const hallSlots = data.filter((slot: Slot) => slot.location === selectedHall);
        setSlots(hallSlots);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה לא ידועה');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedHall]);

  const getHebrewDay = (day: string): string => {
    const daysMap: Record<string, string> = {
      'Sunday': 'ראשון',
      'Monday': 'שני',
      'Tuesday': 'שלישי',
      'Wednesday': 'רביעי',
      'Thursday': 'חמישי',
      'Friday': 'שישי',
      'Saturday': 'שבת'
    };
    return daysMap[day] || day;
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  };

  const renderHallSelection = () => {
    const filteredHalls = HALLS.filter(hall =>
      hall.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-3xl mx-auto mt-8">
          <Card className="shadow-xl bg-white/90 backdrop-blur-sm border border-blue-100">
            <CardHeader className="flex flex-col gap-3 p-6 border-b border-blue-100">
              <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                בחירת אולם
              </h1>
              <p className="text-gray-600 text-center">
                בחר אולם כדי לצפות בלוח הזמנים שלו
              </p>
            </CardHeader>
            <CardBody dir="rtl" className="flex flex-col gap-6 p-8 bg-gradient-to-b from-white to-blue-50/50">
              <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
                <Input
                  type="text"
                  placeholder="חפש אולם..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xl mx-auto"
                  size="lg"
                  variant="bordered"
                  classNames={{
                    input: "text-right text-lg",
                    inputWrapper: [
                      "shadow-sm",
                      "backdrop-blur-sm",
                      "border-2",
                      "border-blue-200",
                      "hover:border-blue-400",
                      "focus-within:!border-blue-600",
                      "bg-white/60",
                      "rounded-xl"
                    ]
                  }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredHalls.map((hall) => (
                    <Button
                      key={hall}
                      className={`p-4 text-center transition-all duration-300 ${
                        selectedHall === hall
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-white hover:bg-blue-50 text-gray-700 border-2 border-blue-200'
                      }`}
                      onClick={() => setSelectedHall(hall)}
                    >
                      {hall}
                    </Button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        {/* תצוגת לוח הזמנים */}
        {selectedHall && !loading && !error && (
          <div className="mt-8">
            {renderSchedule()}
          </div>
        )}
        {loading && (
          <div className="text-center mt-8">
            <Spinner color="primary" size="lg" />
            <p className="text-gray-600 mt-2">טוען נתונים...</p>
          </div>
        )}
        {error && (
          <div className="text-center mt-8 text-red-500">
            <p>{error}</p>
          </div>
        )}
      </div>
    );
  };

  const renderSchedule = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner label="טוען לוח זמנים..." />
        </div>
      );
    }

    if (error) {
      return (
        <Card className="bg-red-100 p-4">
          <p className="text-red-600">{error}</p>
        </Card>
      );
    }

    const getCurrentTimePosition = () => {
      if (currentTime < START_HOUR || currentTime > START_HOUR + 15) return null;
      return `${(currentTime - START_HOUR) * 60}px`;
    };

    const timePosition = getCurrentTimePosition();

    return (
      <Card className="w-full">
        <CardHeader className="flex justify-between items-center p-6 bg-primary-50">
          <div className="flex items-center gap-4">
            <Button
              onPress={() => setSelectedHall('')}
              size="sm"
              variant="flat"
              color="primary"
              startContent={<ArrowIcon />}
            >
              חזור לבחירת אולם
            </Button>
            <Divider orientation="vertical" className="h-8" />
            <h2 className="text-2xl font-bold">{selectedHall}</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className={styles.calendarContainer}>
            <div className={styles.headerRow}>
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className={styles.dayHeader}>
                  {day}
                </div>
              ))}
            </div>

            <div className={styles.gridContainer}>
              <div className={styles.timeColumn} style={{ transform: `translateY(-${scrollTop}px)` }}>
                {HOURS.map(hour => (
                  <div key={hour} className={styles.timeSlot}>
                    {`${hour}:00`}
                  </div>
                ))}
              </div>

              <div className={styles.gridLines} onScroll={handleScroll}>
                {DAYS_OF_WEEK.map((day, dayIndex) => (
                  <div key={day} className={styles.dayColumn}>
                    {HOURS.map((hour, hourIndex) => (
                      <div key={hourIndex} className={styles.hourRow} />
                    ))}
                    {slots
                      .filter(slot => getHebrewDay(slot.day) === day)
                      .map((slot, index) => {
                        const startHour = slot.start_time;
                        const duration = slot.end_time - slot.start_time;
                        const top = (startHour - START_HOUR) * 60;

                        return (
                          <div
                            key={index}
                            className={`${styles.eventBlock} ${slot.assigned_team ? styles.booked : styles.available}`}
                            style={{
                              top: `${top}px`,
                              height: `${duration * 60}px`,
                            }}
                            title={`${convertToTimeString(slot.start_time)}-${convertToTimeString(slot.end_time)}${
                              slot.assigned_team ? ` - קבוצה ${slot.assigned_team}` : ' - פנוי'
                            }`}
                          >
                            <div className={styles.eventTime}>
                              {convertToTimeString(slot.start_time)}-{convertToTimeString(slot.end_time)}
                            </div>
                            {slot.assigned_team && (
                              <div className={styles.eventTeam}>
                                קבוצה {slot.assigned_team}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ))}

                {timePosition && (
                  <div 
                    className={styles.currentTimeIndicator} 
                    style={{ top: timePosition }}
                  >
                    <div className={styles.currentTimeDot} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  const SearchIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const ArrowIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );

  return (
    <div className="h-screen p-2">
      {selectedHall ? renderSchedule() : renderHallSelection()}
    </div>
  );
};

export default VenueSchedule;

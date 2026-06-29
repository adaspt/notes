import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { startOfDay } from "./task-date-utils";

interface Props {
  selected: Date | null;
  onSelect: (date: Date) => void;
}

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

function TaskMonthCalendar({ selected, onSelect }: Props) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfDay(selected ?? new Date()));
  const days = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const selectedTime = selected ? startOfDay(selected).getTime() : null;
  const currentMonth = visibleMonth.getMonth();

  const moveMonth = (amount: number) => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1));
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="icon-sm" onClick={() => moveMonth(-1)}>
          <ChevronLeft />
        </Button>
        <div className="text-sm font-medium">{monthFormatter.format(visibleMonth)}</div>
        <Button variant="ghost" size="icon-sm" onClick={() => moveMonth(1)}>
          <ChevronRight />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {weekdays.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const time = day.getTime();
          const isSelected = time === selectedTime;
          const isCurrentMonth = day.getMonth() === currentMonth;

          return (
            <Button
              key={time}
              variant={isSelected ? "default" : "ghost"}
              size="icon-sm"
              className={cn(!isCurrentMonth && "text-muted-foreground opacity-50")}
              onClick={() => onSelect(day)}
            >
              {day.getDate()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function getCalendarDays(month: Date) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export default TaskMonthCalendar;

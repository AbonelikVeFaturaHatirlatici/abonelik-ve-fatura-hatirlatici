"""Yenileme tarihi hesabı. Saf fonksiyonlar: veritabanı ve web'e bağımlı değil.

Kural: her yenileme BAŞLANGIÇ tarihinden hesaplanır, bir önceki yenilemeden değil.
Ayda o gün yoksa ayın son günü kullanılır (31 Ocak -> 28 Şubat -> 31 Mart).
"""
import calendar
from datetime import date
from enum import Enum


class Period(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"


def add_months(start: date, months: int) -> date:
    """start'a ay ekler; hedef ayda o gün yoksa ayın son gününü verir."""
    index = start.year * 12 + (start.month - 1) + months
    year, month = divmod(index, 12)
    month += 1
    last_day = calendar.monthrange(year, month)[1]
    return date(year, month, min(start.day, last_day))


def next_renewal(start: date, period: Period, after: date) -> date:
    """`after` tarihinden sonraki ilk yenileme günü."""
    step = 1 if period == Period.MONTHLY else 12
    k = 1
    while True:
        candidate = add_months(start, k * step)
        if candidate > after:
            return candidate
        k += 1

from datetime import date

import pytest

from app.domain.renewal import Period, add_months, next_renewal


def test_add_months_clamps_to_month_end():
    assert add_months(date(2026, 1, 31), 1) == date(2026, 2, 28)


def test_add_months_leap_year():
    assert add_months(date(2028, 1, 31), 1) == date(2028, 2, 29)


def test_add_months_crosses_year():
    assert add_months(date(2026, 11, 15), 3) == date(2027, 2, 15)


def test_monthly_31st_returns_to_31st_after_short_month():
    start = date(2026, 1, 31)
    first = next_renewal(start, Period.MONTHLY, date(2026, 1, 31))
    second = next_renewal(start, Period.MONTHLY, first)
    assert first == date(2026, 2, 28)
    assert second == date(2026, 3, 31)  # 28 Mart'a kaymaz


def test_renewal_day_itself_is_not_next():
    # after yenileme günüyse bir sonraki yenileme döner
    assert next_renewal(date(2026, 1, 15), Period.MONTHLY, date(2026, 2, 15)) == date(2026, 3, 15)


def test_yearly_feb_29():
    start = date(2028, 2, 29)
    assert next_renewal(start, Period.YEARLY, date(2028, 2, 29)) == date(2029, 2, 28)
    assert next_renewal(start, Period.YEARLY, date(2031, 6, 1)) == date(2032, 2, 29)


def test_after_far_in_the_future():
    assert next_renewal(date(2026, 1, 10), Period.MONTHLY, date(2027, 1, 10)) == date(2027, 2, 10)


def test_unsupported_period_raises_value_error():
    # "weekly" gibi beklenmeyen değer sessizce yıllık hesaplanmamalı
    with pytest.raises(ValueError):
        next_renewal(date(2026, 1, 10), "weekly", date(2026, 1, 10))


def test_future_start_date_first_renewal_is_start_plus_one_period():
    # başlangıç günü yenileme sayılmaz; ilk yenileme start + 1 periyot
    assert next_renewal(date(2026, 11, 15), Period.MONTHLY, date(2026, 10, 22)) == date(2026, 12, 15)

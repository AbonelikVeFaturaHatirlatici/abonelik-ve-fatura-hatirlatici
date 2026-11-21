"""Düzeltme 1: startDate aralığı (BR-10) ve e-posta 254 karakter sınırı (SRS 3.5.2)."""

from datetime import date

import pytest

from app.domain.rules import (
    EMAIL_MAX_LENGTH,
    EMAIL_TOO_LONG_MESSAGE,
    START_DATE_RANGE_MESSAGE,
    DomainValidationError,
    start_date_bounds,
    validate_email_length,
    validate_start_date,
)

TODAY = date(2026, 2, 27)


def test_start_date_bounds_are_2000_01_01_and_today_plus_366_days():
    assert start_date_bounds(TODAY) == (date(2000, 1, 1), date(2027, 2, 28))


@pytest.mark.parametrize(
    "start",
    [date(2000, 1, 1), date(2026, 1, 31), TODAY, date(2027, 2, 28)],
    ids=["en-erken", "gecmis", "bugun", "bugun+366"],
)
def test_start_date_inside_range_is_accepted(start):
    assert validate_start_date(start, TODAY) == start


@pytest.mark.parametrize(
    "start",
    [date(1999, 12, 31), date(1970, 1, 1), date(2027, 3, 1), date(2030, 1, 1)],
    ids=["2000-oncesi", "1970", "bugun+367", "cok-ileri"],
)
def test_start_date_outside_range_is_rejected_in_turkish(start):
    with pytest.raises(DomainValidationError) as excinfo:
        validate_start_date(start, TODAY)
    assert excinfo.value.field == "startDate"
    assert excinfo.value.message == START_DATE_RANGE_MESSAGE
    assert str(excinfo.value) == START_DATE_RANGE_MESSAGE


def test_start_date_range_message_is_turkish():
    assert START_DATE_RANGE_MESSAGE == (
        "Başlangıç tarihi 2000-01-01 ile bugünden itibaren 366 gün sonrası arasında "
        "olmalıdır."
    )


def test_start_date_upper_bound_moves_with_today():
    later = date(2026, 11, 20)
    assert validate_start_date(date(2027, 11, 21), later) == date(2027, 11, 21)
    with pytest.raises(DomainValidationError):
        validate_start_date(date(2027, 11, 22), later)


def test_leap_year_today_upper_bound():
    # 2027-03-01 + 366 gün = 2028-03-01 (2028 artık yıl)
    assert start_date_bounds(date(2027, 3, 1))[1] == date(2028, 3, 1)


def test_email_of_254_characters_is_accepted():
    email = "a" * (EMAIL_MAX_LENGTH - len("@example.com")) + "@example.com"
    assert len(email) == 254
    assert validate_email_length(email) == email


def test_email_of_255_characters_is_rejected_in_turkish():
    email = "a" * (255 - len("@example.com")) + "@example.com"
    with pytest.raises(DomainValidationError) as excinfo:
        validate_email_length(email)
    assert excinfo.value.field == "email"
    assert excinfo.value.message == EMAIL_TOO_LONG_MESSAGE
    assert EMAIL_TOO_LONG_MESSAGE == "E-posta en fazla 254 karakter olabilir."


def test_email_length_ignores_surrounding_whitespace():
    email = "a" * (254 - len("@example.com")) + "@example.com"
    assert validate_email_length(f"  {email}  ") == f"  {email}  "

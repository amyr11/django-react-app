#!/bin/bash

python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py createsuperuser --noinput
python manage.py collectstatic --noinput

gunicorn 'backend.wsgi' --bind=0.0.0.0:8000
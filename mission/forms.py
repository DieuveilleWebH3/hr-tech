from django import forms
# from django.contrib.auth.models import User
from .models import *
from account.models import User
import os


class MissionEditForm(forms.ModelForm):
    class Meta:
        model = Mission
        fields = ['title', 'job_description', 'prime']
        widgets = {
            'title': forms.TextInput(attrs={'readonly': 'readonly'}),
        }
        labels = {
            'title': 'Title'
        }


class MissionAddForm(forms.ModelForm):

    class Meta:
        model = Mission

        fields = ['title', 'job_description', 'prime']
        # fields = ['title', 'description']
        labels = {
            "title": "Mission Title",
            "job_description": "Description",
            "prime": "Prime"
        }




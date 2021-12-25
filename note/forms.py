from django import forms
# from django.contrib.auth.models import User
from .models import *
from account.models import User
import os


class NoteEditForm(forms.ModelForm):
    class Meta:
        model = Note
        fields = ['title', 'zone', 'production', 'type', 'access', 'standard', 'client', 'description', 'photo']
        widgets = {
            'title': forms.TextInput(attrs={'readonly': 'readonly'}),
        }
        labels = {
            "production": "Type of production",
            "type": "Type of platform",
            'title': 'Name',
            'standard': 'Project Standard'
        }


class NoteAddForm(forms.ModelForm):
    class Meta:
        model = Note

        LANGUAGE_CHOICES = (
            ('fr', 'Français'),
            ('en-uk', 'English (uk)'),
            ('en-us', 'English (usa)'),
        )

        fields = ['title', 'description', 'language']
        labels = {
            "title": "Note Title",
            "description": "Description",
            "language": "Language"
        }
        widgets = {
            'language': forms.ChoiceField(
                choices=LANGUAGE_CHOICES,
                label="Language",
                required=True,
                help_text="The language of which your note is"
            )
        }


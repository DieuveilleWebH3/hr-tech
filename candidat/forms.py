from django import forms
# from django.contrib.auth.models import User
from .models import *
from account.models import User
from phonenumber_field.formfields import PhoneNumberField
import os


class CandidateEditForm(forms.ModelForm):
    class Meta:
        model = Candidates
        fields = ['first_name', 'last_name', 'email', 'title', 'phone_number']
        widgets = {
            'title': forms.TextInput(attrs={'readonly': 'readonly'}),
        }
        labels = {
            'title': 'Title'
        }


class CandidateAddForm(forms.ModelForm):

    # phone_number = PhoneNumberField()

    class Meta:
        model = Candidates

        fields = ['first_name', 'last_name', 'email', 'title', 'phone_number']

        labels = {
            "first_name": "First Name",
            "last_name": "Last Name",
            "email": "Email",
            "title": "Title",
            "phone_number": "Phone number"
        }


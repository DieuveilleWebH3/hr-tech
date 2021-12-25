from django.shortcuts import render, redirect, get_object_or_404, reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_GET
from django.contrib import messages
from .models import *
from .forms import *
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.core.files.storage import FileSystemStorage
import datetime
from django.urls import reverse
import requests
from django.db.models import Q


# Create your views here.

@login_required(redirect_field_name='login')
def edit(request):
    user = request.user

    # form = CollectionAddForm(data=request.POST)

    if request.method == 'POST':
        form = request.POST

    return True


@login_required(redirect_field_name='login')
def add(request):
    user = request.user

    if request.method == 'POST':
        form = NoteAddForm(data=request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important!
            messages.success(request, 'Your password was successfully updated!')
            return redirect('change_password')
        else:
            messages.warning(request, 'An error has occurred ! Please input the right information.')

    return redirect('profile')


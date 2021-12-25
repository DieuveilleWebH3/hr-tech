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

def notes(request):
    note_list = Note.objects.all()

    template_name = 'note/notes.html'
    context = {'note_list': note_list}
    # we return the template with the variables in context
    return render(request, template_name, context)


@login_required(redirect_field_name='login')
def edit(request):
    user = request.user

    # form = NoteAddForm(data=request.POST)

    if request.method == 'POST':
        form = request.POST

    return True


@login_required(redirect_field_name='login')
def add(request):
    user = request.user

    if request.method == 'POST':
        form = NoteAddForm(data=request.POST)
        if form.is_valid():
            # user = form.save()
            # update_session_auth_hash(request, user)  # Important!
            # messages.success(request, 'Your password was successfully updated!')
            # return redirect('change_password')
            return True
        else:
            messages.warning(request, 'An error has occurred ! Please input the right information.')

    return redirect('notes')


# We create a view to delete a note
@login_required(redirect_field_name='login')
def note_delete(request, slug):
    # We request a user
    user = request.user
    # we retrieve the slug to retrieve the chosen project
    note = get_object_or_404(Note, slug=slug)

    # We check if the current user has superuser status or has access to the project
    if user.is_active and (user.is_superuser or note.author == user):
        # We delete the note
        note.delete()
    else:
        messages.warning(request, 'Sorry you don\'t have permission to delete this te! please contact your admin.')
    return redirect("notes")

